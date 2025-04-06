"use client";

import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";
import { createTrade, updateTrade } from "@/server/actions/trades";
import { Strategy, CustomField, Trade } from "@/lib/db/drizzle/schema";
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
import { cn } from "@/lib/utils";
import { ActionResponse } from "@/lib/types/strategies";
import { format } from "date-fns";
import { getAssetsByInstrument } from "@/lib/constants/assets";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, TrendingUp, TrendingDown } from "lucide-react";
import MultipleSelector, { Option } from "@/components/ui/multiselect";
import { useQueryClient } from "@tanstack/react-query";

interface ExtendedStrategy extends Strategy {
  customFields?: CustomField[];
}

interface TradeFormProps {
  strategy: ExtendedStrategy;
  isBacktest?: boolean;
  trade?: Trade;
}

const initialState: ActionResponse = {
  success: false,
  message: "",
};

export default function TradeForm({
  strategy,
  isBacktest = false,
  trade,
}: TradeFormProps) {
  const [state, formAction, isPending] = useActionState(
    trade ? updateTrade : createTrade,
    initialState
  );

  const [customValues, setCustomValues] = useState<Record<string, any>>(
    trade?.customValues || {}
  );

  const [tradeStatus, setTradeStatus] = useState<
    "order_placed" | "open" | "closed"
  >(trade?.status || "order_placed");

  const [selectedResult, setSelectedResult] = useState<
    "win" | "loss" | "break_even" | null
  >(trade?.result || null);

  const [dateOpened, setDateOpened] = useState<Date | undefined>(
    trade?.dateOpened ? new Date(trade.dateOpened) : undefined
  );

  const [dateClosed, setDateClosed] = useState<Date | undefined>(
    trade?.dateClosed ? new Date(trade.dateClosed) : undefined
  );

  const [asset, setAsset] = useState<string>(trade?.asset || "");
  const [direction, setDirection] = useState<string>(
    trade?.direction || "long"
  );
  const [profitLoss, setProfitLoss] = useState<string>(
    trade?.profitLoss?.toString() || ""
  );
  const [notes, setNotes] = useState<string>(trade?.notes || "");

  const assetOptions = getAssetsByInstrument(strategy.instrument);

  const statusId = "trade-status";
  const assetId = "trade-asset";
  const resultId = "trade-result";
  const profitLossId = "trade-profit-loss";
  const notesId = "trade-notes";

  const queryClient = useQueryClient();

  useEffect(() => {
    console.log("State changed:", {
      success: state.success,
      message: state.message,
      trade: state.trade,
    });
    if (state.success && state.message) {
      toast.success(state.message);
      queryClient.invalidateQueries({
        queryKey: ["trades", strategy.id, isBacktest],
      });
      queryClient.invalidateQueries({
        queryKey: ["metrics", strategy.id, isBacktest],
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.success, state.message]);

  useEffect(() => {
    if (tradeStatus === "order_placed") {
      setDateOpened(undefined);
    } else if (!dateOpened) {
      setDateOpened(new Date());
    }

    if (tradeStatus !== "closed") {
      setDateClosed(undefined);
    } else if (tradeStatus === "closed" && !dateClosed) {
      setDateClosed(new Date());
    }
  }, [tradeStatus, dateOpened, dateClosed]);

  const handleCustomFieldChange = (fieldId: string, value: any) => {
    setCustomValues((prev) => ({
      ...prev,
      [fieldId]: value,
    }));
  };

  const handleSubmit = (formData: FormData) => {
    console.log("Submitting form with state:", state);
    if (
      dateOpened &&
      dateOpened instanceof Date &&
      !isNaN(dateOpened.getTime())
    ) {
      const dateOpenedString = dateOpened.toISOString();
      formData.append("dateOpened", dateOpenedString);
    }

    if (
      dateClosed &&
      dateClosed instanceof Date &&
      !isNaN(dateClosed.getTime())
    ) {
      const dateClosedString = dateClosed.toISOString();
      formData.append("dateClosed", dateClosedString);
    }

    const customValuesString = JSON.stringify(customValues);
    formData.append("customValues", customValuesString);

    formData.append("isBacktest", isBacktest.toString());
    formData.append("strategyId", strategy.id);
    if (trade?.id) {
      formData.append("id", trade.id);
    }

    return formAction(formData);
  };

  return (
    <form action={handleSubmit} className="space-y-6 px-3">
      <div className="space-y-4">
        {/* Trade Status */}
        <div className="space-y-2">
          <Label htmlFor={statusId}>Status</Label>
          <Select
            name="status"
            defaultValue={tradeStatus}
            onValueChange={(value) => setTradeStatus(value as any)}
            required
          >
            <SelectTrigger id={statusId} className="w-full">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="order_placed">Order Placed</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
          {state?.errors?.status && (
            <p className="text-sm text-red-500">{state.errors.status[0]}</p>
          )}
        </div>

        {/* Asset */}
        <div className="space-y-2">
          <Label htmlFor={assetId}>Asset</Label>
          <Select name="asset" value={asset} onValueChange={setAsset} required>
            <SelectTrigger id={assetId} className="w-full">
              <SelectValue placeholder="Select asset" />
            </SelectTrigger>
            <SelectContent>
              {assetOptions.map((asset) => (
                <SelectItem key={asset.value} value={asset.value}>
                  {asset.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {state?.errors?.asset && (
            <p className="text-sm text-red-500">{state.errors.asset[0]}</p>
          )}
        </div>

        {/* Direction */}
        <div className="space-y-2">
          <Label>Direction</Label>
          <RadioGroup
            name="direction"
            value={direction}
            onValueChange={setDirection}
            className="grid grid-cols-2 gap-2"
          >
            <div className="border-input has-data-[state=checked]:border-ring relative flex flex-col gap-4 rounded-md border p-4 shadow-xs outline-none">
              <div className="flex justify-between gap-2">
                <RadioGroupItem
                  id="long"
                  value="long"
                  className="order-1 after:absolute after:inset-0"
                />
                <TrendingUp
                  className="text-green-500"
                  size={18}
                  aria-hidden="true"
                />
              </div>
              <Label htmlFor="long">Long</Label>
            </div>
            <div className="border-input has-data-[state=checked]:border-ring relative flex flex-col gap-4 rounded-md border p-4 shadow-xs outline-none">
              <div className="flex justify-between gap-2">
                <RadioGroupItem
                  id="short"
                  value="short"
                  className="order-1 after:absolute after:inset-0"
                />
                <TrendingDown
                  className="text-red-500"
                  size={18}
                  aria-hidden="true"
                />
              </div>
              <Label htmlFor="short">Short</Label>
            </div>
          </RadioGroup>
          {state?.errors?.direction && (
            <p className="text-sm text-red-500">{state.errors.direction[0]}</p>
          )}
        </div>

        {/* Date Opened */}
        <div className="space-y-2">
          <Label htmlFor="dateOpened">Date Opened</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !dateOpened && "text-muted-foreground",
                  state?.errors?.dateOpened && "border-red-500"
                )}
                disabled={tradeStatus === "order_placed"}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateOpened ? (
                  format(dateOpened, "PPP")
                ) : (
                  <span>Select date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={dateOpened}
                onSelect={setDateOpened}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          {state?.errors?.dateOpened && (
            <p className="text-sm text-red-500">{state.errors.dateOpened[0]}</p>
          )}
        </div>

        {/* Result and P/L - Only shown if closed */}
        {tradeStatus === "closed" && (
          <>
            {/* Date Closed */}
            <div className="space-y-2">
              <Label htmlFor="dateClosed">Date Closed</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dateClosed && "text-muted-foreground",
                      state?.errors?.dateClosed && "border-red-500"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateClosed ? (
                      format(dateClosed, "PPP")
                    ) : (
                      <span>Select date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dateClosed}
                    onSelect={setDateClosed}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {state?.errors?.dateClosed && (
                <p className="text-sm text-red-500">
                  {state.errors.dateClosed[0]}
                </p>
              )}
            </div>

            {/* Result */}
            <div className="space-y-2">
              <Label htmlFor={resultId}>Result</Label>
              <Select
                name="result"
                value={selectedResult || "win"}
                onValueChange={(value) =>
                  setSelectedResult(value as "win" | "loss" | "break_even")
                }
              >
                <SelectTrigger id={resultId} className="w-full">
                  <SelectValue placeholder="Select result" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="win">Win</SelectItem>
                  <SelectItem value="break_even">Break Even</SelectItem>
                  <SelectItem value="loss">Loss</SelectItem>
                </SelectContent>
              </Select>
              {state?.errors?.result && (
                <p className="text-sm text-red-500">{state.errors.result[0]}</p>
              )}
            </div>

            {/* Profit/Loss */}
            <div className="space-y-2">
              <Label htmlFor={profitLossId}>Profit/Loss</Label>
              <Input
                type="text"
                inputMode="decimal"
                value={profitLoss}
                onChange={(e) => {
                  let value = e.target.value;
                  // Enforce positive values for wins
                  if (selectedResult === "win" && parseFloat(value) < 0) {
                    value = Math.abs(parseFloat(value)).toString();
                  }
                  // Enforce negative values for losses
                  if (selectedResult === "loss" && parseFloat(value) > 0) {
                    value = (-Math.abs(parseFloat(value))).toString();
                  }
                  setProfitLoss(value);
                }}
                pattern={
                  selectedResult === "win"
                    ? "[0-9]*[.]?[0-9]+"
                    : selectedResult === "loss"
                    ? "-[0-9]*[.]?[0-9]+"
                    : "-?[0-9]*[.]?[0-9]+"
                }
                id={profitLossId}
                name="profitLoss"
                placeholder={
                  selectedResult === "win"
                    ? "0.00"
                    : selectedResult === "loss"
                    ? "-0.00"
                    : "0.00"
                }
                min={
                  selectedResult === "win"
                    ? "0"
                    : selectedResult === "loss"
                    ? undefined
                    : undefined
                }
                max={
                  selectedResult === "loss"
                    ? "0"
                    : selectedResult === "win"
                    ? undefined
                    : undefined
                }
                className={cn(
                  "w-full",
                  state?.errors?.profitLoss ? "border-red-500" : ""
                )}
              />
              {selectedResult === "win" && (
                <p className="text-xs text-muted-foreground">
                  Value must be positive for wins
                </p>
              )}
              {selectedResult === "loss" && (
                <p className="text-xs text-muted-foreground">
                  Value must be negative for losses
                </p>
              )}
              {state?.errors?.profitLoss && (
                <p className="text-sm text-red-500">
                  {state.errors.profitLoss[0]}
                </p>
              )}
            </div>
          </>
        )}

        {/* Custom Fields */}
        {strategy.customFields && strategy.customFields.length > 0 && (
          <div className="space-y-4 pt-4 border-t">
            <h3 className="font-medium">Custom Fields</h3>
            {strategy.customFields.map((field: CustomField, index: number) => {
              // Create a stable ID based on field name and index
              const fieldId = `custom-field-${field.name
                .toLowerCase()
                .replace(/\s+/g, "-")}-${index}`;
              return (
                <div key={index} className="space-y-2">
                  <Label htmlFor={fieldId}>
                    {field.name}
                    {field.required && (
                      <span className="text-red-500 ml-1">*</span>
                    )}
                  </Label>

                  {field.type === "text" ? (
                    <Input
                      id={fieldId}
                      name={`custom-${field.name}`}
                      value={customValues[field.name] || ""}
                      onChange={(e) =>
                        handleCustomFieldChange(field.name, e.target.value)
                      }
                      required={field.required}
                      className="w-full"
                    />
                  ) : field.type === "select" ? (
                    <Select
                      name={`custom-${field.name}`}
                      value={customValues[field.name] || ""}
                      onValueChange={(value) =>
                        handleCustomFieldChange(field.name, value)
                      }
                      required={field.required}
                    >
                      <SelectTrigger id={fieldId} className="w-full">
                        <SelectValue placeholder={`Select ${field.name}`} />
                      </SelectTrigger>
                      <SelectContent>
                        {field.options?.map((option: string) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : field.type === "multi-select" ? (
                    <MultipleSelector
                      commandProps={{
                        label: `Select ${field.name}`,
                      }}
                      value={(customValues[field.name] || []).map(
                        (value: string) => ({
                          value,
                          label: value,
                        })
                      )}
                      onChange={(options: Option[]) => {
                        handleCustomFieldChange(
                          field.name,
                          options.map((opt) => opt.value)
                        );
                      }}
                      defaultOptions={
                        field.options?.map((option: string) => ({
                          value: option,
                          label: option,
                        })) || []
                      }
                      placeholder={`Select ${field.name}`}
                      hidePlaceholderWhenSelected
                      emptyIndicator={
                        <p className="text-center text-sm">
                          No options available
                        </p>
                      }
                    />
                  ) : null}
                </div>
              );
            })}
          </div>
        )}

        {/* Notes - Always at the end */}
        <div className="space-y-2 pt-4 border-t">
          <Label htmlFor={notesId}>Notes</Label>
          <Textarea
            id={notesId}
            name="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add your trade notes here..."
            className={cn(
              "w-full min-h-[100px]",
              state?.errors?.notes ? "border-red-500" : ""
            )}
          />
          {state?.errors?.notes && (
            <p className="text-sm text-red-500">{state.errors.notes[0]}</p>
          )}
        </div>
      </div>

      {/* Error message */}
      {state?.message && !state.success && (
        <div className="bg-red-100 p-3 rounded-md">
          <p className="text-sm text-red-800">{state.message}</p>
        </div>
      )}

      <Button type="submit" className="w-full" disabled={isPending}>
        {trade
          ? isPending
            ? "Updating..."
            : "Update Trade"
          : isPending
          ? "Logging..."
          : "Log Trade"}
      </Button>
    </form>
  );
}
