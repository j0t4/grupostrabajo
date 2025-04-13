import { GET, POST } from '@/app/api/members/route'; // Use alias
import { PrismaClient, MemberStatus } from '@prisma/client';
import { NextRequest } from 'next/server';
import { mockDeep, DeepMockProxy, mockReset } from 'jest-mock-extended';
import { faker } from '@faker-js/faker';

// --- Original Mock Initialization Pattern ---
const prismaMock = mockDeep<DeepMockProxy<PrismaClient>>();

jest.mock('@prisma/client', () => {
  return {
    PrismaClient: jest.fn(() => prismaMock),
    MemberStatus: {
      ACTIVE: 'ACTIVE',
      INACTIVE: 'INACTIVE'
    }
  };
});
// ------------------------------------

jest.unmock('next/server');

describe('Member API - /members', () => {
  let req: DeepMockProxy<NextRequest>;

  beforeEach(() => {
    mockReset(prismaMock);
    req = mockDeep<NextRequest>();
    // Provide a default URL for GET tests
    Object.defineProperty(req, 'nextUrl', { // Use nextUrl which has searchParams
        value: new URL('http://localhost/api/members'),
        writable: true,
    });
  });

  const createMockMember = (id: number) => ({
    id,
    name: faker.person.firstName(),
    surname: faker.person.lastName(),
    email: faker.internet.email(),
    dni: faker.string.alphanumeric(9),
    status: MemberStatus.ACTIVE,
    position: null, organization: null, phone1: null, phone1Description: null,
    phone2: null, phone2Description: null, phone3: null, phone3Description: null,
    deactivationDate: null, deactivationDescription: null
  });

  describe('GET', () => {
    it('should return a list of members', async () => {
      const mockMembers = [createMockMember(1), createMockMember(2)];
      prismaMock.member.findMany.mockResolvedValue(mockMembers as any);

      const response = await GET(req);
      const data = await response.json();

      expect(response.status).toBe(200);
      // Dates should be null or serialized if they exist
      const expectedData = mockMembers.map(m => ({ ...m, deactivationDate: null }));
      expect(data).toEqual(expectedData);
      expect(prismaMock.member.findMany).toHaveBeenCalledTimes(1);
      expect(prismaMock.member.findMany).toHaveBeenCalledWith({ where: {} }); // Check default call
    });

     it('should filter members by status', async () => {
      const mockMembers = [createMockMember(1)];
      prismaMock.member.findMany.mockResolvedValue(mockMembers as any);

      // Mock URL with query params
      Object.defineProperty(req, 'nextUrl', {
           value: new URL('http://localhost/api/members?status=ACTIVE'),
           writable: true,
       });

      const response = await GET(req);
      const data = await response.json();
      const expectedData = mockMembers.map(m => ({ ...m, deactivationDate: null }));

      expect(response.status).toBe(200);
      expect(data).toEqual(expectedData);
      expect(prismaMock.member.findMany).toHaveBeenCalledTimes(1);
      expect(prismaMock.member.findMany).toHaveBeenCalledWith({ where: { status: MemberStatus.ACTIVE } });
    });

    it('should return 500 on database error', async () => {
      prismaMock.member.findMany.mockRejectedValue(new Error('DB Error'));

      const response = await GET(req);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({ error: 'Failed to fetch members. Please check server logs.' });
      expect(prismaMock.member.findMany).toHaveBeenCalledTimes(1);
    });
  });

  describe('POST', () => {
    it('should create a new member', async () => {
      const newMemberInput = {
        name: faker.person.firstName(),
        surname: faker.person.lastName(),
        email: faker.internet.email(),
        dni: faker.string.alphanumeric(9),
        // Status typically defaults in the DB or route handler, not always in input
      };
      const createdMember = { ...newMemberInput, id: 1, status: MemberStatus.ACTIVE, deactivationDate: null }; // Mock the DB result

      prismaMock.member.create.mockResolvedValue(createdMember as any);
      (req.json as jest.Mock).mockResolvedValue(newMemberInput);

      const response = await POST(req);
      const data = await response.json();

      // Dates should be null or serialized
      expect(response.status).toBe(201);
      expect(data).toEqual({ ...createdMember, deactivationDate: null });
      expect(prismaMock.member.create).toHaveBeenCalledTimes(1);
      expect(prismaMock.member.create).toHaveBeenCalledWith({ data: newMemberInput });
    });

    it('should return 500 on database error during creation', async () => {
      const newMemberInput = { name: 'Test', surname: 'User', email: 'test@example.com', dni: '12345678A' };
      prismaMock.member.create.mockRejectedValue(new Error('DB Error'));
      (req.json as jest.Mock).mockResolvedValue(newMemberInput);

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({ error: 'Failed to create member. Please check server logs.' });
      expect(prismaMock.member.create).toHaveBeenCalledTimes(1);
    });

     it('should return 400 on validation error (e.g., missing required field)', async () => {
      const invalidMemberInput = { surname: 'User', email: 'test@example.com', dni: '12345678A' }; // Missing name
      (req.json as jest.Mock).mockResolvedValue(invalidMemberInput);

      // No need to mock prisma.create as validation happens before DB call

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(400);
      // The exact error message depends on Zod schema and error handling in route
      expect(data).toHaveProperty('error');
      expect(data.error).toContain('Validation error'); // Or a more specific Zod message
      expect(prismaMock.member.create).not.toHaveBeenCalled();
    });

    // Add more tests for other validation errors (e.g., invalid email, dni format)
  });
});
