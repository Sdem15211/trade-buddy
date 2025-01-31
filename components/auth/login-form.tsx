import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import GoogleSignInButton from "@/components/auth/google-sign-in-button";

export default function LoginForm() {
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Log in</CardTitle>
        <CardDescription>
          Sign in with your Google account to continue.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <GoogleSignInButton />
      </CardContent>
    </Card>
  );
}
