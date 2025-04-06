"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import LogTradeSheet from "@/components/trades/log-trade-sheet";
import { Strategy } from "@/lib/db/drizzle/schema";
import { Skeleton } from "@/components/ui/skeleton";
import TradesTable from "@/components/trades/trades-table";
import { useMetrics } from "@/server/data/strategies/hooks/strategy-hooks";

interface BacktestTradingDashboardProps {
  strategy: Strategy;
}

export default function BacktestTradingDashboard({
  strategy,
}: BacktestTradingDashboardProps) {
  // Use the custom hook for fetching metrics
  const { data: metrics, isLoading } = useMetrics(strategy.id, true);

  return (
    <div className="space-y-6">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Win Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-500">
              {isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                `${metrics?.winRate || 0}%`
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Profit
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-500">
              {isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                `${metrics?.totalProfit?.toFixed(2) || 0}%`
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg. Return
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-500">
              {isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                `${metrics?.avgReturn?.toFixed(2) || 0}%`
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Main Chart (2/3 width) */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>P&L</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center bg-muted/20">
            <p className="text-muted-foreground">Main Chart Placeholder</p>
          </CardContent>
        </Card>

        {/* Secondary Chart (1/3 width) */}
        <Card>
          <CardHeader>
            <CardTitle>P&L</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center bg-muted/20">
            <p className="text-muted-foreground">Secondary Chart Placeholder</p>
          </CardContent>
        </Card>
      </div>

      {/* Trades Table */}
      <TradesTable strategy={strategy} isBacktest={true} />
    </div>
  );
}
