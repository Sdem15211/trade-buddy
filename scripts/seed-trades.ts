#!/usr/bin/env node
import { seedArcherFullTrades } from "./seed/archer-full-trades";

async function seedAll() {
  console.log("🌱 Starting seed process...");

  try {
    await seedArcherFullTrades();
    console.log("✅ All seed operations completed successfully!");
  } catch (error) {
    console.error("❌ Seed process failed:", error);
    process.exit(1);
  }
}

seedAll();
