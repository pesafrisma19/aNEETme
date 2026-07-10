const DRAMABOX_BASE = "https://www.dramaboxapp.com";

async function scrapeDramaboxSmallData() {
  const res = await fetch(`${DRAMABOX_BASE}/in`);
  const html = await res.text();
  
  const jsonMatch = html.match(/<script id="__NEXT_DATA__" type="application\/json">(.+?)<\/script>/);
  const json = JSON.parse(jsonMatch[1]);
  const smallData = json.props?.pageProps?.smallData || [];
  
  smallData.forEach(list => {
    console.log(`Category: ${list.name} (id: ${list.id}) - items: ${list.items?.length}`);
  });
}
scrapeDramaboxSmallData();
