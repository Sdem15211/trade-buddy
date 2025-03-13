import { CreateStrategyInput } from "@/lib/db/actions/strategies";

export interface ActionResponse {
  success: boolean;
  message: string;
  errors?: {
    [K in keyof CreateStrategyInput]?: string[];
  };
  data?: CreateStrategyInput;
}
