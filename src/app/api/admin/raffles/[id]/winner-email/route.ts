import { and, asc, desc, eq, isNull, like } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";

import { requireConfirmedAdmin } from "@/features/auth/session";
import { sendWinnerOfficialEmail } from "@/features/notifications/winner-official-email";
import { getDb } from "@/server/db";
import {
  draws,
  participants,
  quotaTickets,
  raffleItemImages,
  raffleItems,
  raffles,
} from "@/server/db/schema";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

const sendWinnerEmailSchema = z.object({
  deliveryMode: z.enum(["check", "official"]).default("official"),
});

const officialDrawVideoUrl =
  "https://0dkvpvlmilnfmtpx.public.blob.vercel-storage.com/raffles/daa6e600-8fb5-4c0f-8df8-75d0d5743d65/rifa_amazon_ecoshow.webm";

export async function POST(request: Request, context: RouteContext): Promise<NextResponse> {
  const admin = await requireConfirmedAdmin();
  const { id } = await context.params;
  const body = (await request.json()) as { deliveryMode?: string };
  const parsed = sendWinnerEmailSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues[0]?.message ?? "Dados invalidos para envio do email." },
      { status: 400 },
    );
  }

  const db = getDb();
  const [raffle] = await db
    .select({ id: raffles.id, name: raffles.name, itemId: raffleItems.id })
    .from(raffles)
    .leftJoin(raffleItems, eq(raffleItems.raffleId, raffles.id))
    .where(and(eq(raffles.id, id), eq(raffles.createdByUserId, admin.id)))
    .limit(1);

  if (!raffle) {
    return NextResponse.json({ message: "Rifa nao encontrada." }, { status: 404 });
  }

  const [officialDraw] = await db
    .select({
      drawId: draws.id,
      ticketId: quotaTickets.id,
      ticketNumber: quotaTickets.ticketNumber,
      paymentStatus: quotaTickets.paymentStatus,
      winnerName: participants.name,
    })
    .from(draws)
    .innerJoin(quotaTickets, eq(quotaTickets.id, draws.winningTicketId))
    .innerJoin(participants, eq(participants.id, quotaTickets.participantId))
    .where(eq(draws.raffleId, raffle.id))
    .orderBy(desc(draws.createdAt))
    .limit(1);

  if (!officialDraw) {
    return NextResponse.json({ message: "Sorteio oficial nao encontrado." }, { status: 404 });
  }

  if (officialDraw.paymentStatus !== "confirmed") {
    return NextResponse.json(
      { message: "O sorteio oficial precisa apontar para uma cota com pagamento confirmado." },
      { status: 409 },
    );
  }

  const [firstBlobImage] = raffle.itemId
    ? await db
        .select({ imageUrl: raffleItemImages.imageUrl })
        .from(raffleItemImages)
        .where(
          and(
            eq(raffleItemImages.raffleItemId, raffle.itemId),
            like(raffleItemImages.imageUrl, "%public.blob.vercel-storage.com%"),
          ),
        )
        .orderBy(asc(raffleItemImages.sortOrder))
        .limit(1)
    : [];

  const raffleParticipants =
    parsed.data.deliveryMode === "check"
      ? await db
          .select({
            participantId: participants.id,
            participantName: participants.name,
            participantEmail: participants.email,
          })
          .from(participants)
          .leftJoin(quotaTickets, eq(quotaTickets.participantId, participants.id))
          .where(
            and(
              eq(participants.raffleId, raffle.id),
              eq(participants.email, admin.email),
              isNull(quotaTickets.id),
            ),
          )
      : await db
          .select({
            participantId: participants.id,
            participantName: participants.name,
            participantEmail: participants.email,
          })
          .from(participants)
          .where(eq(participants.raffleId, raffle.id));

  if (parsed.data.deliveryMode === "check" && !raffleParticipants.length) {
    return NextResponse.json(
      { message: "Nenhum participante sem cota encontrado para conferir o email." },
      { status: 404 },
    );
  }

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
      winnerName: officialDraw.winnerName,
      winningTicketNumber: officialDraw.ticketNumber,
      attachmentUrls: {
        imageUrl: firstBlobImage?.imageUrl ?? null,
        videoUrl: officialDrawVideoUrl,
      },
    });

    if (delivery.delivered || delivery.previewOnly) {
      sentCount += 1;
    }
  }

  return NextResponse.json({
    ok: true,
    deliveryMode: parsed.data.deliveryMode,
    sentCount,
    winnerName: officialDraw.winnerName,
    winningTicketNumber: officialDraw.ticketNumber,
  });
}
