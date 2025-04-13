import { GET, DELETE } from '@/app/api/attendances/[memberId]_[meetingId]/route'; // Removed PUT
import { PrismaClient } from '@prisma/client';
import { NextRequest } from 'next/server';
import { mockDeep, DeepMockProxy, mockReset } from 'jest-mock-extended';

// --- Alternative Mock Initialization ---
let prismaMock: DeepMockProxy<PrismaClient>;

jest.mock('@prisma/client', () => {
  const mock = mockDeep<PrismaClient>();
  prismaMock = mock;
  return {
    PrismaClient: jest.fn(() => mock)
  };
});
// ------------------------------------

jest.unmock('next/server');

describe('Attendance API Endpoint - /attendances/[memberId]_[meetingId]', () => {
  let req: DeepMockProxy<NextRequest>;
  const memberId = 1;
  const meetingId = 1;
  const compositeParam = `${memberId}_${meetingId}`; // Correct param format
  const compositeKey = { memberId, meetingId };

  const mockAttendance = {
      memberId,
      meetingId,
      attended: true,
      justification: null,
      // Mock related data if included in route
      member: { id: memberId, name: 'Test Member' },
      meeting: { id: meetingId, title: 'Test Meeting' },
  };

  beforeEach(() => {
    mockReset(prismaMock);
    req = mockDeep<NextRequest>(); // Use mockDeep for NextRequest
  });

  describe('GET', () => {
    it('should return an attendance if found', async () => {
      prismaMock.attendance.findUnique.mockResolvedValue(mockAttendance as any);

      // Pass the single composite parameter
      const response = await GET(req, { params: { memberId_meetingId: compositeParam } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockAttendance);
      expect(prismaMock.attendance.findUnique).toHaveBeenCalledTimes(1);
      expect(prismaMock.attendance.findUnique).toHaveBeenCalledWith({
        where: { memberId_meetingId: compositeKey },
        include: { member: true, meeting: true }, // Match include from route
      });
    });

    it('should return a 404 error if attendance is not found', async () => {
      prismaMock.attendance.findUnique.mockResolvedValue(null);

      const response = await GET(req, { params: { memberId_meetingId: compositeParam } });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data).toEqual({ message: 'Attendance not found' }); // Match route message
      expect(prismaMock.attendance.findUnique).toHaveBeenCalledTimes(1);
    });

     it('should return a 400 error if parameter format is invalid', async () => {
      const invalidParam = 'invalid-format';
      // No need to mock prisma, validation happens first

      const response = await GET(req, { params: { memberId_meetingId: invalidParam } });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toHaveProperty('error');
      expect(data.error).toContain('Invalid path parameter format'); // Match route validation error
      expect(prismaMock.attendance.findUnique).not.toHaveBeenCalled();
    });

    it('should return a 500 error if there is a database error', async () => {
      prismaMock.attendance.findUnique.mockRejectedValue(new Error('Database error'));

      const response = await GET(req, { params: { memberId_meetingId: compositeParam } });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({ error: 'Failed to fetch attendance. Please check server logs.' }); // Match route message
      expect(prismaMock.attendance.findUnique).toHaveBeenCalledTimes(1);
    });
  });

  // Removed PUT describe block as the handler doesn't exist

  describe('DELETE', () => {
    it('should delete an attendance successfully and return 204', async () => {
      // Mock the transaction: first findUnique succeeds, then delete succeeds
      prismaMock.attendance.findUnique.mockResolvedValue(mockAttendance as any); // To pass the check in transaction
      prismaMock.attendance.delete.mockResolvedValue({} as any); // Delete resolves

      // Mock the $transaction implementation
      prismaMock.$transaction.mockImplementation(async (callback) => {
          // Simulate the checks and operations within the transaction callback
          const found = await prismaMock.attendance.findUnique({
              where: { memberId_meetingId: compositeKey },
              select: { memberId: true }
          });
          if (!found) return { status: 404, body: { message: 'Attendance not found' } };
          await prismaMock.attendance.delete({ where: { memberId_meetingId: compositeKey } });
          return { status: 204, body: null };
      });

      const response = await DELETE(req, { params: { memberId_meetingId: compositeParam } });

      expect(response.status).toBe(204); // Expect 204 No Content
      expect(response.body).toBeNull();   // Expect empty body
      expect(prismaMock.$transaction).toHaveBeenCalledTimes(1); // Check if transaction was called
      // We can also check if findUnique and delete were called *within* the transaction mock if needed
    });

     it('should return 404 if attendance to delete is not found', async () => {
       // Mock the transaction: findUnique returns null
       prismaMock.attendance.findUnique.mockResolvedValue(null);

       prismaMock.$transaction.mockImplementation(async (callback) => {
          const found = await prismaMock.attendance.findUnique({ where: { memberId_meetingId: compositeKey }, select: { memberId: true }});
          if (!found) return { status: 404, body: { message: 'Attendance not found' } };
          // Delete won't be reached in this path
          return { status: 500, body: {error: 'Should not reach here'} }; // Should not happen
       });

      const response = await DELETE(req, { params: { memberId_meetingId: compositeParam } });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data).toEqual({ message: 'Attendance not found' });
      expect(prismaMock.$transaction).toHaveBeenCalledTimes(1);
      expect(prismaMock.attendance.delete).not.toHaveBeenCalled(); // Delete shouldn't be called if not found
    });

    it('should return a 500 error if there is a database error during delete', async () => {
      // Mock the transaction failing during the delete operation
      prismaMock.attendance.findUnique.mockResolvedValue(mockAttendance as any); // Found first
      prismaMock.attendance.delete.mockRejectedValue(new Error('Database error')); // Delete fails

       prismaMock.$transaction.mockImplementation(async (callback) => {
           // Simulate the transaction callback throwing an error
           throw new Error('Database error');
       });

      const response = await DELETE(req, { params: { memberId_meetingId: compositeParam } });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({ error: 'Failed to delete attendance. Please check server logs.' }); // Match route message
      expect(prismaMock.$transaction).toHaveBeenCalledTimes(1);
    });

    it('should return a 400 error if parameter format is invalid', async () => {
        const invalidParam = 'invalid-format';
        // No need to mock prisma, validation happens first

        const response = await DELETE(req, { params: { memberId_meetingId: invalidParam } });
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data).toHaveProperty('error');
        expect(data.error).toContain('Invalid path parameter format');
        expect(prismaMock.$transaction).not.toHaveBeenCalled();
        expect(prismaMock.attendance.delete).not.toHaveBeenCalled();
    });
  });
});
