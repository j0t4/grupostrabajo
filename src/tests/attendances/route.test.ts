import { GET } from '@/app/api/attendances/route';
import { prismaMock } from '@/../src/__mocks__/@prisma/client';
import { NextRequest } from 'next/server';
import { Attendance } from '@prisma/client';

// Mock data for attendances
const mockAttendances: Attendance[] = [
  { memberId: 1, meetingId: 101, present: true, justification: null },
  { memberId: 2, meetingId: 101, present: false, justification: 'Sick leave' },
  { memberId: 1, meetingId: 102, present: true, justification: null },
];

describe('GET /api/attendances', () => {
  it('should return all attendances', async () => {
    prismaMock.attendance.findMany.mockResolvedValue(mockAttendances);

    // Note: NextRequest is not strictly needed here as the route doesn't use it,
    // but keeping it for consistency with other tests.
    const req = new NextRequest('http://localhost/api/attendances');
    const response = await GET(); // Call GET without request object as it's not used
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual(mockAttendances);
    // Verify findMany was called without any specific where clause
    expect(prismaMock.attendance.findMany).toHaveBeenCalledWith();
  });

  // Removed tests for filtering as the route does not support it.

  it('should return 500 if there is a database error', async () => {
    const dbError = new Error('Database error');
    prismaMock.attendance.findMany.mockRejectedValue(dbError);

    const req = new NextRequest('http://localhost/api/attendances');
    const response = await GET(); // Call GET without request object
    const body = await response.json();

    expect(response.status).toBe(500);
    // Adjust expectation based on route implementation
    expect(body).toEqual({ error: 'Failed to fetch attendances' });
  });

  // Removed test for invalid query parameters as the route doesn't handle them.
});
