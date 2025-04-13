import { GET, POST } from '../src/app/api/workgroups/route';
import { PrismaClient } from '@prisma/client';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';
import { NextResponse } from 'next/server';

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => mockPrisma),
}));

const mockPrisma: DeepMockProxy<PrismaClient> = mockDeep<PrismaClient>();

describe('Workgroups API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET', () => {
    it('should return a list of workgroups', async () => {
      const mockWorkgroups = [{ id: 1, name: 'Workgroup 1' }, { id: 2, name: 'Workgroup 2' }];
      mockPrisma.workgroup.findMany.mockResolvedValue(mockWorkgroups);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockWorkgroups);
      expect(mockPrisma.workgroup.findMany).toHaveBeenCalledTimes(1);
    });

    it('should return a 500 error if fetching workgroups fails', async () => {
      mockPrisma.workgroup.findMany.mockRejectedValue(new Error('Database error'));

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({ error: 'Failed to fetch workgroups' });
      expect(mockPrisma.workgroup.findMany).toHaveBeenCalledTimes(1);
    });
  });

  describe('POST', () => {
    it('should create a new workgroup', async () => {
      const newWorkgroup = { name: 'New Workgroup' };
      const createdWorkgroup = { id: 3, name: 'New Workgroup' };
      mockPrisma.workgroup.create.mockResolvedValue(createdWorkgroup);

      const mockRequest = {
        json: jest.fn().mockResolvedValue(newWorkgroup),
      } as unknown as Request;

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data).toEqual(createdWorkgroup);
      expect(mockPrisma.workgroup.create).toHaveBeenCalledTimes(1);
      expect(mockPrisma.workgroup.create).toHaveBeenCalledWith({ data: newWorkgroup });
    });

    it('should return a 500 error if creating a workgroup fails', async () => {
      const newWorkgroup = { name: 'New Workgroup' };
      mockPrisma.workgroup.create.mockRejectedValue(new Error('Database error'));

      const mockRequest = {
        json: jest.fn().mockResolvedValue(newWorkgroup),
      } as unknown as Request;

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({ error: 'Failed to create workgroup' });
      expect(mockPrisma.workgroup.create).toHaveBeenCalledTimes(1);
      expect(mockPrisma.workgroup.create).toHaveBeenCalledWith({ data: newWorkgroup });
    });
  });
});