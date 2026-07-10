import { NextResponse } from "next/server";
import { getAllProviders } from "@/providers";

export const dynamic = 'force-dynamic';

export async function GET() {
  const providers = getAllProviders();
  return NextResponse.json(providers);
}
