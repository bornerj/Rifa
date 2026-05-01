import { and, desc, eq } from "drizzle-orm";

import { getDb } from "@/server/db";
import {
  draws,
  participants,
  quotaReservations,
  quotaTickets,
  raffleItemImages,
  raffleItems,
  raffles,
} from "@/server/db/schema";

export async function getRafflesByAdmin(userId: string) {
  const db = getDb();

  return db
    .select({
      id: raffles.id,
      name: raffles.name,
      slug: raffles.slug,
      beneficiary: raffles.beneficiary,
      quotaPriceInCents: raffles.quotaPriceInCents,
      status: raffles.status,
      expiresAt: raffles.expiresAt,
      createdAt: raffles.createdAt,
    })
    .from(raffles)
    .where(eq(raffles.createdByUserId, userId))
    .orderBy(desc(raffles.createdAt));
}

export async function getLatestPublishedRaffleForLanding() {
  const db = getDb();

  const [raffle] = await db
    .select({
      id: raffles.id,
      name: raffles.name,
      slug: raffles.slug,
      purpose: raffles.purpose,
      beneficiary: raffles.beneficiary,
      quotaPriceInCents: raffles.quotaPriceInCents,
      status: raffles.status,
      createdAt: raffles.createdAt,
      expiresAt: raffles.expiresAt,
      itemName: raffleItems.name,
      itemId: raffleItems.id,
    })
    .from(raffles)
    .leftJoin(raffleItems, eq(raffleItems.raffleId, raffles.id))
    .where(eq(raffles.status, "published"))
    .orderBy(desc(raffles.createdAt))
    .limit(1);

  if (!raffle) {
    return null;
  }

  const [image] = raffle.itemId
    ? await db
        .select({
          imageUrl: raffleItemImages.imageUrl,
          isRealItemImage: raffleItemImages.isRealItemImage,
          sortOrder: raffleItemImages.sortOrder,
        })
        .from(raffleItemImages)
        .where(eq(raffleItemImages.raffleItemId, raffle.itemId))
        .orderBy(desc(raffleItemImages.isRealItemImage), raffleItemImages.sortOrder)
        .limit(1)
    : [];

  return {
    ...raffle,
    imageUrl: image?.imageUrl ?? null,
    isRealItemImage: image?.isRealItemImage ?? false,
  };
}

export async function getRaffleDetailsByAdmin(raffleId: string, userId: string) {
  const db = getDb();

  const [raffle] = await db
    .select({
      id: raffles.id,
      name: raffles.name,
      slug: raffles.slug,
      purpose: raffles.purpose,
      beneficiary: raffles.beneficiary,
      quotaPriceInCents: raffles.quotaPriceInCents,
      durationInDays: raffles.durationInDays,
      pixLabel: raffles.pixLabel,
      pixPayload: raffles.pixPayload,
      status: raffles.status,
      createdAt: raffles.createdAt,
      expiresAt: raffles.expiresAt,
      itemId: raffleItems.id,
      itemName: raffleItems.name,
    })
    .from(raffles)
    .leftJoin(raffleItems, eq(raffleItems.raffleId, raffles.id))
    .where(and(eq(raffles.id, raffleId), eq(raffles.createdByUserId, userId)))
    .limit(1);

  if (!raffle) {
    return null;
  }

  const images = raffle.itemId
    ? await db
        .select({
          id: raffleItemImages.id,
          imageUrl: raffleItemImages.imageUrl,
          isRealItemImage: raffleItemImages.isRealItemImage,
          sortOrder: raffleItemImages.sortOrder,
        })
        .from(raffleItemImages)
        .where(eq(raffleItemImages.raffleItemId, raffle.itemId))
    : [];

  return {
    ...raffle,
    images,
  };
}

