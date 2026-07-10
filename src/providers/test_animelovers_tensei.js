import AnimeloversProvider from './animelovers.js';

(async () => {
    try {
        console.log("Testing getInfo for Tensei Shitara...");
        const info = await AnimeloversProvider.getInfo("tensei-shitara-dainana-ouji-datta-node-kimama-ni-majutsu-wo-kiwamemasu");
        console.log("Episodes found:", info.episodes.length);
    } catch(e) {
        console.error("ERROR:", e);
    }
})();
