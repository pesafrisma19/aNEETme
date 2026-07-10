async function testSanka() {
  try {
    const res = await fetch("https://www.sankavollerei.web.id/anime/");
    if (res.headers.get("content-type")?.includes("application/json")) {
      const json = await res.json();
      console.log("JSON response keys:", Object.keys(json));
      console.log("Sample:", JSON.stringify(json).substring(0, 500));
    } else {
      const html = await res.text();
      console.log("HTML response (first 500 chars):", html.substring(0, 500));
    }
  } catch(e) {
    console.error("Fetch failed:", e);
  }
}

testSanka();
