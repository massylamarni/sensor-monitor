import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ pong: "pong" }, { status: 200 });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (typeof body.ping === "undefined") {
      return NextResponse.json({ error: 'Wrong format: {"ping": "message"}' }, { status: 400 });
    }

    return NextResponse.json({ pong: body.ping }, { status: 200 });
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }
}