import { GET, POST } from '../src/app/api/logbookEntries/route';
import { PrismaClient } from '@prisma/client';
import { mockDeep, mockReset } from 'jest-mock-extended';
import { NextRequest } from 'next/server';

const prismaMock = mockDeep<PrismaClient>();

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => prismaMock),
}));

describe('Logbook Entries API', () => {
  beforeEach(() => {
    mockReset(prismaMock);
  });

  it('should return all logbook entries on GET', async () => {
    const mockLogbookEntries = [{ id: 1, content: 'Entry 1' }, { id: 2, content: 'Entry 2' }];
    prismaMock.logbookEntry.findMany.mockResolvedValue(mockLogbookEntries);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual(mockLogbookEntries);
    expect(prismaMock.logbookEntry.findMany).toHaveBeenCalledTimes(1);
  });

  it('should handle errors on GET', async () => {
    prismaMock.logbookEntry.findMany.mockRejectedValue(new Error('Database error'));

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({ error: 'Failed to fetch logbook entries' });
    expect(prismaMock.logbookEntry.findMany).toHaveBeenCalledTimes(1);
  });

  it('should create a new logbook entry on POST', async () => {
    const newEntryData = { content: 'New Entry' };
    const mockCreatedEntry = { id: 3, content: 'New Entry' };
    prismaMock.logbookEntry.create.mockResolvedValue(mockCreatedEntry);

    const mockRequest = {
      json: async () => newEntryData,
    } as unknown as NextRequest;

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data).toEqual(mockCreatedEntry);
    expect(prismaMock.logbookEntry.create).toHaveBeenCalledTimes(1);
    expect(prismaMock.logbookEntry.create).toHaveBeenCalledWith({ data: newEntryData });
  });

  it('should handle errors on POST', async () => {
    const newEntryData = { content: 'New Entry' };
    prismaMock.logbookEntry.create.mockRejectedValue(new Error('Database error'));

    const mockRequest = {
      json: async () => newEntryData,
    } as unknown as NextRequest;

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({ error: 'Failed to create logbook entry' });
    expect(prismaMock.logbookEntry.create).toHaveBeenCalledTimes(1);
    expect(prismaMock.logbookEntry.create).toHaveBeenCalledWith({ data: newEntryData });
  });
});