import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import { requireConfirmedAdmin } from "@/features/auth/session";
import { updateParticipantSchema } from "@/features/participants/schemas";
import { normalizeBrazilPhone } from "@/features/participants/utils";
import { getDb } from "@/server/db";
import { participants, raffles } from "@/server/db/schema";

type RouteContext = {
  params: Promise<{
    id: string;
    participantId: string;
  }>;
};

export async function POST(request: Request, context: RouteContext): Promise<NextResponse> {
  const admin = await requireConfirmedAdmin();
  const { id, participantId } = await context.params;
  const body = (await request.json()) as { name?: string; email?: string; phone?: string };
  const parsed = updateParticipantSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.issues[0]?.message ?? "Dados invalidos do participante." },
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

  const normalizedEmail = parsed.data.email.trim().toLowerCase();
  let normalizedPhone: string;

  try {
    normalizedPhone = normalizeBrazilPhone(parsed.data.phone);
  } catch (error) {
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "Telefone invalido.",
      },
      { status: 400 },
    );
  }

  const [participant] = await db
    .select({ id: participants.id })
    .from(participants)
    .where(and(eq(participants.id, participantId), eq(participants.raffleId, raffle.id)))
    .limit(1);

  if (!participant) {
    return NextResponse.json({ message: "Participante nao encontrado." }, { status: 404 });
  }

  await db
    .update(participants)
    .set({
      name: parsed.data.name.trim(),
      email: normalizedEmail,
      phoneE164: normalizedPhone,
    })
    .where(eq(participants.id, participant.id));

  return NextResponse.json({ ok: true });
}
