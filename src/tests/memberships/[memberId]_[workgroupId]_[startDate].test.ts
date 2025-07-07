import { GET, PUT, DELETE } from '@/app/api/memberships/[memberId]_[workgroupId]_[startDate]/route';
import { prismaMock } from '@/../src/__mocks__/@prisma/client';
import { NextRequest } from 'next/server';
import { Membership, Member, Workgroup, MemberStatus, WorkgroupStatus, MembershipRole } from '@prisma/client'; // Import related types and Prisma
import { jest } from '@jest/globals';

// Helper function (mirroring the one in the route for consistency)
function parseMembershipKey(key: string): { memberId: number; workgroupId: number; startDate: Date } | null {
    const match = key.match(/^(\d+)_(\d+)_(.*)$/);
    if (!match) return null;
    const memberId = parseInt(match[1], 10);
    const workgroupId = parseInt(match[2], 10);
    const startDate = new Date(match[3]);
    if (isNaN(memberId) || isNaN(workgroupId) || isNaN(startDate.getTime())) {
      return null;
    }
    return { memberId, workgroupId, startDate };
}

// --- Mock Data ---
const testDate = new Date('2023-01-01T00:00:00.000Z');
const testDateISO = testDate.toISOString();

const mockMember: Member = { id: 1, name: 'Test Member', surname: 'Test', email: 'test@example.com', dni: '12345678A', position: null, organization: null, phone1: null, phone1Description: null, phone2: null, phone2Description: null, phone3: null, phone3Description: null, status: MemberStatus.ACTIVE, deactivationDate: null, deactivationDescription: null };
const mockWorkgroup: Workgroup = { id: 10, name: 'Test WG', description: null, status: WorkgroupStatus.ACTIVE, deactivationDate: null, parentId: null };

// Mock for Prisma responses (includes relations, uses Date objects)
const mockMembershipWithRelations: Membership & { member: Member, workgroup: Workgroup } = {
  memberId: 1,
  workgroupId: 10,
  role: MembershipRole.ASSISTANT,
  startDate: testDate,
  endDate: null,
  endDateDescription: null,
  member: mockMember,
  workgroup: mockWorkgroup,
};

// Mock for API response body (uses ISO strings for dates)
const mockMembershipISO = {
    memberId: mockMembershipWithRelations.memberId,
    workgroupId: mockMembershipWithRelations.workgroupId,
    role: mockMembershipWithRelations.role,
    startDate: mockMembershipWithRelations.startDate.toISOString(),
    endDate: mockMembershipWithRelations.endDate,
    endDateDescription: mockMembershipWithRelations.endDateDescription,
    member: {
        ...mockMember,
        deactivationDate: mockMember.deactivationDate ? mockMember.deactivationDate.toISOString() : null
    },
    workgroup: {
        ...mockWorkgroup,
        deactivationDate: mockWorkgroup.deactivationDate ? mockWorkgroup.deactivationDate.toISOString() : null
    }
};

const compositeKey = `${mockMembershipWithRelations.memberId}_${mockMembershipWithRelations.workgroupId}_${testDateISO}`;
const invalidCompositeKeyFormat = 'abc_xyz_invalid-date';
// This key passes the new regex but fails Date parsing within parseMembershipKey
const invalidCompositeKeyContent = `1_10_2023-13-01T00:00:00.000Z`; // Invalid month
const notFoundCompositeKey = `999_999_${testDateISO}`;

