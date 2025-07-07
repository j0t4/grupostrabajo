import { GET, DELETE } from '@/app/api/attendances/[memberId]_[meetingId]/route';
import { prismaMock } from '@/../src/__mocks__/@prisma/client';
import { NextRequest } from 'next/server';
import { Attendance, MemberStatus, MeetingType } from '@prisma/client';

// Mock date for consistency in testing
const testDate = new Date();
const testDateISO = testDate.toISOString();

// Mock data for a specific attendance - Use ISO string for date
const mockAttendance: any = {
  memberId: 1,
  meetingId: 101,
  member: { id: 1, name: 'Test Member' },
  meeting: { id: 101, date: testDateISO }, // Use ISO string here
};

// Separate mock for findUnique result which might return a Date object initially
const mockAttendanceWithDateObject: Attendance & { member?: any, meeting?: any } = {
    memberId: 1,
    meetingId: 101,
    member: { id: 1, name: 'Test Member', surname: 'Test', email: 'test@example.com', dni: '12345678A', position: null, organization: null, phone1: null, phone1Description: null, phone2: null, phone2Description: null, phone3: null, phone3Description: null, status: MemberStatus.ACTIVE, deactivationDate: null, deactivationDescription: null },
    meeting: { id: 101, workgroupId: 1, title: 'Test Meeting', description: null, date: testDate, type: MeetingType.PRESENTIAL, observations: null, agenda: null, minutes: null },
};

describe('GET /api/attendances/{memberId}_{meetingId}', () => {
  beforeEach(() => {
    // Reset mocks before each test in this describe block
    jest.resetAllMocks();
    // Ensure the mock return value uses a Date object, as Prisma would
    prismaMock.attendance.findUnique.mockResolvedValue(mockAttendanceWithDateObject);
  });

  it('should return the specific attendance with related data if found', async () => {
    const req = new NextRequest('http://localhost/api/attendances/1_101');
    const params = { params: { memberId_meetingId: '1_101' } };
    const response = await GET(req, params);
    const body = await response.json();

    expect(response.status).toBe(200);
    // Compare against the mock with the ISO date string, as JSON serialization converts dates
    expect(body).toEqual({
        ...mockAttendance,
        member: {
            ...mockAttendance.member,
            surname: 'Test',
            email: 'test@example.com',
            dni: '12345678A',
            position: null,
            organization: null,
            phone1: null,
            phone1Description: null,
            phone2: null,
            phone2Description: null,
            phone3: null,
            phone3Description: null,
            status: 'ACTIVE',
            deactivationDate: null,
            deactivationDescription: null
        },
        meeting: {
            ...mockAttendance.meeting,
            workgroupId: 1,
            title: 'Test Meeting',
            description: null,
            type: 'PRESENTIAL',
            observations: null,
            agenda: null,
            minutes: null
        }
    });
    expect(prismaMock.attendance.findUnique).toHaveBeenCalledWith({
      where: { memberId_meetingId: { memberId: 1, meetingId: 101 } },
      include: { member: true, meeting: true }
    });
  });

  it('should return 404 if the attendance is not found', async () => {
    prismaMock.attendance.findUnique.mockResolvedValue(null);

    const req = new NextRequest('http://localhost/api/attendances/999_999');
    const params = { params: { memberId_meetingId: '999_999' } };
    const response = await GET(req, params);
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body).toEqual({ message: 'Attendance not found' });
    expect(prismaMock.attendance.findUnique).toHaveBeenCalledWith({
      where: { memberId_meetingId: { memberId: 999, meetingId: 999 } },
      include: { member: true, meeting: true }
    });
  });

  it('should return 400 if the IDs are invalid', async () => {
    const req = new NextRequest('http://localhost/api/attendances/abc_xyz');
    const params = { params: { memberId_meetingId: 'abc_xyz' } };
    const response = await GET(req, params);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body).toHaveProperty('error', 'Invalid path parameter format');
    expect(body).toHaveProperty('details');
    expect(Array.isArray(body.details)).toBe(true);
    // findUnique should not be called if validation fails early
    expect(prismaMock.attendance.findUnique).not.toHaveBeenCalled();
  });

  it('should return 500 if there is a database error', async () => {
    const dbError = new Error('Database error');
    prismaMock.attendance.findUnique.mockRejectedValue(dbError);

    // Suppress console.error for this test
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const req = new NextRequest('http://localhost/api/attendances/1_101');
    const params = { params: { memberId_meetingId: '1_101' } };
    const response = await GET(req, params);
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body).toEqual({ error: 'Failed to fetch attendance. Please check server logs.' });

    // Restore console.error
    consoleErrorSpy.mockRestore();
  });
});

