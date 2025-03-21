"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { db } from "../db";
import { auth } from "../../auth/auth";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import { trade, strategy } from "../drizzle/schema";
import { ActionResponse } from "@/lib/types/strategies";
import { createSlug } from "@/lib/utils";

const createTradeSchema = z.object({
  strategyId: z.string().uuid("Invalid strategy ID"),
  status: z.enum(["order_placed", "open", "closed"], {
    errorMap: () => ({ message: "Invalid trade status" }),
  }),
  asset: z.string().min(1, "Asset is required"),
  dateOpened: z.string().optional().nullable(),
  dateClosed: z.string().optional().nullable(),
  direction: z.enum(["long", "short"], {
    errorMap: () => ({ message: "Invalid trade direction" }),
  }),
  result: z
    .enum(["win", "break_even", "loss"], {
      errorMap: () => ({ message: "Invalid result" }),
    })
    .optional()
    .nullable(),
  profitLoss: z.coerce
    .number()
    .refine((val) => val === null || val === undefined || !isNaN(val), {
      message: "Profit/Loss must be a valid number",
    })
    .optional()
    .nullable(),
  notes: z.string().optional(),
  isBacktest: z.boolean().default(false),
  customValues: z.record(z.string(), z.any()).optional(),
});

const updateTradeSchema = createTradeSchema.extend({
  id: z.string().uuid("Invalid trade ID"),
});

const deleteTradeSchema = z.object({
  id: z.string().uuid("Invalid trade ID"),
  strategyId: z.string().uuid("Invalid strategy ID"),
});

export type CreateTradeInput = z.infer<typeof createTradeSchema>;
export type UpdateTradeInput = z.infer<typeof updateTradeSchema>;
export type DeleteTradeInput = z.infer<typeof deleteTradeSchema>;

