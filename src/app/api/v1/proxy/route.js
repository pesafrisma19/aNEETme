import { NextResponse } from "next/server";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const videoUrl = searchParams.get("url");

  if (!videoUrl) {
    return NextResponse.json({ error: "Missing 'url' parameter" }, { status: 400 });
  }

  // Only allow proxying from known safe video hosts
  const allowedHosts = ["pixeldrain.com", "storage.animekita.org"];
  let parsedUrl;
  try {
    parsedUrl = new URL(videoUrl);
  } catch {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }

  const isAllowed = allowedHosts.some(host => parsedUrl.hostname.endsWith(host));
  if (!isAllowed) {
    return NextResponse.json({ error: "URL host not allowed" }, { status: 403 });
  }

  try {
    // Forward Range header from client for seeking support
    const rangeHeader = request.headers.get("range");
    const headers = {
      "User-Agent": "ExoPlayer",
      "Accept": "*/*",
    };
    if (rangeHeader) {
      headers["Range"] = rangeHeader;
    }

    const upstream = await fetch(videoUrl, {
      headers,
      // Server-to-server: no sec-fetch-* headers, no Origin, no Referer
    });

    if (!upstream.ok && upstream.status !== 206) {
      const text = await upstream.text();
      console.error("Proxy upstream error:", upstream.status, text);
      return NextResponse.json(
        { error: `Upstream error: ${upstream.status}` },
        { status: upstream.status }
      );
    }

    // Stream the response back to the browser
    const responseHeaders = new Headers();
    
    // Pass through essential headers for video streaming
    const passThroughHeaders = [
      "content-type",
      "content-length",
      "content-range",
      "accept-ranges",
      "cache-control",
      "last-modified",
    ];
    for (const h of passThroughHeaders) {
      const val = upstream.headers.get(h);
      if (val) responseHeaders.set(h, val);
    }

    // Required for in-browser video player to work
    responseHeaders.set("access-control-allow-origin", "*");

    return new NextResponse(upstream.body, {
      status: upstream.status,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error("Proxy API Error:", error);
    return NextResponse.json({ error: "Proxy request failed" }, { status: 500 });
  }
}
