"use client";

import * as React from "react";
import { useActionState, startTransition, useEffect } from "react";
import { toast } from "sonner";
import { createStrategy } from "@/lib/db/actions/strategies";
import { instrumentOptions } from "@/lib/constants/assets";
import { useRouter } from "next/navigation";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ActionResponse } from "@/lib/types/strategies";
import { CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface CreateStrategyDialogProps {
  children: React.ReactNode;
}
const initialState: ActionResponse = {
  success: false,
  message: "",
};

export function CreateStrategyDialog({ children }: CreateStrategyDialogProps) {
  const [open, setOpen] = React.useState(false);
  const formRef = React.useRef<HTMLFormElement>(null);
  const router = useRouter();

  const [state, formAction, isPending] = useActionState(
    createStrategy,
    initialState
  );

  useEffect(() => {
    if (state.success && state.message) {
      toast.success(state.message);

      setOpen(false);

      startTransition(() => {
        formAction(new FormData());
      });
    }
  }, [state.success, state.message, formAction]);

  const handleDialogOpenChange = (newOpen: boolean) => {
    if (!isPending) {
      setOpen(newOpen);
      if (!newOpen && formRef.current) {
        formRef.current.reset();
        startTransition(() => {
          formAction(new FormData());
        });
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px] md:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create New Strategy</DialogTitle>
          <DialogDescription>
            Create a new trading strategy to track your trades and performance.
          </DialogDescription>
        </DialogHeader>
        <form ref={formRef} action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              name="name"
              defaultValue={state?.data?.name}
              placeholder="My Trading Strategy"
              className={state?.errors?.name ? "border-red-500" : ""}
            />
            {state?.errors?.name && (
              <div className="name">
                <p id="name-error" className="text-sm text-red-500">
                  {state.errors.name[0]}
                </p>
              </div>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">
              Description{" "}
              <span className="text-muted-foreground">
                (optional, recommended)
              </span>
            </Label>
            <Textarea
              id="description"
              name="description"
              defaultValue={state?.data?.description}
              placeholder="Describe your trading strategy..."
              className={state?.errors?.description ? "border-red-500" : ""}
            />
            {state?.errors?.description && (
              <div className="description">
                <p id="description-error" className="text-sm text-red-500">
                  {state.errors.description[0]}
                </p>
              </div>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="instrument">Instrument</Label>
            <Select
              name="instrument"
              required
              defaultValue={state?.data?.instrument}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select instrument" />
              </SelectTrigger>
              <SelectContent>
                {instrumentOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {state?.errors?.instrument && (
              <div className="instrument">
                <p id="instrument-error" className="text-sm text-red-500">
                  {state.errors.instrument[0]}
                </p>
              </div>
            )}
          </div>
          {state?.message && (
            <Alert variant={state.success ? "default" : "destructive"}>
              {state.success && <CheckCircle2 className="h-4 w-4" />}
              <AlertDescription>{state.message}</AlertDescription>
            </Alert>
          )}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Creating..." : "Create Strategy"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
