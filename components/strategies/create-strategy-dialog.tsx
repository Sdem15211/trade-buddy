"use client";

import * as React from "react";
import { useActionState, useEffect, useState, useRef } from "react";
import { toast } from "sonner";
import { createStrategy } from "@/lib/db/actions/strategies";
import { instrumentOptions } from "@/lib/constants/assets";
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
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { Check, Trash } from "lucide-react";
interface CreateStrategyDialogProps {
  children: React.ReactNode;
}

enum FormStep {
  BasicInfo = 0,
  CustomFields = 1,
}

interface CustomField {
  name: string;
  type: "text" | "select" | "multi-select";
  options?: string[];
  required: boolean;
}

const DEFAULT_FIELDS: CustomField[] = [
  {
    name: "Status",
    type: "select",
    options: ["order_placed", "open", "closed"],
    required: true,
  },
  { name: "Asset", type: "text", required: true },
  { name: "Date Opened", type: "text", required: false },
  { name: "Date Closed", type: "text", required: false },
  {
    name: "Result",
    type: "select",
    options: ["win", "break_even", "loss"],
    required: false,
  },
  { name: "Profit/Loss", type: "text", required: false },
  { name: "Notes", type: "text", required: false },
  {
    name: "Direction",
    type: "select",
    options: ["long", "short"],
    required: false,
  },
];

const initialState: ActionResponse = {
  success: false,
  message: "",
};

