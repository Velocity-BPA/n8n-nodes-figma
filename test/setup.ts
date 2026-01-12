/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

// Test setup file for Jest
// Add any global test configuration here

// Mock console.warn to suppress licensing notices during tests
const originalWarn = console.warn;
beforeAll(() => {
  console.warn = jest.fn((...args) => {
    // Suppress licensing notices during tests
    if (args[0]?.includes?.('Velocity BPA Licensing Notice')) {
      return;
    }
    originalWarn.apply(console, args);
  });
});

afterAll(() => {
  console.warn = originalWarn;
});

// Global test timeout
jest.setTimeout(10000);
