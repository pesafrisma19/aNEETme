import AnimeloversProvider from './animelovers.js';

(async () => {
    try {
        console.log("Testing getInfo for Yani...");
        const info = await AnimeloversProvider.getInfo("super-yani-suu-futari-sub-indo");
        console.log("Episodes found:", info.episodes.length);
        if (info.episodes.length > 0) {
            console.log("First episode ID:", info.episodes[0].id);
            console.log("Testing getStream for", info.episodes[0].id);
            const stream = await AnimeloversProvider.getStream(info.episodes[0].id);
            console.log("Stream URL:", stream.streamUrl);
        }
    } catch(e) {
        console.error("ERROR:", e);
    }
})();