export function CreateStrategyDialog({ children }: CreateStrategyDialogProps) {
  const [open, setOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState<FormStep>(FormStep.BasicInfo);
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const [newField, setNewField] = useState<CustomField>({
    name: "",
    type: "text",
    required: false,
  });
  const [fieldOptions, setFieldOptions] = useState<string>("");
  const [basicInfo, setBasicInfo] = useState({
    name: "",
    description: "",
    instrument: "",
  });

  const formRef = useRef<HTMLFormElement>(null);

  const [state, formAction, isPending] = useActionState(
    createStrategy,
    initialState
  );

  useEffect(() => {
    if (state.success && state.message) {
      toast.success(state.message);
      setOpen(false);
      resetForm();
    }
  }, [state.success, state.message, formAction]);

  const handleDialogOpenChange = (newOpen: boolean) => {
    if (!isPending) {
      setOpen(newOpen);
      if (!newOpen) {
        resetForm();
      }
    }
  };

  const resetForm = () => {
    setCurrentStep(FormStep.BasicInfo);
    setCustomFields([]);
    setNewField({
      name: "",
      type: "text",
      required: false,
    });
    setFieldOptions("");
    setBasicInfo({
      name: "",
      description: "",
      instrument: "",
    });

    if (formRef.current) {
      formRef.current.reset();
    }
  };

  const handleNextStep = () => {
    if (formRef.current) {
      const formData = new FormData(formRef.current);
      const name = formData.get("name") as string;
      const description = formData.get("description") as string;
      const instrument = formData.get("instrument") as string;

      setBasicInfo({
        name,
        description,
        instrument,
      });

      if (!name) {
        toast.error("Strategy name is required");
        return;
      }

      if (!instrument) {
        toast.error("Instrument is required");
        return;
      }

      setCurrentStep(FormStep.CustomFields);
    }
  };

  const handlePreviousStep = () => {
    setCurrentStep(FormStep.BasicInfo);
  };

  const addCustomField = () => {
    if (!newField.name) {
      toast.error("Field name is required");
      return;
    }

    if (
      (newField.type === "select" || newField.type === "multi-select") &&
      (!fieldOptions || fieldOptions.trim() === "")
    ) {
      toast.error("Options are required for select fields");
      return;
    }

    if (
      customFields.some((field) => field.name === newField.name) ||
      DEFAULT_FIELDS.some((field) => field.name === newField.name)
    ) {
      toast.error("Field name must be unique");
      return;
    }

    const fieldToAdd: CustomField = {
      ...newField,
      options:
        newField.type === "text"
          ? undefined
          : fieldOptions.split(",").map((opt) => opt.trim()),
    };

    setCustomFields([...customFields, fieldToAdd]);

    setNewField({
      name: "",
      type: "text",
      required: false,
    });
    setFieldOptions("");
  };

  const removeCustomField = (index: number) => {
    const updatedFields = [...customFields];
    updatedFields.splice(index, 1);
    setCustomFields(updatedFields);
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px] md:max-w-[750px] h-[80vh] overflow-hidden flex flex-col p-0">
        <div className="flex flex-1 overflow-hidden">
          {/* Left sidebar */}
          <div className="w-[220px] bg-muted/30 border-r p-6 flex flex-col">
            <div className="mb-8">
              <h2 className="text-medium leading-5 font-medium tracking-tight">
                New Strategy
              </h2>
            </div>

            <div className="flex-1">
              {/* Step 1 */}
              <div className="relative flex mb-8">
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center border-2 z-10",
                    currentStep >= FormStep.BasicInfo
                      ? "bg-primary border-primary text-primary-foreground"
                      : "border-muted-foreground text-muted-foreground bg-background"
                  )}
                >
                  {currentStep > FormStep.BasicInfo ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    "1"
                  )}
                </div>
                <div className="ml-4">
                  <p
                    className={cn(
                      "font-medium text-base",
                      currentStep === FormStep.BasicInfo ? "text-primary" : ""
                    )}
                  >
                    Basic Info
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Strategy name and details
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="relative flex">
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center border-2 z-10",
                    currentStep >= FormStep.CustomFields
                      ? "bg-primary border-primary text-primary-foreground"
                      : "border-muted-foreground text-muted-foreground bg-background"
                  )}
                >
                  {currentStep > FormStep.CustomFields ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    "2"
                  )}
                </div>
                <div className="ml-4">
                  <p
                    className={cn(
                      "font-medium",
                      currentStep === FormStep.CustomFields
                        ? "text-primary"
                        : ""
                    )}
                  >
                    Custom Fields
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Configure trade data points
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Main content area */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <form
              ref={formRef}
              action={(formData) => {
                formData.append("customFields", JSON.stringify(customFields));

                if (currentStep === FormStep.CustomFields) {
                  formData.set("name", basicInfo.name);
                  formData.set("description", basicInfo.description || "");
                  formData.set("instrument", basicInfo.instrument);

                  return formAction(formData);
                }
              }}
              className="flex flex-col flex-1 overflow-hidden"
            >
              <DialogHeader>
                <div className="px-6 py-4 border-b">
                  <DialogTitle className="text-lg font-medium tracking-tight">
                    {currentStep === FormStep.BasicInfo
                      ? "Strategy Information"
                      : "Configure Trade Fields"}
                  </DialogTitle>
                  <DialogDescription className="text-sm text-muted-foreground tracking-tight">
                    {currentStep === FormStep.BasicInfo
                      ? "Enter the basic details of your trading strategy"
                      : "Customize what information you'll track for each trade"}
                  </DialogDescription>
                </div>
              </DialogHeader>

              {/* Form content */}
              <div className="overflow-y-auto flex-1 p-6">
                <div className="space-y-6">
                  {currentStep === FormStep.BasicInfo ? (
                    <>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="name" className="text-base">
                            Name
                          </Label>
                          <Input
                            id="name"
                            name="name"
                            defaultValue={basicInfo.name || state?.data?.name}
                            placeholder="My Trading Strategy"
                            className={cn(
                              "focus-visible:ring-offset-2",
                              state?.errors?.name ? "border-red-500" : ""
                            )}
                          />
                          {state?.errors?.name && (
                            <div className="name">
                              <p
                                id="name-error"
                                className="text-sm text-red-500"
                              >
                                {state.errors.name[0]}
                              </p>
                            </div>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="description" className="text-base">
                            Description{" "}
                            <span className="text-muted-foreground text-xs">
                              (optional)
                            </span>
                          </Label>
                          <Textarea
                            id="description"
                            name="description"
                            defaultValue={
                              basicInfo.description || state?.data?.description
                            }
                            placeholder="Describe your trading strategy..."
                            className={cn(
                              "focus-visible:ring-offset-2 min-h-[120px]",
                              state?.errors?.description ? "border-red-500" : ""
                            )}
                          />
                          {state?.errors?.description && (
                            <div className="description">
                              <p
                                id="description-error"
                                className="text-sm text-red-500"
                              >
                                {state.errors.description[0]}
                              </p>
                            </div>
                          )}
                        </div>
                        <div className="space-y-2 pb-2">
                          <Label htmlFor="instrument" className="text-base">
                            Instrument
                          </Label>
                          <Select
                            name="instrument"
                            required
                            defaultValue={
                              basicInfo.instrument || state?.data?.instrument
                            }
                          >
                            <SelectTrigger className="focus-visible:ring-offset-2">
                              <SelectValue placeholder="Select instrument" />
                            </SelectTrigger>
                            <SelectContent>
                              {instrumentOptions.map((option) => (
                                <SelectItem
                                  key={option.value}
                                  value={option.value}
                                >
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {state?.errors?.instrument && (
                            <div className="instrument">
                              <p
                                id="instrument-error"
                                className="text-sm text-red-500"
                              >
                                {state.errors.instrument[0]}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="space-y-6">
                        {/* Default Fields Section */}
                        <div className="bg-muted/20 p-4 rounded-lg border">
                          <div className="flex items-center justify-between mb-6">
                            <h4 className="text-base font-medium tracking-tight">
                              Standard Fields
                            </h4>
                            <span className="text-xs text-primary bg-primary/10 px-2 py-1 rounded font-medium">
                              Included by default
                            </span>
                          </div>
                          <div className="grid grid-cols-3 gap-3">
                            {DEFAULT_FIELDS.map((field, index) => (
                              <div
                                key={index}
                                className="flex items-center justify-center p-2 border rounded-md bg-background"
                              >
                                <span className="font-medium text-sm">
                                  {field.name}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Divider with label */}
                        <div className="relative">
                          <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-primary/75"></div>
                          </div>
                          <div className="relative flex justify-center">
                            <span className="bg-background px-2 text-sm tracking-tight text-primary/75 font-medium">
                              Custom Configuration
                            </span>
                          </div>
                        </div>

                        {/* Custom Fields List */}
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h4 className="text-base font-medium">
                              Your Custom Fields
                            </h4>
                            <span className="text-xs text-muted-foreground">
                              {customFields.length} custom{" "}
                              {customFields.length === 1 ? "field" : "fields"}{" "}
                              added
                            </span>
                          </div>

                          {customFields.length > 0 ? (
                            <div className="space-y-2">
                              {customFields.map((field, index) => (
                                <div
                                  key={index}
                                  className="flex items-center justify-between p-3 border rounded-md bg-background"
                                >
                                  <div className="flex-1">
                                    <div className="font-medium">
                                      {field.name}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                      {field.type === "text"
                                        ? "Text input"
                                        : field.type === "select"
                                        ? "Single selection"
                                        : "Multiple selection"}
                                      {field.options
                                        ? ` (${field.options.length} options)`
                                        : ""}
                                      {field.required && (
                                        <span className="ml-2 text-primary">
                                          Required
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => removeCustomField(index)}
                                    className="h-8 w-8 text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                                  >
                                    <Trash className="h-4 w-4" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-6 border border-dashed rounded-lg bg-muted/10">
                              <p className="text-muted-foreground">
                                No custom fields added yet
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                Use the form below to add custom fields
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Add New Field Section */}
                        <div className="bg-muted/10 p-5 border rounded-lg">
                          <div className="mb-4">
                            <h4 className="text-base font-medium">
                              Add New Field
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              Create additional fields to track in your trades
                            </p>
                          </div>

                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="fieldName">Field Name</Label>
                                <Input
                                  id="fieldName"
                                  value={newField.name}
                                  onChange={(e) =>
                                    setNewField({
                                      ...newField,
                                      name: e.target.value,
                                    })
                                  }
                                  placeholder="e.g., Risk/Reward Ratio"
                                  className="focus-visible:ring-offset-2"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="fieldType">Field Type</Label>
                                <Select
                                  value={newField.type}
                                  onValueChange={(
                                    value: "text" | "select" | "multi-select"
                                  ) =>
                                    setNewField({ ...newField, type: value })
                                  }
                                >
                                  <SelectTrigger
                                    id="fieldType"
                                    className="focus-visible:ring-offset-2"
                                  >
                                    <SelectValue placeholder="Select type" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="text">Text</SelectItem>
                                    <SelectItem value="select">
                                      Select
                                    </SelectItem>
                                    <SelectItem value="multi-select">
                                      Multi-Select
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>

                            {(newField.type === "select" ||
                              newField.type === "multi-select") && (
                              <div className="space-y-2">
                                <Label htmlFor="fieldOptions">
                                  Options{" "}
                                  <span className="text-xs text-muted-foreground">
                                    (comma-separated)
                                  </span>
                                </Label>
                                <Input
                                  id="fieldOptions"
                                  value={fieldOptions}
                                  onChange={(e) =>
                                    setFieldOptions(e.target.value)
                                  }
                                  placeholder="e.g., Option 1, Option 2, Option 3"
                                  className="focus-visible:ring-offset-2"
                                />
                              </div>
                            )}

                            <div className="flex items-center space-x-2 mt-2">
                              <Checkbox
                                id="fieldRequired"
                                checked={newField.required}
                                onCheckedChange={(checked) =>
                                  setNewField({
                                    ...newField,
                                    required: checked === true,
                                  })
                                }
                                className="focus-visible:ring-offset-2"
                              />
                              <Label
                                htmlFor="fieldRequired"
                                className="text-sm"
                              >
                                Required Field
                              </Label>
                            </div>

                            <Button
                              type="button"
                              onClick={addCustomField}
                              className="w-full mt-2"
                            >
                              Add Field
                            </Button>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <DialogFooter className="sticky bottom-0 bg-background p-4 border-t">
                {currentStep === FormStep.BasicInfo ? (
                  <>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setOpen(false)}
                      disabled={isPending}
                    >
                      Cancel
                    </Button>
                    <div
                      className={`inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 cursor-pointer ${
                        isPending ? "opacity-50 pointer-events-none" : ""
                      }`}
                      onClick={handleNextStep}
                    >
                      Next
                    </div>
                  </>
                ) : (
                  <>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handlePreviousStep}
                      disabled={isPending}
                    >
                      Back
                    </Button>
                    <Button type="submit" disabled={isPending}>
                      {isPending ? "Creating..." : "Create Strategy"}
                    </Button>
                  </>
                )}
              </DialogFooter>
            </form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
