import AnimeloversProvider from './animelovers.js';

(async () => {
    try {
        console.log("Testing getRecent...");
        const recent = await AnimeloversProvider.getRecent();
        console.log(`Found ${recent.length} recent animelovers.`);
        if (recent.length > 0) console.log(recent[0].title);
        
        console.log("\nTesting search...");
        const search = await AnimeloversProvider.search("naruto");
        console.log(`Found ${search.length} search results.`);
        if (search.length > 0) console.log(search[0].title);
    } catch(e) {
        console.error(e);
    }
})();
