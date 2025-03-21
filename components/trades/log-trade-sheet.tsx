"use client";

import * as React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { X } from "lucide-react";
import { Strategy } from "@/lib/db/drizzle/schema";
import TradeForm from "./trade-form";

interface LogTradeSheetProps {
  strategy: Strategy;
  isBacktest?: boolean;
  onSuccess?: () => void;
}

export default function LogTradeSheet({
  strategy,
  isBacktest = false,
  onSuccess,
}: LogTradeSheetProps) {
  const [open, setOpen] = useState(false);

  const handleSuccess = () => {
    setOpen(false);
    if (onSuccess) {
      onSuccess();
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button>Log Trade</Button>
      </SheetTrigger>
      <SheetContent className="sm:max-w-md overflow-hidden flex flex-col">
        <div className="flex justify-between items-center pr-8">
          <SheetHeader className="pb-4">
            <SheetTitle className="text-lg font-semibold tracking-tight">
              Log Trade
            </SheetTitle>
            <SheetDescription>
              Record a new trade in your {isBacktest ? "backtest" : "live"}{" "}
              journal.
            </SheetDescription>
          </SheetHeader>
          <SheetClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </SheetClose>
        </div>
        <div
          className="flex-1 overflow-y-auto px-1"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          <style jsx global>{`
            /* Hide scrollbar for Chrome, Safari and Opera */
            .scrollbar-hide::-webkit-scrollbar {
              display: none;
            }

            /* Hide scrollbar for IE, Edge and Firefox */
            .scrollbar-hide {
              -ms-overflow-style: none; /* IE and Edge */
              scrollbar-width: none; /* Firefox */
            }
          `}</style>
          <div className="mt-2 pb-8 scrollbar-hide">
            <TradeForm
              strategy={strategy}
              isBacktest={isBacktest}
              onSuccess={handleSuccess}
            />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
