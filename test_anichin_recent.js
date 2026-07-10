import provider from "./src/providers/anichin.js";

async function testAnichin() {
   try {
      const recent = await provider.getRecent(1);
      console.log("Recent length:", recent.length);
      console.log(recent);
   } catch (e) {
      console.error(e);
   }
}
testAnichin();
