"use client";
import { signOut } from "@/lib/auth/auth-client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { LogOut } from "lucide-react";
import { useState } from "react";
export default function LogoutButton() {
  const router = useRouter();
  const [isSignOut, setIsSignOut] = useState(false);

  return (
    <Button
      className="gap-2 z-10"
      variant="secondary"
      onClick={async () => {
        setIsSignOut(true);
        await signOut({
          fetchOptions: {
            onSuccess() {
              router.push("/");
            },
          },
        });
        setIsSignOut(false);
      }}
      disabled={isSignOut}
    >
      <span className="text-sm">
        {isSignOut ? (
          <Loader2 size={15} className="animate-spin" />
        ) : (
          <div className="flex items-center gap-2">
            <LogOut size={16} />
            Sign Out
          </div>
        )}
      </span>
    </Button>
  );
}
