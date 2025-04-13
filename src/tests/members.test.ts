import { GET, POST } from '@/app/api/members/route'; // Use alias
import { PrismaClient, MemberStatus } from '@prisma/client';
import { mockDeep, mockReset, DeepMockProxy } from 'jest-mock-extended';
import { NextRequest, NextResponse } from 'next/server';
import { faker } from '@faker-js/faker';

// --- Correct Initialization Order ---
// 1. Declare the mock variable
const prismaMock = mockDeep<DeepMockProxy<PrismaClient>>();

// 2. Mock the module *using* the declared variable
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => prismaMock),
  MemberStatus: {
      ACTIVE: 'ACTIVE',
      INACTIVE: 'INACTIVE'
  }
}));
// ------------------------------------

jest.unmock('next/server'); // Use real NextResponse

describe('Member API - /members', () => {
  let req: DeepMockProxy<NextRequest>;

  beforeEach(() => {
    mockReset(prismaMock); // Reset mocks before each test
    req = mockDeep<NextRequest>();
  });

  // Helper to create mock member data consistent with schema
  const createMockMemberData = (id: number) => ({
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
    it('should return all members with serialized dates', async () => {
      const members = [
        createMockMemberData(1),
        { ...createMockMemberData(2), deactivationDate: new Date() } // Include one with a date
      ];
      prismaMock.member.findMany.mockResolvedValue(members as any);

      const response = await GET(); // GET doesn't typically use request body
      const data = await response.json();

      const expectedData = members.map(m => ({
          ...m,
          deactivationDate: m.deactivationDate ? m.deactivationDate.toISOString() : null
      }));

      expect(response.status).toBe(200);
      expect(data).toEqual(expectedData);
      expect(prismaMock.member.findMany).toHaveBeenCalledTimes(1);
    });

    it('should handle errors during GET', async () => {
      prismaMock.member.findMany.mockRejectedValue(new Error('Database error'));

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({ error: 'Failed to fetch members. Please check server logs.' });
      expect(prismaMock.member.findMany).toHaveBeenCalledTimes(1);
    });
  });

  describe('POST', () => {
    it('should create a new member and return serialized data', async () => {
      const newMemberInput = {
        name: faker.person.firstName(),
        surname: faker.person.lastName(),
        email: faker.internet.email(),
        dni: faker.string.alphanumeric(9),
        // status defaults to ACTIVE in schema
      };
      const createdMember = {
          id: 3,
          ...newMemberInput,
          status: MemberStatus.ACTIVE,
          position: null, organization: null, phone1: null, phone1Description: null,
          phone2: null, phone2Description: null, phone3: null, phone3Description: null,
          deactivationDate: null, deactivationDescription: null
      };
      prismaMock.member.create.mockResolvedValue(createdMember as any);
      (req.json as jest.Mock).mockResolvedValue(newMemberInput);

      const response = await POST(req);
      const data = await response.json();

      const expectedData = { ...createdMember, deactivationDate: null }; // Serialize date field

      expect(response.status).toBe(201);
      expect(data).toEqual(expectedData);
      expect(prismaMock.member.create).toHaveBeenCalledTimes(1);
      // Prisma adds default status, so check input data passed was correct
      expect(prismaMock.member.create).toHaveBeenCalledWith({ data: newMemberInput });
    });

    it('should handle errors during POST', async () => {
      const newMemberInput = {
        name: faker.person.firstName(),
        surname: faker.person.lastName(),
        email: faker.internet.email(),
        dni: faker.string.alphanumeric(9),
      };
      prismaMock.member.create.mockRejectedValue(new Error('Database error'));
      (req.json as jest.Mock).mockResolvedValue(newMemberInput);

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({ error: 'Failed to create member. Please check server logs.' });
      expect(prismaMock.member.create).toHaveBeenCalledTimes(1);
      expect(prismaMock.member.create).toHaveBeenCalledWith({ data: newMemberInput });
    });

     // Add tests for validation errors (Zod)
     // Add tests for 409 conflict (unique email/dni)
  });
});
