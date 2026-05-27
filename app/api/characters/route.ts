import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json([]);
}

export async function POST(request: Request) {
  const character = await request.json();

  return NextResponse.json({ character }, { status: 201 });
}
