import { GET, PUT, DELETE } from '@/app/api/logbookEntries/[id]/route'; // Use alias
import { PrismaClient, LogbookEntryType, LogbookEntryStatus } from '@prisma/client';
import { NextRequest } from 'next/server';
import { mockDeep, DeepMockProxy, mockReset } from 'jest-mock-extended';

// --- Original Mock Initialization Pattern ---
const prismaMock = mockDeep<DeepMockProxy<PrismaClient>>();

jest.mock('@prisma/client', () => {
  return {
    PrismaClient: jest.fn(() => prismaMock),
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

jest.unmock('next/server');

describe('Logbook Entries API - /logbookEntries/[id]', () => {
  let req: DeepMockProxy<NextRequest>;

  beforeEach(() => {
    mockReset(prismaMock); // Reset mocks before each test
    req = mockDeep<NextRequest>();
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
    it('should return a logbook entry by ID', async () => {
      const entryId = 1;
      const workgroupId = 1;
      const mockEntry = createMockLogbookEntry(entryId, workgroupId);
      prismaMock.logbookEntry.findUnique.mockResolvedValue(mockEntry as any);

      const response = await GET(req, { params: { id: String(entryId) } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({ ...mockEntry, date: mockEntry.date.toISOString() });
      expect(prismaMock.logbookEntry.findUnique).toHaveBeenCalledWith({ where: { id: entryId } });
      expect(prismaMock.logbookEntry.findUnique).toHaveBeenCalledTimes(1);
    });

    it('should return 404 if logbook entry is not found', async () => {
      const entryId = 99;
      prismaMock.logbookEntry.findUnique.mockResolvedValue(null);

      const response = await GET(req, { params: { id: String(entryId) } });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data).toEqual({ message: 'Logbook entry not found' });
      expect(prismaMock.logbookEntry.findUnique).toHaveBeenCalledWith({ where: { id: entryId } });
      expect(prismaMock.logbookEntry.findUnique).toHaveBeenCalledTimes(1);
    });

    it('should return 500 on database error', async () => {
        const entryId = 1;
        prismaMock.logbookEntry.findUnique.mockRejectedValue(new Error('DB Error'));
        const response = await GET(req, { params: { id: String(entryId) } });
        const data = await response.json();
        expect(response.status).toBe(500);
        expect(data).toEqual({ error: 'Failed to fetch logbook entry. Please check server logs.' });
        expect(prismaMock.logbookEntry.findUnique).toHaveBeenCalledTimes(1);
    });
  });

  describe('PUT', () => {
    it('should update a logbook entry', async () => {
      const entryId = 1;
      const workgroupId = 1;
      const existingEntry = createMockLogbookEntry(entryId, workgroupId);
      const updateData = { description: 'Updated logbook entry', status: LogbookEntryStatus.RESOLVED };
      const updatedEntry = { ...existingEntry, ...updateData };

      // prismaMock.logbookEntry.findUnique.mockResolvedValue(existingEntry as any); // Needed if route checks first
      prismaMock.logbookEntry.update.mockResolvedValue(updatedEntry as any);
      (req.json as jest.Mock).mockResolvedValue(updateData);

      const response = await PUT(req, { params: { id: String(entryId) } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({ ...updatedEntry, date: updatedEntry.date.toISOString() });
      expect(prismaMock.logbookEntry.update).toHaveBeenCalledWith({ where: { id: entryId }, data: updateData });
      expect(prismaMock.logbookEntry.update).toHaveBeenCalledTimes(1);
    });

     it('should return 404 if logbook entry to update is not found', async () => {
        const entryId = 99;
        const updateData = { description: 'Updated logbook entry' };
        prismaMock.logbookEntry.update.mockRejectedValue({ code: 'P2025' }); // Simulate Prisma not found
        (req.json as jest.Mock).mockResolvedValue(updateData);

        const response = await PUT(req, { params: { id: String(entryId) } });
        const data = await response.json();

        expect(response.status).toBe(404);
        expect(data).toEqual({ message: 'Logbook entry not found' });
        expect(prismaMock.logbookEntry.update).toHaveBeenCalledTimes(1);
    });

    it('should return 500 on database error', async () => {
        const entryId = 1;
        const updateData = { description: 'Updated logbook entry' };
        prismaMock.logbookEntry.update.mockRejectedValue(new Error('DB Error'));
        (req.json as jest.Mock).mockResolvedValue(updateData);

        const response = await PUT(req, { params: { id: String(entryId) } });
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data).toEqual({ error: 'Failed to update logbook entry. Please check server logs.' });
        expect(prismaMock.logbookEntry.update).toHaveBeenCalledTimes(1);
    });
  });

  describe('DELETE', () => {
    it('should delete a logbook entry and return 204', async () => {
      const entryId = 1;
      prismaMock.logbookEntry.delete.mockResolvedValue({} as any);

      const response = await DELETE(req, { params: { id: String(entryId) } });

      expect(response.status).toBe(204);
      expect(response.body).toBeNull(); // Check body is null for 204
      expect(prismaMock.logbookEntry.delete).toHaveBeenCalledWith({ where: { id: entryId } });
      expect(prismaMock.logbookEntry.delete).toHaveBeenCalledTimes(1);
    });

    it('should return 404 if logbook entry to delete is not found', async () => {
        const entryId = 99;
        prismaMock.logbookEntry.delete.mockRejectedValue({ code: 'P2025' }); // Simulate Prisma not found

        const response = await DELETE(req, { params: { id: String(entryId) } });
        const data = await response.json();

        expect(response.status).toBe(404);
        expect(data).toEqual({ message: 'Logbook entry not found' });
        expect(prismaMock.logbookEntry.delete).toHaveBeenCalledTimes(1);
    });

    it('should return 500 on database error', async () => {
        const entryId = 1;
        prismaMock.logbookEntry.delete.mockRejectedValue(new Error('DB Error'));

        const response = await DELETE(req, { params: { id: String(entryId) } });
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data).toEqual({ error: 'Failed to delete logbook entry. Please check server logs.' });
        expect(prismaMock.logbookEntry.delete).toHaveBeenCalledTimes(1);
    });
  });
});
