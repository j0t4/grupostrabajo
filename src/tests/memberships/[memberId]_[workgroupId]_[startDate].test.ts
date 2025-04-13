import { GET, PUT, DELETE } from '../../app/api/memberships/[memberId]_[workgroupId]_[startDate]/route';
import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

describe('Memberships API Endpoints', () => {
  const memberId = '1';
  const workgroupId = '2';
  const startDate = '2023-01-01';
  let createdMemberId: number;
  let createdWorkgroupId: number;

  // Use a consistent date format for startDate
  const formattedStartDate = new Date(startDate).toISOString();
  beforeEach(async () => {
    // Ensure a clean database state and create necessary records before each test
    await prisma.membership.deleteMany();
    await prisma.member.deleteMany();
    await prisma.workgroup.deleteMany();

    // Create a member and a workgroup to satisfy foreign key constraints
    await prisma.member.create({
      data: {
        id: Number(memberId),
        name: 'Test Member',
        email: 'test@example.com',
        surname: 'Test Surname',
        dni: '12345678A',
      },
    });

    await prisma.workgroup.create({
      data: {
        id: Number(workgroupId),
        name: 'Test Workgroup',
      },
    });
    const createdMember = await prisma.member.findUnique({
      where: { id: Number(memberId) },
    });
    const createdWorkgroup = await prisma.workgroup.findUnique({
      where: { id: Number(workgroupId) },
    });
    if (createdMember && createdWorkgroup) {
      createdMemberId = createdMember.id;
      createdWorkgroupId = createdWorkgroup.id;
    } else {
      throw new Error('Failed to create member or workgroup');
    }
  },
    });
createdMemberId = createdMember.id;
createdWorkgroupId = createdWorkgroup.id;

// Create a membership with the composite key
await prisma.membership.create({
  data: {
    memberId: Number(memberId),
    workgroupId: Number(workgroupId),
    startDate: formattedStartDate,
    role: 'GUEST', // Or any valid role
  },
});

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
        role: 'GUEST', // Use a valid role from the enum
      },
    });

    const request = new Request(
      `http://localhost/api/memberships/${createdMemberId}_${createdWorkgroupId}_${formattedStartDate}`,
    );

    const response = await GET(request, {
      params: { memberId: createdMemberId.toString(), workgroupId: createdWorkgroupId.toString(), startDate: formattedStartDate },
    });

    const membership = await response.json();

    expect(response.status).toBe(200);
    expect(membership).toHaveProperty('memberId', Number(memberId));
    expect(membership).toHaveProperty('workgroupId', Number(workgroupId));
    expect(new Date(membership.startDate)).toEqual(new Date(startDate));
  });
  it('should return a 404 error if membership is not found', async () => {
    const params = {
      memberId: '999', // Non-existent member ID
      workgroupId: '999', // Non-existent workgroup ID
      startDate: formattedStartDate,
    };

    const request = new Request('http://localhost');
    const response = await GET(request, { params });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(error).toHaveProperty('error', 'Membership not found');
  });

  it('should return a 500 error if there is a server error', async () => {
    // Mock PrismaClient to simulate an error
    jest.spyOn(prisma.membership, 'findUnique').mockImplementation(() => {
      throw new Error('Simulated database error');
    });
    const params = {
      memberId: createdMemberId.toString(),
      workgroupId: createdWorkgroupId.toString(),
      startDate: formattedStartDate,
    };
    const request = new Request('http://localhost'); // Provide a valid URL
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

    const updatedEndDate = new Date('2023-12-31').toISOString();
    const request = new Request(
      `http://localhost/api/memberships/${createdMemberId}_${createdWorkgroupId}_${formattedStartDate}`,
      {
        method: 'PUT',
        body: JSON.stringify({ endDate: updatedEndDate }),
      },
    );

    const response = await PUT(request, {
      params: { memberId: createdMemberId.toString(), workgroupId: createdWorkgroupId.toString(), startDate: formattedStartDate },
    });

    const membership = await response.json();

    expect(response.status).toBe(200);
    expect(membership).toHaveProperty('endDate', updatedEndDate);
  });

  it('should return a 500 error if there is a server error', async () => {
    // Mock PrismaClient to simulate an error
    jest.spyOn(prisma.membership, 'update').mockImplementation(() => {
      throw new Error('Simulated database error');
    });

    const updatedData = { endDate: new Date('2023-12-31').toISOString() };
    const params = { memberId: memberId.toString(), workgroupId: workgroupId.toString(), startDate: formattedStartDate };
    const requestUrl = `http://localhost/api/memberships/${params.memberId}_${params.workgroupId}_${params.startDate}`;

    const request = new Request('http://localhost', { // Provide a valid URL
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
    const request = new Request(
      `http://localhost/api/memberships/${createdMemberId}_${createdWorkgroupId}_${formattedStartDate}`,
      {
        method: 'DELETE',
      },
    );
    const response = await DELETE(request, { params: { memberId: memberId.toString(), workgroupId: workgroupId.toString(), startDate: formattedStartDate } });
    const result = await response.json();
    expect(response.status).toBe(200);
    expect(result).toHaveProperty('message', 'Membership deleted');

    const params = { memberId: memberId.toString(), workgroupId: workgroupId.toString(), startDate: formattedStartDate };

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

    const request = new Request(
      `http://localhost/api/memberships/${createdMemberId}_${createdWorkgroupId}_${formattedStartDate}`,
      {
        method: 'DELETE',
      },
    );
    const params = { memberId: memberId.toString(), workgroupId: workgroupId.toString(), startDate: formattedStartDate };
    const response = await DELETE(request, { params });
    const error = await response.json();

    expect(response.status).toBe(500);
    expect(error).toHaveProperty('error', 'Failed to delete membership');

    // Restore the original implementation
    jest.restoreAllMocks();
  });
});
});