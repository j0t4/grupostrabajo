import { GET, POST } from '../src/app/api/members/route';
import { PrismaClient } from '@prisma/client';
import { mockDeep, mockReset, DeepMockProxy } from 'jest-mock-extended';
import { NextRequest } from 'next/server';
import { faker } from '@faker-js/faker';

const prismaMock = mockDeep<PrismaClient>();

jest.mock('@prisma/client', () => ({
  PrismaClient: function () {
    return prismaMock;
  },
}));

beforeEach(() => {
  mockReset(prismaMock);
});

describe('Member API', () => {
  describe('GET', () => {
    it('should return all members', async () => {
      const members = [
        {
          id: 1,
          name: faker.person.fullName(),
          email: faker.internet.email(),
          role: faker.helpers.arrayElement(['ADMIN', 'MEMBER']),
        },
        {
          id: 2,
          name: faker.person.fullName(),
          email: faker.internet.email(),
          role: faker.helpers.arrayElement(['ADMIN', 'MEMBER']),
        },
      ];
      prismaMock.member.findMany.mockResolvedValue(members);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(members);
      expect(prismaMock.member.findMany).toHaveBeenCalledTimes(1);
    });

    it('should handle errors', async () => {
      prismaMock.member.findMany.mockRejectedValue(new Error('Database error'));

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({ error: 'Failed to fetch members' });
      expect(prismaMock.member.findMany).toHaveBeenCalledTimes(1);
    });
  });

  describe('POST', () => {
    it('should create a new member', async () => {
      const newMember = {
        name: faker.person.fullName(),
        email: faker.internet.email(),
        role: faker.helpers.arrayElement(['ADMIN', 'MEMBER']),
      };
      const createdMember = { id: 3, ...newMember };
      prismaMock.member.create.mockResolvedValue(createdMember);

      const request = {
        json: async () => newMember,
      } as unknown as NextRequest;

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data).toEqual(createdMember);
      expect(prismaMock.member.create).toHaveBeenCalledTimes(1);
      expect(prismaMock.member.create).toHaveBeenCalledWith({ data: newMember });
    });

    it('should handle errors', async () => {
      const newMember = {
        name: faker.person.fullName(),
        email: faker.internet.email(),
        role: faker.helpers.arrayElement(['ADMIN', 'MEMBER']),
      };
      prismaMock.member.create.mockRejectedValue(new Error('Database error'));

      const request = {
        json: async () => newMember,
      } as unknown as NextRequest;

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({ error: 'Failed to create member' });
      expect(prismaMock.member.create).toHaveBeenCalledTimes(1);
      expect(prismaMock.member.create).toHaveBeenCalledWith({ data: newMember });
    });
  });
});