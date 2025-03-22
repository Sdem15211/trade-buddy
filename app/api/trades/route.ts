import { auth } from "@/lib/auth/auth";
import { db } from "@/lib/db/db";
import { trade } from "@/lib/db/drizzle/schema";
import { NextRequest, NextResponse } from "next/server";
import { and, eq, desc, asc, sql } from "drizzle-orm";
import { headers } from "next/headers";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const strategyId = searchParams.get("strategyId");
    const isBacktest = searchParams.get("isBacktest") === "true";
    const sortField = searchParams.get("sortField") || "createdAt";
    const sortDirection = searchParams.get("sortDirection") || "desc";

    // Check authentication using the headers
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "You must be logged in to access trades" },
        { status: 401 }
      );
    }

    if (!strategyId) {
      return NextResponse.json(
        { error: "Strategy ID is required" },
        { status: 400 }
      );
    }

    // Get the total count
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(trade)
      .where(
        and(
          eq(trade.userId, session.user.id),
          eq(trade.strategyId, strategyId),
          eq(trade.isBacktest, isBacktest)
        )
      );

    const totalCount = countResult[0].count;

    // Get paginated trades with proper ordering
    const trades = await db.query.trade.findMany({
      where: (fields, { eq, and }) =>
        and(
          eq(fields.userId, session.user.id),
          eq(fields.strategyId, strategyId),
          eq(fields.isBacktest, isBacktest)
        ),
      orderBy: (fields, { desc, asc }) => [
        sortDirection === "desc"
          ? desc(fields[sortField as keyof typeof fields])
          : asc(fields[sortField as keyof typeof fields]),
      ],
    });

    return NextResponse.json({
      trades,
      totalCount,
    });
  } catch (error) {
    console.error("Error fetching trades:", error);
    return NextResponse.json(
      { error: "Failed to fetch trades" },
      { status: 500 }
    );
  }
}
