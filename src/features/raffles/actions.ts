"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireConfirmedAdmin } from "@/features/auth/session";
import { createRaffleSchema } from "@/features/raffles/schemas";
import { slugify } from "@/lib/utils";
import { getDb } from "@/server/db";
import { raffleItemImages, raffleItems, raffles } from "@/server/db/schema";
import { eq } from "drizzle-orm";

export type CreateRaffleActionState = {
  status: "idle" | "error" | "success";
  message?: string;
};

export async function createRaffleAction(
  _prevState: CreateRaffleActionState,
  formData: FormData,
): Promise<CreateRaffleActionState> {
  const admin = await requireConfirmedAdmin();
  const imageEntries = formData
    .getAll("images")
    .map((entry) => String(entry).trim())
    .filter(Boolean);

  const parsed = createRaffleSchema.safeParse({
    name: formData.get("name"),
    purpose: formData.get("purpose"),
    beneficiary: formData.get("beneficiary"),
    durationInDays: formData.get("durationInDays"),
    quotaPriceInCents: formData.get("quotaPriceInCents"),
    pixLabel: formData.get("pixLabel"),
    pixPayload: formData.get("pixPayload"),
    itemName: formData.get("itemName"),
    images: imageEntries,
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? "Nao foi possivel criar a rifa.",
    };
  }

  const db = getDb();
  const baseSlug = slugify(parsed.data.name);
  let slug = baseSlug;
  let suffix = 1;

  while (true) {
    const [existing] = await db
      .select({ id: raffles.id })
      .from(raffles)
      .where(eq(raffles.slug, slug))
      .limit(1);

    if (!existing) {
      break;
    }

    suffix += 1;
    slug = `${baseSlug}-${suffix}`;
  }

  const createdAt = new Date();
  const expiresAt = new Date(createdAt.getTime() + parsed.data.durationInDays * 24 * 60 * 60 * 1000);

  const createdRaffleId = await db.transaction(async (tx) => {
    const [createdRaffle] = await tx
      .insert(raffles)
      .values({
        createdByUserId: admin.id,
        name: parsed.data.name.trim(),
        purpose: parsed.data.purpose.trim(),
        beneficiary: parsed.data.beneficiary.trim(),
        slug,
        quotaPriceInCents: parsed.data.quotaPriceInCents,
        durationInDays: parsed.data.durationInDays,
        pixLabel: parsed.data.pixLabel.trim(),
        pixPayload: parsed.data.pixPayload.trim(),
        status: "published",
        expiresAt,
      })
      .returning({
        id: raffles.id,
      });

    const [createdItem] = await tx
      .insert(raffleItems)
      .values({
        raffleId: createdRaffle.id,
        name: parsed.data.itemName.trim(),
      })
      .returning({
        id: raffleItems.id,
      });

    await tx.insert(raffleItemImages).values(
      parsed.data.images.map((imageUrl, index) => ({
        raffleItemId: createdItem.id,
        imageUrl,
        sortOrder: index,
      })),
    );

    return createdRaffle.id;
  });

  revalidatePath("/admin");
  revalidatePath("/");
  redirect(`/admin/rifas/${createdRaffleId}`);
}
