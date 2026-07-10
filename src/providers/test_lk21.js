import Lk21Provider from './lk21.js';

(async () => {
    try {
        console.log("Testing search...");
        const search = await Lk21Provider.search("avenger");
        console.log(`Found ${search.length} search results.`);
        if (search.length > 0) console.log(search[0].title);
    } catch(e) {
        console.error(e);
    }
})();
