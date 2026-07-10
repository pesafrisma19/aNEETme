async function testLocalAPI() {
   try {
       const res = await fetch("http://localhost:3000/api/search?server=anichin&type=recent&page=1");
       const json = await res.json();
       console.log("Local API status:", res.status);
       console.log("Local API response:", json);
   } catch(e) {
       console.log("Error calling local API:", e);
   }
}
testLocalAPI();
