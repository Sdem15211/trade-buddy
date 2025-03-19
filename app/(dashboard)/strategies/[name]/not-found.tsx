import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export default function StrategyNotFound() {
  return (
    <div className="container py-10 flex flex-col items-center justify-center text-center">
      <AlertCircle className="h-16 w-16 text-muted-foreground mb-6" />
      <h1 className="text-3xl font-bold mb-2">Strategy Not Found</h1>
      <p className="text-lg text-muted-foreground mb-8">
        The strategy you&apos;re looking for does not exist or you don&apos;t
        have access to it.
      </p>
      <Button asChild>
        <Link href="/strategies">Back to Strategies</Link>
      </Button>
    </div>
  );
}
