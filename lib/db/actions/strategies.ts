"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { db } from "../db";
import { auth } from "../../auth/auth";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import { strategy, customField } from "../drizzle/schema";
import { ActionResponse } from "@/lib/types/strategies";

const customFieldSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Field name is required"),
  type: z.enum(["text", "select", "multi-select"]),
  options: z.array(z.string()).optional(),
  required: z.boolean().default(false),
});

const createStrategySchema = z.object({
  name: z.string().min(1, "Strategy name is required"),
  description: z.string().optional(),
  instrument: z.string().min(1, "Instrument is required"),
  customFields: z.array(customFieldSchema).optional(),
});

const updateStrategySchema = createStrategySchema.extend({
  id: z.string().min(1, "Strategy ID is required"),
});

const deleteStrategySchema = z.object({
  id: z.string().min(1, "Strategy ID is required"),
});

export type CreateStrategyInput = z.infer<typeof createStrategySchema>;
export type UpdateStrategyInput = z.infer<typeof updateStrategySchema>;
export type DeleteStrategyInput = z.infer<typeof deleteStrategySchema>;

export async function createStrategy(
  prevState: ActionResponse,
  formData: FormData
): Promise<ActionResponse> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user?.id) {
    return {
      success: false,
      message: "You must be logged in to create a strategy",
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

  let customFieldsData: z.infer<typeof customFieldSchema>[] = [];

  try {
    const customFieldsJson = formData.get("customFields") as string;
    if (customFieldsJson) {
      customFieldsData = JSON.parse(customFieldsJson);
    }
  } catch (error) {
    console.error("Error parsing custom fields:", error);
    return {
      success: false,
      message: "Invalid custom fields data",
    };
  }

  const dataToValidate: CreateStrategyInput = {
    name: rawData.name as string,
    description: rawData.description as string,
    instrument: rawData.instrument as string,
    customFields: customFieldsData,
  };
  const validationResult = createStrategySchema.safeParse(dataToValidate);

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
    // Start a transaction to ensure all operations succeed or fail together
    return await db.transaction(async (tx: any) => {
      const [newStrategy] = await tx
        .insert(strategy)
        .values({
          userId: session.user.id,
          name: validatedData.name,
          description: validatedData.description || null,
          instrument: validatedData.instrument,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();

      if (validatedData.customFields && validatedData.customFields.length > 0) {
        const customFieldsToInsert = validatedData.customFields.map(
          (field: any) => ({
            strategyId: newStrategy.id,
            name: field.name,
            type: field.type,
            options:
              field.options && field.options.length > 0 ? field.options : null,
            required: field.required,
          })
        );

        await tx.insert(customField).values(customFieldsToInsert);
      }

      revalidatePath("/strategies");

      return {
        success: true,
        message: "Strategy created successfully",
        strategy: newStrategy,
      };
    });
  } catch (error) {
    console.error("Error creating strategy:", error);
    return {
      success: false,
      message: "Failed to create strategy. Please try again.",
    };
  }
}

export async function updateStrategy(formData: FormData) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user?.id) {
    throw new Error("You must be logged in to update a strategy");
  }

  const rawData = Object.fromEntries(formData.entries());

  let customFieldsData: z.infer<typeof customFieldSchema>[] = [];

  try {
    const customFieldsJson = formData.get("customFields") as string;
    if (customFieldsJson) {
      customFieldsData = JSON.parse(customFieldsJson);
    }
  } catch (error) {
    console.error("Error parsing custom fields:", error);
    throw new Error("Invalid custom fields data");
  }

  const dataToValidate: UpdateStrategyInput = {
    id: rawData.id as string,
    name: rawData.name as string,
    description: rawData.description as string,
    instrument: rawData.instrument as string,
    customFields: customFieldsData,
  };

  const validationResult = updateStrategySchema.safeParse(dataToValidate);

  if (!validationResult.success) {
    const errors = validationResult.error.format();
    console.error("Validation errors:", errors);
    throw new Error(`Validation failed: ${JSON.stringify(errors)}`);
  }

  const validatedData = validationResult.data;

  try {
    const existingStrategy = await db.query.strategy.findFirst({
      where: (fields: any, { eq, and }: any) =>
        and(
          eq(fields.id, validatedData.id),
          eq(fields.userId, session.user.id)
        ),
    });

    if (!existingStrategy) {
      throw new Error(
        "Strategy not found or you don't have permission to update it"
      );
    }

    return await db.transaction(async (tx: any) => {
      const [updatedStrategy] = await tx
        .update(strategy)
        .set({
          name: validatedData.name,
          description: validatedData.description || null,
          instrument: validatedData.instrument,
          updatedAt: new Date(),
        })
        .where(eq(strategy.id, validatedData.id))
        .returning();

      if (validatedData.customFields && validatedData.customFields.length > 0) {
        const existingFields = await tx
          .select({ id: customField.id })
          .from(customField)
          .where(eq(customField.strategyId, validatedData.id));

        const existingFieldIds = new Set(
          existingFields.map((field: any) => field.id)
        );

        const fieldsToUpdate: any[] = [];
        const fieldsToCreate: any[] = [];

        validatedData.customFields.forEach((field: any) => {
          if (field.id && existingFieldIds.has(field.id)) {
            fieldsToUpdate.push({
              id: field.id,
              name: field.name,
              type: field.type,
              options:
                field.options && field.options.length > 0
                  ? field.options
                  : null,
              required: field.required,
            });
            existingFieldIds.delete(field.id);
          } else {
            fieldsToCreate.push({
              strategyId: validatedData.id,
              name: field.name,
              type: field.type,
              options:
                field.options && field.options.length > 0
                  ? field.options
                  : null,
              required: field.required,
            });
          }
        });

        for (const field of fieldsToUpdate) {
          await tx
            .update(customField)
            .set({
              name: field.name,
              type: field.type,
              options: field.options,
              required: field.required,
            })
            .where(eq(customField.id, field.id));
        }

        if (fieldsToCreate.length > 0) {
          await tx.insert(customField).values(fieldsToCreate);
        }

        if (existingFieldIds.size > 0) {
          for (const fieldId of existingFieldIds) {
            await tx
              .delete(customField)
              .where(eq(customField.id, fieldId as string));
          }
        }
      } else {
        await tx
          .delete(customField)
          .where(eq(customField.strategyId, validatedData.id));
      }

      revalidatePath("/strategies");
      revalidatePath(`/strategies/${validatedData.id}`);

      return { success: true, strategy: updatedStrategy };
    });
  } catch (error) {
    console.error("Error updating strategy:", error);
    throw new Error("Failed to update strategy. Please try again.");
  }
}

