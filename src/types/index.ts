import type { z } from 'zod';

export interface Tool {
  name: string;
  description: string;
  parameters: z.ZodType;
  execute: (params: unknown) => Promise<ToolResult>;
}

export interface ToolResult {
  success: boolean;
  data?: unknown;
  error?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}