export async function createTrade(
  prevState: ActionResponse,
  formData: FormData
): Promise<ActionResponse> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    return {
      success: false,
      message: "You must be logged in to create a trade",
    };
  }

  // Check if FormData is empty (used for resetting the form state)
  if (formData.entries().next().done) {
    return {
      success: false,
      message: "",
    };
  }

  const rawData = Object.fromEntries(formData.entries());

  let customValuesData = {};
  try {
    const customValuesJson = formData.get("customValues") as string;
    if (customValuesJson) {
      customValuesData = JSON.parse(customValuesJson);
    }
  } catch (error) {
    console.error("Error parsing custom values:", error);
    return {
      success: false,
      message: "Invalid custom values data",
    };
  }

  // Convert string dates to Date objects if they exist
  const dateOpened = rawData.dateOpened ? rawData.dateOpened.toString() : null;
  const dateClosed = rawData.dateClosed ? rawData.dateClosed.toString() : null;

  // Parse profit/loss as a decimal number
  let profitLossValue = null;
  if (rawData.profitLoss) {
    const profitLossString = rawData.profitLoss.toString().trim();
    profitLossValue = profitLossString ? parseFloat(profitLossString) : null;
  }

  const dataToValidate: CreateTradeInput = {
    strategyId: rawData.strategyId as string,
    status: rawData.status as "order_placed" | "open" | "closed",
    asset: rawData.asset as string,
    dateOpened,
    dateClosed,
    direction: rawData.direction as "long" | "short",
    result: (rawData.result as "win" | "break_even" | "loss") || null,
    profitLoss: profitLossValue,
    notes: (rawData.notes as string) || "",
    isBacktest: rawData.isBacktest === "true",
    customValues: customValuesData,
  };

  const validationResult = createTradeSchema.safeParse(dataToValidate);

  if (!validationResult.success) {
    const errors = validationResult.error.format();
    console.error("Validation errors:", errors);
    return {
      success: false,
      message: "Please fix errors in the form",
      errors: validationResult.error.flatten().fieldErrors,
      data: dataToValidate,
    };
  }

  const validatedData = validationResult.data;

  try {
    // Verify the strategy exists and belongs to the user
    const userStrategy = await db.query.strategy.findFirst({
      where: (fields, { eq, and }) =>
        and(
          eq(fields.id, validatedData.strategyId),
          eq(fields.userId, session.user.id)
        ),
    });

    if (!userStrategy) {
      return {
        success: false,
        message: "Strategy not found or you don't have permission to access it",
      };
    }

    // Insert the new trade
    const [newTrade] = await db
      .insert(trade)
      .values({
        userId: session.user.id,
        strategyId: validatedData.strategyId,
        status: validatedData.status,
        asset: validatedData.asset,
        dateOpened: validatedData.dateOpened
          ? new Date(validatedData.dateOpened)
          : null,
        dateClosed: validatedData.dateClosed
          ? new Date(validatedData.dateClosed)
          : null,
        direction: validatedData.direction,
        result: validatedData.result,
        profitLoss:
          validatedData.profitLoss !== null &&
          validatedData.profitLoss !== undefined
            ? validatedData.profitLoss.toString()
            : null,
        notes: validatedData.notes || "",
        isBacktest: validatedData.isBacktest,
        customValues: validatedData.customValues || {},
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    // Revalidate paths with proper slug
    const strategySlug = createSlug(userStrategy.name);
    revalidatePath(`/strategies/${strategySlug}`);

    return {
      success: true,
      message: "Trade logged successfully",
      trade: newTrade,
    };
  } catch (error) {
    console.error("Error creating trade:", error);
    return {
      success: false,
      message: "Failed to log trade. Please try again.",
    };
  }
}

export async function updateTrade(
  prevState: ActionResponse,
  formData: FormData
): Promise<ActionResponse> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    return {
      success: false,
      message: "You must be logged in to update a trade",
    };
  }

  const rawData = Object.fromEntries(formData.entries());

  let customValuesData = {};
  try {
    const customValuesJson = formData.get("customValues") as string;
    if (customValuesJson) {
      customValuesData = JSON.parse(customValuesJson);
    }
  } catch (error) {
    console.error("Error parsing custom values:", error);
    return {
      success: false,
      message: "Invalid custom values data",
    };
  }

  // Convert string dates to Date objects if they exist
  const dateOpened = rawData.dateOpened ? rawData.dateOpened.toString() : null;
  const dateClosed = rawData.dateClosed ? rawData.dateClosed.toString() : null;

  // Parse profit/loss as a decimal number
  let profitLossValue = null;
  if (rawData.profitLoss) {
    const profitLossString = rawData.profitLoss.toString().trim();
    profitLossValue = profitLossString ? parseFloat(profitLossString) : null;
  }

  const dataToValidate: UpdateTradeInput = {
    id: rawData.id as string,
    strategyId: rawData.strategyId as string,
    status: rawData.status as "order_placed" | "open" | "closed",
    asset: rawData.asset as string,
    dateOpened,
    dateClosed,
    direction: rawData.direction as "long" | "short",
    result: (rawData.result as "win" | "break_even" | "loss") || null,
    profitLoss: profitLossValue,
    notes: (rawData.notes as string) || "",
    isBacktest: rawData.isBacktest === "true",
    customValues: customValuesData,
  };

  const validationResult = updateTradeSchema.safeParse(dataToValidate);

  if (!validationResult.success) {
    const errors = validationResult.error.format();
    console.error("Validation errors:", errors);
    return {
      success: false,
      message: "Please fix errors in the form",
      errors: validationResult.error.flatten().fieldErrors,
      data: dataToValidate,
    };
  }

  const validatedData = validationResult.data;

  try {
    // Get the strategy first to ensure it exists and get its name
    const userStrategy = await db.query.strategy.findFirst({
      where: (fields, { eq, and }) =>
        and(
          eq(fields.id, validatedData.strategyId),
          eq(fields.userId, session.user.id)
        ),
    });

    if (!userStrategy) {
      return {
        success: false,
        message: "Strategy not found or you don't have permission to access it",
      };
    }

    // Verify the trade exists and belongs to the user
    const existingTrade = await db.query.trade.findFirst({
      where: (fields, { eq, and }) =>
        and(
          eq(fields.id, validatedData.id),
          eq(fields.userId, session.user.id)
        ),
    });

    if (!existingTrade) {
      return {
        success: false,
        message: "Trade not found or you don't have permission to update it",
      };
    }

    // Update the trade
    const [updatedTrade] = await db
      .update(trade)
      .set({
        status: validatedData.status,
        asset: validatedData.asset,
        dateOpened: validatedData.dateOpened
          ? new Date(validatedData.dateOpened)
          : null,
        dateClosed: validatedData.dateClosed
          ? new Date(validatedData.dateClosed)
          : null,
        direction: validatedData.direction,
        result: validatedData.result,
        profitLoss:
          validatedData.profitLoss !== null &&
          validatedData.profitLoss !== undefined
            ? validatedData.profitLoss.toString()
            : null,
        notes: validatedData.notes || "",
        customValues: validatedData.customValues || {},
        updatedAt: new Date(),
      })
      .where(eq(trade.id, validatedData.id))
      .returning();

    // Revalidate paths with proper slug
    const strategySlug = createSlug(userStrategy.name);
    revalidatePath(`/strategies/${strategySlug}`);

    return {
      success: true,
      message: "Trade updated successfully",
      trade: updatedTrade,
    };
  } catch (error) {
    console.error("Error updating trade:", error);
    return {
      success: false,
      message: "Failed to update trade. Please try again.",
    };
  }
}

export async function deleteTrade(
  id: string,
  strategyId: string
): Promise<ActionResponse> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    return {
      success: false,
      message: "You must be logged in to delete a trade",
    };
  }

  try {
    // Get the strategy first to ensure it exists and get its name
    const userStrategy = await db.query.strategy.findFirst({
      where: (fields, { eq, and }) =>
        and(eq(fields.id, strategyId), eq(fields.userId, session.user.id)),
    });

    if (!userStrategy) {
      return {
        success: false,
        message: "Strategy not found or you don't have permission to access it",
      };
    }

    // Verify the trade exists and belongs to the user
    const existingTrade = await db.query.trade.findFirst({
      where: (fields, { eq, and }) =>
        and(eq(fields.id, id), eq(fields.userId, session.user.id)),
    });

    if (!existingTrade) {
      return {
        success: false,
        message: "Trade not found or you don't have permission to delete it",
      };
    }

    // Delete the trade
    await db.delete(trade).where(eq(trade.id, id));

    // Revalidate paths with proper slug
    const strategySlug = createSlug(userStrategy.name);
    revalidatePath(`/strategies/${strategySlug}`);

    return {
      success: true,
      message: "Trade deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting trade:", error);
    return {
      success: false,
      message: "Failed to delete trade. Please try again.",
    };
  }
}