export async function getPublicRaffleBySlug(slug: string) {
  const db = getDb();

  const [raffle] = await db
    .select({
      id: raffles.id,
      name: raffles.name,
      slug: raffles.slug,
      purpose: raffles.purpose,
      beneficiary: raffles.beneficiary,
      quotaPriceInCents: raffles.quotaPriceInCents,
      pixLabel: raffles.pixLabel,
      pixPayload: raffles.pixPayload,
      status: raffles.status,
      createdAt: raffles.createdAt,
      expiresAt: raffles.expiresAt,
      itemId: raffleItems.id,
      itemName: raffleItems.name,
    })
    .from(raffles)
    .leftJoin(raffleItems, eq(raffleItems.raffleId, raffles.id))
    .where(eq(raffles.slug, slug))
    .limit(1);

  if (!raffle) {
    return null;
  }

  const images = raffle.itemId
    ? await db
        .select({
          imageUrl: raffleItemImages.imageUrl,
          isRealItemImage: raffleItemImages.isRealItemImage,
          sortOrder: raffleItemImages.sortOrder,
        })
        .from(raffleItemImages)
        .where(eq(raffleItemImages.raffleItemId, raffle.itemId))
    : [];

  const soldTickets = await db
    .select({
      ticketId: quotaTickets.id,
      ticketNumber: quotaTickets.ticketNumber,
      paymentStatus: quotaTickets.paymentStatus,
      participantName: participants.name,
      participantEmail: participants.email,
      participantPhone: participants.phoneE164,
      reservationId: quotaReservations.id,
      reservationStatus: quotaReservations.status,
      reservedAt: quotaTickets.createdAt,
    })
    .from(quotaTickets)
    .innerJoin(participants, eq(participants.id, quotaTickets.participantId))
    .innerJoin(quotaReservations, eq(quotaReservations.id, quotaTickets.reservationId))
    .where(eq(quotaTickets.raffleId, raffle.id))
    .orderBy(desc(quotaTickets.createdAt));

  const [latestDraw] = await db
    .select({
      id: draws.id,
      winningTicketId: draws.winningTicketId,
      createdAt: draws.createdAt,
    })
    .from(draws)
    .where(eq(draws.raffleId, raffle.id))
    .orderBy(desc(draws.createdAt))
    .limit(1);

  return {
    ...raffle,
    images,
    soldTickets,
    latestDraw,
  };
}

export async function getAdminRaffleOperations(raffleId: string, userId: string) {
  const db = getDb();

  const [raffle] = await db
    .select({
      id: raffles.id,
      slug: raffles.slug,
      status: raffles.status,
    })
    .from(raffles)
    .where(and(eq(raffles.id, raffleId), eq(raffles.createdByUserId, userId)))
    .limit(1);

  if (!raffle) {
    return null;
  }

  const reservations = await db
    .select({
      reservationId: quotaReservations.id,
      reservationStatus: quotaReservations.status,
      totalAmountInCents: quotaReservations.totalAmountInCents,
      quantity: quotaReservations.quantity,
      createdAt: quotaReservations.createdAt,
      participantId: participants.id,
      participantName: participants.name,
      participantEmail: participants.email,
      participantPhone: participants.phoneE164,
      receiptEmailSentAt: quotaReservations.receiptEmailSentAt,
    })
    .from(quotaReservations)
    .innerJoin(participants, eq(participants.id, quotaReservations.participantId))
    .where(eq(quotaReservations.raffleId, raffle.id))
    .orderBy(desc(quotaReservations.createdAt));

  const tickets = await db
    .select({
      ticketId: quotaTickets.id,
      ticketNumber: quotaTickets.ticketNumber,
      paymentStatus: quotaTickets.paymentStatus,
      participantId: participants.id,
      participantName: participants.name,
      reservationId: quotaTickets.reservationId,
    })
    .from(quotaTickets)
    .innerJoin(participants, eq(participants.id, quotaTickets.participantId))
    .where(eq(quotaTickets.raffleId, raffle.id))
    .orderBy(desc(quotaTickets.createdAt));

  const [latestDraw] = await db
    .select({
      id: draws.id,
      winningTicketId: draws.winningTicketId,
      createdAt: draws.createdAt,
    })
    .from(draws)
    .where(eq(draws.raffleId, raffle.id))
    .orderBy(desc(draws.createdAt))
    .limit(1);

  const ticketsByReservation = new Map<string, string[]>();
  for (const ticket of tickets) {
    const current = ticketsByReservation.get(ticket.reservationId) ?? [];
    current.push(ticket.ticketNumber);
    ticketsByReservation.set(ticket.reservationId, current);
  }

  return {
    raffle,
    reservations: reservations.map((reservation) => ({
      ...reservation,
      ticketNumbers: ticketsByReservation.get(reservation.reservationId) ?? [],
    })),
    tickets,
    latestDraw,
  };
}
