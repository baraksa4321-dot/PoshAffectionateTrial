declare module "bun:test" {
  interface BunExpectation {
    not: BunExpectation;
    rejects: BunExpectation;
    resolves: BunExpectation;
    toBe(expected: unknown): void;
    toBeGreaterThan(expected: number): void;
    toBeNull(): void;
    toBeUndefined(): void;
    toContain(expected: unknown): void;
    toContainEqual(expected: unknown): void;
    toEqual(expected: unknown): void;
    toHaveLength(expected: number): void;
    toMatch(expected: RegExp | string): void;
    toMatchObject(expected: object): void;
    toThrow(expected?: unknown): void;
  }

  interface BunExpect {
    (actual: unknown): BunExpectation;
    objectContaining(expected: object): object;
  }

  export const beforeEach: (fn: () => void | Promise<void>) => void;
  export const describe: (name: string, fn: () => void) => void;
  export const expect: BunExpect;
  export const mock: {
    module(path: string, factory: () => unknown): void;
  };
  export const test: (name: string, fn: () => void | Promise<void>) => void;
}
