export interface ActionResponse {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
  data?: any;
  strategy?: any;
  trade?: any;
}
