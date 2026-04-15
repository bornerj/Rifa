import {
  boolean,
  integer,
  index,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const raffleStatusEnum = pgEnum("raffle_status", [
  "draft",
  "published",
  "closed",
  "drawn",
]);

export const reservationStatusEnum = pgEnum("reservation_status", [
  "pending",
  "awaiting_payment",
  "paid",
  "cancelled",
]);

export const paymentStatusEnum = pgEnum("payment_status", [
  "pending",
  "confirmed",
  "cancelled",
]);

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 160 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  emailConfirmed: boolean("email_confirmed").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const emailVerificationTokens = pgTable(
  "email_verification_tokens",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id),
    tokenHash: text("token_hash").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    consumedAt: timestamp("consumed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    userIdIdx: index("email_verification_tokens_user_id_idx").on(table.userId),
  }),
);

export const raffles = pgTable("raffles", {
  id: uuid("id").defaultRandom().primaryKey(),
  createdByUserId: uuid("created_by_user_id")
    .notNull()
    .references(() => users.id),
  name: varchar("name", { length: 180 }).notNull(),
  purpose: text("purpose").notNull(),
  beneficiary: varchar("beneficiary", { length: 180 }).notNull(),
  slug: varchar("slug", { length: 220 }).notNull().unique(),
  quotaPriceInCents: integer("quota_price_in_cents").notNull(),
  durationInDays: integer("duration_in_days").notNull(),
  pixPayload: text("pix_payload").notNull(),
  pixLabel: varchar("pix_label", { length: 180 }).notNull(),
  status: raffleStatusEnum("status").notNull().default("draft"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
});

export const raffleItems = pgTable("raffle_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  raffleId: uuid("raffle_id")
    .notNull()
    .references(() => raffles.id),
  name: varchar("name", { length: 180 }).notNull(),
});

export const raffleItemImages = pgTable("raffle_item_images", {
  id: uuid("id").defaultRandom().primaryKey(),
  raffleItemId: uuid("raffle_item_id")
    .notNull()
    .references(() => raffleItems.id),
  imageUrl: text("image_url").notNull(),
  isRealItemImage: boolean("is_real_item_image").notNull().default(false),
  sortOrder: integer("sort_order").notNull(),
});

export const participants = pgTable("participants", {
  id: uuid("id").defaultRandom().primaryKey(),
  raffleId: uuid("raffle_id")
    .notNull()
    .references(() => raffles.id),
  name: varchar("name", { length: 180 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  phoneE164: varchar("phone_e164", { length: 20 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const quotaReservations = pgTable("quota_reservations", {
  id: uuid("id").defaultRandom().primaryKey(),
  raffleId: uuid("raffle_id")
    .notNull()
    .references(() => raffles.id),
  participantId: uuid("participant_id")
    .notNull()
    .references(() => participants.id),
  quantity: integer("quantity").notNull(),
  unitPriceInCents: integer("unit_price_in_cents").notNull(),
  totalAmountInCents: integer("total_amount_in_cents").notNull(),
  status: reservationStatusEnum("status").notNull().default("pending"),
  receiptEmailSentAt: timestamp("receipt_email_sent_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const quotaTickets = pgTable(
  "quota_tickets",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    raffleId: uuid("raffle_id")
      .notNull()
      .references(() => raffles.id),
    participantId: uuid("participant_id")
      .notNull()
      .references(() => participants.id),
    reservationId: uuid("reservation_id")
      .notNull()
      .references(() => quotaReservations.id),
    ticketNumber: varchar("ticket_number", { length: 5 }).notNull(),
    unitPriceInCents: integer("unit_price_in_cents").notNull(),
    paymentStatus: paymentStatusEnum("payment_status").notNull().default("pending"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    raffleTicketUnique: uniqueIndex("quota_tickets_raffle_ticket_unique").on(
      table.raffleId,
      table.ticketNumber,
    ),
  }),
);

export const draws = pgTable("draws", {
  id: uuid("id").defaultRandom().primaryKey(),
  raffleId: uuid("raffle_id")
    .notNull()
    .references(() => raffles.id),
  startedByUserId: uuid("started_by_user_id")
    .notNull()
    .references(() => users.id),
  winningTicketId: uuid("winning_ticket_id")
    .notNull()
    .references(() => quotaTickets.id),
  auditReference: text("audit_reference").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
