import { signOut } from "@/auth";
import { Button } from "@/components/ui/button";

export default function LogoutButton() {
  const handleLogout = async () => {
    "use server";
    await signOut({ redirectTo: "/" });
  };

  return (
    <form action={handleLogout}>
      <Button variant="outline" type="submit">
        Sign out
      </Button>
    </form>
  );
}
