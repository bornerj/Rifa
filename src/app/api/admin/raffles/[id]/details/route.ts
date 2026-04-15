import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";

import { requireConfirmedAdmin } from "@/features/auth/session";
import { updateRaffleDetailsSchema } from "@/features/raffles/schemas";
import { getDb } from "@/server/db";
import { raffles } from "@/server/db/schema";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(request: Request, context: RouteContext): Promise<NextResponse> {
  const admin = await requireConfirmedAdmin();
  const { id } = await context.params;
  const body = (await request.json()) as {
    name?: string;
    purpose?: string;
    beneficiary?: string;
    quotaPriceInCents?: string;
  };

  const parsed = updateRaffleDetailsSchema.safeParse({
    name: body.name,
    purpose: body.purpose,
    beneficiary: body.beneficiary,
    quotaPriceInCents: body.quotaPriceInCents,
  });

  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues[0]?.message ?? "Dados da rifa invalidos." },
      { status: 400 },
    );
  }

  const db = getDb();
  const [raffle] = await db
    .select({ id: raffles.id })
    .from(raffles)
    .where(and(eq(raffles.id, id), eq(raffles.createdByUserId, admin.id)))
    .limit(1);

  if (!raffle) {
    return NextResponse.json({ message: "Rifa nao encontrada." }, { status: 404 });
  }

  await db
    .update(raffles)
    .set({
      name: parsed.data.name,
      purpose: parsed.data.purpose,
      beneficiary: parsed.data.beneficiary,
      quotaPriceInCents: parsed.data.quotaPriceInCents,
    })
    .where(eq(raffles.id, raffle.id));

  return NextResponse.json({ ok: true });
}
