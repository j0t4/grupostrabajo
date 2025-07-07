import { GET, POST } from '@/app/api/memberships/route';
import { prismaMock } from '@/../src/__mocks__/@prisma/client';
import { NextRequest } from 'next/server';
import { Membership, MembershipRole } from '@prisma/client';
import { jest } from '@jest/globals'; // Ensure jest types are available

// Mock data for memberships
const mockMemberships: Membership[] = [
  {
    memberId: 1,
    workgroupId: 10,
    role: MembershipRole.ASSISTANT,
    startDate: new Date('2023-01-01'),
    endDate: null,
    endDateDescription: null,
  },
  {
    memberId: 2,
    workgroupId: 10,
    role: MembershipRole.PRESIDENT,
    startDate: new Date('2023-02-01'),
    endDate: new Date('2023-12-31'),
    endDateDescription: 'End of term',
  },
  {
    memberId: 1,
    workgroupId: 20,
    role: MembershipRole.SECRETARY,
    startDate: new Date('2024-01-01'),
    endDate: null,
    endDateDescription: null,
  },
];

// Mock data for creating a new membership
const newMembershipData = {
  memberId: 3,
  workgroupId: 20,
  role: MembershipRole.GUEST,
  startDate: '2024-03-01T00:00:00.000Z', // Use ISO string for requests
};

const createdMembership: Membership = {
  ...newMembershipData,
  startDate: new Date(newMembershipData.startDate), // Convert back to Date for comparison
  endDate: null, // Assuming endDate is optional
  endDateDescription: null,
};

describe('GET /api/memberships', () => {
  it('should return all memberships', async () => {
    prismaMock.membership.findMany.mockResolvedValue(mockMemberships);

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual(mockMemberships.map(m => ({ ...m, startDate: m.startDate.toISOString(), endDate: m.endDate ? m.endDate.toISOString() : null }))); // Compare with ISO strings
    expect(prismaMock.membership.findMany).toHaveBeenCalledWith();
  });

  it('should return 500 if there is a database error', async () => {
    const dbError = new Error('Database error');
    prismaMock.membership.findMany.mockRejectedValue(dbError);

    // Suppress console.error for this test
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body).toEqual({ error: 'Failed to fetch memberships' });

    // Restore console.error
    consoleErrorSpy.mockRestore();
  });
});

describe('POST /api/memberships', () => {
  it('should create a new membership successfully', async () => {
    prismaMock.membership.create.mockResolvedValue(createdMembership);

    const req = new NextRequest('http://localhost/api/memberships', {
      method: 'POST',
      body: JSON.stringify(newMembershipData),
      headers: { 'Content-Type': 'application/json' }
    });

    const response = await POST(req);
    const body = await response.json();

    expect(response.status).toBe(201);
    // Compare the received body (with ISO date string) to the expected object (also with ISO date string)
    expect(body).toEqual({
      ...createdMembership,
      startDate: createdMembership.startDate.toISOString(),
      endDate: createdMembership.endDate ? createdMembership.endDate.toISOString() : null,
      endDateDescription: null
     });
    expect(prismaMock.membership.create).toHaveBeenCalledWith({ data: newMembershipData });
  });

  it('should return 500 if creation fails due to database error', async () => {
    const dbError = new Error('Database error');
    prismaMock.membership.create.mockRejectedValue(dbError);

    // Suppress console.error for this test
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

     const req = new NextRequest('http://localhost/api/memberships', {
      method: 'POST',
      body: JSON.stringify(newMembershipData),
      headers: { 'Content-Type': 'application/json' }
    });

    const response = await POST(req);
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body).toEqual({ error: 'Failed to create membership' });

    // Restore console.error
    consoleErrorSpy.mockRestore();
  });

   it('should return 500 if creation fails due to invalid data (e.g., missing required field)', async () => {
    // Simulate Prisma rejecting invalid data (though actual validation might be more specific)
     const validationError = new Error('Invalid data');
     // You might need to mock specific Prisma error codes (like P2002 for unique constraints)
     // or Zod errors if you add validation to the route.
     prismaMock.membership.create.mockRejectedValue(validationError);

    // Suppress console.error for this test
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const invalidData = { workgroupId: 999 }; // Missing memberId, startDate

    const req = new NextRequest('http://localhost/api/memberships', {
        method: 'POST',
        body: JSON.stringify(invalidData),
        headers: { 'Content-Type': 'application/json' }
    });

    const response = await POST(req);
    const body = await response.json();

    expect(response.status).toBe(500); // Or potentially 400 if you add input validation
    expect(body).toEqual({ error: 'Failed to create membership' });
    expect(prismaMock.membership.create).toHaveBeenCalledWith({ data: invalidData });

    // Restore console.error
    consoleErrorSpy.mockRestore();
  });

});
