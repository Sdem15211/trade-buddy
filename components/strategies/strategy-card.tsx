"use client";

import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";

interface StrategyCardProps {
  strategy: {
    id: string;
    name: string;
    description: string | null;
    instrument: string;
    createdAt: Date;
  };
}

export function StrategyCard({ strategy }: StrategyCardProps) {
  const { id, name, description, instrument, createdAt } = strategy;

  return (
    <Link href={`/strategies/${id}`} className="block">
      <Card className="h-full transition-all hover:shadow-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="line-clamp-1">{name}</CardTitle>
            <Badge variant="secondary" className="capitalize">
              {instrument}
            </Badge>
          </div>
          <CardDescription className="line-clamp-2">
            {description || "No description provided"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Content can be added here in the future */}
        </CardContent>
        <CardFooter className="text-xs text-muted-foreground">
          Created{" "}
          {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
        </CardFooter>
      </Card>
    </Link>
  );
}
