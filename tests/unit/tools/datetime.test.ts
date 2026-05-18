import { describe, it, expect } from 'vitest';
import { dateTimeTool } from '../../../src/tools/datetime.js';

describe('dateTimeTool', () => {
  it('should return current UTC time', async () => {
    const before = Date.now();
    const result = await dateTimeTool.execute({});
    const after = Date.now();

    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();

    const data = result.data as { iso: string; timezone: string; unix: number };
    expect(data.timezone).toBe('UTC');
    expect(new Date(data.iso).getTime()).toBeGreaterThanOrEqual(before);
    expect(new Date(data.iso).getTime()).toBeLessThanOrEqual(after);
    expect(data.unix).toBeGreaterThan(0);
  });

  it('should return time for a specific timezone', async () => {
    const result = await dateTimeTool.execute({ timezone: 'America/New_York' });

    expect(result.success).toBe(true);
    const data = result.data as { timezone: string };
    expect(data.timezone).toBe('America/New_York');
  });

  it('should handle invalid timezone', async () => {
    const result = await dateTimeTool.execute({ timezone: 'Invalid/Timezone' });

    expect(result.success).toBe(false);
    expect(result.error).toContain('Invalid timezone');
  });
});
