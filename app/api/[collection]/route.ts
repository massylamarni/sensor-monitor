import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

const ALLOWED_COLLECTIONS = new Set(["gas", "movement", "temperature", "rfid"] as const);
type AllowedCollection = typeof ALLOWED_COLLECTIONS extends Set<infer T> ? T : never;

type RouteContext = { params: Promise<{ collection: string }> };

function isAllowed(c: string): c is AllowedCollection {
  return ALLOWED_COLLECTIONS.has(c as AllowedCollection);
}

function getTimeRange(searchParams: URLSearchParams): { timeStart: number; timeEnd: number } {
  let timeStart = parseInt(searchParams.get("timeStart") ?? "", 10);
  let timeEnd = parseInt(searchParams.get("timeEnd") ?? "", 10);

  if (isNaN(timeStart) || isNaN(timeEnd)) {
    timeStart = new Date().setHours(0, 0, 0, 0);
    timeEnd = new Date().setHours(23, 59, 59, 999);
  }

  return { timeStart, timeEnd };
}

async function getCollection(name: string) {
  const client = await clientPromise;
  return client.db("sensor_data").collection(name);
}

export async function GET(req: Request, { params }: RouteContext) {
  const { collection } = await params;
  if (!isAllowed(collection)) {
    return NextResponse.json({ error: "Invalid collection" }, { status: 400 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const { timeStart, timeEnd } = getTimeRange(searchParams);

    const col = await getCollection(collection);
    const records = await col
      .find({ createdAt: { $gte: new Date(timeStart), $lte: new Date(timeEnd) } })
      .sort({ createdAt: 1 })
      .toArray();

    return NextResponse.json(records);
  } catch {
    return NextResponse.json(
      { error: `Error fetching from collection "${collection}"` },
      { status: 500 }
    );
  }
}

export async function POST(req: Request, { params }: RouteContext) {
  const { collection } = await params;
  if (!isAllowed(collection)) {
    return NextResponse.json({ error: "Invalid collection" }, { status: 400 });
  }

  try {
    const body = await req.json();
    const col = await getCollection(collection);
    const result = await col.insertOne({ value: body.value, createdAt: new Date() });

    return NextResponse.json({ captureId: result.insertedId }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to save capture" }, { status: 500 });
  }
}