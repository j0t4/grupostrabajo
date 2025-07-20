import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const memberships = await prisma.membership.findMany();
    return NextResponse.json(memberships);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch memberships' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Ensure we have all required fields
    const membershipData = {
      memberId: data.memberId,
      workgroupId: data.workgroupId,
      role: data.role || 'GUEST',
      startDate: data.startDate || new Date(),
    };

    const membership = await prisma.membership.create({
      data: membershipData,
    });
    return NextResponse.json(membership, { status: 201 });
  } catch (error) {
    console.error('Membership creation error:', error);
    return NextResponse.json({ error: 'Failed to create membership', details: error.message }, { status: 500 });
  }
}