import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";

import { requireConfirmedAdmin } from "@/features/auth/session";
import { updateRaffleItemSchema } from "@/features/raffles/schemas";
import { getDb } from "@/server/db";
import { raffleItemImages, raffleItems, raffles } from "@/server/db/schema";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(request: Request, context: RouteContext): Promise<NextResponse> {
  const admin = await requireConfirmedAdmin();
  const { id } = await context.params;
  const body = (await request.json()) as {
    itemName?: string;
    images?: string[];
  };

  const parsed = updateRaffleItemSchema.safeParse({
    itemName: body.itemName,
    images: Array.isArray(body.images) ? body.images.map((value) => value.trim()).filter(Boolean) : [],
  });

  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues[0]?.message ?? "Item invalido." },
      { status: 400 },
    );
  }

  const db = getDb();
  const [raffle] = await db
    .select({
      id: raffles.id,
      itemId: raffleItems.id,
    })
    .from(raffles)
    .leftJoin(raffleItems, eq(raffleItems.raffleId, raffles.id))
    .where(and(eq(raffles.id, id), eq(raffles.createdByUserId, admin.id)))
    .limit(1);

  if (!raffle || !raffle.itemId) {
    return NextResponse.json({ message: "Rifa ou item nao encontrado." }, { status: 404 });
  }

  await db.transaction(async (tx) => {
    await tx
      .update(raffleItems)
      .set({
        name: parsed.data.itemName,
      })
      .where(eq(raffleItems.id, raffle.itemId as string));

    await tx.delete(raffleItemImages).where(eq(raffleItemImages.raffleItemId, raffle.itemId as string));

    await tx.insert(raffleItemImages).values(
      parsed.data.images.map((imageUrl, index) => ({
        raffleItemId: raffle.itemId as string,
        imageUrl,
        isRealItemImage: index === 0,
        sortOrder: index,
      })),
    );
  });

  return NextResponse.json({ ok: true });
}
