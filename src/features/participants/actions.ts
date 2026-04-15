"use server";

import { randomInt } from "node:crypto";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { and, eq } from "drizzle-orm";

import { requireConfirmedAdmin } from "@/features/auth/session";
import { reserveQuotaSchema } from "@/features/participants/schemas";
import {
  createAuditReference,
  generateTicketNumber,
  normalizeBrazilPhone,
} from "@/features/participants/utils";
import { getDb } from "@/server/db";
import {
  draws,
  participants,
  quotaReservations,
  quotaTickets,
  raffles,
} from "@/server/db/schema";

export type ParticipantActionState = {
  status: "idle" | "error" | "success";
  message?: string;
  reservationId?: string;
  ticketNumbers?: string[];
  totalAmountInCents?: number;
};

export async function reserveQuotaAction(
  _prevState: ParticipantActionState,
  formData: FormData,
): Promise<ParticipantActionState> {
  const parsed = reserveQuotaSchema.safeParse({
    raffleId: formData.get("raffleId"),
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? "Nao foi possivel reservar as cotas.",
    };
  }

  const db = getDb();
  const quantity = 1;
  const normalizedPhone = normalizeBrazilPhone(parsed.data.phone);
  const normalizedEmail = parsed.data.email.trim().toLowerCase();

  const [raffle] = await db
    .select({
      id: raffles.id,
      slug: raffles.slug,
      quotaPriceInCents: raffles.quotaPriceInCents,
      status: raffles.status,
      expiresAt: raffles.expiresAt,
    })
    .from(raffles)
    .where(eq(raffles.id, parsed.data.raffleId))
    .limit(1);

  if (!raffle || raffle.status !== "published" || raffle.expiresAt.getTime() < Date.now()) {
    return {
      status: "error",
      message: "Essa rifa nao esta disponivel para novas cotas.",
    };
  }

  const reservationResult = await db.transaction(async (tx) => {
    const [existingParticipant] = await tx
      .select({
        id: participants.id,
      })
      .from(participants)
      .where(and(eq(participants.raffleId, raffle.id), eq(participants.email, normalizedEmail)))
      .limit(1);

    const participantId =
      existingParticipant?.id ??
      (
        await tx
          .insert(participants)
          .values({
            raffleId: raffle.id,
            name: parsed.data.name.trim(),
            email: normalizedEmail,
            phoneE164: normalizedPhone,
          })
          .returning({
            id: participants.id,
          })
      )[0].id;

    const [reservation] = await tx
      .insert(quotaReservations)
      .values({
        raffleId: raffle.id,
        participantId,
        quantity,
        unitPriceInCents: raffle.quotaPriceInCents,
        totalAmountInCents: raffle.quotaPriceInCents * quantity,
        status: "awaiting_payment",
      })
      .returning({
        id: quotaReservations.id,
      });

    const existingTickets = await tx
      .select({
        ticketNumber: quotaTickets.ticketNumber,
      })
      .from(quotaTickets)
      .where(eq(quotaTickets.raffleId, raffle.id));

    const usedTicketNumbers = new Set(existingTickets.map((ticket) => ticket.ticketNumber));
    const ticketsToCreate: Array<{
      raffleId: string;
      participantId: string;
      reservationId: string;
      ticketNumber: string;
      unitPriceInCents: number;
    }> = [];

    for (let index = 0; index < quantity; index += 1) {
      let ticketNumber = generateTicketNumber();
      while (usedTicketNumbers.has(ticketNumber)) {
        ticketNumber = generateTicketNumber();
      }
      usedTicketNumbers.add(ticketNumber);
      ticketsToCreate.push({
        raffleId: raffle.id,
        participantId,
        reservationId: reservation.id,
        ticketNumber,
        unitPriceInCents: raffle.quotaPriceInCents,
      });
    }

    await tx.insert(quotaTickets).values(ticketsToCreate);

    return {
      reservationId: reservation.id,
      ticketNumbers: ticketsToCreate.map((ticket) => ticket.ticketNumber),
      totalAmountInCents: raffle.quotaPriceInCents * quantity,
    };
  });

  revalidatePath(`/r/${raffle.slug}`);
  return {
    status: "success",
    message:
      "Cota gerada com sucesso. Pague o PIX e aguarde o email de confirmacao apos a validacao do admin.",
    reservationId: reservationResult.reservationId,
    ticketNumbers: reservationResult.ticketNumbers,
    totalAmountInCents: reservationResult.totalAmountInCents,
  };
}

export async function runDrawAction(formData: FormData): Promise<void> {
  const admin = await requireConfirmedAdmin();
  const raffleId = String(formData.get("raffleId"));

  const db = getDb();
  const [raffle] = await db
    .select({
      id: raffles.id,
      slug: raffles.slug,
      status: raffles.status,
    })
    .from(raffles)
    .where(and(eq(raffles.id, raffleId), eq(raffles.createdByUserId, admin.id)))
    .limit(1);

  if (!raffle) {
    redirect("/admin");
  }

  const eligibleTickets = await db
    .select({
      id: quotaTickets.id,
    })
    .from(quotaTickets)
    .where(and(eq(quotaTickets.raffleId, raffle.id), eq(quotaTickets.paymentStatus, "confirmed")));

  if (!eligibleTickets.length) {
    redirect(`/admin/rifas/${raffle.id}`);
  }

  const winner = eligibleTickets[randomInt(0, eligibleTickets.length)];

  await db.transaction(async (tx) => {
    await tx.insert(draws).values({
      raffleId: raffle.id,
      startedByUserId: admin.id,
      winningTicketId: winner.id,
      auditReference: createAuditReference(),
    });

    await tx
      .update(raffles)
      .set({
        status: "drawn",
      })
      .where(eq(raffles.id, raffle.id));
  });

  revalidatePath(`/admin/rifas/${raffle.id}`);
  revalidatePath(`/r/${raffle.slug}`);
}
