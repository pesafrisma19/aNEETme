import { NextResponse } from "next/server";
import { getProvider } from "@/providers";

export async function GET(request, { params }) {
  const { provider: server } = await params;
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Missing id parameter" }, { status: 400 });
  }

  const provider = getProvider(server);
  if (!provider) {
    return NextResponse.json({ error: "Server tidak ditemukan" }, { status: 404 });
  }

  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

  try {
    const data = await provider.getInfo(id);
    return NextResponse.json(data);
  } catch (error) {
    console.error(`[${server}] Info API Error:`, error);
    return NextResponse.json({ error: error.message || "Gagal memuat data info" }, { status: 500 });
  }
}
