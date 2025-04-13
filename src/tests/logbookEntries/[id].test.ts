import { GET, PUT, DELETE } from '../../app/api/logbookEntries/[id]/route';
import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

describe('Logbook Entries API', () => {
  let logbookEntryId: number;

  beforeAll(async () => {
    // Create a logbook entry for testing purposes
    const logbookEntry = await prisma.logbookEntry.create({
      data: {
        date: new Date(),
        description: 'Initial logbook entry for testing',
        type: 'ATTENDEES',
        workgroupId: 1,
        status: 'ACTIVE',
      },
    });
    logbookEntryId = logbookEntry.id;
  });
  
  afterAll(async () => {
    // Clean up the created logbook entry
    await prisma.logbookEntry.delete({
      where: { id: logbookEntryId }, 
    });
    await prisma.$disconnect();
  });

  it('should GET a logbook entry by ID', async () => {
    const req = new Request('');
    const params = { id: logbookEntryId.toString() };
    const res = await GET(req, { params: params as any });

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toHaveProperty('id', logbookEntryId);
  });

  it('should return 404 if logbook entry is not found', async () => {
    const req = new Request('');
    const params = { id: '9999' }; // Non-existent ID
    const res = await GET(req, { params: params as any });

    expect(res.status).toBe(404);
    const data = await res.json();
    expect(data).toHaveProperty('error', 'Logbook entry not found');
  });

  it('should PUT (update) a logbook entry', async () => {
    const updatedData = { description: 'Updated logbook entry' };
    const req = new Request(JSON.stringify(updatedData));
    const params = { id: logbookEntryId.toString() };
    const res = await PUT(req, { params: params as any });

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toHaveProperty('description', 'Updated logbook entry');
  });

  it('should DELETE a logbook entry', async () => {
    // Create a new logbook entry to be deleted
    const newLogbookEntry = await prisma.logbookEntry.create({
      data: {
        date: new Date(),
        description: 'Logbook entry to be deleted',
        type: 'ATTENDEES',
        workgroupId: 1,
        status: 'ACTIVE',

      },
    });

    const req = new Request('');
    const params = { id: newLogbookEntry.id.toString() };
    const res = await DELETE(req, { params: params as any });

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toHaveProperty('message', 'Logbook entry deleted');

    // Verify that the logbook entry is actually deleted
    const getRes = await GET(req, { params: params as any });
    expect(getRes.status).toBe(404);
  });
});