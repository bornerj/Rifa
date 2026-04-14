import { randomInt } from "node:crypto";

import { NextResponse } from "next/server";
import { and, desc, eq } from "drizzle-orm";

import { requireConfirmedAdmin } from "@/features/auth/session";
import { createAuditReference } from "@/features/participants/utils";
import { getDb } from "@/server/db";
import { draws, quotaTickets, raffles } from "@/server/db/schema";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(_request: Request, context: RouteContext): Promise<NextResponse> {
  const admin = await requireConfirmedAdmin();
  const { id } = await context.params;
  const db = getDb();

  const [raffle] = await db
    .select({
      id: raffles.id,
      status: raffles.status,
    })
    .from(raffles)
    .where(and(eq(raffles.id, id), eq(raffles.createdByUserId, admin.id)))
    .limit(1);

  if (!raffle) {
    return NextResponse.json({ message: "Rifa nao encontrada." }, { status: 404 });
  }

  const [existingDraw] = await db
    .select({ id: draws.id })
    .from(draws)
    .where(eq(draws.raffleId, raffle.id))
    .orderBy(desc(draws.createdAt))
    .limit(1);

  if (existingDraw) {
    return NextResponse.json({ message: "Sorteio ja realizado." }, { status: 409 });
  }

  const eligibleTickets = await db
    .select({
      id: quotaTickets.id,
    })
    .from(quotaTickets)
    .where(and(eq(quotaTickets.raffleId, raffle.id), eq(quotaTickets.paymentStatus, "confirmed")));

  if (!eligibleTickets.length) {
    return NextResponse.json(
      { message: "Nao existem cotas pagas para sortear." },
      { status: 400 },
    );
  }

  const winner = eligibleTickets[randomInt(0, eligibleTickets.length)];

  await db.transaction(async (tx) => {
    await tx.insert(draws).values({
      raffleId: raffle.id,
      startedByUserId: admin.id,
      winningTicketId: winner.id,
      auditReference: createAuditReference(),
    });

    await tx.update(raffles).set({ status: "drawn" }).where(eq(raffles.id, raffle.id));
  });

  return NextResponse.json({ ok: true });
}
