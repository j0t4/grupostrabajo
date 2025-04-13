import { GET, POST } from '../src/app/api/memberships/route';
import { PrismaClient } from '@prisma/client';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';
import { NextRequest } from 'next/server';

const prismaMock: DeepMockProxy<PrismaClient> = mockDeep<PrismaClient>();

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => prismaMock),
}));

describe('Memberships API', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('GET', () => {
    it('should return all memberships', async () => {
      const mockMemberships = [{ id: 1, memberId: 1, workgroupId: 1, startDate: new Date() }];
      prismaMock.membership.findMany.mockResolvedValue(mockMemberships);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockMemberships);
      expect(prismaMock.membership.findMany).toHaveBeenCalledTimes(1);
    });

    it('should handle errors', async () => {
      prismaMock.membership.findMany.mockRejectedValue(new Error('Database error'));

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({ error: 'Failed to fetch memberships' });
      expect(prismaMock.membership.findMany).toHaveBeenCalledTimes(1);
    });
  });

  describe('POST', () => {
    it('should create a new membership', async () => {
      const newMembership = { memberId: 2, workgroupId: 2, startDate: new Date() };
      const createdMembership = { id: 2, ...newMembership };
      prismaMock.membership.create.mockResolvedValue(createdMembership);

      const mockRequest = {
        json: async () => newMembership,
      } as unknown as NextRequest;

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data).toEqual(createdMembership);
      expect(prismaMock.membership.create).toHaveBeenCalledTimes(1);
      expect(prismaMock.membership.create).toHaveBeenCalledWith({
        data: newMembership,
      });
    });

    it('should handle errors', async () => {
      const newMembership = { memberId: 2, workgroupId: 2, startDate: new Date() };
      prismaMock.membership.create.mockRejectedValue(new Error('Database error'));

      const mockRequest = {
        json: async () => newMembership,
      } as unknown as NextRequest;

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({ error: 'Failed to create membership' });
      expect(prismaMock.membership.create).toHaveBeenCalledTimes(1);
      expect(prismaMock.membership.create).toHaveBeenCalledWith({
        data: newMembership,
      });
    });
  });
});