/**
 * AhrefsTop South Korea traffic ranking fetcher
 *
 * Usage:
 *   node fetch-ahrefs.js
 *
 * Downloads Taiwan top 100 from AhrefsTop and saves JSON.
 */

const https = require('https');
const fs = require('fs');
const { URL } = require('url');

const AHREFS_URL = 'https://ahrefstop.com/websites/south-korea';
const OUTPUT_FILE = 'ahrefs_top_kr.json';

const httpsAgent = new https.Agent({
  rejectUnauthorized: false
});

function download(url, baseUrl = undefined) {
  return new Promise((resolve, reject) => {
    const parsedUrl = baseUrl ? new URL(url, baseUrl) : new URL(url);
    const currentBase = `${parsedUrl.protocol}//${parsedUrl.host}`;

    https.get(parsedUrl.href, { agent: httpsAgent }, (res) => {
      if ([301, 302, 303, 307, 308].includes(res.statusCode)) {
        const loc = res.headers.location;
        if (!loc) return reject(new Error(`Redirect (${res.statusCode}) with no Location header`));
        console.log(`Redirect -> ${loc}`);
        return resolve(download(loc, currentBase));
      }

      if (res.statusCode !== 200) {
        return reject(new Error(`Download failed, HTTP ${res.statusCode}`));
      }

      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => resolve(data));
    }).on('error', (err) => {
      reject(err);
    });
  });
}

function decodeHtmlEntities(str) {
  if (!str) return str;
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ');
}

/**
 * Convert traffic string to thousands (K)
 * e.g. "80.4M" -> 80400
 */
function convertTrafficToK(trafficStr) {
  if (!trafficStr || typeof trafficStr !== 'string') {
    return 0;
  }

  const cleaned = trafficStr.trim().replace(/[,\s]/g, '');

  const match = cleaned.match(/^([\d.]+)([KMkm]?)$/);
  if (!match) {
    return 0;
  }

  const value = parseFloat(match[1]);
  const unit = (match[2] || '').toUpperCase();

  if (isNaN(value)) {
    return 0;
  }

  if (unit === 'M') {
    return Math.round(value * 1000);
  } else if (unit === 'K') {
    return Math.round(value);
  }
  throw new Error(`Invalid unit: ${unit}`);
}

function parseTable(html) {
  const sites = [];

  const tbodyStart = html.indexOf('<tbody');
  if (tbodyStart === -1) {
    throw new Error('Table tbody not found');
  }

  const tbodyEnd = html.indexOf('</tbody>', tbodyStart);
  if (tbodyEnd === -1) {
    throw new Error('Table tbody end not found');
  }

  const tbodyContent = html.substring(tbodyStart, tbodyEnd);

  const trRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/g;
  let trMatch;

  while ((trMatch = trRegex.exec(tbodyContent)) !== null) {
    const trContent = trMatch[1];

    const rankMatch = trContent.match(/<td[^>]*>(\d+)<\/td>/);
    if (!rankMatch) continue;
    const rank = parseInt(rankMatch[1], 10);

    const websiteMatch = trContent.match(/<a[^>]*href="\/websites\/([^"]+)"[^>]*>([^<]+)<\/a>/);
    if (!websiteMatch) continue;
    const website = websiteMatch[2].trim();

    const categoryMatch = trContent.match(/<a[^>]*href="\/websites\/taiwan\/[^"]*"[^>]*>([^<]+)<\/a>/);
    const category = categoryMatch ? decodeHtmlEntities(categoryMatch[1].trim()) : '';

    const trafficMatch = trContent.match(/<td[^>]*>[\s\S]*?<span>([\d.]+[KMkm]?)<\/span>/);
    if (!trafficMatch) continue;
    const trafficStr = trafficMatch[1].trim();
    const searchTrafficK = convertTrafficToK(trafficStr);

    sites.push({
      rank,
      website,
      category: category || null,
      search_traffic_K: searchTrafficK
    });
  }

  return sites;
}

async function main() {
  try {
    console.log('Downloading South Korea rankings from AhrefsTop...');

    const html = await download(AHREFS_URL);

    console.log('Download complete; parsing table...');

    const sites = parseTable(html);

    if (sites.length === 0) {
      throw new Error('No site rows parsed');
    }

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(sites, null, 2));

    console.log('------------------------------------------------');
    console.log('Done.');
    console.log(`Sites: ${sites.length}`);
    console.log(`Wrote: ${OUTPUT_FILE}`);
    console.log('First 5:', JSON.stringify(sites.slice(0, 5), null, 2));
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

main();
