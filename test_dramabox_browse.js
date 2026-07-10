async function scrapeDramaboxBrowse() {
  const url = "https://www.dramaboxapp.com/in/browse/449";
  const res = await fetch(url);
  const html = await res.text();
  
  const match = html.match(/<script id="__NEXT_DATA__" type="application\/json">(.+?)<\/script>/);
  if (!match) {
    console.log("No Next JS data found");
    return;
  }
  const data = JSON.parse(match[1]);
  const pageProps = data.props?.pageProps || {};
  
  console.log("Keys in pageProps:", Object.keys(pageProps));
  
  if (pageProps.categoryList) {
    console.log("Categories:", pageProps.categoryList.map(c => ({ id: c.id, name: c.name })));
  }
  
  if (pageProps.movieList) {
    console.log("Movies count:", pageProps.movieList.length);
  }
  
  // Also let's see how we can fetch more pages. Usually it's an API or we just use _next/data
  console.log("Build ID:", data.buildId);
}
scrapeDramaboxBrowse();
