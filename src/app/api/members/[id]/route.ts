import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    const member = await prisma.member.findUnique({
      where: { id: Number(id) },
    });
    if (!member) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }
    return NextResponse.json(member);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch member' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const data = await request.json();
    
    // Convert deactivationDate to Date object if it exists
    if (data.status === "INACTIVE" && data.deactivationDate) {
      data.deactivationDate = new Date(data.deactivationDate);
    } else if (data.status === "ACTIVE") {
      data.deactivationDate = null;
      data.deactivationDescription = null;
    }
    
    const updatedMember = await prisma.member.update({
      where: { id },
      data,
    });
    return NextResponse.json(updatedMember);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to update member" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    await prisma.member.delete({
      where: { id: Number(id) },
    });
    return NextResponse.json({ message: 'Member deleted' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to delete member' }, { status: 500 });
  }
}