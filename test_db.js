const DramaboxScraper = require('@zhadev/dramabox').default;

async function test() {
  try {
    const scraper = new DramaboxScraper();
    console.log("Fetching latest from DramaBox...");
    const result = await scraper.getLatest(1);
    console.log("Result:", JSON.stringify(result).substring(0, 500));
  } catch (err) {
    console.error("Error:", err);
  }
}

test();
