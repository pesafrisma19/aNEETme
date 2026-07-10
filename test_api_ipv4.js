async function test() {
  try {
    const res = await fetch("http://127.0.0.1:3000/api/search?server=anichin&type=recent&page=1");
    if (!res.ok) throw new Error("Status: " + res.status);
    const json = await res.json();
    console.log("Results length:", json.results?.length);
  } catch (e) {
    console.log("Error:", e.message);
  }
}
test();
