import { NextResponse } from "next/server";

export async function GET() {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

  try {
    const url = "https://apps.animekita.org/api/v1.2.5/jadwal.php";
    const res = await fetch(url, {
      headers: {
        "accept": "application/json",
        "user-agent": "Dart/3.9 (dart:io)"
      }
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Gagal memuat jadwal rilis" }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Schedule API Error:", error);
    return NextResponse.json({ error: "Gagal mengambil data jadwal dari server" }, { status: 500 });
  }
}
