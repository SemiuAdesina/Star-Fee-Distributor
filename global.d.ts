// Global type definitions for development
declare global {
  const Buffer: typeof import('buffer').Buffer;
  const console: Console;
  const process: NodeJS.Process;
  
  namespace NodeJS {
    interface Process {
      exit(code?: number): never;
    }
  }
}

// Mocha test globals
declare const describe: (name: string, fn: () => void) => void;
declare const it: (name: string, fn: () => void | Promise<void>) => void;
declare const before: (fn: () => void | Promise<void>) => void;
declare const after: (fn: () => void | Promise<void>) => void;
declare const beforeEach: (fn: () => void | Promise<void>) => void;
declare const afterEach: (fn: () => void | Promise<void>) => void;

// Chai assertions
declare const expect: any;

export {};
