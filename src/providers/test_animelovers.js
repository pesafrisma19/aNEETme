import AnimeloversProvider from './animelovers.js';

(async () => {
    try {
        console.log("Testing getRecent...");
        const recent = await AnimeloversProvider.getRecent();
        if (recent.length > 0) {
            const first = recent[0];
            console.log("Recent ID:", first.id);
            
            console.log("\nTesting getInfo for:", first.title);
            const info = await AnimeloversProvider.getInfo(first.id);
            console.log("Episodes found:", info.episodes.length);
            if (info.episodes.length > 0) {
                console.log("First episode:", info.episodes[0]);
            } else {
                console.log("NO EPISODES FOUND! Inspecting raw JSON from API...");
                // let's fetch raw
                const slug = first.id.split("/").pop().replace(/-\d+$/, "");
                const url = `https://apps.animekita.org/api/v1.2.5/anime.php?id=${slug}`;
                const res = await fetch(url, { headers: { "accept": "application/json", "user-agent": "Dart/3.9 (dart:io)" } });
                const json = await res.json();
                console.log("Keys in raw json:", Object.keys(json));
                console.log("list_episode type:", typeof json.list_episode, Array.isArray(json.list_episode));
            }
        }
    } catch(e) {
        console.error(e);
    }
})();
