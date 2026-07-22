import { NextResponse } from "next/server";
import { PRE_INDEXED_BOOKS } from "@/lib/books";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({ books: PRE_INDEXED_BOOKS });
}
