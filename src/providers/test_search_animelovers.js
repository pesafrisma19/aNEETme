import AnimeloversProvider from './animelovers.js';

(async () => {
    try {
        console.log("Testing search for naruto...");
        const results = await AnimeloversProvider.search("naruto");
        console.log("Search results found:", results.length);
        if (results.length > 0) {
            console.log("First result title:", results[0].title);
            console.log("First result id:", results[0].id);
        }
    } catch(e) {
        console.error("ERROR:", e);
    }
})();
