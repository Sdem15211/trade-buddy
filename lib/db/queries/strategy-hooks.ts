"use client";

import { useQuery } from "@tanstack/react-query";

// Type for the metrics data
interface StrategyMetrics {
  winRate: number;
  totalProfit: number;
  avgReturn: number;
}

/**
 * Hook for fetching metrics data for a specific strategy
 *
 * @param strategyId - The ID of the strategy to fetch metrics for
 * @param isBacktest - Whether to fetch backtest metrics or live metrics
 */
export function useMetrics(
  strategyId: string | undefined,
  isBacktest: boolean = false
) {
  return useQuery<StrategyMetrics>({
    queryKey: ["metrics", strategyId, isBacktest],
    queryFn: async () => {
      if (!strategyId) throw new Error("No strategy ID provided");

      const response = await fetch(
        `/api/strategies/${strategyId}/metrics?isBacktest=${isBacktest}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch metrics");
      }

      return response.json();
    },
    enabled: !!strategyId, // Only run the query if a strategyId is provided
  });
}
