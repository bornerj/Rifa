import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";

import { requireConfirmedAdmin } from "@/features/auth/session";
import { getDb } from "@/server/db";
import { quotaReservations, quotaTickets, raffles } from "@/server/db/schema";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(request: Request, context: RouteContext): Promise<NextResponse> {
  const admin = await requireConfirmedAdmin();
  const { id } = await context.params;
  const body = (await request.json()) as { reservationId?: string };

  if (!body.reservationId) {
    return NextResponse.json({ message: "Reserva invalida." }, { status: 400 });
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

  await db.transaction(async (tx) => {
    await tx
      .update(quotaReservations)
      .set({ status: "paid" })
      .where(eq(quotaReservations.id, body.reservationId as string));

    await tx
      .update(quotaTickets)
      .set({ paymentStatus: "confirmed" })
      .where(eq(quotaTickets.reservationId, body.reservationId as string));
  });

  return NextResponse.json({ ok: true });
}
