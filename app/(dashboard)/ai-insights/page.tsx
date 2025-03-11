import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { auth } from "@/lib/auth/auth";

export default async function AIInsightsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/");
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <SidebarTrigger />
        <h1 className="text-3xl font-bold">AI Insights</h1>
      </div>
      <p className="text-muted-foreground">
        Get AI-powered insights and analysis for your trading strategies.
      </p>
    </div>
  );
}
