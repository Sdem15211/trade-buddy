"use client";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  DropdownMenu,
  DropdownMenuContent,
} from "@/components/ui/dropdown-menu";
import { Pencil, Trash2, ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Strategy } from "@/lib/db/drizzle/schema";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tabs } from "@/components/ui/tabs";
import { useState } from "react";
import Link from "next/link";
import LiveTradingDashboard from "./live-trading-dashboard";
import BacktestTradingDashboard from "./backtest-trading-dashboard";

export default function StrategyDetail({ strategy }: { strategy: Strategy }) {
  const [activeTab, setActiveTab] = useState("live");
  return (
    <div className="flex flex-col gap-6 h-full w-full">
      <div className="relative flex items-center justify-between border-b pb-5">
        <div className="flex items-center gap-4">
          <Link href="/strategies">
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tighter">
              {strategy.name}
            </h1>
            <Badge variant="outline" className="font-medium mt-1">
              {strategy.instrument}
            </Badge>
          </div>
        </div>
        <Tabs
          defaultValue="live"
          className="w-fit absolute left-1/2 -translate-x-1/2"
          onValueChange={setActiveTab}
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="live">Live Trading</TabsTrigger>
            <TabsTrigger value="backtest">Backtesting</TabsTrigger>
          </TabsList>
        </Tabs>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem className="text-sm font-medium cursor-pointer">
              <Pencil className="mr-2 h-4 w-4" />
              <span>Modify</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive text-sm font-medium cursor-pointer">
              <Trash2 className="mr-2 h-4 w-4" />
              <span>Delete</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {activeTab === "live" ? (
        <LiveTradingDashboard strategy={strategy} />
      ) : (
        <BacktestTradingDashboard strategy={strategy} />
      )}
    </div>
  );
}
