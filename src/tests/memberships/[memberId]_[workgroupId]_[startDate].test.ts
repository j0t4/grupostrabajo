import { GET, PUT, DELETE } from '@/app/api/memberships/[memberId]_[workgroupId]_[startDate]/route'; // Use alias
import { PrismaClient, MembershipRole } from '@prisma/client';
import { NextRequest } from 'next/server';
import { mockDeep, DeepMockProxy, mockReset } from 'jest-mock-extended';

// --- Alternative Mock Initialization ---
let prismaMock: DeepMockProxy<PrismaClient>;

jest.mock('@prisma/client', () => {
  const mock = mockDeep<PrismaClient>();
  prismaMock = mock;
  return {
    PrismaClient: jest.fn(() => mock),
    MembershipRole: { // Include enums used in tests/routes
      PRESIDENT: 'PRESIDENT',
      SECRETARY: 'SECRETARY',
      ASSISTANT: 'ASSISTANT',
      GUEST: 'GUEST'
    }
  };
});
// ------------------------------------

jest.unmock('next/server'); // Use real NextResponse

describe('Memberships API Endpoints - /memberships/[compositeId]', () => {
  let req: DeepMockProxy<NextRequest>;
  const memberId = 1;
  const workgroupId = 2;
  const startDate = new Date('2023-01-01T00:00:00.000Z'); // Use Date object
  const startDateISO = startDate.toISOString();

  // Composite key for Prisma queries
  const compositeId = {
    memberId: memberId,
    workgroupId: workgroupId,
    startDate: startDate, // Prisma expects Date object here
  };

  const mockMembership = {
    memberId: memberId,
    workgroupId: workgroupId,
    startDate: startDate,
    role: MembershipRole.GUEST,
    endDate: null,
    endDateDescription: null,
    // Mock related data if included in response/logic
    member: { id: memberId, name: 'Test Member', /* other fields */ },
    workgroup: { id: workgroupId, name: 'Test WG', /* other fields */ },
  };

  // Expected JSON response (dates as ISO strings)
  const mockMembershipJSON = {
      memberId: memberId,
      workgroupId: workgroupId,
      startDate: startDateISO,
      role: MembershipRole.GUEST,
      endDate: null,
      endDateDescription: null,
      // Related data might also be included depending on route's include
      member: { id: memberId, name: 'Test Member', /* other fields */ },
      workgroup: { id: workgroupId, name: 'Test WG', /* other fields */ },
  };

  beforeEach(() => {
    mockReset(prismaMock);
    req = mockDeep<NextRequest>();
  });

  describe('GET', () => {
    it('should return a membership if found', async () => {
      prismaMock.membership.findUnique.mockResolvedValue(mockMembership as any);

      const response = await GET(req, { params: { memberId: String(memberId), workgroupId: String(workgroupId), startDate: startDateISO } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockMembershipJSON); // Compare with serialized date
      expect(prismaMock.membership.findUnique).toHaveBeenCalledTimes(1);
      expect(prismaMock.membership.findUnique).toHaveBeenCalledWith({
        where: { memberId_workgroupId_startDate: compositeId },
        include: { member: true, workgroup: true }, // Match include from route
      });
    });

    it('should return a 404 error if membership is not found', async () => {
      prismaMock.membership.findUnique.mockResolvedValue(null);

      const response = await GET(req, { params: { memberId: String(memberId), workgroupId: String(workgroupId), startDate: startDateISO } });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data).toEqual({ message: 'Membership not found' }); // Match route error message
      expect(prismaMock.membership.findUnique).toHaveBeenCalledTimes(1);
      expect(prismaMock.membership.findUnique).toHaveBeenCalledWith({
        where: { memberId_workgroupId_startDate: compositeId },
        include: { member: true, workgroup: true }, // Match include from route
      });
    });

    it('should return a 500 error if there is a database error', async () => {
      prismaMock.membership.findUnique.mockRejectedValue(new Error('Simulated database error'));

      const response = await GET(req, { params: { memberId: String(memberId), workgroupId: String(workgroupId), startDate: startDateISO } });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({ error: 'Failed to fetch membership. Please check server logs.' }); // Match route error message
      expect(prismaMock.membership.findUnique).toHaveBeenCalledTimes(1);
    });
  });

  describe('PUT', () => {
    it('should update a membership if found', async () => {
      const updateData = { endDate: new Date('2023-12-31T00:00:00.000Z'), role: MembershipRole.ASSISTANT };
      const updatedMembership = { ...mockMembership, ...updateData };
      const updatedMembershipJSON = { ...mockMembershipJSON, ...updateData, endDate: updateData.endDate.toISOString() };

      prismaMock.membership.update.mockResolvedValue(updatedMembership as any);
      (req.json as jest.Mock).mockResolvedValue(updateData); // Mock request body

      const response = await PUT(req, { params: { memberId: String(memberId), workgroupId: String(workgroupId), startDate: startDateISO } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(updatedMembershipJSON);
      expect(prismaMock.membership.update).toHaveBeenCalledTimes(1);
      expect(prismaMock.membership.update).toHaveBeenCalledWith({
        where: { memberId_workgroupId_startDate: compositeId },
        data: updateData,
      });
    });

     it('should return 404 if membership to update is not found', async () => {
        const updateData = { role: MembershipRole.ASSISTANT };
        prismaMock.membership.update.mockRejectedValue({ code: 'P2025' }); // Simulate Prisma not found
        (req.json as jest.Mock).mockResolvedValue(updateData);

        const response = await PUT(req, { params: { memberId: String(memberId), workgroupId: String(workgroupId), startDate: startDateISO } });
        const data = await response.json();

        expect(response.status).toBe(404);
        expect(data).toEqual({ message: 'Membership not found' });
        expect(prismaMock.membership.update).toHaveBeenCalledTimes(1);
    });


    it('should return a 500 error if there is a database error', async () => {
      const updateData = { role: MembershipRole.ASSISTANT };
      prismaMock.membership.update.mockRejectedValue(new Error('Simulated database error'));
      (req.json as jest.Mock).mockResolvedValue(updateData);


      const response = await PUT(req, { params: { memberId: String(memberId), workgroupId: String(workgroupId), startDate: startDateISO } });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({ error: 'Failed to update membership. Please check server logs.' }); // Match route error message
      expect(prismaMock.membership.update).toHaveBeenCalledTimes(1);
    });

    // Add tests for validation errors
  });

  describe('DELETE', () => {
    it('should delete a membership if found and return 204', async () => {
       prismaMock.membership.delete.mockResolvedValue(mockMembership as any); // Mock the deleted record

      const response = await DELETE(req, { params: { memberId: String(memberId), workgroupId: String(workgroupId), startDate: startDateISO } });

      // DELETE should return 204 No Content
      expect(response.status).toBe(204);
       expect(response.body).toBeNull(); // Check body is null for 204

      expect(prismaMock.membership.delete).toHaveBeenCalledTimes(1);
      expect(prismaMock.membership.delete).toHaveBeenCalledWith({
        where: { memberId_workgroupId_startDate: compositeId },
      });
    });

     it('should return 404 if membership to delete is not found', async () => {
        prismaMock.membership.delete.mockRejectedValue({ code: 'P2025' }); // Simulate Prisma not found

        const response = await DELETE(req, { params: { memberId: String(memberId), workgroupId: String(workgroupId), startDate: startDateISO } });
        const data = await response.json();

        expect(response.status).toBe(404);
        expect(data).toEqual({ message: 'Membership not found' });
        expect(prismaMock.membership.delete).toHaveBeenCalledTimes(1);
    });

    it('should return a 500 error if there is a database error', async () => {
       prismaMock.membership.delete.mockRejectedValue(new Error('Simulated database error'));

      const response = await DELETE(req, { params: { memberId: String(memberId), workgroupId: String(workgroupId), startDate: startDateISO } });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({ error: 'Failed to delete membership. Please check server logs.' }); // Match route error message
      expect(prismaMock.membership.delete).toHaveBeenCalledTimes(1);
    });
  });
});
