import { db } from "../../lib/db/db";
import {
  trade,
  directionEnum,
  tradeStatusEnum,
  tradeResultEnum,
  customField,
  strategy,
} from "../../lib/db/drizzle/schema";
import { eq } from "drizzle-orm";

const STRATEGY_ID = "9f9a283e-a73b-46ed-960d-2323ea2c94d6";
const USER_ID = "xQIb37i3aTc92j7sw7VMv4LvgrkQO3Ia";

// Forex pairs to use for trades
const FOREX_PAIRS = [
  "EUR/USD",
  "GBP/USD",
  "USD/JPY",
  "AUD/USD",
  "USD/CHF",
  "USD/CAD",
  "EUR/GBP",
  "EUR/JPY",
  "GBP/JPY",
];

// Types from schema
type Direction = (typeof directionEnum.enumValues)[number];
type TradeStatus = (typeof tradeStatusEnum.enumValues)[number];
type TradeResult = (typeof tradeResultEnum.enumValues)[number];

// Random date between November 2024 and now
function randomDate(start: Date, end: Date) {
  return new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime())
  );
}

// Random decimal between min and max with 2 decimal places
function randomDecimal(min: number, max: number) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(2));
}

// Random element from array
function randomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

// Generate random profit/loss percentage between -12% and +12%
function generateProfitLoss(result: TradeResult) {
  if (result === "win") {
    // For a win, generate between 0.5% and 12%
    return randomDecimal(0.5, 12).toString();
  } else if (result === "loss") {
    // For a loss, generate between -12% and -0.5%
    return (-randomDecimal(0.5, 12)).toString();
  } else {
    // For break even, generate between -0.4% and 0.4%
    return randomDecimal(-0.1, 0.1).toString();
  }
}

async function seedArcherFullTrades() {
  console.log("🌱 Seeding Archer Full trades...");

  // First, fetch the custom fields for the Archer Full strategy
  const strategyData = await db.query.strategy.findFirst({
    where: eq(strategy.id, STRATEGY_ID),
    with: {
      customFields: true,
    },
  });

  if (!strategyData) {
    throw new Error(`Strategy with ID ${STRATEGY_ID} not found`);
  }

  console.log(`📋 Found strategy: ${strategyData.name}`);
  console.log(`🔍 Found ${strategyData.customFields.length} custom fields`);

  const startDate = new Date(2024, 10, 1); // November 2024
  const endDate = new Date(); // Current date

  const trades = Array.from({ length: 35 }, (_, i) => {
    const direction = Math.random() > 0.5 ? "long" : ("short" as Direction);
    const result =
      Math.random() > 0.5
        ? "win"
        : Math.random() > 0.4
        ? "break_even"
        : ("loss" as TradeResult);
    const profitLoss = generateProfitLoss(result);

    const dateOpened = randomDate(startDate, endDate);
    const dateClosed = new Date(dateOpened);
    dateClosed.setHours(dateOpened.getHours() + Math.floor(Math.random() * 72)); // 0-72 hours later

    // Generate custom values based on the actual custom fields of the strategy
    const customValues: Record<string, any> = {};

    for (const field of strategyData.customFields) {
      if (field.type === "select" && field.options) {
        // For select fields, choose a random option from the available options
        customValues[field.name] = randomElement(field.options as string[]);
      } else if (field.type === "multi-select" && field.options) {
        // For multi-select fields, choose 1-3 random options
        const options = field.options as string[];
        const numToSelect = Math.floor(Math.random() * 3) + 1;
        const selectedOptions = Array.from({ length: numToSelect }, () =>
          randomElement(options)
        );
        // Remove duplicates
        customValues[field.name] = [...new Set(selectedOptions)];
      } else if (field.type === "text") {
        // For text fields, generate some sample text based on the field name
        if (
          field.name.toLowerCase().includes("ratio") ||
          field.name.toLowerCase().includes("r:r")
        ) {
          customValues[field.name] = (Math.random() * 3 + 1).toFixed(1) + ":1";
        } else if (
          field.name.toLowerCase().includes("note") ||
          field.name.toLowerCase().includes("comment")
        ) {
          customValues[field.name] = `Sample note for trade ${i + 1}`;
        } else {
          customValues[field.name] = `Value for ${field.name} - Trade ${i + 1}`;
        }
      }
    }

    return {
      userId: USER_ID,
      strategyId: STRATEGY_ID,
      status: "closed" as TradeStatus,
      asset: randomElement(FOREX_PAIRS),
      dateOpened,
      dateClosed,
      direction,
      result,
      profitLoss,
      notes: `Trade ${i + 1} for Archer Full strategy testing.`,
      isBacktest: false,
      customValues,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  });

  try {
    // Delete existing trades for this strategy to avoid duplicates
    await db.delete(trade).where(eq(trade.strategyId, STRATEGY_ID));
    console.log("🧹 Removed existing trades for Archer Full strategy");

    // Insert all trades in a single batch
    for (const tradeData of trades) {
      await db.insert(trade).values(tradeData);
    }
    console.log(
      `✅ Successfully seeded ${trades.length} trades for Archer Full strategy!`
    );
    return trades.length;
  } catch (error) {
    console.error("❌ Error seeding trades:", error);
    throw error;
  }
}

// Execute the seed function if this file is run directly
if (require.main === module) {
  seedArcherFullTrades()
    .then(() => {
      console.log("✨ Seeding completed!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Seeding failed:", error);
      process.exit(1);
    });
}

export { seedArcherFullTrades };
