import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { SidebarTrigger } from "@/components/ui/sidebar";

export default async function StrategiesPage() {
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
        <h1 className="text-3xl font-bold">Strategies</h1>
      </div>
      <p className="text-muted-foreground">
        View and manage your trading strategies here.
      </p>
    </div>
  );
}
