import { headers } from "next/headers";
import { db } from "../db";
import { auth } from "@/lib/auth/auth";

export async function getStrategyByName(name: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    return null;
  }

  // Find strategy by name for the current user
  const foundStrategy = await db.query.strategy.findFirst({
    where: (fields, { eq, and }) =>
      and(eq(fields.userId, session.user.id), eq(fields.name, name)),
    with: {
      customFields: true,
    },
  });

  return foundStrategy;
}

export async function getRecentTradesByStrategyId(
  strategyId: string,
  limit = 5
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    return [];
  }

  // Get recent trades for the strategy
  const trades = await db.query.trade.findMany({
    where: (fields, { eq, and }) =>
      and(
        eq(fields.userId, session.user.id),
        eq(fields.strategyId, strategyId)
      ),
    orderBy: (fields, { desc }) => [desc(fields.createdAt)],
    limit,
  });

  return trades;
}
