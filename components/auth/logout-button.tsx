import { signOut } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
export default function LogoutButton() {
  const router = useRouter();
  const handleLogout = async () =>
    await signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/");
        },
      },
    });

  return (
    <form
      action={async () => {
        await handleLogout();
      }}
    >
      <Button variant="outline" type="submit">
        Sign out
      </Button>
    </form>
  );
}
