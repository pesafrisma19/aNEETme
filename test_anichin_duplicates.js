import provider from "./src/providers/anichin.js";

async function checkDuplicates() {
   const recent = await provider.getRecent(1);
   const ids = recent.map(r => r.id);
   const uniqueIds = new Set(ids);
   console.log(`Total: ${ids.length}, Unique: ${uniqueIds.size}`);
   if (ids.length !== uniqueIds.size) {
      console.log("Duplicates found!");
      const counts = {};
      ids.forEach(id => { counts[id] = (counts[id] || 0) + 1; });
      for (const id in counts) {
         if (counts[id] > 1) console.log(`${id} occurs ${counts[id]} times`);
      }
   }
}
checkDuplicates();
