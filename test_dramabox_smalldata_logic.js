async function getSmallDataList(index) {
  const DRAMABOX_BASE = "https://www.dramaboxapp.com";
  try {
    const res = await fetch(`${DRAMABOX_BASE}/in`);
    const html = await res.text();
    const jsonMatch = html.match(/<script id="__NEXT_DATA__" type="application\/json">(.+?)<\/script>/);
    if (!jsonMatch) return [];
    
    const json = JSON.parse(jsonMatch[1]);
    const smallData = json.props?.pageProps?.smallData || [];
    
    if (smallData.length > index) {
      const list = smallData[index].items || [];
      return list.map(item => ({
        id: item.bookId,
        title: item.bookName,
        image: item.cover,
        releaseDate: item.shelfTime ? item.shelfTime.split(" ")[0] : "",
        playCount: 0
      }));
    }
    return [];
  } catch(e) {
    console.error(e);
    return [];
  }
}

async function testIt() {
  const t = await getSmallDataList(0);
  console.log("Got:", t.length, t[0]);
}
testIt();
