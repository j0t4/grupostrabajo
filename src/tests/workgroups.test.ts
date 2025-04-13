import { GET, POST } from '@/app/api/workgroups/route'; // Use alias
import { PrismaClient, WorkgroupStatus } from '@prisma/client';
import { mockDeep, DeepMockProxy, mockReset } from 'jest-mock-extended';
import { NextRequest } from 'next/server';

// --- Alternative Mock Initialization ---
let prismaMock: DeepMockProxy<PrismaClient>;

jest.mock('@prisma/client', () => {
  const mock = mockDeep<PrismaClient>();
  prismaMock = mock;
  return {
    PrismaClient: jest.fn(() => mock),
    WorkgroupStatus: {
      ACTIVE: 'ACTIVE',
      INACTIVE: 'INACTIVE'
    }
  };
});
// ------------------------------------

jest.unmock('next/server'); // Use real NextResponse

describe('Workgroups API - /workgroups', () => {
  let req: DeepMockProxy<NextRequest>;

  beforeEach(() => {
    mockReset(prismaMock);
    req = mockDeep<NextRequest>();
    // Provide a default URL for GET tests
    Object.defineProperty(req, 'nextUrl', { // Use nextUrl which has searchParams
        value: new URL('http://localhost/api/workgroups'),
        writable: true,
    });
  });

  const createMockWorkgroup = (id: number) => ({
    id,
    name: `Workgroup ${id}`,
    description: 'Test Description',
    creationDate: new Date(),
    status: WorkgroupStatus.ACTIVE,
    coordinatorId: null, // Assuming nullable
  });

  describe('GET', () => {
    it('should return all workgroups with serialized dates', async () => {
      const mockWorkgroups = [
        createMockWorkgroup(1),
        createMockWorkgroup(2),
      ];
      prismaMock.workgroup.findMany.mockResolvedValue(mockWorkgroups as any);

      const response = await GET(req); // Pass the mocked request
      const data = await response.json();

      const expectedData = mockWorkgroups.map(wg => ({
        ...wg,
        creationDate: wg.creationDate.toISOString(),
      }));

      expect(response.status).toBe(200);
      expect(data).toEqual(expectedData);
      expect(prismaMock.workgroup.findMany).toHaveBeenCalledTimes(1);
      expect(prismaMock.workgroup.findMany).toHaveBeenCalledWith({ where: {} }); // Default call args
    });

     it('should filter workgroups by status', async () => {
      const mockWorkgroups = [createMockWorkgroup(1)];
      prismaMock.workgroup.findMany.mockResolvedValue(mockWorkgroups as any);

      // Mock URL with query params
      Object.defineProperty(req, 'nextUrl', {
           value: new URL('http://localhost/api/workgroups?status=ACTIVE'),
           writable: true,
       });

      const response = await GET(req);
      const data = await response.json();

      const expectedData = mockWorkgroups.map(wg => ({ ...wg, creationDate: wg.creationDate.toISOString() }));

      expect(response.status).toBe(200);
      expect(data).toEqual(expectedData);
      expect(prismaMock.workgroup.findMany).toHaveBeenCalledTimes(1);
      expect(prismaMock.workgroup.findMany).toHaveBeenCalledWith({ where: { status: WorkgroupStatus.ACTIVE } });
    });

    it('should handle errors during GET', async () => {
      prismaMock.workgroup.findMany.mockRejectedValue(new Error('Database error'));

      const response = await GET(req); // Pass the mocked request
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({ error: 'Failed to fetch workgroups. Please check server logs.' });
      expect(prismaMock.workgroup.findMany).toHaveBeenCalledTimes(1);
    });
  });

  describe('POST', () => {
    it('should create a new workgroup and return serialized date', async () => {
      const newWorkgroupInput = { name: 'New WG', description: 'A new workgroup' };
      const createdWorkgroup = { ...newWorkgroupInput, id: 3, creationDate: new Date(), status: WorkgroupStatus.ACTIVE, coordinatorId: null };
      prismaMock.workgroup.create.mockResolvedValue(createdWorkgroup as any);
      (req.json as jest.Mock).mockResolvedValue(newWorkgroupInput);

      const response = await POST(req);
      const data = await response.json();

      const expectedData = {
          ...createdWorkgroup,
          creationDate: createdWorkgroup.creationDate.toISOString(), // Serialize date
      };

      expect(response.status).toBe(201);
      expect(data).toEqual(expectedData);
      expect(prismaMock.workgroup.create).toHaveBeenCalledTimes(1);
      expect(prismaMock.workgroup.create).toHaveBeenCalledWith({ data: newWorkgroupInput });
    });

    it('should handle errors during POST', async () => {
      const newWorkgroupInput = { name: 'New WG' };
      prismaMock.workgroup.create.mockRejectedValue(new Error('Database error'));
      (req.json as jest.Mock).mockResolvedValue(newWorkgroupInput);

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({ error: 'Failed to create workgroup. Please check server logs.' });
      expect(prismaMock.workgroup.create).toHaveBeenCalledTimes(1);
    });

    // Add tests for validation errors (Zod)
    // Add tests for potential coordinatorId validation/existence check if applicable
  });
});