export async function deleteStrategy(formData: FormData) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user?.id) {
    throw new Error("You must be logged in to delete a strategy");
  }

  const rawData = Object.fromEntries(formData.entries());

  const dataToValidate: DeleteStrategyInput = {
    id: rawData.id as string,
  };

  const validationResult = deleteStrategySchema.safeParse(dataToValidate);

  if (!validationResult.success) {
    const errors = validationResult.error.format();
    console.error("Validation errors:", errors);
    throw new Error(`Validation failed: ${JSON.stringify(errors)}`);
  }

  const validatedData = validationResult.data;

  try {
    const existingStrategy = await db.query.strategy.findFirst({
      where: (fields: any, { eq, and }: any) =>
        and(
          eq(fields.id, validatedData.id),
          eq(fields.userId, session.user.id)
        ),
    });

    if (!existingStrategy) {
      throw new Error(
        "Strategy not found or you don't have permission to delete it"
      );
    }

    return await db.transaction(async (tx: any) => {
      await tx
        .delete(customField)
        .where(eq(customField.strategyId, validatedData.id));

      await tx.delete(strategy).where(eq(strategy.id, validatedData.id));

      revalidatePath("/strategies");

      return { success: true };
    });
  } catch (error) {
    console.error("Error deleting strategy:", error);
    throw new Error("Failed to delete strategy. Please try again.");
  }
}
