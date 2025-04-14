import { GET, POST } from '@/app/api/members/route';
import { prismaMock } from '@/../src/__mocks__/@prisma/client';
import { NextRequest } from 'next/server';
import { Member } from '@prisma/client';

describe('Members API - /api/members', () => {
  const mockMembers: Member[] = [
    { id: 1, firstName: 'John', lastName: 'Doe', email: 'john.doe@example.com', joinDate: new Date(), status: 'ACTIVE', deactivationDate: null },
    { id: 2, firstName: 'Jane', lastName: 'Smith', email: 'jane.smith@example.com', joinDate: new Date(), status: 'ACTIVE', deactivationDate: null },
  ];

  // Helper to serialize dates
  const serializeMemberDates = (member: Member) => ({
    ...member,
    joinDate: member.joinDate.toISOString(),
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

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({ error: 'Failed to fetch members' });
    });
  });

  describe('POST /api/members', () => {
    it('should create a new member and return it', async () => {
      const newMemberData = { firstName: 'New', lastName: 'Member', email: 'new.member@example.com', status: 'ACTIVE' as const };
      const createdMember: Member = {
          id: 3,
          ...newMemberData,
          joinDate: new Date(),
          deactivationDate: null,
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
       const newMemberData = { firstName: 'Fail', lastName: 'Member', email: 'fail@example.com' };
       prismaMock.member.create.mockRejectedValue(new Error('Creation failed'));

       const req = new NextRequest('http://localhost/api/members', {
         method: 'POST',
         body: JSON.stringify(newMemberData),
         headers: { 'Content-Type': 'application/json' },
       });


       const response = await POST(req);
       const data = await response.json();

       expect(response.status).toBe(500);
       expect(data).toEqual({ error: 'Failed to create member' });
     });

     // Add more tests for validation errors if your POST handler includes validation (currently it doesn't seem to)
  });
});
