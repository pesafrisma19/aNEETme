import provider from "./src/providers/anichin.js";

async function testProvider() {
   const recent = await provider.getRecent(1);
   console.log("Recent:", recent.slice(0, 2));
   
   if (recent.length > 0) {
      const id = recent[0].id; // donghua id
      console.log("Fetching info for:", id);
      const info = await provider.getInfo(id);
      
      console.log("Info title:", info.title);
      console.log("Episodes:", info.episodes.slice(0, 2));
      
      if (info.episodes.length > 0) {
         const epId = info.episodes[0].id;
         console.log("Fetching stream for:", epId);
         const stream = await provider.getStream(epId);
         console.log("Stream:", stream);
      }
   }
}
testProvider();