describe('DELETE /api/attendances/{memberId}_{meetingId}', () => {
    beforeEach(() => {
        // Reset mocks before each test in this describe block
        jest.resetAllMocks();

        // Default setup for successful deletion transaction simulation
        prismaMock.attendance.findUnique.mockResolvedValue(mockAttendanceWithDateObject);
        prismaMock.attendance.delete.mockResolvedValue(mockAttendanceWithDateObject);
        prismaMock.$transaction.mockImplementation(async (callback: any) => {
            // In a real scenario, this would pass the actual transaction client (tx)
            // For mocking, we pass the global mock to allow the callback to use mocked methods
            try {
                const result = await callback(prismaMock);
                // If callback returns a result object (like our route does for 404)
                if (result && typeof result === 'object' && result.status) {
                     return result;
                }
                // Simulate successful transaction commit (though not explicitly returned by route)
                return { status: 204, body: null }; // Default success from transaction perspective
            } catch (error) {
                // Propagate errors to be caught by the route handler's catch block
                throw error;
            }
        });
    });

  it('should delete the specific attendance and return 204 if found', async () => {
    const req = new NextRequest('http://localhost/api/attendances/1_101', { method: 'DELETE' });
    const params = { params: { memberId_meetingId: '1_101' } };
    const response = await DELETE(req, params);

    expect(response.status).toBe(204);
    expect(await response.text()).toBe('');
    expect(prismaMock.attendance.findUnique).toHaveBeenCalledWith({
      where: { memberId_meetingId: { memberId: 1, meetingId: 101 } },
      select: { memberId: true }
    });
    expect(prismaMock.attendance.delete).toHaveBeenCalledWith({
      where: { memberId_meetingId: { memberId: 1, meetingId: 101 } },
    });
    expect(prismaMock.$transaction).toHaveBeenCalled();
  });

  it('should return 404 if the attendance to delete is not found', async () => {
    // Override the default findUnique mock for this specific test
    prismaMock.attendance.findUnique.mockResolvedValue(null);

    const req = new NextRequest('http://localhost/api/attendances/999_999', { method: 'DELETE' });
    const params = { params: { memberId_meetingId: '999_999' } };
    const response = await DELETE(req, params);
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body).toEqual({ message: 'Attendance not found' });
    expect(prismaMock.attendance.findUnique).toHaveBeenCalledWith({
      where: { memberId_meetingId: { memberId: 999, meetingId: 999 } },
      select: { memberId: true }
    });
    // Delete should not be called because findUnique returned null inside the transaction callback
    expect(prismaMock.attendance.delete).not.toHaveBeenCalled();
    expect(prismaMock.$transaction).toHaveBeenCalled();
  });

   it('should return 400 if the IDs are invalid', async () => {
        const req = new NextRequest('http://localhost/api/attendances/abc_xyz', { method: 'DELETE' });
        const params = { params: { memberId_meetingId: 'abc_xyz' } };
        const response = await DELETE(req, params);
        const body = await response.json();

        expect(response.status).toBe(400);
        expect(body).toHaveProperty('error', 'Invalid path parameter format');
        expect(body).toHaveProperty('details');
        expect(Array.isArray(body.details)).toBe(true);
        // Transaction should not be called if validation fails
        expect(prismaMock.$transaction).not.toHaveBeenCalled();
    });

  it('should return 500 if there is a database error during delete transaction', async () => {
    // Mock the transaction itself failing
    const dbError = new Error('Database error');
    prismaMock.$transaction.mockRejectedValue(dbError);

    // Suppress console.error for this test
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const req = new NextRequest('http://localhost/api/attendances/1_101', { method: 'DELETE' });
    const params = { params: { memberId_meetingId: '1_101' } };
    const response = await DELETE(req, params);
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body).toEqual({ error: 'Failed to delete attendance. Please check server logs.' });
     expect(prismaMock.$transaction).toHaveBeenCalled();

    // Restore console.error
    consoleErrorSpy.mockRestore();
  });

  it('should return 409 if delete fails due to foreign key constraint (P2003)', async () => {
    // Mock the transaction failing with a specific Prisma error
    const fkError = new Error('Foreign key constraint failed');
    (fkError as any).code = 'P2003';
    prismaMock.$transaction.mockRejectedValue(fkError);

    // Suppress console.error for this test
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const req = new NextRequest('http://localhost/api/attendances/1_101', { method: 'DELETE' });
    const params = { params: { memberId_meetingId: '1_101' } };
    const response = await DELETE(req, params);
    const body = await response.json();

    expect(response.status).toBe(409);
    expect(body).toEqual({ error: 'Cannot delete attendance due to existing references.' });
    expect(prismaMock.$transaction).toHaveBeenCalled();

    // Restore console.error
    consoleErrorSpy.mockRestore();
  });
});
