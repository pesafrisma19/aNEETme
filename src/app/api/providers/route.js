import { NextResponse } from "next/server";
import { getAllProviders } from "@/providers";

export async function GET() {
  const providers = getAllProviders();
  return NextResponse.json(providers);
}
