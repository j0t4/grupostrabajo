import { GET, POST } from '@/app/api/workgroups/route'; // Use alias
import { PrismaClient, WorkgroupStatus } from '@prisma/client';
import { mockDeep, DeepMockProxy, mockReset } from 'jest-mock-extended';
import { NextRequest, NextResponse } from 'next/server';

// --- Correct Initialization Order ---
// 1. Declare the mock variable
const mockPrisma = mockDeep<DeepMockProxy<PrismaClient>>();

// 2. Mock the module *using* the declared variable
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => mockPrisma),
  WorkgroupStatus: {
      ACTIVE: 'ACTIVE',
      INACTIVE: 'INACTIVE'
  }
}));
// ------------------------------------

jest.unmock('next/server'); // Use real NextResponse

describe('Workgroups API - /workgroups', () => {
  let req: DeepMockProxy<NextRequest>;

  beforeEach(() => {
    mockReset(mockPrisma);
    req = mockDeep<NextRequest>();
  });

  describe('GET', () => {
    it('should return a list of workgroups with serialized dates', async () => {
      const mockWorkgroups = [
          { id: 1, name: 'Workgroup 1', description: null, status: WorkgroupStatus.ACTIVE, deactivationDate: new Date(), parentId: null },
          { id: 2, name: 'Workgroup 2', description: null, status: WorkgroupStatus.ACTIVE, deactivationDate: null, parentId: null }
      ];
      mockPrisma.workgroup.findMany.mockResolvedValue(mockWorkgroups as any);

      const response = await GET();
      const data = await response.json();

      // Expected serialized data
      const expectedData = mockWorkgroups.map(wg => ({
          ...wg,
          deactivationDate: wg.deactivationDate ? wg.deactivationDate.toISOString() : null
      }));

      expect(response.status).toBe(200);
      expect(data).toEqual(expectedData);
      expect(mockPrisma.workgroup.findMany).toHaveBeenCalledTimes(1);
    });

    it('should return a 500 error if fetching workgroups fails', async () => {
      mockPrisma.workgroup.findMany.mockRejectedValue(new Error('Database error'));

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({ error: 'Failed to fetch workgroups. Please check server logs.' });
      expect(mockPrisma.workgroup.findMany).toHaveBeenCalledTimes(1);
    });
  });

  describe('POST', () => {
    it('should create a new workgroup and return serialized data', async () => {
      const newWorkgroupInput = { name: 'New Workgroup', description: 'Test Desc', status: WorkgroupStatus.ACTIVE };
      const createdWorkgroup = { id: 3, ...newWorkgroupInput, deactivationDate: null, parentId: null };
      mockPrisma.workgroup.create.mockResolvedValue(createdWorkgroup as any);
      (req.json as jest.Mock).mockResolvedValue(newWorkgroupInput);

      const response = await POST(req);
      const data = await response.json();

      // Expected serialized data
      const expectedData = {
          ...createdWorkgroup,
          deactivationDate: null // Ensure date field is correctly serialized
      };

      expect(response.status).toBe(201);
      expect(data).toEqual(expectedData);
      expect(mockPrisma.workgroup.create).toHaveBeenCalledTimes(1);
      expect(mockPrisma.workgroup.create).toHaveBeenCalledWith({ data: newWorkgroupInput });
    });

    it('should return a 500 error if creating a workgroup fails', async () => {
      const newWorkgroupInput = { name: 'New Workgroup' };
      mockPrisma.workgroup.create.mockRejectedValue(new Error('Database error'));
      (req.json as jest.Mock).mockResolvedValue(newWorkgroupInput);

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({ error: 'Failed to create workgroup. Please check server logs.' });
      expect(mockPrisma.workgroup.create).toHaveBeenCalledTimes(1);
      expect(mockPrisma.workgroup.create).toHaveBeenCalledWith({ data: newWorkgroupInput });
    });

     // Add tests for validation errors (Zod)
  });
});
