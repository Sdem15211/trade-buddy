import { getStrategyByName } from "@/server/data/strategies/strategies";
import { slugToReadable } from "@/lib/utils";
import { notFound } from "next/navigation";
import StrategyDetail from "../../../../components/strategies/strategy-detail";

type paramsType = Promise<{ name: string }>;
interface StrategyPageProps {
  params: paramsType;
}

export default async function StrategyPage({ params }: StrategyPageProps) {
  const { name } = await params;
  const decodedName = slugToReadable(name);
  const strategy = await getStrategyByName(decodedName);

  if (!strategy) {
    return notFound();
  }

  return <StrategyDetail strategy={strategy} />;
}
