"use server";

import { revalidatePath } from "next/cache";

import { requireConfirmedAdmin } from "@/features/auth/session";
import { createRaffleSchema } from "@/features/raffles/schemas";
import { logger } from "@/lib/logger";
import { slugify } from "@/lib/utils";
import { getDb } from "@/server/db";
import { raffleItemImages, raffleItems, raffles } from "@/server/db/schema";
import { eq } from "drizzle-orm";

export type CreateRaffleActionState = {
  status: "idle" | "error" | "success";
  message?: string;
  redirectTo?: string;
  fieldErrors?: Partial<Record<"purpose", string>>;
};

export async function createRaffleAction(
  _prevState: CreateRaffleActionState,
  formData: FormData,
): Promise<CreateRaffleActionState> {
  const traceId = crypto.randomUUID();

  try {
    logger.info("Create raffle started", { traceId });

    const admin = await requireConfirmedAdmin();
    logger.info("Create raffle admin confirmed", { traceId, adminId: admin.id });

    const imageEntries = formData
      .getAll("images")
      .map((entry) => String(entry).trim())
      .filter(Boolean);
    logger.info("Create raffle images parsed", {
      traceId,
      imageCount: imageEntries.length,
    });

    const parsed = createRaffleSchema.safeParse({
      name: formData.get("name"),
      purpose: formData.get("purpose"),
      beneficiary: formData.get("beneficiary"),
      durationInDays: formData.get("durationInDays"),
      quotaPriceInCents: formData.get("quotaPriceInCents"),
      itemName: formData.get("itemName"),
      images: imageEntries,
    });

    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0];
      logger.warn("Create raffle validation failed", {
        traceId,
        issue: firstIssue?.message,
      });
      return {
        status: "error",
        message: firstIssue?.message ?? "Nao foi possivel criar a rifa.",
        fieldErrors:
          firstIssue?.path[0] === "purpose"
            ? {
                purpose: firstIssue.message,
              }
            : undefined,
      };
    }

    logger.info("Create raffle validation passed", {
      traceId,
      name: parsed.data.name,
      durationInDays: parsed.data.durationInDays,
      quotaPriceInCents: parsed.data.quotaPriceInCents,
    });

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

    logger.info("Create raffle slug resolved", { traceId, slug });

    const createdAt = new Date();
    const expiresAt = new Date(
      createdAt.getTime() + parsed.data.durationInDays * 24 * 60 * 60 * 1000,
    );

    const createdRaffleId = await db.transaction(async (tx) => {
      logger.info("Create raffle transaction opened", { traceId });

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
          pixLabel: "",
          pixPayload: "",
          status: "published",
          expiresAt,
        })
        .returning({
          id: raffles.id,
        });

      logger.info("Create raffle row inserted", {
        traceId,
        raffleId: createdRaffle.id,
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

      logger.info("Create raffle item inserted", {
        traceId,
        itemId: createdItem.id,
      });

      await tx.insert(raffleItemImages).values(
        parsed.data.images.map((imageUrl, index) => ({
          raffleItemId: createdItem.id,
          imageUrl,
          isRealItemImage: index === 0,
          sortOrder: index,
        })),
      );

      logger.info("Create raffle images inserted", {
        traceId,
        imageCount: parsed.data.images.length,
      });

      return createdRaffle.id;
    });

    revalidatePath("/admin");
    revalidatePath("/");

    logger.info("Create raffle finished", {
      traceId,
      redirectTo: `/admin/rifas/${createdRaffleId}`,
    });

    return {
      status: "success",
      message: "Rifa criada com sucesso.",
      redirectTo: `/admin/rifas/${createdRaffleId}`,
    };
  } catch (error) {
    logger.error("Failed to create raffle", {
      traceId,
      error: error instanceof Error ? error.message : "Unknown error",
    });

    return {
      status: "error",
      message:
        process.env.NODE_ENV === "development" && error instanceof Error
          ? `Nao foi possivel salvar a rifa: ${error.message}`
          : "Nao foi possivel salvar a rifa agora. Confira os campos e tente novamente.",
    };
  }
}
