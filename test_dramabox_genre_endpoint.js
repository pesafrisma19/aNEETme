const DRAMABOX_BASE = "https://www.dramaboxapp.com";

async function getBuildId() {
  const res = await fetch(`${DRAMABOX_BASE}/in`);
  const html = await res.text();
  const match = html.match(/"buildId":"([^"]+)"/);
  if (match && match[1]) {
    return match[1];
  }
  return "dramaboxapp_prod_20260703"; // fallback
}

async function testGenreFetch() {
  const buildId = await getBuildId();
  // id 449 for Cinta Pahit
  const url = `${DRAMABOX_BASE}/_next/data/${buildId}/in/browse/449.json?typeTwoId=449`;
  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0",
      "x-nextjs-data": "1"
    }
  });
  if (res.ok) {
     const json = await res.json();
     console.log("Books fetched via Next.js API:", json.pageProps.bookList.length);
  } else {
     console.log("Failed Next.js API:", res.status);
  }
}
testGenreFetch();
