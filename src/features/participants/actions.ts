"use server";

import { randomInt } from "node:crypto";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { and, desc, eq } from "drizzle-orm";

import { requireConfirmedAdmin } from "@/features/auth/session";
import { reserveQuotaSchema, requestOtpSchema } from "@/features/participants/schemas";
import { sendOtpMessage } from "@/features/participants/sms";
import {
  createAuditReference,
  generateOtpCode,
  generateTicketNumber,
  hashOtpCode,
  normalizeBrazilPhone,
  verifyOtpCode,
} from "@/features/participants/utils";
import { getDb } from "@/server/db";
import {
  draws,
  otpChallenges,
  participants,
  quotaReservations,
  quotaTickets,
  raffles,
} from "@/server/db/schema";

export type ParticipantActionState = {
  status: "idle" | "error" | "success";
  message?: string;
  previewCode?: string;
  reservationId?: string;
};

const initialState: ParticipantActionState = {
  status: "idle",
};

export { initialState as initialParticipantActionState };

export async function requestOtpAction(
  _prevState: ParticipantActionState,
  formData: FormData,
): Promise<ParticipantActionState> {
  const parsed = requestOtpSchema.safeParse({
    raffleId: formData.get("raffleId"),
    name: formData.get("name"),
    phone: formData.get("phone"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? "Nao foi possivel solicitar o codigo.",
    };
  }

  const db = getDb();
  const normalizedPhone = normalizeBrazilPhone(parsed.data.phone);
  const otpCode = generateOtpCode();
  const expiresAt = new Date(Date.now() + 1000 * 60 * 10);

  await db.insert(otpChallenges).values({
    phoneE164: normalizedPhone,
    codeHash: hashOtpCode(otpCode),
    expiresAt,
  });

  const delivery = await sendOtpMessage({
    phone: normalizedPhone,
    code: otpCode,
  });

  return {
    status: "success",
    message: delivery.delivered
      ? "Codigo enviado com sucesso. Confira seu telefone."
      : "Codigo gerado em modo de preview. Use o codigo abaixo para continuar.",
    previewCode: delivery.previewCode,
  };
}

export async function reserveQuotaAction(
  _prevState: ParticipantActionState,
  formData: FormData,
): Promise<ParticipantActionState> {
  const parsed = reserveQuotaSchema.safeParse({
    raffleId: formData.get("raffleId"),
    name: formData.get("name"),
    phone: formData.get("phone"),
    otpCode: formData.get("otpCode"),
    quantity: formData.get("quantity"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? "Nao foi possivel reservar as cotas.",
    };
  }

  const db = getDb();
  const normalizedPhone = normalizeBrazilPhone(parsed.data.phone);

  const [challenge] = await db
    .select({
      id: otpChallenges.id,
      codeHash: otpChallenges.codeHash,
      expiresAt: otpChallenges.expiresAt,
      verifiedAt: otpChallenges.verifiedAt,
      attempts: otpChallenges.attempts,
    })
    .from(otpChallenges)
    .where(eq(otpChallenges.phoneE164, normalizedPhone))
    .orderBy(desc(otpChallenges.createdAt))
    .limit(1);

  if (!challenge) {
    return {
      status: "error",
      message: "Solicite o codigo OTP antes de reservar as cotas.",
    };
  }

  if (challenge.verifiedAt) {
    return {
      status: "error",
      message: "Esse codigo ja foi utilizado. Solicite um novo OTP.",
    };
  }

  if (challenge.expiresAt.getTime() < Date.now()) {
    return {
      status: "error",
      message: "Seu codigo expirou. Gere outro para continuar.",
    };
  }

  if (!verifyOtpCode(parsed.data.otpCode, challenge.codeHash)) {
    await db
      .update(otpChallenges)
      .set({
        attempts: challenge.attempts + 1,
      })
      .where(eq(otpChallenges.id, challenge.id));

    return {
      status: "error",
      message: "Codigo invalido. Confira os 6 digitos enviados.",
    };
  }

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

  await db.transaction(async (tx) => {
    const [existingParticipant] = await tx
      .select({
        id: participants.id,
      })
      .from(participants)
      .where(and(eq(participants.raffleId, raffle.id), eq(participants.phoneE164, normalizedPhone)))
      .limit(1);

    const participantId =
      existingParticipant?.id ??
      (
        await tx
          .insert(participants)
          .values({
            raffleId: raffle.id,
            name: parsed.data.name.trim(),
            phoneE164: normalizedPhone,
            phoneVerifiedAt: new Date(),
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
        quantity: parsed.data.quantity,
        unitPriceInCents: raffle.quotaPriceInCents,
        totalAmountInCents: raffle.quotaPriceInCents * parsed.data.quantity,
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

    for (let index = 0; index < parsed.data.quantity; index += 1) {
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

    await tx
      .update(otpChallenges)
      .set({
        verifiedAt: new Date(),
      })
      .where(eq(otpChallenges.id, challenge.id));
  });

  revalidatePath(`/r/${raffle.slug}`);
  return {
    status: "success",
    message: "Cotas reservadas com sucesso. Agora siga para o pagamento via PIX.",
  };
}

export async function confirmPaymentAction(formData: FormData): Promise<void> {
  const admin = await requireConfirmedAdmin();
  const raffleId = String(formData.get("raffleId"));
  const reservationId = String(formData.get("reservationId"));

  const db = getDb();
  const [raffle] = await db
    .select({
      id: raffles.id,
      slug: raffles.slug,
    })
    .from(raffles)
    .where(and(eq(raffles.id, raffleId), eq(raffles.createdByUserId, admin.id)))
    .limit(1);

  if (!raffle) {
    redirect("/admin");
  }

  await db.transaction(async (tx) => {
    await tx
      .update(quotaReservations)
      .set({
        status: "paid",
      })
      .where(eq(quotaReservations.id, reservationId));

    await tx
      .update(quotaTickets)
      .set({
        paymentStatus: "confirmed",
      })
      .where(eq(quotaTickets.reservationId, reservationId));
  });

  revalidatePath(`/admin/rifas/${raffleId}`);
  revalidatePath(`/r/${raffle.slug}`);
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
