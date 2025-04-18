"use client";

import * as React from "react";
import { useState, useCallback } from "react";
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
import { Pencil, Plus, Trash2, X } from "lucide-react";
import { Strategy, Trade } from "@/lib/db/drizzle/schema";
import TradeForm from "./trade-form";

interface LogTradeSheetProps {
  strategy: Strategy;
  isBacktest?: boolean;
  edit?: boolean;
  trade?: Trade;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export default function LogTradeSheet({
  strategy,
  isBacktest = false,
  edit = false,
  trade,
  open: controlledOpen,
  onOpenChange,
}: LogTradeSheetProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;

  const handleSuccess = useCallback(() => {
    setOpen(false);
  }, [setOpen]);

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      {!edit && controlledOpen === undefined && (
        <SheetTrigger asChild>
          <Button variant="default" size="default">
            Log Trade
            <Plus className="w-4 h-4 ml-2" />
          </Button>
        </SheetTrigger>
      )}
      <SheetContent className="sm:max-w-md overflow-hidden flex flex-col">
        <div className="flex justify-between items-center pr-8">
          <SheetHeader className="pb-4">
            <SheetTitle className="text-lg font-semibold tracking-tight">
              {edit ? "Edit Trade" : "Log Trade"}
            </SheetTitle>
            <SheetDescription>
              {edit
                ? "Edit an existing trade in your journal."
                : "Record a new trade in your journal."}
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
            {edit ? (
              <TradeForm
                strategy={strategy}
                isBacktest={isBacktest}
                trade={trade as Trade}
                onSuccess={handleSuccess}
              />
            ) : (
              <TradeForm
                strategy={strategy}
                isBacktest={isBacktest}
                onSuccess={handleSuccess}
              />
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
