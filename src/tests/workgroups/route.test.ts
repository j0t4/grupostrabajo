import { GET, POST } from '@/app/api/workgroups/route';
import { prismaMock } from '@/../src/__mocks__/@prisma/client';
import { NextRequest } from 'next/server';
import { Workgroup } from '@prisma/client';

describe('Workgroups API - /api/workgroups', () => {
  const mockWorkgroups: Workgroup[] = [
    { id: 1, name: 'Test Group 1', description: 'Desc 1', creationDate: new Date(), status: 'ACTIVE', deactivationDate: null, parentId: null },
    { id: 2, name: 'Test Group 2', description: 'Desc 2', creationDate: new Date(), status: 'ACTIVE', deactivationDate: null, parentId: null },
  ];

  describe('GET /api/workgroups', () => {
    it('should return all workgroups', async () => {
      prismaMock.workgroup.findMany.mockResolvedValue(mockWorkgroups);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockWorkgroups.map(wg => ({...wg, creationDate: wg.creationDate.toISOString() })));
      expect(prismaMock.workgroup.findMany).toHaveBeenCalledTimes(1);
    });

    it('should return 500 on database error', async () => {
      prismaMock.workgroup.findMany.mockRejectedValue(new Error('Database error'));

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({ error: 'Failed to fetch workgroups' });
    });
  });

  describe('POST /api/workgroups', () => {
    it('should create a new workgroup and return it', async () => {
      const newWorkgroupData = { name: 'New Group', description: 'New Desc', status: 'ACTIVE' };
      const createdWorkgroup: Workgroup = {
          id: 3,
          ...newWorkgroupData,
          creationDate: new Date(),
          deactivationDate: null,
          parentId: null
      };
      prismaMock.workgroup.create.mockResolvedValue(createdWorkgroup);

      // Mock NextRequest
      const req = new NextRequest('http://localhost/api/workgroups', {
        method: 'POST',
        body: JSON.stringify(newWorkgroupData),
        headers: { 'Content-Type': 'application/json' },
      });


      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data).toEqual({...createdWorkgroup, creationDate: createdWorkgroup.creationDate.toISOString() });
      expect(prismaMock.workgroup.create).toHaveBeenCalledTimes(1);
      expect(prismaMock.workgroup.create).toHaveBeenCalledWith({ data: newWorkgroupData });
    });

     it('should return 500 if creation fails', async () => {
       const newWorkgroupData = { name: 'Fail Group', description: 'Fail Desc' };
       prismaMock.workgroup.create.mockRejectedValue(new Error('Creation failed'));

       const req = new NextRequest('http://localhost/api/workgroups', {
         method: 'POST',
         body: JSON.stringify(newWorkgroupData),
         headers: { 'Content-Type': 'application/json' },
       });


       const response = await POST(req);
       const data = await response.json();

       expect(response.status).toBe(500);
       expect(data).toEqual({ error: 'Failed to create workgroup' });
     });

     // Add more tests for validation errors if your POST handler includes validation
  });
});
