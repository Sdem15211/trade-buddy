"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Strategy } from "@/lib/db/drizzle/schema";
import TradesTable from "@/components/trades/trades-table";

interface LiveTradingDashboardProps {
  strategy: Strategy;
}

export default function LiveTradingDashboard({
  strategy,
}: LiveTradingDashboardProps) {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-3 gap-4">
        <div className="grid grid-cols-1 gap-4 col-span-1">
          <Card className="bg-primary">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-primary-foreground/90">
                Win Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary-foreground w-full flex justify-end">
                57%
              </div>
            </CardContent>
          </Card>

          <Card className="bg-primary">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-primary-foreground/90">
                Total Profit
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary-foreground w-full flex justify-end">
                81.40%
              </div>
            </CardContent>
          </Card>

          <Card className="bg-primary">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-primary-foreground/90">
                Avg. Return
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary-foreground w-full flex justify-end">
                3.85%
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
