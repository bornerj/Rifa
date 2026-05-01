import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import { requireConfirmedAdmin } from "@/features/auth/session";
import { getDb } from "@/server/db";
import { quotaReservations, quotaTickets, raffles } from "@/server/db/schema";

type RouteContext = {
  params: Promise<{
    id: string;
    reservationId: string;
  }>;
};

export async function DELETE(_request: Request, context: RouteContext): Promise<NextResponse> {
  const admin = await requireConfirmedAdmin();
  const { id, reservationId } = await context.params;
  const db = getDb();

  const [raffle] = await db
    .select({ id: raffles.id })
    .from(raffles)
    .where(and(eq(raffles.id, id), eq(raffles.createdByUserId, admin.id)))
    .limit(1);

  if (!raffle) {
    return NextResponse.json({ message: "Rifa nao encontrada." }, { status: 404 });
  }

  const [reservation] = await db
    .select({
      id: quotaReservations.id,
      status: quotaReservations.status,
    })
    .from(quotaReservations)
    .where(and(eq(quotaReservations.id, reservationId), eq(quotaReservations.raffleId, raffle.id)))
    .limit(1);

  if (!reservation) {
    return NextResponse.json({ message: "Reserva nao encontrada." }, { status: 404 });
  }

  if (reservation.status === "paid") {
    return NextResponse.json(
      { message: "Reservas com pagamento confirmado nao podem ser excluidas." },
      { status: 409 },
    );
  }

  await db.transaction(async (tx) => {
    await tx.delete(quotaTickets).where(eq(quotaTickets.reservationId, reservation.id));
    await tx.delete(quotaReservations).where(eq(quotaReservations.id, reservation.id));
  });

  return NextResponse.json({ ok: true });
}
