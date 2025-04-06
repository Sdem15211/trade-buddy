"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Strategy } from "@/lib/db/drizzle/schema";
import TradesTable from "@/components/trades/trades-table";
import { Skeleton } from "@/components/ui/skeleton";
import { useMetrics } from "@/server/data/strategies/hooks/strategy-hooks";

interface LiveTradingDashboardProps {
  strategy: Strategy;
}

export default function LiveTradingDashboard({
  strategy,
}: LiveTradingDashboardProps) {
  const { data: metrics, isLoading } = useMetrics(strategy.id, false);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-3 gap-4">
        <div className="grid grid-cols-1 gap-4 col-span-1">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold w-full flex justify-end">
                {isLoading ? (
                  <Skeleton className="h-8 w-16 bg-primary-foreground/20" />
                ) : (
                  `${metrics?.winRate || 0}%`
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Total Profit
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold w-full flex justify-end">
                {isLoading ? (
                  <Skeleton className="h-8 w-16 bg-primary-foreground/20" />
                ) : (
                  `${metrics?.totalProfit?.toFixed(2) || 0}%`
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Avg. Return</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold w-full flex justify-end">
                {isLoading ? (
                  <Skeleton className="h-8 w-16 bg-primary-foreground/20" />
                ) : (
                  `${metrics?.avgReturn?.toFixed(2) || 0}%`
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>P&L</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center bg-muted/20">
            <p className="text-muted-foreground">Main Chart Placeholder</p>
          </CardContent>
        </Card>
      </div>

      <TradesTable strategy={strategy} isBacktest={false} />
    </div>
  );
}
