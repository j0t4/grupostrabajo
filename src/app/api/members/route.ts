import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const members = await prisma.member.findMany();
    return NextResponse.json(members);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch members' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Convert deactivationDate to Date object if it exists
    if (data.status === "INACTIVE" && data.deactivationDate) {
      data.deactivationDate = new Date(data.deactivationDate);
    } else if (data.status === "ACTIVE") {
      data.deactivationDate = null;
      data.deactivationDescription = null;
    }
    
    const member = await prisma.member.create({
      data,
    });
    return NextResponse.json(member, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to create member' }, { status: 500 });
  }
}



export async function PUT(request: Request) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Member ID is required' }, { status: 400 });
    }
    
    const data = await request.json();
    const updatedMember = await prisma.member.update({
      where: { id: parseInt(id) },
      data,
    });
    
    return NextResponse.json(updatedMember, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to update member' }, { status: 500 });
  }
}