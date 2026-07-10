async function inspectSankaAPI() {
  const BASE = "https://www.sankavollerei.web.id/anime";
  
  const eps = [
    `${BASE}/ongoing-anime?page=1`,
    `${BASE}/complete-anime?page=1`,
    `${BASE}/genre/action?page=1`,
    `${BASE}/schedule`,
    `${BASE}/anime/super-yani-suu-futari-sub-indo`,
    `${BASE}/episode/suysf-episode-1-sub-indo`
  ];

  for (let url of eps) {
    console.log("Fetching:", url);
    try {
      const res = await fetch(url);
      const json = await res.json();
      console.log("Data structure:", JSON.stringify(json.data).substring(0, 300));
    } catch(e) {
      console.error(e.message);
    }
  }
}
inspectSankaAPI();
