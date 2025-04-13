import { GET, POST } from '@/app/api/logbookEntries/route'; // Use alias
import { PrismaClient, LogbookEntryType, LogbookEntryStatus } from '@prisma/client';
import { mockDeep, mockReset, DeepMockProxy } from 'jest-mock-extended';
import { NextRequest, NextResponse } from 'next/server';

// --- Correct Initialization Order ---
// 1. Declare the mock variable
const prismaMock = mockDeep<DeepMockProxy<PrismaClient>>();

// 2. Mock the module *using* the declared variable
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => prismaMock),
  LogbookEntryType: {
    ATTENDEES: 'ATTENDEES',
    AGENDA: 'AGENDA',
    DOCUMENTATION: 'DOCUMENTATION',
    MINUTES: 'MINUTES'
  },
  LogbookEntryStatus: {
    ACTIVE: 'ACTIVE',
    RESOLVED: 'RESOLVED'
  }
}));
// ------------------------------------

jest.unmock('next/server'); // Use real NextResponse

describe('Logbook Entries API - /logbookEntries', () => {
  let req: DeepMockProxy<NextRequest>;

  beforeEach(() => {
    mockReset(prismaMock); // Reset mocks before each test
    req = mockDeep<NextRequest>();
  });

  describe('GET', () => {
    it('should return all logbook entries with serialized dates', async () => {
      const mockLogbookEntries = [
        { id: 1, workgroupId: 1, date: new Date(), description: 'Entry 1', type: LogbookEntryType.AGENDA, status: LogbookEntryStatus.ACTIVE },
        { id: 2, workgroupId: 1, date: new Date(), description: 'Entry 2', type: LogbookEntryType.MINUTES, status: LogbookEntryStatus.RESOLVED }
      ];
      prismaMock.logbookEntry.findMany.mockResolvedValue(mockLogbookEntries as any);

      const response = await GET(); // GET request usually doesn't have a body or complex req object
      const data = await response.json();

      const expectedData = mockLogbookEntries.map(e => ({ ...e, date: e.date.toISOString() }));

      expect(response.status).toBe(200);
      expect(data).toEqual(expectedData);
      expect(prismaMock.logbookEntry.findMany).toHaveBeenCalledTimes(1);
    });

    it('should handle errors on GET', async () => {
      prismaMock.logbookEntry.findMany.mockRejectedValue(new Error('Database error'));

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({ error: 'Failed to fetch logbook entries. Please check server logs.' });
      expect(prismaMock.logbookEntry.findMany).toHaveBeenCalledTimes(1);
    });
 });

  describe('POST', () => {
    it('should create a new logbook entry and return serialized data', async () => {
      const newEntryData = { workgroupId: 1, description: 'New Entry', type: LogbookEntryType.DOCUMENTATION };
      // Prisma adds date and default status
      const createdEntry = { id: 3, ...newEntryData, date: new Date(), status: LogbookEntryStatus.ACTIVE };
      prismaMock.logbookEntry.create.mockResolvedValue(createdEntry as any);
      (req.json as jest.Mock).mockResolvedValue(newEntryData);

      const response = await POST(req);
      const data = await response.json();

      const expectedData = { ...createdEntry, date: createdEntry.date.toISOString() };

      expect(response.status).toBe(201);
      expect(data).toEqual(expectedData);
      expect(prismaMock.logbookEntry.create).toHaveBeenCalledTimes(1);
      expect(prismaMock.logbookEntry.create).toHaveBeenCalledWith({ data: newEntryData });
    });

    it('should handle errors on POST', async () => {
      const newEntryData = { workgroupId: 1, description: 'New Entry', type: LogbookEntryType.DOCUMENTATION };
      prismaMock.logbookEntry.create.mockRejectedValue(new Error('Database error'));
      (req.json as jest.Mock).mockResolvedValue(newEntryData);

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({ error: 'Failed to create logbook entry. Please check server logs.' });
      expect(prismaMock.logbookEntry.create).toHaveBeenCalledTimes(1);
      expect(prismaMock.logbookEntry.create).toHaveBeenCalledWith({ data: newEntryData });
    });

     // Add tests for validation errors (Zod)
     // Add tests for 404 if workgroup not found
  });
});
