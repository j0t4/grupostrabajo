import { GET, PUT, DELETE } from '@/app/api/members/[id]/route'; // Use alias
import { PrismaClient, MemberStatus } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { mockDeep, DeepMockProxy, mockReset } from 'jest-mock-extended';
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

// Keep NextResponse *unmocked* unless absolutely necessary
// This makes tests closer to reality and avoids complex mock maintenance
jest.unmock('next/server');

describe('Member API Endpoints - /members/[id]', () => {
  let req: DeepMockProxy<NextRequest>;

  beforeEach(() => {
    mockReset(prismaMock); // Reset mocks before each test
    req = mockDeep<NextRequest>(); // Use mockDeep for NextRequest as well
  });

  // Helper function to create a mock member
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
    it('should return a member if found', async () => {
      const memberId = 1;
      const mockMember = createMockMember(memberId);
      prismaMock.member.findUnique.mockResolvedValue(mockMember as any);

      const response = await GET(req, { params: { id: String(memberId) } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockMember);
      expect(prismaMock.member.findUnique).toHaveBeenCalledWith({ where: { id: memberId } });
      expect(prismaMock.member.findUnique).toHaveBeenCalledTimes(1);
    });

    it('should return 404 if member is not found', async () => {
      const memberId = 99;
      prismaMock.member.findUnique.mockResolvedValue(null);

      const response = await GET(req, { params: { id: String(memberId) } });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data).toEqual({ message: 'Member not found' }); // Match the actual error message from route
      expect(prismaMock.member.findUnique).toHaveBeenCalledWith({ where: { id: memberId } });
      expect(prismaMock.member.findUnique).toHaveBeenCalledTimes(1);
    });

    it('should return 500 if there is a database error', async () => {
      const memberId = 1;
      prismaMock.member.findUnique.mockRejectedValue(new Error('Database error'));

      const response = await GET(req, { params: { id: String(memberId) } });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({ error: 'Failed to fetch member. Please check server logs.' });
      expect(prismaMock.member.findUnique).toHaveBeenCalledWith({ where: { id: memberId } });
      expect(prismaMock.member.findUnique).toHaveBeenCalledTimes(1);
    });
  });

  describe('PUT', () => {
    it('should update a member if found', async () => {
      const memberId = 1;
      const existingMember = createMockMember(memberId);
      const updateData = { name: 'Updated Name', email: faker.internet.email() };
      const updatedMember = { ...existingMember, ...updateData };

      prismaMock.member.findUnique.mockResolvedValue(existingMember as any);
      prismaMock.member.update.mockResolvedValue(updatedMember as any);
      (req.json as jest.Mock).mockResolvedValue(updateData); // Mock the request body

      const response = await PUT(req, { params: { id: String(memberId) } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(updatedMember);
      expect(prismaMock.member.update).toHaveBeenCalledWith({ where: { id: memberId }, data: updateData });
      expect(prismaMock.member.update).toHaveBeenCalledTimes(1);
    });

     it('should return 404 if member to update is not found', async () => {
      const memberId = 99;
      const updateData = { name: 'Updated Name' };
      prismaMock.member.update.mockRejectedValue({ code: 'P2025' });
      (req.json as jest.Mock).mockResolvedValue(updateData);

      const response = await PUT(req, { params: { id: String(memberId) } });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data).toEqual({ message: 'Member not found' });
      expect(prismaMock.member.update).toHaveBeenCalledWith({ where: { id: memberId }, data: updateData });
      expect(prismaMock.member.update).toHaveBeenCalledTimes(1);
    });

    it('should return 500 if there is a database error during update', async () => {
      const memberId = 1;
      const updateData = { name: 'Updated Name' };
      prismaMock.member.update.mockRejectedValue(new Error('Database error'));
      (req.json as jest.Mock).mockResolvedValue(updateData);

      const response = await PUT(req, { params: { id: String(memberId) } });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({ error: 'Failed to update member. Please check server logs.' });
      expect(prismaMock.member.update).toHaveBeenCalledWith({ where: { id: memberId }, data: updateData });
      expect(prismaMock.member.update).toHaveBeenCalledTimes(1);
    });
  });

  describe('DELETE', () => {
    it('should delete a member if found and return 204', async () => {
      const memberId = 1;
      prismaMock.member.delete.mockResolvedValue({} as any);

      const response = await DELETE(req, { params: { id: String(memberId) } });

      expect(response.status).toBe(204);
      expect(response.body).toBeNull(); // Check body is null for 204

      expect(prismaMock.member.delete).toHaveBeenCalledWith({ where: { id: memberId } });
      expect(prismaMock.member.delete).toHaveBeenCalledTimes(1);
    });

     it('should return 404 if member to delete is not found', async () => {
      const memberId = 99;
      prismaMock.member.delete.mockRejectedValue({ code: 'P2025' });

      const response = await DELETE(req, { params: { id: String(memberId) } });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data).toEqual({ message: 'Member not found' });
      expect(prismaMock.member.delete).toHaveBeenCalledWith({ where: { id: memberId } });
      expect(prismaMock.member.delete).toHaveBeenCalledTimes(1);
    });

    it('should return 500 if there is a database error during delete', async () => {
      const memberId = 1;
      prismaMock.member.delete.mockRejectedValue(new Error('Database error'));

      const response = await DELETE(req, { params: { id: String(memberId) } });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({ error: 'Failed to delete member. Please check server logs.' });
      expect(prismaMock.member.delete).toHaveBeenCalledWith({ where: { id: memberId } });
      expect(prismaMock.member.delete).toHaveBeenCalledTimes(1);
    });
  });
});
