import OtakudesuProvider from './src/providers/otakudesu.js';

(async () => {
  try {
    console.log("Testing search...");
    const search = await OtakudesuProvider.search("naruto");
    console.log("Search results:", search.length);

    console.log("Testing recent...");
    const recent = await OtakudesuProvider.getRecent();
    console.log("Recent results:", recent.length);

    console.log("Testing detail...");
    const info = await OtakudesuProvider.getInfo("super-yani-suu-futari-sub-indo");
    console.log("Info title:", info.title);
    console.log("Episodes:", info.episodes.length);

    if (info.episodes.length > 0) {
      console.log("Testing stream...");
      const stream = await OtakudesuProvider.getStream(info.episodes[0].id);
      console.log("Stream iframe:", stream.iframeSrc);
    }
  } catch (e) {
    console.error(e);
  }
})();
