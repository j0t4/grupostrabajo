import { GET, PUT, DELETE } from '../../src/app/api/members/[id]/route';
import { PrismaClient } from '@prisma/client';
import { NextRequest } from 'next/server';

const prisma = new PrismaClient();

// Mock the PrismaClient and NextResponse
jest.mock('@prisma/client');
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((data, options) => ({ body: JSON.stringify(data), ...options })),
  },
}));

describe('Member API Endpoints', () => {
  let mockMember: any;

  beforeEach(() => {
    mockMember = { id: 1, name: 'John Doe', email: 'john.doe@example.com' };
    (prisma.member.findUnique as jest.Mock).mockResolvedValue(null);
    (prisma.member.update as jest.Mock).mockResolvedValue(null);
    (prisma.member.delete as jest.Mock).mockResolvedValue(null);
    (NextResponse.json as jest.Mock).mockImplementation((data, options) => ({
      ...options,
      body: JSON.stringify(data),
    }));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET', () => {
    it('should return a member if found', async () => {
      (prisma.member.findUnique as jest.Mock).mockResolvedValue(mockMember);

      const req = {} as NextRequest;
      const params = { id: '1' };
      const res = await GET(req, { params: params });

      expect(prisma.member.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(NextResponse.json).toHaveBeenCalledWith(mockMember);
      expect(res.body).toEqual(JSON.stringify(mockMember));
    });

    it('should return 404 if member is not found', async () => {
      const req = {} as NextRequest;
      const params = { id: '1' };
      const res = await GET(req, { params: params });

      expect(prisma.member.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(NextResponse.json).toHaveBeenCalledWith({ error: 'Member not found' }, { status: 404 });
      expect(res.status).toEqual(404);
    });

    it('should return 500 if there is an error', async () => {
      (prisma.member.findUnique as jest.Mock).mockRejectedValue(new Error('Database error'));

      const req = {} as NextRequest;
      const params = { id: '1' };
      const res = await GET(req, { params: params });

      expect(prisma.member.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(NextResponse.json).toHaveBeenCalledWith({ error: 'Failed to fetch member' }, { status: 500 });
      expect(res.status).toEqual(500);
    });
  });

  describe('PUT', () => {
    it('should update a member if found', async () => {
      const updatedMember = { ...mockMember, name: 'Updated Name' };
      (prisma.member.update as jest.Mock).mockResolvedValue(updatedMember);

      const req = { json: async () => ({ name: 'Updated Name' }) } as NextRequest;
      const params = { id: '1' };
      const res = await PUT(req, { params: params });

      expect(prisma.member.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { name: 'Updated Name' },
      });
      expect(NextResponse.json).toHaveBeenCalledWith(updatedMember);
      expect(res.body).toEqual(JSON.stringify(updatedMember));
    });

    it('should return 500 if there is an error', async () => {
      (prisma.member.update as jest.Mock).mockRejectedValue(new Error('Database error'));

      const req = { json: async () => ({ name: 'Updated Name' }) } as NextRequest;
      const params = { id: '1' };
      const res = await PUT(req, { params: params });

      expect(prisma.member.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { name: 'Updated Name' },
      });
      expect(NextResponse.json).toHaveBeenCalledWith({ error: 'Failed to update member' }, { status: 500 });
      expect(res.status).toEqual(500);
    });
  });

  describe('DELETE', () => {
    it('should delete a member if found', async () => {
      const req = {} as NextRequest;
      const params = { id: '1' };
      const res = await DELETE(req, { params: params });

      expect(prisma.member.delete).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(NextResponse.json).toHaveBeenCalledWith({ message: 'Member deleted' });
      expect(res.body).toEqual(JSON.stringify({ message: 'Member deleted' }));
    });

    it('should return 500 if there is an error', async () => {
      (prisma.member.delete as jest.Mock).mockRejectedValue(new Error('Database error'));

      const req = {} as NextRequest;
      const params = { id: '1' };
      const res = await DELETE(req, { params: params });

      expect(prisma.member.delete).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(NextResponse.json).toHaveBeenCalledWith({ error: 'Failed to delete member' }, { status: 500 });
      expect(res.status).toEqual(500);
    });
  });
});