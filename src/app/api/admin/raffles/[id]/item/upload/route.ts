import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";

import { requireConfirmedAdmin } from "@/features/auth/session";
import { getDb } from "@/server/db";
import { raffles } from "@/server/db/schema";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

const acceptedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const maxFileSizeInBytes = 4 * 1024 * 1024;

export async function POST(request: Request, context: RouteContext): Promise<NextResponse> {
  const admin = await requireConfirmedAdmin();
  const { id } = await context.params;

  const db = getDb();
  const [raffle] = await db
    .select({ id: raffles.id })
    .from(raffles)
    .where(and(eq(raffles.id, id), eq(raffles.createdByUserId, admin.id)))
    .limit(1);

  if (!raffle) {
    return NextResponse.json({ message: "Rifa nao encontrada." }, { status: 404 });
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ message: "Imagem invalida." }, { status: 400 });
  }

  if (!acceptedTypes.has(file.type)) {
    return NextResponse.json({ message: "Use uma imagem JPG, PNG ou WebP." }, { status: 400 });
  }

  if (file.size > maxFileSizeInBytes) {
    return NextResponse.json({ message: "A imagem deve ter no maximo 4 MB." }, { status: 400 });
  }

  const extension = file.type.split("/")[1] ?? "jpg";
  const blob = await put(`raffles/${raffle.id}/real-item-image.${extension}`, file, {
    access: "public",
    addRandomSuffix: true,
  });

  return NextResponse.json({ imageUrl: blob.url });
}
