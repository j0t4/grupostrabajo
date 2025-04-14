import { GET, PUT, DELETE } from '@/app/api/workgroups/[id]/route';
import { prismaMock } from '@/../src/__mocks__/@prisma/client';
import { NextRequest } from 'next/server';
import { Workgroup } from '@prisma/client';

// Helper function to create a mock NextRequest
const createMockRequest = (method: string, body?: any, params?: { id: string }): NextRequest => {
    const url = new URL(`http://localhost/api/workgroups/${params?.id ?? '1'}`);
    return new NextRequest(url.toString(), {
        method,
        body: body ? JSON.stringify(body) : null,
        headers: body ? { 'Content-Type': 'application/json' } : {},
    });
};

const serializeWorkgroup = (workgroup: any) => {
  if (!workgroup) return null;
  return {
    ...workgroup,
    deactivationDate: workgroup.deactivationDate ? workgroup.deactivationDate.toISOString() : null,
    creationDate: workgroup.creationDate.toISOString(), // Assuming creationDate is always present and needs serialization
  };
};


describe('Workgroups API - /api/workgroups/[id]', () => {
  const workgroupId = 1;
  const mockWorkgroup: Workgroup = {
      id: workgroupId,
      name: 'Test Group 1',
      description: 'Desc 1',
      creationDate: new Date('2024-01-01T00:00:00.000Z'),
      status: 'ACTIVE',
      deactivationDate: null,
      parentId: null
  };
  const serializedMockWorkgroup = serializeWorkgroup(mockWorkgroup);

  const params = { params: { id: String(workgroupId) } };
  const invalidIdParams = { params: { id: 'abc' } };
  const nonExistentIdParams = { params: { id: '999' } };

  describe('GET /api/workgroups/[id]', () => {
      it('should return a specific workgroup by ID', async () => {
          prismaMock.workgroup.findUnique.mockResolvedValue(mockWorkgroup);

          const response = await GET(createMockRequest('GET', null, { id: String(workgroupId) }), params);
          const data = await response.json();

          expect(response.status).toBe(200);
          expect(data).toEqual(serializedMockWorkgroup);
          expect(prismaMock.workgroup.findUnique).toHaveBeenCalledWith({ where: { id: workgroupId } });
      });

       it('should return 404 if workgroup not found', async () => {
           prismaMock.workgroup.findUnique.mockResolvedValue(null);

           const response = await GET(createMockRequest('GET', null, { id: String(nonExistentIdParams.params.id) }), nonExistentIdParams);
           const data = await response.json();

           expect(response.status).toBe(404);
           expect(data).toEqual({ message: 'Workgroup not found' });
       });

       it('should return 400 if ID is invalid', async () => {
           const response = await GET(createMockRequest('GET', null, { id: invalidIdParams.params.id }), invalidIdParams);
           const data = await response.json();

           expect(response.status).toBe(400);
           expect(data.error).toEqual('Invalid ID parameter');
       });

       it('should return 500 on database error', async () => {
           prismaMock.workgroup.findUnique.mockRejectedValue(new Error('Database error'));

           const response = await GET(createMockRequest('GET', null, { id: String(workgroupId) }), params);
           const data = await response.json();

           expect(response.status).toBe(500);
           expect(data.error).toContain('Failed to fetch workgroup');
       });
  });

  describe('PUT /api/workgroups/[id]', () => {
      const updateData = { name: 'Updated Name', status: 'INACTIVE' as const };
      const updatedWorkgroup = { ...mockWorkgroup, ...updateData };
      const serializedUpdatedWorkgroup = serializeWorkgroup(updatedWorkgroup);

      it('should update a workgroup and return it', async () => {
          prismaMock.workgroup.update.mockResolvedValue(updatedWorkgroup);

          const req = createMockRequest('PUT', updateData, { id: String(workgroupId) });
          const response = await PUT(req, params);
          const data = await response.json();

          expect(response.status).toBe(200);
          expect(data).toEqual(serializedUpdatedWorkgroup);
          expect(prismaMock.workgroup.update).toHaveBeenCalledWith({
              where: { id: workgroupId },
              data: updateData,
          });
      });

       it('should return 404 if workgroup to update not found', async () => {
           // Simulate Prisma P2025 error
           const prismaError = { code: 'P2025' };
           prismaMock.workgroup.update.mockRejectedValue(prismaError);

           const req = createMockRequest('PUT', updateData, { id: String(nonExistentIdParams.params.id) });
           const response = await PUT(req, nonExistentIdParams);
           const data = await response.json();


           expect(response.status).toBe(404);
           expect(data).toEqual({ message: 'Workgroup not found' });
       });

       it('should return 400 for invalid ID', async () => {
           const req = createMockRequest('PUT', updateData, { id: invalidIdParams.params.id });
           const response = await PUT(req, invalidIdParams);
           const data = await response.json();

           expect(response.status).toBe(400);
           expect(data.error).toContain('Invalid ID parameter');
       });

       it('should return 400 for invalid update data', async () => {
           const invalidData = { name: 123 }; // Invalid type for name
           const req = createMockRequest('PUT', invalidData, { id: String(workgroupId) });
           const response = await PUT(req, params);
           const data = await response.json();

           expect(response.status).toBe(400);
           expect(data.error).toContain('Invalid input data');
       });

        it('should return 400 if trying to set itself as parent', async () => {
             const selfParentData = { parentId: workgroupId };
             prismaMock.workgroup.findUnique.mockResolvedValue(mockWorkgroup); // Assume parent check needs this

             const req = createMockRequest('PUT', selfParentData, { id: String(workgroupId) });
             const response = await PUT(req, params);
             const data = await response.json();

             expect(response.status).toBe(400);
             expect(data).toEqual({ error: 'Workgroup cannot be its own parent.' });
         });

         it('should return 404 if parentId does not exist', async () => {
             const nonExistentParentData = { parentId: 999 };
             prismaMock.workgroup.findUnique.mockResolvedValue(null); // Simulate parent not found

             const req = createMockRequest('PUT', nonExistentParentData, { id: String(workgroupId) });
             const response = await PUT(req, params);
             const data = await response.json();

             expect(response.status).toBe(404);
             expect(data).toEqual({ error: `Parent workgroup with ID ${nonExistentParentData.parentId} not found.` });
             // Ensure the findUnique for parent check was called
             expect(prismaMock.workgroup.findUnique).toHaveBeenCalledWith({ where: { id: nonExistentParentData.parentId } });
         });


       it('should return 500 on other database error', async () => {
           prismaMock.workgroup.update.mockRejectedValue(new Error('Database error'));

           const req = createMockRequest('PUT', updateData, { id: String(workgroupId) });
           const response = await PUT(req, params);
           const data = await response.json();

           expect(response.status).toBe(500);
           expect(data.error).toContain('Failed to update workgroup');
       });
  });

  describe('DELETE /api/workgroups/[id]', () => {
      it('should delete a workgroup and return 204', async () => {
           prismaMock.workgroup.findUnique.mockResolvedValue(mockWorkgroup); // Needed for existence check
           prismaMock.workgroup.delete.mockResolvedValue(mockWorkgroup);

           const req = createMockRequest('DELETE', null, { id: String(workgroupId) });
           const response = await DELETE(req, params);

           expect(response.status).toBe(204);
           expect(await response.text()).toBe(''); // No body for 204
           expect(prismaMock.workgroup.findUnique).toHaveBeenCalledWith({ where: { id: workgroupId } });
           expect(prismaMock.workgroup.delete).toHaveBeenCalledWith({ where: { id: workgroupId } });
      });

       it('should return 404 if workgroup to delete not found', async () => {
           prismaMock.workgroup.findUnique.mockResolvedValue(null); // Simulate not found during check

           const req = createMockRequest('DELETE', null, { id: String(nonExistentIdParams.params.id) });
           const response = await DELETE(req, nonExistentIdParams);
           const data = await response.json();

           expect(response.status).toBe(404);
           expect(data).toEqual({ message: 'Workgroup not found' });
           expect(prismaMock.workgroup.delete).toHaveBeenCalledTimes(1); // Delete should be called after the failed findUnique
       });

        it('should return 409 if deletion conflicts (e.g., foreign key constraint)', async () => {
             prismaMock.workgroup.findUnique.mockResolvedValue(mockWorkgroup); // Found during check
             const prismaError = { code: 'P2003' }; // Foreign key constraint error
             prismaMock.workgroup.delete.mockRejectedValue(prismaError);

             const req = createMockRequest('DELETE', null, { id: String(workgroupId) });
             const response = await DELETE(req, params);
             const data = await response.json();

             expect(response.status).toBe(409); // Conflict
             expect(data.error).toContain('Cannot delete workgroup');
         });

       it('should return 400 for invalid ID', async () => {
           const req = createMockRequest('DELETE', null, { id: invalidIdParams.params.id });
           const response = await DELETE(req, invalidIdParams);
           const data = await response.json();

           expect(response.status).toBe(400);
           expect(data.error).toContain('Invalid ID parameter');
       });

       it('should return 500 on other database error during delete', async () => {
           prismaMock.workgroup.findUnique.mockResolvedValue(mockWorkgroup); // Found during check
           prismaMock.workgroup.delete.mockRejectedValue(new Error('Database error'));

           const req = createMockRequest('DELETE', null, { id: String(workgroupId) });
           const response = await DELETE(req, params);
           const data = await response.json();

           expect(response.status).toBe(500);
           expect(data.error).toContain('Failed to delete workgroup');
       });
  });
});
