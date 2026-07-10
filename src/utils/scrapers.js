import * as cheerio from 'cheerio';

/**
 * Scrapes a list of movies/series from an LK21-styled website
 * Works for both d21.team (Cinema) and tv4.nontondrama.my (Dynasty)
 */
export async function scrapeLK21List(url) {
  try {
    const res = await fetch(url, { next: { revalidate: 3600 } }); // Cache for 1 hour
    const html = await res.text();
    const $ = cheerio.load(html);

    const results = [];
    $('article[itemtype="https://schema.org/Movie"]').each((i, el) => {
      const $el = $(el);
      
      const link = $el.find('figure > a').attr('href');
      // The href might be absolute or relative. Let's make it just the slug if possible
      let id = link;
      if (link && link.startsWith('http')) {
        const urlObj = new URL(link);
        id = urlObj.pathname.replace(/^\/|\/$/g, ''); // just the slug
      } else if (link) {
        id = link.replace(/^\/|\/$/g, ''); // just the slug
      }

      const title = $el.find('.poster-title').text().trim();
      const image = $el.find('img').attr('src') || $el.find('img').attr('data-src');
      const rating = $el.find('.rating span[itemprop="ratingValue"]').text().trim();
      const year = $el.find('.year').text().trim();
      const episode = $el.find('.episode').text().replace('EPS', 'EPS ').trim();
      const type = episode ? "series" : "movie";
      const genres = $el.find('.genre').text().trim().split(',').map(g => g.trim());

      if (id && title) {
        results.push({
          id,
          title,
          image,
          rating,
          year,
          episode,
          type,
          genres
        });
      }
    });

    return results;
  } catch (error) {
    console.error("Error in scrapeLK21List:", error);
    return [];
  }
}

/**
 * Scrapes detailed info of a movie/series
 */
export async function scrapeLK21Info(url) {
  try {
    const res = await fetch(url, { next: { revalidate: 3600 } });
    const html = await res.text();
    const $ = cheerio.load(html);

    const title = $('h1[itemprop="name"]').text().trim() || $('.title-wrapper h1').text().trim();
    const image = $('.poster img').attr('src');
    const synopsis = $('div[itemprop="description"]').text().trim() || $('.content-wrapper blockquote').text().trim();
    
    // Extact meta details
    const details = {};
    $('.content-wrapper ul li').each((i, el) => {
      const text = $(el).text();
      if (text.includes(':')) {
        const [key, ...val] = text.split(':');
        details[key.trim().toLowerCase()] = val.join(':').trim();
      }
    });

    // Extract Episodes (for series)
    const episodes = [];
    $('.episode-list ul li a, .btn-group a.btn-primary').each((i, el) => {
      const epTitle = $(el).text().trim();
      const epLink = $(el).attr('href');
      if (epLink) {
        episodes.push({ title: epTitle, link: epLink });
      }
    });

    // Extract Iframe Embeds
    let iframeSrc = $('iframe').first().attr('src');
    if (!iframeSrc) {
       iframeSrc = $('#player-iframe').attr('src') || $('iframe[allowfullscreen]').attr('src');
    }

    return {
      title,
      image,
      synopsis,
      details,
      episodes,
      iframeSrc
    };
  } catch (error) {
    console.error("Error in scrapeLK21Info:", error);
    return null;
  }
}
