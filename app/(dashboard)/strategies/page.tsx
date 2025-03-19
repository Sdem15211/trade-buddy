import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { CreateStrategyDialog } from "@/components/strategies/create-strategy-dialog";
import { StrategyCard } from "@/components/strategies/strategy-card";
import { db } from "@/lib/db/db";
import { strategy, strategyConfig } from "@/lib/db/drizzle/schema";
import { eq } from "drizzle-orm";

export default async function StrategiesPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/");
  }

  // Fetch user's strategies
  const strategies = await db.query.strategy.findMany({
    ...strategyConfig,
    where: eq(strategy.userId, session.user.id),
    orderBy: (strategy, { desc }) => [desc(strategy.createdAt)],
  });

  return (
    <div className="p-6 w-full shrink-0 flex-1 space-y-6">
      <div className="w-full flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SidebarTrigger />
          <h1 className="text-3xl font-bold">Strategies</h1>
        </div>
        <CreateStrategyDialog>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create New Strategy
          </Button>
        </CreateStrategyDialog>
      </div>
      <p className="text-muted-foreground">
        View and manage your trading strategies here.
      </p>

      {strategies.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
          <h2 className="text-xl font-semibold">No strategies yet</h2>
          <p className="mt-2 text-muted-foreground">
            Create your first trading strategy to get started.
          </p>
          <CreateStrategyDialog>
            <Button className="mt-4">
              <PlusCircle className="mr-2 h-4 w-4" />
              Create New Strategy
            </Button>
          </CreateStrategyDialog>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {strategies.map((strategy) => (
            <StrategyCard key={strategy.id} strategy={strategy} />
          ))}
        </div>
      )}
    </div>
  );
}
