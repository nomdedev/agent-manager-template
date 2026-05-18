import { describe, it, expect } from 'vitest';
import { calculatorTool } from '../../../src/tools/calculator.js';

describe('calculatorTool', () => {
  it('should add two numbers', async () => {
    const result = await calculatorTool.execute({ operation: 'add', a: 5, b: 3 });
    expect(result.success).toBe(true);
    expect(result.data).toEqual({ result: 8 });
  });

  it('should subtract two numbers', async () => {
    const result = await calculatorTool.execute({ operation: 'subtract', a: 10, b: 4 });
    expect(result.success).toBe(true);
    expect(result.data).toEqual({ result: 6 });
  });

  it('should multiply two numbers', async () => {
    const result = await calculatorTool.execute({ operation: 'multiply', a: 6, b: 7 });
    expect(result.success).toBe(true);
    expect(result.data).toEqual({ result: 42 });
  });

  it('should divide two numbers', async () => {
    const result = await calculatorTool.execute({ operation: 'divide', a: 20, b: 4 });
    expect(result.success).toBe(true);
    expect(result.data).toEqual({ result: 5 });
  });

  it('should handle division by zero', async () => {
    const result = await calculatorTool.execute({ operation: 'divide', a: 10, b: 0 });
    expect(result.success).toBe(false);
    expect(result.error).toBe('Division by zero is not allowed');
  });

  it('should reject invalid parameters', async () => {
    const result = await calculatorTool.execute({ operation: 'modulo', a: 5, b: 3 });
    expect(result.success).toBe(false);
    expect(result.error).toContain('Invalid parameters');
  });

  it('should reject missing parameters', async () => {
    const result = await calculatorTool.execute({});
    expect(result.success).toBe(false);
    expect(result.error).toContain('Invalid parameters');
  });
});
