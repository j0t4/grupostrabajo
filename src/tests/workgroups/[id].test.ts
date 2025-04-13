import { GET, PUT, DELETE } from '../../src/app/api/workgroups/[id]/route';
import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

// Mock the Prisma client
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    workgroup: {
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  })),
}));

describe('Workgroup API Endpoints', () => {
  const mockRequest = (method: string, body?: any) => {
    const req = new Request('http://localhost:3000/api/workgroups/1', {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    return req;
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET', () => {
    it('should return a workgroup if found', async () => {
      const mockWorkgroup = { id: 1, name: 'Test Workgroup' };
      (prisma.workgroup.findUnique as jest.Mock).mockResolvedValue(mockWorkgroup);

      const req = mockRequest('GET');
      const res = await GET(req, { params: { id: '1' } });
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data).toEqual(mockWorkgroup);
      expect(prisma.workgroup.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('should return 404 if workgroup is not found', async () => {
      (prisma.workgroup.findUnique as jest.Mock).mockResolvedValue(null);

      const req = mockRequest('GET');
      const res = await GET(req, { params: { id: '1' } });
      const data = await res.json();

      expect(res.status).toBe(404);
      expect(data).toEqual({ error: 'Workgroup not found' });
      expect(prisma.workgroup.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('should return 500 if there is an error', async () => {
      (prisma.workgroup.findUnique as jest.Mock).mockRejectedValue(new Error('Database error'));

      const req = mockRequest('GET');
      const res = await GET(req, { params: { id: '1' } });
      const data = await res.json();

      expect(res.status).toBe(500);
      expect(data).toEqual({ error: 'Failed to fetch workgroup' });
      expect(prisma.workgroup.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
    });
  });

  describe('PUT', () => {
    it('should update a workgroup successfully', async () => {
      const mockWorkgroup = { id: 1, name: 'Updated Workgroup' };
      (prisma.workgroup.update as jest.Mock).mockResolvedValue(mockWorkgroup);

      const req = mockRequest('PUT', { name: 'Updated Workgroup' });
      const res = await PUT(req, { params: { id: '1' } });
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data).toEqual(mockWorkgroup);
      expect(prisma.workgroup.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { name: 'Updated Workgroup' },
      });
    });

    it('should return 500 if there is an error', async () => {
      (prisma.workgroup.update as jest.Mock).mockRejectedValue(new Error('Database error'));

      const req = mockRequest('PUT', { name: 'Updated Workgroup' });
      const res = await PUT(req, { params: { id: '1' } });
      const data = await res.json();

      expect(res.status).toBe(500);
      expect(data).toEqual({ error: 'Failed to update workgroup' });
      expect(prisma.workgroup.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { name: 'Updated Workgroup' },
      });
    });
  });

  describe('DELETE', () => {
    it('should delete a workgroup successfully', async () => {
      (prisma.workgroup.delete as jest.Mock).mockResolvedValue({});

      const req = mockRequest('DELETE');
      const res = await DELETE(req, { params: { id: '1' } });
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data).toEqual({ message: 'Workgroup deleted' });
      expect(prisma.workgroup.delete).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('should return 500 if there is an error', async () => {
      (prisma.workgroup.delete as jest.Mock).mockRejectedValue(new Error('Database error'));

      const req = mockRequest('DELETE');
      const res = await DELETE(req, { params: { id: '1' } });
      const data = await res.json();

      expect(res.status).toBe(500);
      expect(data).toEqual({ error: 'Failed to delete workgroup' });
      expect(prisma.workgroup.delete).toHaveBeenCalledWith({ where: { id: 1 } });
    });
  });
});