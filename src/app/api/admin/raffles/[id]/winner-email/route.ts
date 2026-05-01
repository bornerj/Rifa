import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";

import { requireConfirmedAdmin } from "@/features/auth/session";
import { sendWinnerOfficialEmail } from "@/features/notifications/winner-official-email";
import { getDb } from "@/server/db";
import { participants, quotaTickets, raffles } from "@/server/db/schema";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

const sendWinnerEmailSchema = z.object({
  winningTicketId: z.string().uuid("Cota vencedora invalida."),
});

export async function POST(request: Request, context: RouteContext): Promise<NextResponse> {
  const admin = await requireConfirmedAdmin();
  const { id } = await context.params;
  const body = (await request.json()) as { winningTicketId?: string };
  const parsed = sendWinnerEmailSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues[0]?.message ?? "Dados invalidos para envio do email." },
      { status: 400 },
    );
  }

  const db = getDb();
  const [raffle] = await db
    .select({ id: raffles.id, name: raffles.name })
    .from(raffles)
    .where(and(eq(raffles.id, id), eq(raffles.createdByUserId, admin.id)))
    .limit(1);

  if (!raffle) {
    return NextResponse.json({ message: "Rifa nao encontrada." }, { status: 404 });
  }

  const [winnerTicket] = await db
    .select({
      ticketId: quotaTickets.id,
      ticketNumber: quotaTickets.ticketNumber,
      paymentStatus: quotaTickets.paymentStatus,
      winnerName: participants.name,
    })
    .from(quotaTickets)
    .innerJoin(participants, eq(participants.id, quotaTickets.participantId))
    .where(and(eq(quotaTickets.id, parsed.data.winningTicketId), eq(quotaTickets.raffleId, raffle.id)))
    .limit(1);

  if (!winnerTicket) {
    return NextResponse.json({ message: "Cota vencedora nao encontrada." }, { status: 404 });
  }

  if (winnerTicket.paymentStatus !== "confirmed") {
    return NextResponse.json(
      { message: "Apenas cotas com pagamento confirmado podem ser usadas no email oficial." },
      { status: 409 },
    );
  }

  const raffleParticipants = await db
    .select({
      participantId: participants.id,
      participantName: participants.name,
      participantEmail: participants.email,
    })
    .from(participants)
    .where(eq(participants.raffleId, raffle.id));

  const uniqueRecipients = Array.from(
    new Map(
      raffleParticipants.map((participant) => [
        participant.participantEmail.trim().toLowerCase(),
        participant,
      ]),
    ).values(),
  );

  let sentCount = 0;
  for (const participant of uniqueRecipients) {
    const delivery = await sendWinnerOfficialEmail({
      participantEmail: participant.participantEmail,
      participantName: participant.participantName,
      raffleName: raffle.name,
      winnerName: winnerTicket.winnerName,
      winningTicketNumber: winnerTicket.ticketNumber,
    });

    if (delivery.delivered || delivery.previewOnly) {
      sentCount += 1;
    }
  }

  return NextResponse.json({
    ok: true,
    sentCount,
    winnerName: winnerTicket.winnerName,
    winningTicketNumber: winnerTicket.ticketNumber,
  });
}
