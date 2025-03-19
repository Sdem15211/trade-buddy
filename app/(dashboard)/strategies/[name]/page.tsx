import {
  getStrategyByName,
  getRecentTradesByStrategyId,
} from "@/lib/db/actions/strategies";
import { slugToReadable } from "@/lib/utils";
import { notFound } from "next/navigation";
import StrategyDetail from "./components/strategy-detail";
import { Suspense } from "react";
interface StrategyPageProps {
  params: {
    name: string;
  };
}

export default async function StrategyPage({ params }: StrategyPageProps) {
  const { name } = await params;
  const decodedName = slugToReadable(name);
  const strategy = await getStrategyByName(decodedName);

  if (!strategy) {
    return notFound();
  }

  const recentTrades = await getRecentTradesByStrategyId(strategy.id);

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <StrategyDetail strategy={strategy} />
    </Suspense>
  );
}
