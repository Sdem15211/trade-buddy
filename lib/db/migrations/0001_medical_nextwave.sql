CREATE TYPE "public"."field_type" AS ENUM('text', 'select', 'multi-select');--> statement-breakpoint
CREATE TYPE "public"."trade_result" AS ENUM('win', 'break_even', 'loss');--> statement-breakpoint
CREATE TYPE "public"."trade_status" AS ENUM('order_placed', 'open', 'closed');--> statement-breakpoint
CREATE TABLE "custom_field" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"strategy_id" uuid NOT NULL,
	"name" text NOT NULL,
	"type" "field_type" NOT NULL,
	"options" json,
	"required" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "strategy" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"instrument" text NOT NULL,
	"asset" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "trade" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"strategy_id" uuid NOT NULL,
	"status" "trade_status" DEFAULT 'order_placed' NOT NULL,
	"date_opened" timestamp,
	"date_closed" timestamp,
	"result" "trade_result",
	"profit_loss" integer,
	"notes" text,
	"is_backtest" boolean DEFAULT false NOT NULL,
	"custom_values" json NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "custom_field" ADD CONSTRAINT "custom_field_strategy_id_strategy_id_fk" FOREIGN KEY ("strategy_id") REFERENCES "public"."strategy"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "strategy" ADD CONSTRAINT "strategy_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trade" ADD CONSTRAINT "trade_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trade" ADD CONSTRAINT "trade_strategy_id_strategy_id_fk" FOREIGN KEY ("strategy_id") REFERENCES "public"."strategy"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "custom_field_strategy_id_idx" ON "custom_field" USING btree ("strategy_id");--> statement-breakpoint
CREATE INDEX "strategy_user_id_idx" ON "strategy" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "trade_user_id_idx" ON "trade" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "trade_strategy_id_idx" ON "trade" USING btree ("strategy_id");