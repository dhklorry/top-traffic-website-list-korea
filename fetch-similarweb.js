/**
 * SimilarWeb traffic ranking fetcher
 *
 * Usage:
 *   node fetch-similarweb.js [country]
 *   e.g. node fetch-similarweb.js taiwan
 *        node fetch-similarweb.js japan
 */

const https = require('https');
const fs = require('fs');
const { URL } = require('url');
const zlib = require('zlib');

const country = process.argv[2] || 'south-korea';
const SIMILARWEB_URL = `https://www.similarweb.com/top-websites/${country}/`;
const OUTPUT_FILE = `similarweb_top_${country}.json`;

const httpsAgent = new https.Agent({
  rejectUnauthorized: false
});

function download(url, baseUrl = undefined) {
  return new Promise((resolve, reject) => {
    const parsedUrl = baseUrl ? new URL(url, baseUrl) : new URL(url);
    const currentBase = `${parsedUrl.protocol}//${parsedUrl.host}`;

    const options = {
      hostname: parsedUrl.hostname,
      path: parsedUrl.pathname + parsedUrl.search,
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
      },
      agent: httpsAgent
    };

    const req = https.request(options, (res) => {
      if ([301, 302, 303, 307, 308].includes(res.statusCode)) {
        const loc = res.headers.location;
        if (!loc) return reject(new Error(`Redirect (${res.statusCode}) with no Location header`));
        console.log(`Redirect -> ${loc}`);
        return resolve(download(loc, currentBase));
      }

      if (res.statusCode === 202) {
        console.log('Warning: HTTP 202; continuing to read body...');
      } else if (res.statusCode !== 200) {
        return reject(new Error(`Download failed, HTTP ${res.statusCode}`));
      }

      const encoding = res.headers['content-encoding'];
      let stream = res;

      if (encoding === 'gzip') {
        stream = res.pipe(zlib.createGunzip());
      } else if (encoding === 'deflate') {
        stream = res.pipe(zlib.createInflate());
      } else if (encoding === 'br') {
        stream = res.pipe(zlib.createBrotliDecompress());
      }

      let data = '';
      stream.on('data', (chunk) => {
        data += chunk;
      });
      stream.on('end', () => {
        if (data.length === 0) {
          return reject(new Error('Empty response body'));
        }
        if (data.includes('Just a moment') || data.includes('Checking your browser') || data.includes('Please wait')) {
          console.log('Warning: possible WAF challenge page; attempting parse anyway...');
        }
        resolve(data);
      });
      stream.on('error', (err) => {
        reject(err);
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.end();
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

function parseTable(html) {
  const sites = [];

  const trRegex = /<tr[^>]*class="[^"]*top-table__row[^"]*"[^>]*>([\s\S]*?)<\/tr>/g;
  let trMatch;

  while ((trMatch = trRegex.exec(html)) !== null) {
    const trContent = trMatch[1];

    const rankMatch = trContent.match(/<span[^>]*class="[^"]*__rank[^"]*"[^>]*>(\d+)<\/span>/);
    if (!rankMatch) continue;
    const rank = parseInt(rankMatch[1], 10);

    const websiteMatch = trContent.match(/<span[^>]*class="[^"]*__domain[^"]*"[^>]*>([^<]+)<\/span>/);
    if (!websiteMatch) continue;
    const website = websiteMatch[1].trim();

    const categoryMatch = trContent.match(/<a[^>]*class="[^"]*__category[^"]*"[^>]*>([^<]+)<\/a>/);
    const category = categoryMatch ? decodeHtmlEntities(categoryMatch[1].trim()) : null;

    sites.push({
      rank,
      website,
      category
    });
  }

  return sites;
}

async function main() {
  try {
    console.log(`Downloading ${country} rankings from SimilarWeb...`);

    const html = await download(SIMILARWEB_URL);

    console.log('Download complete; parsing table...');

    const sites = parseTable(html);

    if (sites.length === 0) {
      throw new Error('No site rows parsed; HTML layout may have changed or needs JS rendering');
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
