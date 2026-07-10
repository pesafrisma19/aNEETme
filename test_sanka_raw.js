async function testSankaRaw() {
  const res = await fetch("https://www.sankavollerei.web.id/anime/");
  const html = await res.text();
  console.log(html);
}
testSankaRaw();
