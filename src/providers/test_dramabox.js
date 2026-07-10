import DramaboxProvider from './dramabox.js';

(async () => {
    try {
        console.log("Testing getRecent...");
        const recent = await DramaboxProvider.getRecent();
        console.log(`Found ${recent.length} recent dramas.`);
        if (recent.length > 0) console.log(recent[0].title);
        
        console.log("\nTesting getInfo...");
        const info = await DramaboxProvider.getInfo("41000104560");
        console.log(`Title: ${info.title}, Episodes: ${info.episodes.length}`);
        
        if (info.episodes.length > 0) {
            console.log("\nTesting getStream...");
            const stream = await DramaboxProvider.getStream(info.episodes[0].id);
            console.log(`Stream URL: ${stream.streamUrl}`);
        }
    } catch(e) {
        console.error(e);
    }
})();
