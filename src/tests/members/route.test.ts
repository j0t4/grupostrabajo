import { GET, POST } from '@/app/api/members/route';
import { prismaMock } from '@/../src/__mocks__/@prisma/client';
import { NextRequest } from 'next/server';
import { Member, MemberStatus } from '@prisma/client';

describe('Members API - /api/members', () => {
  const mockMembers: Member[] = [
    { id: 1, name: 'John', surname: 'Doe', email: 'john.doe@example.com', dni: '12345678A', position: 'Developer', organization: 'Acme Inc.', phone1: '123456789', phone1Description: 'Work', phone2: null, phone2Description: null, phone3: null, phone3Description: null, status: MemberStatus.ACTIVE, deactivationDate: null, deactivationDescription: null },
    { id: 2, name: 'Jane', surname: 'Smith', email: 'jane.smith@example.com', dni: '87654321B', position: 'Designer', organization: 'Acme Inc.', phone1: '987654321', phone1Description: 'Work', phone2: null, phone2Description: null, phone3: null, phone3Description: null, status: MemberStatus.ACTIVE, deactivationDate: null, deactivationDescription: null },
  ];

  // Helper to serialize dates
  const serializeMemberDates = (member: Member) => ({
    ...member,
    deactivationDate: member.deactivationDate ? member.deactivationDate.toISOString() : null,
  });

  describe('GET /api/members', () => {
    it('should return all members', async () => {
      prismaMock.member.findMany.mockResolvedValue(mockMembers);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockMembers.map(serializeMemberDates));
      expect(prismaMock.member.findMany).toHaveBeenCalledTimes(1);
    });

    it('should return 500 on database error', async () => {
      prismaMock.member.findMany.mockRejectedValue(new Error('Database error'));

      // Suppress console.error for this test
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({ error: 'Failed to fetch members' });

      // Restore console.error
      consoleErrorSpy.mockRestore();
    });
  });

  describe('POST /api/members', () => {
    it('should create a new member and return it', async () => {
      const newMemberData = { name: 'New', surname: 'Member', email: 'new.member@example.com', dni: '11111111C', status: MemberStatus.ACTIVE };
      const createdMember: Member = {
          id: 3,
          ...newMemberData,
          position: null,
          organization: null,
          phone1: null,
          phone1Description: null,
          phone2: null,
          phone2Description: null,
          phone3: null,
          phone3Description: null,
          deactivationDate: null,
          deactivationDescription: null,
      };
      prismaMock.member.create.mockResolvedValue(createdMember);

      // Mock NextRequest
      const req = new NextRequest('http://localhost/api/members', {
        method: 'POST',
        body: JSON.stringify(newMemberData),
        headers: { 'Content-Type': 'application/json' },
      });


      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data).toEqual(serializeMemberDates(createdMember));
      expect(prismaMock.member.create).toHaveBeenCalledTimes(1);
      expect(prismaMock.member.create).toHaveBeenCalledWith({ data: newMemberData });
    });

     it('should return 500 if creation fails', async () => {
       const newMemberData = { name: 'Fail', surname: 'Member', email: 'fail@example.com', dni: '22222222D' };
       prismaMock.member.create.mockRejectedValue(new Error('Creation failed'));

       // Suppress console.error for this test
       const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

       const req = new NextRequest('http://localhost/api/members', {
         method: 'POST',
         body: JSON.stringify(newMemberData),
         headers: { 'Content-Type': 'application/json' },
       });


       const response = await POST(req);
       const data = await response.json();

       expect(response.status).toBe(500);
       expect(data).toEqual({ error: 'Failed to create member' });

       // Restore console.error
       consoleErrorSpy.mockRestore();
     });

     // Add more tests for validation errors if your POST handler includes validation (currently it doesn't seem to)
  });
});
