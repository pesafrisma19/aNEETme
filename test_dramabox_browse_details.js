async function scrapeDramaboxBrowseDetails() {
  const url = "https://www.dramaboxapp.com/in/browse/449";
  const res = await fetch(url);
  const html = await res.text();
  
  const match = html.match(/<script id="__NEXT_DATA__" type="application\/json">(.+?)<\/script>/);
  const data = JSON.parse(match[1]);
  const pageProps = data.props?.pageProps || {};
  
  if (pageProps.types) {
    console.log("Types (Genres):", JSON.stringify(pageProps.types, null, 2));
  }
  if (pageProps.bookList) {
    console.log("First 2 books:", JSON.stringify(pageProps.bookList.slice(0, 2), null, 2));
  }
}
scrapeDramaboxBrowseDetails();
