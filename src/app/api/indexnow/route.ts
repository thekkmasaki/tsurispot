import { NextResponse } from "next/server";

// IndexNow key verification endpoint
export async function GET() {
  return new NextResponse("tsurispot2026indexnow", {
    headers: { "Content-Type": "text/plain" },
  });
}
