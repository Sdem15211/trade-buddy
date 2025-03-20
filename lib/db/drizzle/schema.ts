import {
  pgTable,
  text,
  timestamp,
  boolean,
  uuid,
  json,
  integer,
  index,
  pgEnum,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at"),
  updatedAt: timestamp("updated_at"),
});

// Enums for the trading strategy functionality
export const fieldTypeEnum = pgEnum("field_type", [
  "text",
  "select",
  "multi-select",
]);
export const tradeStatusEnum = pgEnum("trade_status", [
  "order_placed",
  "open",
  "closed",
]);
export const tradeResultEnum = pgEnum("trade_result", [
  "win",
  "break_even",
  "loss",
]);
export const instrumentEnum = pgEnum("instrument", [
  "forex",
  "crypto",
  "stocks",
]);
export const directionEnum = pgEnum("direction", ["long", "short"]);

// Strategy table
export const strategy = pgTable(
  "strategy",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    description: text("description"),
    instrument: instrumentEnum("instrument").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    index("strategy_user_id_idx").on(table.userId),
    uniqueIndex("strategy_user_id_name_unique_idx").on(
      table.userId,
      table.name
    ),
  ]
);

// Custom Field table for strategies
export const customField = pgTable(
  "custom_field",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    strategyId: uuid("strategy_id")
      .notNull()
      .references(() => strategy.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    type: fieldTypeEnum("type").notNull(),
    options: json("options").$type<string[]>(), // Array of options for select and multi-select fields
    required: boolean("required").notNull().default(false),
  },
  (table) => [index("custom_field_strategy_id_idx").on(table.strategyId)]
);

// Trade table
export const trade = pgTable(
  "trade",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    strategyId: uuid("strategy_id")
      .notNull()
      .references(() => strategy.id, { onDelete: "cascade" }),
    status: tradeStatusEnum("status").notNull().default("order_placed"),
    asset: text("asset").notNull(),
    dateOpened: timestamp("date_opened"), // null if order_placed
    dateClosed: timestamp("date_closed"), // null if still open
    direction: directionEnum("direction").notNull(),
    result: tradeResultEnum("result"), // null if not closed
    profitLoss: integer("profit_loss"), // Can be positive or negative
    notes: text("notes"),
    isBacktest: boolean("is_backtest").notNull().default(false),
    customValues: json("custom_values").notNull().$type<Record<string, any>>(), // Values for custom fields
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    index("trade_user_id_idx").on(table.userId),
    index("trade_strategy_id_idx").on(table.strategyId),
  ]
);

// Relations
export const strategyRelations = relations(strategy, ({ many }) => ({
  customFields: many(customField),
}));

export const customFieldRelations = relations(customField, ({ one }) => ({
  strategy: one(strategy, {
    fields: [customField.strategyId],
    references: [strategy.id],
  }),
}));

// Query Config
export const strategyConfig = {
  with: {
    customFields: true,
  },
} as const;

export type CustomField = typeof customField.$inferSelect;
export type Strategy = typeof strategy.$inferSelect;
export type Trade = typeof trade.$inferSelect;
