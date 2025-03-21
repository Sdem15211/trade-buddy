import { CreateStrategyInput } from "@/lib/db/actions/strategies";
import { z } from "zod";

export interface ActionResponse {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
  data?: any;
  strategy?: any;
  trade?: any;
}
