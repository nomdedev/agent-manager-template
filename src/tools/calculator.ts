import { z } from 'zod';
import type { Tool, ToolResult } from '../types/index.js';

const CalculatorSchema = z.object({
  operation: z.enum(['add', 'subtract', 'multiply', 'divide']),
  a: z.number(),
  b: z.number(),
});

export const calculatorTool: Tool = {
  name: 'calculator',
  description:
    'Performs basic arithmetic operations: add, subtract, multiply, divide. Use this for any math calculations.',
  parameters: CalculatorSchema,

  async execute(params: unknown): Promise<ToolResult> {
    const parsed = CalculatorSchema.safeParse(params);
    if (!parsed.success) {
      return { success: false, error: `Invalid parameters: ${parsed.error.message}` };
    }

    const { operation, a, b } = parsed.data;
    let result: number;

    switch (operation) {
      case 'add':
        result = a + b;
        break;
      case 'subtract':
        result = a - b;
        break;
      case 'multiply':
        result = a * b;
        break;
      case 'divide':
        if (b === 0) {
          return { success: false, error: 'Division by zero is not allowed' };
        }
        result = a / b;
        break;
    }

    return { success: true, data: { result } };
  },
};
