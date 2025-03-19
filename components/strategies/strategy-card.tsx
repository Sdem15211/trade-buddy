"use client";

import { useState } from "react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Calendar, MoreHorizontal, Trash2 } from "lucide-react";
import { deleteStrategy } from "@/lib/db/actions/strategies";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

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
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await deleteStrategy(strategy.id);
      toast.success("Strategy deleted successfully");
      router.refresh();
    } catch (error) {
      toast.error("Failed to delete strategy. Please try again.");
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  // Stop event propagation to prevent navigation when clicking on dropdown
  const handleDropdownClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <Card className="h-full transition-all hover:shadow-md relative group">
      <Link href={`/strategies/${id}`} className="block h-full">
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
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Created{" "}
              {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
            </div>
            <div onClick={handleDropdownClick} className="relative z-10">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => setShowDeleteDialog(true)}
                    className="text-destructive focus:text-destructive cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete strategy
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardFooter>
      </Link>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the &quot;{name}&quot; strategy and
              all associated data. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
