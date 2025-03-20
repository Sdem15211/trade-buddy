import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";

export default async function Dashboard() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/");
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-3xl font-bold">Dashboard</h1>
        </div>
      </div>
      <p className="text-muted-foreground">
        Welcome back, {session.user?.name || session.user?.email || ""}!
      </p>
    </div>
  );
}
