"use client";

import { useQuery } from "@tanstack/react-query";
import { Trade } from "@/lib/db/drizzle/schema";

interface TradesData {
  trades: Trade[];
  total: number;
}

/**
 * Hook for fetching trades data for a specific strategy
 *
 * @param strategyId - The ID of the strategy to fetch trades for
 * @param isBacktest - Whether to fetch backtest trades or live trades
 */
export function useTrades(strategyId: string, isBacktest: boolean = false) {
  const queryKey = ["trades", strategyId, isBacktest];

  return useQuery<TradesData>({
    queryKey,
    queryFn: async () => {
      const response = await fetch(
        `/api/trades?strategyId=${strategyId}&isBacktest=${isBacktest}&sortField=dateOpened&sortDirection=desc`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch trades");
      }

      return response.json();
    },
  });
}
