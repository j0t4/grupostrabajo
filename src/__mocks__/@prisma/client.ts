import { mockDeep, DeepMockProxy } from 'jest-mock-extended';
import { PrismaClient } from '@prisma/client';

// Create serializable mock objects
export const prismaMock = mockDeep<PrismaClient>({
  workgroup: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  member: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  membership: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  meeting: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  attendance: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  logbookEntry: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  }
});

// Export a mocked version of PrismaClient
export const PrismaClient = jest.fn(() => prismaMock);

// Export enums that might be needed in tests
export const MemberStatus = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE'
};

export const WorkgroupStatus = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE'
};

export const MeetingType = {
  PRESENTIAL: 'PRESENTIAL',
  ONLINE: 'ONLINE'
};

export const MembershipRole = {
  PRESIDENT: 'PRESIDENT',
  SECRETARY: 'SECRETARY',
  ASSISTANT: 'ASSISTANT',
  GUEST: 'GUEST'
};

export const LogbookEntryType = {
  ATTENDEES: 'ATTENDEES',
  AGENDA: 'AGENDA',
  DOCUMENTATION: 'DOCUMENTATION',
  MINUTES: 'MINUTES'
};

export const LogbookEntryStatus = {
  ACTIVE: 'ACTIVE',
  RESOLVED: 'RESOLVED'
};