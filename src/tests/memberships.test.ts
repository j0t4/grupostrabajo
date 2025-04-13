import { GET, POST } from '@/app/api/memberships/route'; // Use alias
import { PrismaClient, MembershipRole } from '@prisma/client';
import { mockDeep, DeepMockProxy, mockReset } from 'jest-mock-extended';
import { NextRequest } from 'next/server';

// --- Original Mock Initialization Pattern ---
const prismaMock = mockDeep<DeepMockProxy<PrismaClient>>();

jest.mock('@prisma/client', () => {
  return {
    PrismaClient: jest.fn(() => prismaMock),
    MembershipRole: {
      PRESIDENT: 'PRESIDENT',
      SECRETARY: 'SECRETARY',
      ASSISTANT: 'ASSISTANT',
      GUEST: 'GUEST'
    }
  };
});
// ------------------------------------

jest.unmock('next/server'); // Use real NextResponse

describe('Memberships API - /memberships', () => {
  let req: DeepMockProxy<NextRequest>;

  beforeEach(() => {
    mockReset(prismaMock);
    req = mockDeep<NextRequest>();
    // Provide a default URL, can be overridden in specific tests
    Object.defineProperty(req, 'nextUrl', { // Use nextUrl which has searchParams
        value: new URL('http://localhost/api/memberships'),
        writable: true,
    });
  });

  describe('GET', () => {
    it('should return all memberships with serialized dates', async () => {
      const mockMemberships = [
        { memberId: 1, workgroupId: 1, role: MembershipRole.PRESIDENT, startDate: new Date(), endDate: new Date(), endDateDescription: null, member: { name: 'M1' }, workgroup: { name: 'WG1' } },
        { memberId: 2, workgroupId: 1, role: MembershipRole.ASSISTANT, startDate: new Date(), endDate: null, endDateDescription: null, member: { name: 'M2' }, workgroup: { name: 'WG1' } }
      ];
      prismaMock.membership.findMany.mockResolvedValue(mockMemberships as any);

      const response = await GET(req); // Pass the mocked request
      const data = await response.json();

      const expectedData = mockMemberships.map(m => ({
           ...m,
           startDate: m.startDate.toISOString(),
           endDate: m.endDate ? m.endDate.toISOString() : null
       }));

      expect(response.status).toBe(200);
      expect(data).toEqual(expectedData);
      expect(prismaMock.membership.findMany).toHaveBeenCalledTimes(1);
      // Default call includes relations and empty where
      expect(prismaMock.membership.findMany).toHaveBeenCalledWith({ where: {}, include: { member: true, workgroup: true } });
    });

     it('should filter memberships by query parameters', async () => {
      const mockMemberships = [
        { memberId: 1, workgroupId: 1, role: MembershipRole.PRESIDENT, startDate: new Date(), endDate: null, endDateDescription: null, member: { name: 'M1' }, workgroup: { name: 'WG1' } },
      ];
      prismaMock.membership.findMany.mockResolvedValue(mockMemberships as any);

      // Mock URL with query params
      Object.defineProperty(req, 'nextUrl', {
           value: new URL('http://localhost/api/memberships?memberId=1&workgroupId=1'),
           writable: true,
       });

      const response = await GET(req);
      const data = await response.json();

      const expectedData = mockMemberships.map(m => ({ ...m, startDate: m.startDate.toISOString(), endDate: null })); // Ensure endDate is null if expected

      expect(response.status).toBe(200);
      expect(data).toEqual(expectedData);
      expect(prismaMock.membership.findMany).toHaveBeenCalledTimes(1);
      expect(prismaMock.membership.findMany).toHaveBeenCalledWith({
        where: { memberId: 1, workgroupId: 1 }, // Ensure params are parsed as numbers
        include: { member: true, workgroup: true }
      });
    });

    it('should handle errors during GET', async () => {
      prismaMock.membership.findMany.mockRejectedValue(new Error('Database error'));

      const response = await GET(req); // Pass the mocked request
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({ error: 'Failed to fetch memberships. Please check server logs.' });
      expect(prismaMock.membership.findMany).toHaveBeenCalledTimes(1);
    });
  });

  describe('POST', () => {
    it('should create a new membership and return serialized dates', async () => {
      const newMembershipInput = { memberId: 2, workgroupId: 2, role: MembershipRole.GUEST };
      // Mock the result from prisma create
      const createdMembership = { ...newMembershipInput, startDate: new Date(), endDate: null, endDateDescription: null };
      prismaMock.membership.create.mockResolvedValue(createdMembership as any);
      (req.json as jest.Mock).mockResolvedValue(newMembershipInput);

      const response = await POST(req);
      const data = await response.json();

      const expectedData = {
          ...createdMembership,
          startDate: createdMembership.startDate.toISOString(), // Serialize date
          endDate: null
      };

      expect(response.status).toBe(201);
      expect(data).toEqual(expectedData);
      expect(prismaMock.membership.create).toHaveBeenCalledTimes(1);
      // Prisma automatically handles default startDate if not provided
      expect(prismaMock.membership.create).toHaveBeenCalledWith({ data: newMembershipInput });
    });

    it('should handle errors during POST', async () => {
      const newMembershipInput = { memberId: 2, workgroupId: 2, role: MembershipRole.GUEST };
      prismaMock.membership.create.mockRejectedValue(new Error('Database error'));
      (req.json as jest.Mock).mockResolvedValue(newMembershipInput);

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({ error: 'Failed to create membership. Please check server logs.' });
      expect(prismaMock.membership.create).toHaveBeenCalledTimes(1);
      expect(prismaMock.membership.create).toHaveBeenCalledWith({ data: newMembershipInput });
    });

     // Add tests for validation errors (Zod)
     // Add tests for 404 if member/workgroup not found
     // Add tests for 409 conflict if membership already exists
  });
});
