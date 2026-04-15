import { NextResponse } from "next/server";
import { and, eq, inArray } from "drizzle-orm";
import { z } from "zod";

import { requireConfirmedAdmin } from "@/features/auth/session";
import { sendPaymentReceiptEmail } from "@/features/notifications/receipt-email";
import { logger } from "@/lib/logger";
import { getDb } from "@/server/db";
import { participants, quotaReservations, quotaTickets, raffles } from "@/server/db/schema";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

const confirmPaymentsSchema = z.object({
  reservationIds: z.array(z.string().uuid()).min(1, "Selecione ao menos uma reserva."),
});

export async function POST(request: Request, context: RouteContext): Promise<NextResponse> {
  const admin = await requireConfirmedAdmin();
  const { id } = await context.params;
  const body = (await request.json()) as { reservationId?: string; reservationIds?: string[] };
  const parsed = confirmPaymentsSchema.safeParse({
    reservationIds: Array.isArray(body.reservationIds)
      ? body.reservationIds
      : body.reservationId
        ? [body.reservationId]
        : [],
  });

  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues[0]?.message ?? "Reservas invalidas." },
      { status: 400 },
    );
  }

  const db = getDb();
  const [raffle] = await db
    .select({ id: raffles.id, name: raffles.name, slug: raffles.slug })
    .from(raffles)
    .where(and(eq(raffles.id, id), eq(raffles.createdByUserId, admin.id)))
    .limit(1);

  if (!raffle) {
    return NextResponse.json({ message: "Rifa nao encontrada." }, { status: 404 });
  }

  const reservationsToConfirm = await db
    .select({
      reservationId: quotaReservations.id,
      totalAmountInCents: quotaReservations.totalAmountInCents,
      participantName: participants.name,
      participantEmail: participants.email,
    })
    .from(quotaReservations)
    .innerJoin(participants, eq(participants.id, quotaReservations.participantId))
    .where(
      and(
        eq(quotaReservations.raffleId, raffle.id),
        inArray(quotaReservations.id, parsed.data.reservationIds),
      ),
    );

  if (reservationsToConfirm.length !== parsed.data.reservationIds.length) {
    return NextResponse.json({ message: "Uma ou mais reservas nao pertencem a esta rifa." }, { status: 400 });
  }

  const tickets = await db
    .select({
      reservationId: quotaTickets.reservationId,
      ticketNumber: quotaTickets.ticketNumber,
    })
    .from(quotaTickets)
    .where(inArray(quotaTickets.reservationId, parsed.data.reservationIds));

  const ticketsByReservation = new Map<string, string[]>();
  for (const ticket of tickets) {
    const current = ticketsByReservation.get(ticket.reservationId) ?? [];
    current.push(ticket.ticketNumber);
    ticketsByReservation.set(ticket.reservationId, current);
  }

  await db.transaction(async (tx) => {
    await tx
      .update(quotaReservations)
      .set({ status: "paid" })
      .where(inArray(quotaReservations.id, parsed.data.reservationIds));

    await tx
      .update(quotaTickets)
      .set({ paymentStatus: "confirmed" })
      .where(inArray(quotaTickets.reservationId, parsed.data.reservationIds));
  });

  let deliveredCount = 0;
  for (const reservation of reservationsToConfirm) {
    try {
      const delivery = await sendPaymentReceiptEmail({
        participantName: reservation.participantName,
        participantEmail: reservation.participantEmail,
        raffleName: raffle.name,
        reservationId: reservation.reservationId,
        ticketNumbers: ticketsByReservation.get(reservation.reservationId) ?? [],
        totalAmountInCents: reservation.totalAmountInCents,
      });

      if (delivery.delivered || delivery.previewOnly) {
        deliveredCount += 1;
        await db
          .update(quotaReservations)
          .set({ receiptEmailSentAt: new Date() })
          .where(eq(quotaReservations.id, reservation.reservationId));
      }
    } catch (error) {
      logger.error("Failed to send payment receipt email", {
        reservationId: reservation.reservationId,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  return NextResponse.json({ ok: true, confirmedCount: reservationsToConfirm.length, deliveredCount });
}