// --- Tests --- //
describe('API Route: /api/memberships/[key]', () => {

    describe('GET /api/memberships/{key}', () => {
        beforeEach(() => {
            jest.resetAllMocks();
            prismaMock.membership.findUnique.mockResolvedValue(mockMembershipWithRelations);
        });

        it('should return the specific membership with relations if found', async () => {
            const req = new NextRequest(`http://localhost/api/memberships/${compositeKey}`);
            const params = { params: { memberId_workgroupId_startDate: compositeKey } };

            const response = await GET(req, params);
            const body = await response.json();

            expect(response.status).toBe(200);
            expect(body).toEqual(mockMembershipISO); // Compare with ISO string version
            expect(prismaMock.membership.findUnique).toHaveBeenCalledWith({
                where: { memberId_workgroupId_startDate: { memberId: 1, workgroupId: 10, startDate: testDate } },
                include: { member: true, workgroup: true }
            });
        });

        it('should return 404 if the membership is not found', async () => {
            prismaMock.membership.findUnique.mockResolvedValue(null);
            const req = new NextRequest(`http://localhost/api/memberships/${notFoundCompositeKey}`);
            const params = { params: { memberId_workgroupId_startDate: notFoundCompositeKey } };
            const parsedKey = parseMembershipKey(notFoundCompositeKey)!;

            const response = await GET(req, params);
            const body = await response.json();

            expect(response.status).toBe(404);
            expect(body).toEqual({ message: 'Membership not found' });
            expect(prismaMock.membership.findUnique).toHaveBeenCalledWith({
                where: { memberId_workgroupId_startDate: { memberId: parsedKey.memberId, workgroupId: parsedKey.workgroupId, startDate: parsedKey.startDate } },
                 include: { member: true, workgroup: true }
            });
        });

         it('should return 400 if the key format is invalid (regex fail)', async () => {
            const req = new NextRequest(`http://localhost/api/memberships/${invalidCompositeKeyFormat}`);
            const params = { params: { memberId_workgroupId_startDate: invalidCompositeKeyFormat } };

            const response = await GET(req, params);
            const body = await response.json();

            expect(response.status).toBe(400);
            expect(body).toHaveProperty('error', 'Invalid path parameter format');
            expect(body).toHaveProperty('details');
            expect(prismaMock.membership.findUnique).not.toHaveBeenCalled();
        });

        it('should return 500 if the key content is invalid (date parse fail)', async () => {
            // This key passes regex but fails new Date() -> parseMembershipKey returns null
            const req = new NextRequest(`http://localhost/api/memberships/${invalidCompositeKeyContent}`);
            const params = { params: { memberId_workgroupId_startDate: invalidCompositeKeyContent } };

            const response = await GET(req, params);
            const body = await response.json();

             // The route's parseMembershipKey returns null, leading to 500 in the refactored route
            expect(response.status).toBe(500);
            expect(body).toEqual({ error: 'Internal server error: Failed to parse validated key.' });
            expect(prismaMock.membership.findUnique).not.toHaveBeenCalled();
        });

        it('should return 500 if there is a database error during findUnique', async () => {
            const dbError = new Error('Database error');
            prismaMock.membership.findUnique.mockRejectedValue(dbError);

            // Suppress console.error for this test
            const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

            const req = new NextRequest(`http://localhost/api/memberships/${compositeKey}`);
            const params = { params: { memberId_workgroupId_startDate: compositeKey } };

            const response = await GET(req, params);
            const body = await response.json();

            expect(response.status).toBe(500);
            expect(body).toEqual({ error: 'Failed to fetch membership. Please check server logs.' });

            // Restore console.error
            consoleErrorSpy.mockRestore();
        });
    });

    describe('PUT /api/memberships/{key}', () => {
        const validUpdateData = { endDate: new Date('2024-12-31T00:00:00.000Z'), endDateDescription: 'Finished' };
        const validUpdateDataISO = { endDate: validUpdateData.endDate.toISOString(), endDateDescription: 'Finished' };

         beforeEach(() => {
            jest.resetAllMocks();
            // Default mock for successful update
            const updatedMembership = { ...mockMembershipWithRelations, ...validUpdateData };
            prismaMock.membership.update.mockResolvedValue(updatedMembership);
         });

        it('should update the endDate successfully', async () => {
            const req = new NextRequest(`http://localhost/api/memberships/${compositeKey}`, {
                method: 'PUT',
                body: JSON.stringify(validUpdateData),
                headers: { 'Content-Type': 'application/json' }
            });
            const params = { params: { memberId_workgroupId_startDate: compositeKey } };

            const response = await PUT(req, params);
            const body = await response.json();
            const expectedBody = { ...mockMembershipISO, endDate: validUpdateData.endDate.toISOString(), endDateDescription: validUpdateData.endDateDescription }; // Calculate expected JSON response

            expect(response.status).toBe(200);
            expect(body).toEqual(expectedBody);
            expect(prismaMock.membership.update).toHaveBeenCalledWith({
                where: { memberId_workgroupId_startDate: { memberId: 1, workgroupId: 10, startDate: testDate } },
                data: { endDate: validUpdateData.endDate, endDateDescription: validUpdateData.endDateDescription }, // Expect Date object sent to Prisma
            });
        });

         it('should set endDate to null successfully', async () => {
             const updateDataNull = { endDate: null, endDateDescription: null };
             const updatedMembershipNull = { ...mockMembershipWithRelations, ...updateDataNull };
             prismaMock.membership.update.mockResolvedValue(updatedMembershipNull);

            const req = new NextRequest(`http://localhost/api/memberships/${compositeKey}`, {
                method: 'PUT',
                body: JSON.stringify(updateDataNull),
                headers: { 'Content-Type': 'application/json' }
            });
            const params = { params: { memberId_workgroupId_startDate: compositeKey } };

            const response = await PUT(req, params);
            const body = await response.json();
            const expectedBody = { ...mockMembershipISO, ...updateDataNull };

            expect(response.status).toBe(200);
            expect(body).toEqual(expectedBody);
            expect(prismaMock.membership.update).toHaveBeenCalledWith({
                where: { memberId_workgroupId_startDate: { memberId: 1, workgroupId: 10, startDate: testDate } },
                data: { endDate: null, endDateDescription: null },
            });
        });

        it('should return 404 if the membership to update is not found (P2025)', async () => {
            const prismaNotFoundError = new Error('Record to update not found.');
            (prismaNotFoundError as any).code = 'P2025';
            prismaMock.membership.update.mockRejectedValue(prismaNotFoundError);

            // Suppress console.error for this test
            const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

            const req = new NextRequest(`http://localhost/api/memberships/${notFoundCompositeKey}`, {
                method: 'PUT',
                body: JSON.stringify(validUpdateData),
                headers: { 'Content-Type': 'application/json' }
            });
            const params = { params: { memberId_workgroupId_startDate: notFoundCompositeKey } };

            const response = await PUT(req, params);
            const body = await response.json();

            expect(response.status).toBe(404);
            expect(body).toEqual({ message: 'Membership not found' });
            expect(prismaMock.membership.update).toHaveBeenCalled(); // Still tried to update

            // Restore console.error
            consoleErrorSpy.mockRestore();
        });

        it('should return 400 if the key format is invalid', async () => {
             const req = new NextRequest(`http://localhost/api/memberships/${invalidCompositeKeyFormat}`, {
                 method: 'PUT',
                 body: JSON.stringify(validUpdateDataISO),
                 headers: { 'Content-Type': 'application/json' }
             });
            const params = { params: { memberId_workgroupId_startDate: invalidCompositeKeyFormat } };

            const response = await PUT(req, params);
            const body = await response.json();

            expect(response.status).toBe(400);
            expect(body).toHaveProperty('error', 'Invalid path parameter format');
            expect(prismaMock.membership.update).not.toHaveBeenCalled();
        });

        it('should return 400 for invalid update data format (Zod fail)', async () => {
            const invalidData = { endDate: 'not-a-date' }; // Invalid date string

            const req = new NextRequest(`http://localhost/api/memberships/${compositeKey}`, {
                 method: 'PUT',
                 body: JSON.stringify(invalidData),
                 headers: { 'Content-Type': 'application/json' }
             });
            const params = { params: { memberId_workgroupId_startDate: compositeKey } };

            const response = await PUT(req, params);
            const body = await response.json();

            expect(response.status).toBe(400);
            expect(body).toHaveProperty('error', 'Invalid input data');
             expect(body).toHaveProperty('details');
             expect(prismaMock.membership.update).not.toHaveBeenCalled();
        });

         it('should return 400 for unexpected update data field (Zod strict fail)', async () => {
            const invalidData = { endDate: null, unexpectedField: 'test' };

            const req = new NextRequest(`http://localhost/api/memberships/${compositeKey}`, {
                 method: 'PUT',
                 body: JSON.stringify(invalidData),
                 headers: { 'Content-Type': 'application/json' }
             });
            const params = { params: { memberId_workgroupId_startDate: compositeKey } };

            const response = await PUT(req, params);
            const body = await response.json();

            expect(response.status).toBe(400);
            expect(body).toHaveProperty('error', 'Invalid input data');
             expect(body).toHaveProperty('details'); // Zod adds details about unrecognized keys
             expect(prismaMock.membership.update).not.toHaveBeenCalled();
        });

         it('should return 500 if there is a database error during update', async () => {
            const dbError = new Error('Database error');
            // Ensure it's not a P2025 error, which should be 404
            if ('code' in dbError) delete (dbError as any).code;
            prismaMock.membership.update.mockRejectedValue(dbError);

            // Suppress console.error for this test
            const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

            const req = new NextRequest(`http://localhost/api/memberships/${compositeKey}`, {
                 method: 'PUT',
                 body: JSON.stringify(validUpdateData),
                 headers: { 'Content-Type': 'application/json' }
             });
            const params = { params: { memberId_workgroupId_startDate: compositeKey } };

            const response = await PUT(req, params);
            const body = await response.json();

            expect(response.status).toBe(500);
            expect(body).toEqual({ error: 'Failed to update membership. Please check server logs.' });

            // Restore console.error
            consoleErrorSpy.mockRestore();
        });
    });

    describe('DELETE /api/memberships/{key}', () => {
         beforeEach(() => {
            jest.resetAllMocks();
            prismaMock.membership.delete.mockResolvedValue(mockMembershipWithRelations); // delete returns the deleted object
         });

        it('should delete the specific membership and return 204', async () => {
            const req = new NextRequest(`http://localhost/api/memberships/${compositeKey}`, { method: 'DELETE' });
            const params = { params: { memberId_workgroupId_startDate: compositeKey } };

            const response = await DELETE(req, params);

            expect(response.status).toBe(204);
            expect(await response.text()).toBe(''); // No body for 204
            expect(prismaMock.membership.delete).toHaveBeenCalledWith({
                where: { memberId_workgroupId_startDate: { memberId: 1, workgroupId: 10, startDate: testDate } },
            });
        });

        it('should return 404 if the membership to delete is not found (P2025)', async () => {
            const prismaNotFoundError = new Error('Record to delete does not exist.');
            (prismaNotFoundError as any).code = 'P2025';
            prismaMock.membership.delete.mockRejectedValue(prismaNotFoundError);

            // Suppress console.error for this test
            const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

            const req = new NextRequest(`http://localhost/api/memberships/${notFoundCompositeKey}`, { method: 'DELETE' });
             const params = { params: { memberId_workgroupId_startDate: notFoundCompositeKey } };
             const parsedKey = parseMembershipKey(notFoundCompositeKey)!;

            const response = await DELETE(req, params);
            const body = await response.json();

            expect(response.status).toBe(404);
            expect(body).toEqual({ message: 'Membership not found' });
            expect(prismaMock.membership.delete).toHaveBeenCalledWith({
                 where: { memberId_workgroupId_startDate: { memberId: parsedKey.memberId, workgroupId: parsedKey.workgroupId, startDate: parsedKey.startDate } },
            });

            // Restore console.error
            consoleErrorSpy.mockRestore();
        });

         it('should return 400 if the key format is invalid', async () => {
             const req = new NextRequest(`http://localhost/api/memberships/${invalidCompositeKeyFormat}`, { method: 'DELETE' });
            const params = { params: { memberId_workgroupId_startDate: invalidCompositeKeyFormat } };

            const response = await DELETE(req, params);
            const body = await response.json();

            expect(response.status).toBe(400);
            expect(body).toHaveProperty('error', 'Invalid path parameter format');
            expect(prismaMock.membership.delete).not.toHaveBeenCalled();
        });

        it('should return 409 if delete fails due to foreign key constraint (P2003)', async () => {
            const fkError = new Error('Foreign key constraint violation');
            (fkError as any).code = 'P2003';
            prismaMock.membership.delete.mockRejectedValue(fkError);

            // Suppress console.error for this test
            const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

            const req = new NextRequest(`http://localhost/api/memberships/${compositeKey}`, { method: 'DELETE' });
            const params = { params: { memberId_workgroupId_startDate: compositeKey } };

            const response = await DELETE(req, params);
            const body = await response.json();

            expect(response.status).toBe(409); // Conflict
            expect(body).toEqual({ error: 'Cannot delete membership due to existing references.' });
            expect(prismaMock.membership.delete).toHaveBeenCalled();

            // Restore console.error
            consoleErrorSpy.mockRestore();
        });

        it('should return 500 if there is a generic database error during delete', async () => {
            const dbError = new Error('Database error');
             // Ensure it's not a P2025 or P2003 error
            if ('code' in dbError) delete (dbError as any).code;
            prismaMock.membership.delete.mockRejectedValue(dbError);

            // Suppress console.error for this test
            const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

            const req = new NextRequest(`http://localhost/api/memberships/${compositeKey}`, { method: 'DELETE' });
            const params = { params: { memberId_workgroupId_startDate: compositeKey } };

            const response = await DELETE(req, params);
            const body = await response.json();

            expect(response.status).toBe(500);
            expect(body).toEqual({ error: 'Failed to delete membership. Please check server logs.' });

            // Restore console.error
            consoleErrorSpy.mockRestore();
        });
    });
});        it('should update the endDate successfully', async () => {
            const req = new NextRequest(`http://localhost/api/memberships/${compositeKey}`, {
                method: 'PUT',
                body: JSON.stringify(validUpdateData),
                headers: { 'Content-Type': 'application/json' }
            });
            const params = { params: { memberId_workgroupId_startDate: compositeKey } };

            const response = await PUT(req, params);
            const body = await response.json();
            const expectedBody = { ...mockMembershipISO, endDate: validUpdateData.endDate.toISOString(), endDateDescription: validUpdateData.endDateDescription }; // Calculate expected JSON response

            expect(response.status).toBe(200);
            expect(body).toEqual(expectedBody);
            expect(prismaMock.membership.update).toHaveBeenCalledWith({
                where: { memberId_workgroupId_startDate: { memberId: 1, workgroupId: 10, startDate: testDate } },
                data: { endDate: validUpdateData.endDate, endDateDescription: validUpdateData.endDateDescription }, // Expect Date object sent to Prisma
            });
        });

         it('should set endDate to null successfully', async () => {
             const updateDataNull = { endDate: null, endDateDescription: null };
             const updatedMembershipNull = { ...mockMembershipWithRelations, ...updateDataNull };
             prismaMock.membership.update.mockResolvedValue(updatedMembershipNull);

            const req = new NextRequest(`http://localhost/api/memberships/${compositeKey}`, {
                method: 'PUT',
                body: JSON.stringify(updateDataNull),
                headers: { 'Content-Type': 'application/json' }
            });
            const params = { params: { memberId_workgroupId_startDate: compositeKey } };

            const response = await PUT(req, params);
            const body = await response.json();
            const expectedBody = { ...mockMembershipISO, ...updateDataNull };

            expect(response.status).toBe(200);
            expect(body).toEqual(expectedBody);
            expect(prismaMock.membership.update).toHaveBeenCalledWith({
                where: { memberId_workgroupId_startDate: { memberId: 1, workgroupId: 10, startDate: testDate } },
                data: { endDate: null, endDateDescription: null },
            });
        });

        it('should return 404 if the membership to update is not found (P2025)', async () => {
            const prismaNotFoundError = new Error('Record to update not found.');
            (prismaNotFoundError as any).code = 'P2025';
            prismaMock.membership.update.mockRejectedValue(prismaNotFoundError);

            // Suppress console.error for this test
            const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

            const req = new NextRequest(`http://localhost/api/memberships/${notFoundCompositeKey}`, {
                method: 'PUT',
                body: JSON.stringify(validUpdateData),
                headers: { 'Content-Type': 'application/json' }
            });
            const params = { params: { memberId_workgroupId_startDate: notFoundCompositeKey } };

            const response = await PUT(req, params);
            const body = await response.json();

            expect(response.status).toBe(404);
            expect(body).toEqual({ message: 'Membership not found' });
            expect(prismaMock.membership.update).toHaveBeenCalled(); // Still tried to update

            // Restore console.error
            consoleErrorSpy.mockRestore();
        });

        it('should return 400 if the key format is invalid', async () => {
             const req = new NextRequest(`http://localhost/api/memberships/${invalidCompositeKeyFormat}`, {
                 method: 'PUT',
                 body: JSON.stringify(validUpdateDataISO),
                 headers: { 'Content-Type': 'application/json' }
             });
            const params = { params: { memberId_workgroupId_startDate: invalidCompositeKeyFormat } };

            const response = await PUT(req, params);
            const body = await response.json();

            expect(response.status).toBe(400);
            expect(body).toHaveProperty('error', 'Invalid path parameter format');
            expect(prismaMock.membership.update).not.toHaveBeenCalled();
        });

        it('should return 400 for invalid update data format (Zod fail)', async () => {
            const invalidData = { endDate: 'not-a-date' }; // Invalid date string

            const req = new NextRequest(`http://localhost/api/memberships/${compositeKey}`, {
                 method: 'PUT',
                 body: JSON.stringify(invalidData),
                 headers: { 'Content-Type': 'application/json' }
             });
            const params = { params: { memberId_workgroupId_startDate: compositeKey } };

            const response = await PUT(req, params);
            const body = await response.json();

            expect(response.status).toBe(400);
            expect(body).toHaveProperty('error', 'Invalid input data');
             expect(body).toHaveProperty('details');
             expect(prismaMock.membership.update).not.toHaveBeenCalled();
        });

         it('should return 400 for unexpected update data field (Zod strict fail)', async () => {
            const invalidData = { endDate: null, unexpectedField: 'test' };

            const req = new NextRequest(`http://localhost/api/memberships/${compositeKey}`, {
                 method: 'PUT',
                 body: JSON.stringify(invalidData),
                 headers: { 'Content-Type': 'application/json' }
             });
            const params = { params: { memberId_workgroupId_startDate: compositeKey } };

            const response = await PUT(req, params);
            const body = await response.json();

            expect(response.status).toBe(400);
            expect(body).toHaveProperty('error', 'Invalid input data');
             expect(body).toHaveProperty('details'); // Zod adds details about unrecognized keys
             expect(prismaMock.membership.update).not.toHaveBeenCalled();
        });

         it('should return 500 if there is a database error during update', async () => {
            const dbError = new Error('Database error');
            // Ensure it's not a P2025 error, which should be 404
            if ('code' in dbError) delete (dbError as any).code;
            prismaMock.membership.update.mockRejectedValue(dbError);

            // Suppress console.error for this test
            const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

            const req = new NextRequest(`http://localhost/api/memberships/${compositeKey}`, {
                 method: 'PUT',
                 body: JSON.stringify(validUpdateData),
                 headers: { 'Content-Type': 'application/json' }
             });
            const params = { params: { memberId_workgroupId_startDate: compositeKey } };

            const response = await PUT(req, params);
            const body = await response.json();

            expect(response.status).toBe(500);
            expect(body).toEqual({ error: 'Failed to update membership. Please check server logs.' });

            // Restore console.error
            consoleErrorSpy.mockRestore();
        });
    });

    describe('DELETE /api/memberships/{key}', () => {
         beforeEach(() => {
            jest.resetAllMocks();
            prismaMock.membership.delete.mockResolvedValue(mockMembershipWithRelations); // delete returns the deleted object
         });

        it('should delete the specific membership and return 204', async () => {
            const req = new NextRequest(`http://localhost/api/memberships/${compositeKey}`, { method: 'DELETE' });
            const params = { params: { memberId_workgroupId_startDate: compositeKey } };

            const response = await DELETE(req, params);

            expect(response.status).toBe(204);
            expect(await response.text()).toBe(''); // No body for 204
            expect(prismaMock.membership.delete).toHaveBeenCalledWith({
                where: { memberId_workgroupId_startDate: { memberId: 1, workgroupId: 10, startDate: testDate } },
            });
        });

        it('should return 404 if the membership to delete is not found (P2025)', async () => {
            const prismaNotFoundError = new Error('Record to delete does not exist.');
            (prismaNotFoundError as any).code = 'P2025';
            prismaMock.membership.delete.mockRejectedValue(prismaNotFoundError);

            // Suppress console.error for this test
            const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

            const req = new NextRequest(`http://localhost/api/memberships/${notFoundCompositeKey}`, { method: 'DELETE' });
             const params = { params: { memberId_workgroupId_startDate: notFoundCompositeKey } };
             const parsedKey = parseMembershipKey(notFoundCompositeKey)!;

            const response = await DELETE(req, params);
            const body = await response.json();

            expect(response.status).toBe(404);
            expect(body).toEqual({ message: 'Membership not found' });
            expect(prismaMock.membership.delete).toHaveBeenCalledWith({
                 where: { memberId_workgroupId_startDate: { memberId: parsedKey.memberId, workgroupId: parsedKey.workgroupId, startDate: parsedKey.startDate } },
            });

            // Restore console.error
            consoleErrorSpy.mockRestore();
        });

         it('should return 400 if the key format is invalid', async () => {
             const req = new NextRequest(`http://localhost/api/memberships/${invalidCompositeKeyFormat}`, { method: 'DELETE' });
            const params = { params: { memberId_workgroupId_startDate: invalidCompositeKeyFormat } };

            const response = await DELETE(req, params);
            const body = await response.json();

            expect(response.status).toBe(400);
            expect(body).toHaveProperty('error', 'Invalid path parameter format');
            expect(prismaMock.membership.delete).not.toHaveBeenCalled();
        });

        it('should return 409 if delete fails due to foreign key constraint (P2003)', async () => {
            const fkError = new Error('Foreign key constraint violation');
            (fkError as any).code = 'P2003';
            prismaMock.membership.delete.mockRejectedValue(fkError);

            // Suppress console.error for this test
            const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

            const req = new NextRequest(`http://localhost/api/memberships/${compositeKey}`, { method: 'DELETE' });
            const params = { params: { memberId_workgroupId_startDate: compositeKey } };

            const response = await DELETE(req, params);
            const body = await response.json();

            expect(response.status).toBe(409); // Conflict
            expect(body).toEqual({ error: 'Cannot delete membership due to existing references.' });
            expect(prismaMock.membership.delete).toHaveBeenCalled();

            // Restore console.error
            consoleErrorSpy.mockRestore();
        });

        it('should return 500 if there is a generic database error during delete', async () => {
            const dbError = new Error('Database error');
             // Ensure it's not a P2025 or P2003 error
            if ('code' in dbError) delete (dbError as any).code;
            prismaMock.membership.delete.mockRejectedValue(dbError);

            // Suppress console.error for this test
            const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

            const req = new NextRequest(`http://localhost/api/memberships/${compositeKey}`, { method: 'DELETE' });
            const params = { params: { memberId_workgroupId_startDate: compositeKey } };

            const response = await DELETE(req, params);
            const body = await response.json();

            expect(response.status).toBe(500);
            expect(body).toEqual({ error: 'Failed to delete membership. Please check server logs.' });

            // Restore console.error
            consoleErrorSpy.mockRestore();
        });
    });
});        it('should update the endDate successfully', async () => {
            const req = new NextRequest(`http://localhost/api/memberships/${compositeKey}`, {
                method: 'PUT',
                body: JSON.stringify(validUpdateData),
                headers: { 'Content-Type': 'application/json' }
            });
            const params = { params: { memberId_workgroupId_startDate: compositeKey } };

            const response = await PUT(req, params);
            const body = await response.json();
            const expectedBody = { ...mockMembershipISO, endDate: validUpdateData.endDate.toISOString(), endDateDescription: validUpdateData.endDateDescription }; // Calculate expected JSON response

            expect(response.status).toBe(200);
            expect(body).toEqual(expectedBody);
            expect(prismaMock.membership.update).toHaveBeenCalledWith({
                where: { memberId_workgroupId_startDate: { memberId: 1, workgroupId: 10, startDate: testDate } },
                data: { endDate: validUpdateData.endDate, endDateDescription: validUpdateData.endDateDescription }, // Expect Date object sent to Prisma
            });
        });

         it('should set endDate to null successfully', async () => {
             const updateDataNull = { endDate: null, endDateDescription: null };
             const updatedMembershipNull = { ...mockMembershipWithRelations, ...updateDataNull };
             prismaMock.membership.update.mockResolvedValue(updatedMembershipNull);

            const req = new NextRequest(`http://localhost/api/memberships/${compositeKey}`, {
                method: 'PUT',
                body: JSON.stringify(updateDataNull),
                headers: { 'Content-Type': 'application/json' }
            });
            const params = { params: { memberId_workgroupId_startDate: compositeKey } };

            const response = await PUT(req, params);
            const body = await response.json();
            const expectedBody = { ...mockMembershipISO, ...updateDataNull };

            expect(response.status).toBe(200);
            expect(body).toEqual(expectedBody);
            expect(prismaMock.membership.update).toHaveBeenCalledWith({
                where: { memberId_workgroupId_startDate: { memberId: 1, workgroupId: 10, startDate: testDate } },
                data: { endDate: null, endDateDescription: null },
            });
        });

        it('should return 404 if the membership to update is not found (P2025)', async () => {
            const prismaNotFoundError = new Error('Record to update not found.');
            (prismaNotFoundError as any).code = 'P2025';
            prismaMock.membership.update.mockRejectedValue(prismaNotFoundError);

            // Suppress console.error for this test
            const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

            const req = new NextRequest(`http://localhost/api/memberships/${notFoundCompositeKey}`, {
                method: 'PUT',
                body: JSON.stringify(validUpdateData),
                headers: { 'Content-Type': 'application/json' }
            });
            const params = { params: { memberId_workgroupId_startDate: notFoundCompositeKey } };

            const response = await PUT(req, params);
            const body = await response.json();

            expect(response.status).toBe(404);
            expect(body).toEqual({ message: 'Membership not found' });
            expect(prismaMock.membership.update).toHaveBeenCalled(); // Still tried to update

            // Restore console.error
            consoleErrorSpy.mockRestore();
        });

        it('should return 400 if the key format is invalid', async () => {
             const req = new NextRequest(`http://localhost/api/memberships/${invalidCompositeKeyFormat}`, {
                 method: 'PUT',
                 body: JSON.stringify(validUpdateDataISO),
                 headers: { 'Content-Type': 'application/json' }
             });
            const params = { params: { memberId_workgroupId_startDate: invalidCompositeKeyFormat } };

            const response = await PUT(req, params);
            const body = await response.json();

            expect(response.status).toBe(400);
            expect(body).toHaveProperty('error', 'Invalid path parameter format');
            expect(prismaMock.membership.update).not.toHaveBeenCalled();
        });

        it('should return 400 for invalid update data format (Zod fail)', async () => {
            const invalidData = { endDate: 'not-a-date' }; // Invalid date string

            const req = new NextRequest(`http://localhost/api/memberships/${compositeKey}`, {
                 method: 'PUT',
                 body: JSON.stringify(invalidData),
                 headers: { 'Content-Type': 'application/json' }
             });
            const params = { params: { memberId_workgroupId_startDate: compositeKey } };

            const response = await PUT(req, params);
            const body = await response.json();

            expect(response.status).toBe(400);
            expect(body).toHaveProperty('error', 'Invalid input data');
             expect(body).toHaveProperty('details');
             expect(prismaMock.membership.update).not.toHaveBeenCalled();
        });

         it('should return 400 for unexpected update data field (Zod strict fail)', async () => {
            const invalidData = { endDate: null, unexpectedField: 'test' };

            const req = new NextRequest(`http://localhost/api/memberships/${compositeKey}`, {
                 method: 'PUT',
                 body: JSON.stringify(invalidData),
                 headers: { 'Content-Type': 'application/json' }
             });
            const params = { params: { memberId_workgroupId_startDate: compositeKey } };

            const response = await PUT(req, params);
            const body = await response.json();

            expect(response.status).toBe(400);
            expect(body).toHaveProperty('error', 'Invalid input data');
             expect(body).toHaveProperty('details'); // Zod adds details about unrecognized keys
             expect(prismaMock.membership.update).not.toHaveBeenCalled();
        });

         it('should return 500 if there is a database error during update', async () => {
            const dbError = new Error('Database error');
            // Ensure it's not a P2025 error, which should be 404
            if ('code' in dbError) delete (dbError as any).code;
            prismaMock.membership.update.mockRejectedValue(dbError);

            // Suppress console.error for this test
            const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

            const req = new NextRequest(`http://localhost/api/memberships/${compositeKey}`, {
                 method: 'PUT',
                 body: JSON.stringify(validUpdateData),
                 headers: { 'Content-Type': 'application/json' }
             });
            const params = { params: { memberId_workgroupId_startDate: compositeKey } };

            const response = await PUT(req, params);
            const body = await response.json();

            expect(response.status).toBe(500);
            expect(body).toEqual({ error: 'Failed to update membership. Please check server logs.' });

            // Restore console.error
            consoleErrorSpy.mockRestore();
        });
    });

         it('should update the endDate successfully', async () => {
            const req = new NextRequest(`http://localhost/api/memberships/${compositeKey}`, {
                method: 'PUT',
                body: JSON.stringify({ endDate: validUpdateData.endDate, endDateDescription: validUpdateData.endDateDescription }),
                headers: { 'Content-Type': 'application/json' }
            });
            const params = { params: { memberId_workgroupId_startDate: compositeKey } };

            const response = await PUT(req, params);
            const body = await response.json();
            const expectedBody = { ...mockMembershipISO, endDate: validUpdateData.endDate.toISOString(), endDateDescription: validUpdateData.endDateDescription }; // Calculate expected JSON response

            expect(response.status).toBe(200);
            expect(body).toEqual(expectedBody);
            expect(prismaMock.membership.update).toHaveBeenCalledWith({
                where: { memberId_workgroupId_startDate: { memberId: 1, workgroupId: 10, startDate: testDate } },
                data: { endDate: validUpdateData.endDate, endDateDescription: validUpdateData.endDateDescription }, // Expect Date object sent to Prisma
            });
        });
            const params = { params: { memberId_workgroupId_startDate: compositeKey } };

            const response = await PUT(req, params);
            const body = await response.json();
            const expectedBody = { ...mockMembershipISO, endDate: validUpdateData.endDate.toISOString(), endDateDescription: validUpdateData.endDateDescription }; // Calculate expected JSON response

            expect(response.status).toBe(200);
            expect(body).toEqual(expectedBody);
            expect(prismaMock.membership.update).toHaveBeenCalledWith({
                where: { memberId_workgroupId_startDate: { memberId: 1, workgroupId: 10, startDate: testDate } },
                data: { endDate: validUpdateData.endDate, endDateDescription: validUpdateData.endDateDescription }, // Expect Date object sent to Prisma
            });
        });
            const params = { params: { memberId_workgroupId_startDate: compositeKey } };

            const response = await PUT(req, params);
            const body = await response.json();
            const expectedBody = { ...mockMembershipISO, endDate: validUpdateData.endDate.toISOString(), endDateDescription: validUpdateData.endDateDescription }; // Calculate expected JSON response

            expect(response.status).toBe(200);
            expect(body).toEqual(expectedBody);
            expect(prismaMock.membership.update).toHaveBeenCalledWith({
                where: { memberId_workgroupId_startDate: { memberId: 1, workgroupId: 10, startDate: testDate } },
                data: { endDate: validUpdateData.endDate, endDateDescription: validUpdateData.endDateDescription }, // Expect Date object sent to Prisma
            });
        });
         it('should set endDate to null successfully', async () => {
             const updateDataNull = { endDate: null, endDateDescription: null };
             const updatedMembershipNull = { ...mockMembershipWithRelations, ...updateDataNull };
             prismaMock.membership.update.mockResolvedValue(updatedMembershipNull);

            const req = new NextRequest(`http://localhost/api/memberships/${compositeKey}`, {
                method: 'PUT',
                body: JSON.stringify(updateDataNull),
                headers: { 'Content-Type': 'application/json' }
            });
            const params = { params: { memberId_workgroupId_startDate: compositeKey } };

            const response = await PUT(req, params);
            const body = await response.json();
            const expectedBody = { ...mockMembershipISO, ...updateDataNull };

            expect(response.status).toBe(200);
            expect(body).toEqual(expectedBody);
            expect(prismaMock.membership.update).toHaveBeenCalledWith({
                where: { memberId_workgroupId_startDate: { memberId: 1, workgroupId: 10, startDate: testDate } },
                data: { endDate: null, endDateDescription: null },
            });
        });
        it('should return 404 if the membership to update is not found (P2025)', async () => {
            const prismaNotFoundError = new Error('Record to update not found.');
            (prismaNotFoundError as any).code = 'P2025';
            prismaMock.membership.update.mockRejectedValue(prismaNotFoundError);

            // Suppress console.error for this test
            const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

            const req = new NextRequest(`http://localhost/api/memberships/${notFoundCompositeKey}`, {
                method: 'PUT',
                body: JSON.stringify({ endDate: validUpdateData.endDate, endDateDescription: validUpdateData.endDateDescription }),
                headers: { 'Content-Type': 'application/json' }
            });
            const params = { params: { memberId_workgroupId_startDate: notFoundCompositeKey } };

            const response = await PUT(req, params);
            const body = await response.json();

            expect(response.status).toBe(404);
            expect(body).toEqual({ message: 'Membership not found' });
            expect(prismaMock.membership.update).toHaveBeenCalled(); // Still tried to update

            // Restore console.error
            consoleErrorSpy.mockRestore();
        });

        it('should return 400 if the key format is invalid', async () => {
             const req = new NextRequest(`http://localhost/api/memberships/${invalidCompositeKeyFormat}`, {
                 method: 'PUT',
                 body: JSON.stringify(validUpdateDataISO),
                 headers: { 'Content-Type': 'application/json' }
             });
            const params = { params: { memberId_workgroupId_startDate: invalidCompositeKeyFormat } };

            const response = await PUT(req, params);
            const body = await response.json();

            expect(response.status).toBe(400);
            expect(body).toHaveProperty('error', 'Invalid path parameter format');
            expect(prismaMock.membership.update).not.toHaveBeenCalled();
        });

        it('should return 400 for invalid update data format (Zod fail)', async () => {
            const invalidData = { endDate: 'not-a-date' }; // Invalid date string

            const req = new NextRequest(`http://localhost/api/memberships/${compositeKey}`, {
                 method: 'PUT',
                 body: JSON.stringify(invalidData),
                 headers: { 'Content-Type': 'application/json' }
             });
            const params = { params: { memberId_workgroupId_startDate: compositeKey } };

            const response = await PUT(req, params);
            const body = await response.json();

            expect(response.status).toBe(400);
            expect(body).toHaveProperty('error', 'Invalid input data');
             expect(body).toHaveProperty('details');
             expect(prismaMock.membership.update).not.toHaveBeenCalled();
        });

         it('should return 400 for unexpected update data field (Zod strict fail)', async () => {
            const invalidData = { endDate: null, unexpectedField: 'test' };

            const req = new NextRequest(`http://localhost/api/memberships/${compositeKey}`, {
                 method: 'PUT',
                 body: JSON.stringify(invalidData),
                 headers: { 'Content-Type': 'application/json' }
             });
            const params = { params: { memberId_workgroupId_startDate: compositeKey } };

            const response = await PUT(req, params);
            const body = await response.json();

            expect(response.status).toBe(400);
            expect(body).toHaveProperty('error', 'Invalid input data');
             expect(body).toHaveProperty('details'); // Zod adds details about unrecognized keys
             expect(prismaMock.membership.update).not.toHaveBeenCalled();
        });

         it('should return 500 if there is a database error during update', async () => {
            const dbError = new Error('Database error');
            // Ensure it's not a P2025 error, which should be 404
            if ('code' in dbError) delete (dbError as any).code;
            prismaMock.membership.update.mockRejectedValue(dbError);

            // Suppress console.error for this test
            const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

            const req = new NextRequest(`http://localhost/api/memberships/${compositeKey}`, {
                 method: 'PUT',
                 body: JSON.stringify({ endDate: validUpdateData.endDate, endDateDescription: validUpdateData.endDateDescription }),
                 headers: { 'Content-Type': 'application/json' }
             });
            const params = { params: { memberId_workgroupId_startDate: compositeKey } };

            const response = await PUT(req, params);
            const body = await response.json();

            expect(response.status).toBe(500);
            expect(body).toEqual({ error: 'Failed to update membership. Please check server logs.' });

            // Restore console.error
            consoleErrorSpy.mockRestore();
        });
    });

    describe('DELETE /api/memberships/{key}', () => {
         beforeEach(() => {
            jest.resetAllMocks();
            prismaMock.membership.delete.mockResolvedValue(mockMembershipWithRelations); // delete returns the deleted object
         });

        it('should delete the specific membership and return 204', async () => {
            const req = new NextRequest(`http://localhost/api/memberships/${compositeKey}`, { method: 'DELETE' });
            const params = { params: { memberId_workgroupId_startDate: compositeKey } };

            const response = await DELETE(req, params);

            expect(response.status).toBe(204);
            expect(await response.text()).toBe(''); // No body for 204
            expect(prismaMock.membership.delete).toHaveBeenCalledWith({
                where: { memberId_workgroupId_startDate: { memberId: 1, workgroupId: 10, startDate: testDate } },
            });
        });

        it('should return 404 if the membership to delete is not found (P2025)', async () => {
            const prismaNotFoundError = new Error('Record to delete does not exist.');
            (prismaNotFoundError as any).code = 'P2025';
            prismaMock.membership.delete.mockRejectedValue(prismaNotFoundError);

            // Suppress console.error for this test
            const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

            const req = new NextRequest(`http://localhost/api/memberships/${notFoundCompositeKey}`, { method: 'DELETE' });
             const params = { params: { memberId_workgroupId_startDate: notFoundCompositeKey } };
             const parsedKey = parseMembershipKey(notFoundCompositeKey)!;

            const response = await DELETE(req, params);
            const body = await response.json();

            expect(response.status).toBe(404);
            expect(body).toEqual({ message: 'Membership not found' });
            expect(prismaMock.membership.delete).toHaveBeenCalledWith({
                 where: { memberId_workgroupId_startDate: { memberId: parsedKey.memberId, workgroupId: parsedKey.workgroupId, startDate: parsedKey.startDate } },
            });

            // Restore console.error
            consoleErrorSpy.mockRestore();
        });

         it('should return 400 if the key format is invalid', async () => {
             const req = new NextRequest(`http://localhost/api/memberships/${invalidCompositeKeyFormat}`, { method: 'DELETE' });
            const params = { params: { memberId_workgroupId_startDate: invalidCompositeKeyFormat } };

            const response = await DELETE(req, params);
            const body = await response.json();

            expect(response.status).toBe(400);
            expect(body).toHaveProperty('error', 'Invalid path parameter format');
            expect(prismaMock.membership.delete).not.toHaveBeenCalled();
        });

        it('should return 409 if delete fails due to foreign key constraint (P2003)', async () => {
            const fkError = new Error('Foreign key constraint violation');
            (fkError as any).code = 'P2003';
            prismaMock.membership.delete.mockRejectedValue(fkError);

            // Suppress console.error for this test
            const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

            const req = new NextRequest(`http://localhost/api/memberships/${compositeKey}`, { method: 'DELETE' });
            const params = { params: { memberId_workgroupId_startDate: compositeKey } };

            const response = await DELETE(req, params);
            const body = await response.json();

            expect(response.status).toBe(409); // Conflict
            expect(body).toEqual({ error: 'Cannot delete membership due to existing references.' });
            expect(prismaMock.membership.delete).toHaveBeenCalled();

            // Restore console.error
            consoleErrorSpy.mockRestore();
        });

        it('should return 500 if there is a generic database error during delete', async () => {
            const dbError = new Error('Database error');
             // Ensure it's not a P2025 or P2003 error
            if ('code' in dbError) delete (dbError as any).code;
            prismaMock.membership.delete.mockRejectedValue(dbError);

            // Suppress console.error for this test
            const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

            const req = new NextRequest(`http://localhost/api/memberships/${compositeKey}`, { method: 'DELETE' });
            const params = { params: { memberId_workgroupId_startDate: compositeKey } };

            const response = await DELETE(req, params);
            const body = await response.json();

            expect(response.status).toBe(500);
            expect(body).toEqual({ error: 'Failed to delete membership. Please check server logs.' });

            // Restore console.error
            consoleErrorSpy.mockRestore();
        });
    });
});
