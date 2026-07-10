async function testLocal() {
  try {
     const res = await fetch("http://localhost:3000/api/providers");
     const json = await res.json();
     console.log("Providers length:", json.length);
     console.log("Providers names:", json.map(p => p.name));
  } catch (e) {
     console.error("Local fetch failed", e.message);
  }
}
testLocal();
