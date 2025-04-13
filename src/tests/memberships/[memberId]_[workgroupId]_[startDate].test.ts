import { GET, PUT, DELETE } from '../../src/app/api/memberships/[memberId]_[workgroupId]_[startDate]/route';
import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

describe('Memberships API Endpoints', () => {
  const memberId = '1';
  const workgroupId = '1';
  const startDate = '2023-01-01';
  const params = { memberId, workgroupId, startDate };

  beforeEach(async () => {
    // Ensure a clean database state before each test
    await prisma.membership.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('GET', () => {
    it('should return a membership if found', async () => {
      // Create a membership to be retrieved
      await prisma.membership.create({
        data: {
          memberId: Number(memberId),
          workgroupId: Number(workgroupId),
          startDate: new Date(startDate),
        },
      });

      const request = new Request('');
      const response = await GET(request, { params });
      const membership = await response.json();

      expect(response.status).toBe(200);
      expect(membership).toHaveProperty('memberId', Number(memberId));
      expect(membership).toHaveProperty('workgroupId', Number(workgroupId));
      expect(new Date(membership.startDate)).toEqual(new Date(startDate));
    });

    it('should return a 404 error if membership is not found', async () => {
      const request = new Request('');
      const response = await GET(request, { params });
      const error = await response.json();

      expect(response.status).toBe(404);
      expect(error).toHaveProperty('error', 'Membership not found');
    });

    it('should return a 500 error if there is a server error', async () => {
      // Mock PrismaClient to simulate an error
      jest.spyOn(prisma.membership, 'findUnique').mockImplementation(() => {
        throw new Error('Simulated database error');
      });

      const request = new Request('');
      const response = await GET(request, { params });
      const error = await response.json();

      expect(response.status).toBe(500);
      expect(error).toHaveProperty('error', 'Failed to fetch membership');

      // Restore the original implementation
      jest.restoreAllMocks();
    });
  });

  describe('PUT', () => {
    it('should update a membership if found', async () => {
      // Create a membership to be updated
      await prisma.membership.create({
        data: {
          memberId: Number(memberId),
          workgroupId: Number(workgroupId),
          startDate: new Date(startDate),
        },
      });

      const updatedData = { endDate: new Date('2023-12-31') };
      const request = new Request('', {
        method: 'PUT',
        body: JSON.stringify(updatedData),
      });
      const response = await PUT(request, { params });
      const membership = await response.json();

      expect(response.status).toBe(200);
      expect(membership).toHaveProperty('endDate', updatedData.endDate.toISOString());
    });

    it('should return a 500 error if there is a server error', async () => {
      // Mock PrismaClient to simulate an error
      jest.spyOn(prisma.membership, 'update').mockImplementation(() => {
        throw new Error('Simulated database error');
      });

      const updatedData = { endDate: new Date('2023-12-31') };
      const request = new Request('', {
        method: 'PUT',
        body: JSON.stringify(updatedData),
      });
      const response = await PUT(request, { params });
      const error = await response.json();

      expect(response.status).toBe(500);
      expect(error).toHaveProperty('error', 'Failed to update membership');

      // Restore the original implementation
      jest.restoreAllMocks();
    });
  });

  describe('DELETE', () => {
    it('should delete a membership if found', async () => {
      // Create a membership to be deleted
      await prisma.membership.create({
        data: {
          memberId: Number(memberId),
          workgroupId: Number(workgroupId),
          startDate: new Date(startDate),
        },
      });

      const request = new Request('', { method: 'DELETE' });
      const response = await DELETE(request, { params });
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result).toHaveProperty('message', 'Membership deleted');

      // Verify that the membership is actually deleted
      const deletedMembership = await prisma.membership.findUnique({
        where: {
          memberId_workgroupId_startDate: {
            memberId: Number(memberId),
            workgroupId: Number(workgroupId),
            startDate: new Date(startDate),
          },
        },
      });
      expect(deletedMembership).toBeNull();
    });

    it('should return a 500 error if there is a server error', async () => {
      // Mock PrismaClient to simulate an error
      jest.spyOn(prisma.membership, 'delete').mockImplementation(() => {
        throw new Error('Simulated database error');
      });

      const request = new Request('', { method: 'DELETE' });
      const response = await DELETE(request, { params });
      const error = await response.json();

      expect(response.status).toBe(500);
      expect(error).toHaveProperty('error', 'Failed to delete membership');

      // Restore the original implementation
      jest.restoreAllMocks();
    });
  });
});