import { GET, POST } from '@/app/api/logbookEntries/route'; // Use alias
import { PrismaClient, LogbookEntryType, LogbookEntryStatus } from '@prisma/client';
import { mockDeep, DeepMockProxy, mockReset } from 'jest-mock-extended';
import { NextRequest } from 'next/server';

// --- Alternative Mock Initialization ---
let prismaMock: DeepMockProxy<PrismaClient>;

jest.mock('@prisma/client', () => {
  const mock = mockDeep<PrismaClient>();
  prismaMock = mock;
  return {
    PrismaClient: jest.fn(() => mock),
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
  };
});
// ------------------------------------

jest.unmock('next/server'); // Use real NextResponse

describe('Logbook Entries API - /logbookEntries', () => {
  let req: DeepMockProxy<NextRequest>;

  beforeEach(() => {
    mockReset(prismaMock);
    req = mockDeep<NextRequest>();
    // Provide a default URL for GET tests
    Object.defineProperty(req, 'nextUrl', { // Use nextUrl which has searchParams
        value: new URL('http://localhost/api/logbookEntries'),
        writable: true,
    });
  });

  const createMockLogbookEntry = (id: number, workgroupId: number) => ({
      id,
      workgroupId,
      date: new Date(),
      description: `Entry ${id}`,
      type: LogbookEntryType.AGENDA,
      status: LogbookEntryStatus.ACTIVE,
  });

  describe('GET', () => {
    it('should return all logbook entries with serialized dates', async () => {
      const mockEntries = [
        createMockLogbookEntry(1, 1),
        createMockLogbookEntry(2, 1),
      ];
      prismaMock.logbookEntry.findMany.mockResolvedValue(mockEntries as any);

      const response = await GET(req); // Pass the mocked request
      const data = await response.json();

      const expectedData = mockEntries.map(e => ({
          ...e,
          date: e.date.toISOString(), // Serialize date
      }));

      expect(response.status).toBe(200);
      expect(data).toEqual(expectedData);
      expect(prismaMock.logbookEntry.findMany).toHaveBeenCalledTimes(1);
      expect(prismaMock.logbookEntry.findMany).toHaveBeenCalledWith({ where: {} }); // Default call args
    });

    it('should filter logbook entries by query parameters', async () => {
      const mockEntries = [createMockLogbookEntry(1, 1)];
      prismaMock.logbookEntry.findMany.mockResolvedValue(mockEntries as any);

      // Mock URL with query params
       Object.defineProperty(req, 'nextUrl', {
           value: new URL('http://localhost/api/logbookEntries?workgroupId=1&type=AGENDA&status=ACTIVE'),
           writable: true,
       });

      const response = await GET(req);
      const data = await response.json();

      const expectedData = mockEntries.map(e => ({ ...e, date: e.date.toISOString() }));

      expect(response.status).toBe(200);
      expect(data).toEqual(expectedData);
      expect(prismaMock.logbookEntry.findMany).toHaveBeenCalledTimes(1);
      expect(prismaMock.logbookEntry.findMany).toHaveBeenCalledWith({
        where: { workgroupId: 1, type: LogbookEntryType.AGENDA, status: LogbookEntryStatus.ACTIVE }, // Params parsed
      });
    });

    it('should handle errors during GET', async () => {
      prismaMock.logbookEntry.findMany.mockRejectedValue(new Error('Database error'));

      const response = await GET(req); // Pass the mocked request
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({ error: 'Failed to fetch logbook entries. Please check server logs.' });
      expect(prismaMock.logbookEntry.findMany).toHaveBeenCalledTimes(1);
    });
  });

  describe('POST', () => {
    it('should create a new logbook entry and return serialized date', async () => {
      const newEntryInput = { workgroupId: 2, description: 'New Entry', type: LogbookEntryType.MINUTES };
      const createdEntry = { ...newEntryInput, id: 3, date: new Date(), status: LogbookEntryStatus.ACTIVE }; // Mock DB result
      prismaMock.logbookEntry.create.mockResolvedValue(createdEntry as any);
      (req.json as jest.Mock).mockResolvedValue(newEntryInput);

      const response = await POST(req);
      const data = await response.json();

      const expectedData = {
          ...createdEntry,
          date: createdEntry.date.toISOString(), // Serialize date
      };

      expect(response.status).toBe(201);
      expect(data).toEqual(expectedData);
      expect(prismaMock.logbookEntry.create).toHaveBeenCalledTimes(1);
      expect(prismaMock.logbookEntry.create).toHaveBeenCalledWith({ data: newEntryInput });
    });

    it('should handle errors during POST', async () => {
      const newEntryInput = { workgroupId: 2, description: 'New Entry', type: LogbookEntryType.MINUTES };
      prismaMock.logbookEntry.create.mockRejectedValue(new Error('Database error'));
      (req.json as jest.Mock).mockResolvedValue(newEntryInput);

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({ error: 'Failed to create logbook entry. Please check server logs.' });
      expect(prismaMock.logbookEntry.create).toHaveBeenCalledTimes(1);
      expect(prismaMock.logbookEntry.create).toHaveBeenCalledWith({ data: newEntryInput });
    });

    // Add tests for validation errors (Zod)
    // Add tests for 404 if workgroup not found
  });
});
