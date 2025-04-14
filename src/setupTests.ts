// This file is executed before each test file
import { prismaMock } from './__mocks__/@prisma/client';
import { mockReset } from 'jest-mock-extended';

// Reset all mocks before each test
beforeEach(() => {
  mockReset(prismaMock);
});