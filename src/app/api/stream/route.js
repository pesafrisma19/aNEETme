import { NextResponse } from "next/server";
import { getProvider } from "@/providers";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const server = searchParams.get("server") || "animelovers";

  if (!id) {
    return NextResponse.json({ error: "Missing id parameter" }, { status: 400 });
  }

  const provider = getProvider(server);
  if (!provider) {
    return NextResponse.json({ error: "Server tidak didukung" }, { status: 400 });
  }

  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

  try {
    const data = await provider.getStream(id);
    return NextResponse.json(data);
  } catch (error) {
    console.error(`[${server}] Stream API Error:`, error);
    return NextResponse.json({ error: error.message || "Gagal memuat stream" }, { status: 500 });
  }
}
