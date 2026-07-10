const DRAMABOX_BASE = "https://www.dramaboxapp.com";

async function scrapeDramaboxSmallData() {
  const res = await fetch(`${DRAMABOX_BASE}/in`);
  const html = await res.text();
  
  const jsonMatch = html.match(/<script id="__NEXT_DATA__" type="application\/json">(.+?)<\/script>/);
  const json = JSON.parse(jsonMatch[1]);
  const smallData = json.props?.pageProps?.smallData || [];
  
  console.log("smallData length:", smallData.length);
  if (smallData.length > 0) {
     console.log("Keys of first smallData item:", Object.keys(smallData[0]));
     console.log("First item:", JSON.stringify(smallData[0]).substring(0, 500));
  }
}
scrapeDramaboxSmallData();
