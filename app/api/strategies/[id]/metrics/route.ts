import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/db";
import { trade } from "@/lib/db/drizzle/schema";
import { eq, and, sql } from "drizzle-orm";

type paramsType = Promise<{ id: string }>;
interface MetricsPageProps {
  params: paramsType;
}

export async function GET(request: NextRequest, { params }: MetricsPageProps) {
  try {
    const { searchParams } = new URL(request.url);
    const isBacktest = searchParams.get("isBacktest") === "true";
    const strategyId = (await params).id;

    // Fetch all relevant trades
    const tradesData = await db.query.trade.findMany({
      where: and(
        eq(trade.strategyId, strategyId),
        eq(trade.isBacktest, isBacktest)
      ),
    });

    // Calculate metrics according to specified formulas
    const winningTrades = tradesData.filter((trade) => trade.result === "win");
    const breakEvenTrades = tradesData.filter(
      (trade) => trade.result === "break_even"
    );
    const relevantTradesCount = tradesData.length - breakEvenTrades.length;

    // Win rate = winning trades / (total trades - break-even trades)
    const winRate =
      relevantTradesCount > 0
        ? Math.round((winningTrades.length / relevantTradesCount) * 100)
        : 0;

    // Total profit = sum of all profit/loss percentages
    let totalProfit = 0;
    tradesData.forEach((trade) => {
      if (trade.profitLoss) {
        const plValue =
          typeof trade.profitLoss === "string"
            ? parseFloat(trade.profitLoss)
            : Number(trade.profitLoss);

        if (!isNaN(plValue)) {
          totalProfit += plValue;
        }
      }
    });

    // Avg return = average of profit/loss values
    const avgReturn =
      tradesData.length > 0
        ? parseFloat((totalProfit / tradesData.length).toFixed(2))
        : 0;

    // Round total profit to 2 decimal places
    totalProfit = parseFloat(totalProfit.toFixed(2));

    return NextResponse.json({
      winRate,
      totalProfit,
      avgReturn,
    });
  } catch (error) {
    console.error("Error fetching metrics:", error);
    return NextResponse.json(
      { error: "Failed to fetch metrics" },
      { status: 500 }
    );
  }
}
