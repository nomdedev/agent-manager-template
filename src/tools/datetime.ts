import { z } from 'zod';
import type { Tool, ToolResult } from '../types/index.js';

const DateTimeSchema = z.object({
  timezone: z.string().optional().default('UTC'),
});

export const dateTimeTool: Tool = {
  name: 'get_datetime',
  description: 'Returns the current date and time. Optionally accepts a timezone (e.g., "America/New_York").',
  parameters: DateTimeSchema,

  async execute(params: unknown): Promise<ToolResult> {
    const parsed = DateTimeSchema.safeParse(params);
    if (!parsed.success) {
      return { success: false, error: `Invalid parameters: ${parsed.error.message}` };
    }

    const { timezone } = parsed.data;

    try {
      const now = new Date();
      const formatted = now.toLocaleString('en-US', {
        timeZone: timezone,
        dateStyle: 'full',
        timeStyle: 'long',
      });

      return {
        success: true,
        data: {
          iso: now.toISOString(),
          formatted,
          timezone,
          unix: Math.floor(now.getTime() / 1000),
        },
      };
    } catch (err) {
      return {
        success: false,
        error: `Invalid timezone: ${timezone}`,
      };
    }
  },
};
