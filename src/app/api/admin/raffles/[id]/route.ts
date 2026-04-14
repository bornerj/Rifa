import { NextResponse } from "next/server";

import { requireConfirmedAdmin } from "@/features/auth/session";
import {
  getAdminRaffleOperations,
  getRaffleDetailsByAdmin,
} from "@/features/raffles/repository";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_request: Request, context: RouteContext): Promise<NextResponse> {
  const admin = await requireConfirmedAdmin();
  const { id } = await context.params;

  const raffle = await getRaffleDetailsByAdmin(id, admin.id);
  const operations = await getAdminRaffleOperations(id, admin.id);

  if (!raffle || !operations) {
    return NextResponse.json({ message: "Rifa nao encontrada." }, { status: 404 });
  }

  return NextResponse.json({
    raffle,
    operations,
  });
}
