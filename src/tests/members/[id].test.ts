import { GET, PUT, DELETE } from '@/app/api/members/[id]/route';
import { prismaMock } from '@/../src/__mocks__/@prisma/client';
import { NextRequest } from 'next/server';
import { Member, MemberStatus } from '@prisma/client';

// Helper function to create a mock NextRequest
const createMockRequest = (method: string, body?: any, params?: { id: string }): NextRequest => {
    const url = new URL(`http://localhost/api/members/${params?.id ?? '1'}`);
    return new NextRequest(url.toString(), {
        method,
        body: body ? JSON.stringify(body) : null,
        headers: body ? { 'Content-Type': 'application/json' } : {},
    });
};

// Helper to serialize dates
const serializeMember = (member: Member | null) => {
  if (!member) return null;
  return {
    ...member,
    deactivationDate: member.deactivationDate ? member.deactivationDate.toISOString() : null,
  };
};

describe('Members API - /api/members/[id]', () => {
  const memberId = 1;
  const mockMember: Member = {
      id: memberId,
      name: 'John',
      surname: 'Doe',
      email: 'john.doe@example.com',
      dni: '12345678A',
      position: 'Developer',
      organization: 'Acme Inc.',
      phone1: '123456789',
      phone1Description: 'Work',
      phone2: null,
      phone2Description: null,
      phone3: null,
      phone3Description: null,
      status: MemberStatus.ACTIVE,
      deactivationDate: null,
      deactivationDescription: null,
  };
  const serializedMockMember = serializeMember(mockMember);

  const params = { params: { id: String(memberId) } };
  const invalidIdParams = { params: { id: 'abc' } }; // Example of invalid ID format if needed
  const nonExistentIdParams = { params: { id: '999' } };

  describe('GET /api/members/[id]', () => {
      it('should return a specific member by ID', async () => {
          prismaMock.member.findUnique.mockResolvedValue(mockMember);

          const response = await GET(createMockRequest('GET', null, { id: String(memberId) }), params);
          const data = await response.json();

          expect(response.status).toBe(200);
          expect(data).toEqual(serializedMockMember);
          expect(prismaMock.member.findUnique).toHaveBeenCalledWith({ where: { id: memberId } });
      });

       it('should return 404 if member not found', async () => {
           prismaMock.member.findUnique.mockResolvedValue(null);

           const response = await GET(createMockRequest('GET', null, { id: String(nonExistentIdParams.params.id) }), nonExistentIdParams);
           const data = await response.json();

           expect(response.status).toBe(404);
           expect(data).toEqual({ error: 'Member not found' });
       });

       // If ID validation were added to the route, this test would be relevant
       // it('should return 400 if ID is invalid', async () => {
       //     const response = await GET(createMockRequest('GET', null, { id: invalidIdParams.params.id }), invalidIdParams);
       //     const data = await response.json();
       //     expect(response.status).toBe(400);
       //     expect(data.error).toEqual('Invalid ID parameter'); // Adjust error message as needed
       // });

       it('should return 500 on database error', async () => {
           prismaMock.member.findUnique.mockRejectedValue(new Error('Database error'));

           // Suppress console.error for this test
           const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

           const response = await GET(createMockRequest('GET', null, { id: String(memberId) }), params);
           const data = await response.json();

           expect(response.status).toBe(500);
           expect(data.error).toContain('Failed to fetch member');

           // Restore console.error
           consoleErrorSpy.mockRestore();
       });
  });

  describe('PUT /api/members/[id]', () => {
      const updateData = { name: 'Updated Name', status: MemberStatus.INACTIVE };
      const updatedMember = { ...mockMember, ...updateData };
      const serializedUpdatedMember = serializeMember(updatedMember);

      it('should update a member and return it', async () => {
          prismaMock.member.update.mockResolvedValue(updatedMember);

          const req = createMockRequest('PUT', updateData, { id: String(memberId) });
          const response = await PUT(req, params);
          const data = await response.json();

          expect(response.status).toBe(200);
          expect(data).toEqual(serializedUpdatedMember);
          expect(prismaMock.member.update).toHaveBeenCalledWith({
              where: { id: memberId },
              data: updateData,
          });
      });

      // This test assumes PUT would return 404 if the record doesn't exist.
      // Prisma update throws an error (P2025) if the record is not found.
      it('should return 500 if update fails (e.g., member not found)', async () => {
           const prismaError = new Error('Record to update not found.');
           // (prismaError as any).code = 'P2025'; // Simulate Prisma error code if specific handling is needed
           prismaMock.member.update.mockRejectedValue(prismaError);

           // Suppress console.error for this test
           const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

           const req = createMockRequest('PUT', updateData, { id: String(nonExistentIdParams.params.id) });
           const response = await PUT(req, nonExistentIdParams);
           const data = await response.json();

           expect(response.status).toBe(500); // Currently returns 500
           expect(data).toEqual({ error: 'Failed to update member' });
           // If 404 handling were added based on P2025: expect(response.status).toBe(404);

           // Restore console.error
           consoleErrorSpy.mockRestore();
      });

       // If ID validation were added:
       // it('should return 400 for invalid ID', async () => {
       //     const req = createMockRequest('PUT', updateData, { id: invalidIdParams.params.id });
       //     const response = await PUT(req, invalidIdParams);
       //     const data = await response.json();
       //     expect(response.status).toBe(400);
       //     expect(data.error).toContain('Invalid ID parameter');
       // });

       // If input validation were added:
       // it('should return 400 for invalid update data', async () => {
       //     const invalidData = { email: 123 }; // Invalid type for email
       //     const req = createMockRequest('PUT', invalidData, { id: String(memberId) });
       //     const response = await PUT(req, params);
       //     const data = await response.json();
       //     expect(response.status).toBe(400);
       //     expect(data.error).toContain('Invalid input data');
       // });

       it('should return 500 on other database error', async () => {
           prismaMock.member.update.mockRejectedValue(new Error('Some other database error'));

           // Suppress console.error for this test
           const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

           const req = createMockRequest('PUT', updateData, { id: String(memberId) });
           const response = await PUT(req, params);
           const data = await response.json();

           expect(response.status).toBe(500);
           expect(data.error).toContain('Failed to update member');

           // Restore console.error
           consoleErrorSpy.mockRestore();
       });
  });

  describe('DELETE /api/members/[id]', () => {
      it('should delete a member and return a success message', async () => {
           // Note: The actual route returns { message: 'Member deleted' } with 200 OK.
           // A 204 No Content response is more standard for successful DELETE without returning content.
           prismaMock.member.delete.mockResolvedValue(mockMember); // Prisma delete returns the deleted object

           const req = createMockRequest('DELETE', null, { id: String(memberId) });
           const response = await DELETE(req, params);
           const data = await response.json();

           expect(response.status).toBe(200);
           expect(data).toEqual({ message: 'Member deleted' });
           expect(prismaMock.member.delete).toHaveBeenCalledWith({ where: { id: memberId } });
      });

      // This test assumes DELETE would return 404 if the record doesn't exist.
      // Prisma delete throws an error (P2025) if the record is not found.
      it('should return 500 if member to delete not found', async () => {
           const prismaError = new Error('Record to delete does not exist.');
           // (prismaError as any).code = 'P2025';
           prismaMock.member.delete.mockRejectedValue(prismaError);

           // Suppress console.error for this test
           const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

           const req = createMockRequest('DELETE', null, { id: String(nonExistentIdParams.params.id) });
           const response = await DELETE(req, nonExistentIdParams);
           const data = await response.json();

           expect(response.status).toBe(500); // Currently returns 500
           expect(data).toEqual({ error: 'Failed to delete member' });
           // If 404 handling were added based on P2025: expect(response.status).toBe(404);

           // Restore console.error
           consoleErrorSpy.mockRestore();
       });

        // If deletion conflicts (e.g., foreign key constraints) were handled:
        // it('should return 409 if deletion conflicts', async () => {
        //      const prismaError = { code: 'P2003' }; // Foreign key constraint error
        //      prismaMock.member.delete.mockRejectedValue(prismaError);
        //      const req = createMockRequest('DELETE', null, { id: String(memberId) });
        //      const response = await DELETE(req, params);
        //      const data = await response.json();
        //      expect(response.status).toBe(409); // Conflict
        //      expect(data.error).toContain('Cannot delete member');
        //  });

       // If ID validation were added:
       // it('should return 400 for invalid ID', async () => {
       //     const req = createMockRequest('DELETE', null, { id: invalidIdParams.params.id });
       //     const response = await DELETE(req, invalidIdParams);
       //     const data = await response.json();
       //     expect(response.status).toBe(400);
       //     expect(data.error).toContain('Invalid ID parameter');
       // });

       it('should return 500 on other database error during delete', async () => {
           prismaMock.member.delete.mockRejectedValue(new Error('Database error during delete'));

           // Suppress console.error for this test
           const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

           const req = createMockRequest('DELETE', null, { id: String(memberId) });
           const response = await DELETE(req, params);
           const data = await response.json();

           expect(response.status).toBe(500);
           expect(data.error).toContain('Failed to delete member');

           // Restore console.error
           consoleErrorSpy.mockRestore();
       });
  });
});
