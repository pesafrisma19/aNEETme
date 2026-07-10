const DRAMABOX_BASE = "https://www.dramaboxapp.com";

async function scrapeDramaboxGenres() {
  const res = await fetch(`${DRAMABOX_BASE}/in`);
  const html = await res.text();
  
  const jsonMatch = html.match(/<script id="__NEXT_DATA__" type="application\/json">(.+?)<\/script>/);
  if (!jsonMatch) {
    console.log("No Next Data found");
    return;
  }
  const json = JSON.parse(jsonMatch[1]);
  const categories = json.props?.pageProps?.categoryList || [];
  
  if (categories.length > 0) {
    console.log("Categories found:", categories.map(c => c.name || c.id));
    console.log("Full JSON for first category:", JSON.stringify(categories[0]));
  } else {
    // See if we can find keywords or something in pageProps
    console.log("pageProps keys:", Object.keys(json.props?.pageProps || {}));
  }
}
scrapeDramaboxGenres();
