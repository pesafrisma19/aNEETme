async function testSankaAPI() {
  const url = "https://www.sankavollerei.web.id/anime/home";
  console.log("Fetching", url);
  try {
    const res = await fetch(url);
    const json = await res.json();
    console.log("Success! Home keys:", Object.keys(json));
    
    // Test search
    const res2 = await fetch("https://www.sankavollerei.web.id/anime/search/naruto");
    if(res2.ok) {
       const j2 = await res2.json();
       console.log("Search 'naruto' works! Keys:", Object.keys(j2));
    }
  } catch(e) {
    console.error("Failed:", e.message);
  }
}
testSankaAPI();
