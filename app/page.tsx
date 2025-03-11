import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function Home() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <h1 className="text-4xl font-bold">Welcome to the App</h1>
      <Button>
        <Link
          className="font-semibold"
          href={session?.session ? "/dashboard" : "/login"}
        >
          {session?.session ? "Go to your Dashboard" : "Login here"}
        </Link>
      </Button>
    </div>
  );
}
