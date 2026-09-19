/**
 * Semrush South Korea traffic ranking fetcher
 *
 * Usage:
 *   node fetch-semrush.js
 *
 * Downloads from Semrush Trending Websites and reads window.__PRELOADED_STATE__.
 */

const https = require('https');
const fs = require('fs');
const { URL } = require('url');

const SEMRUSH_URL = 'https://www.semrush.com/trending-websites/kr/all';
const OUTPUT_FILE = 'semrush_top_kr.json';

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

function extractPreloadedState(html) {
  const pattern = /window\.__PRELOADED_STATE__\s*=\s*({[\s\S]*?});/;
  const match = html.match(pattern);

  if (!match) {
    const startMatch = html.match(/window\.__PRELOADED_STATE__\s*=\s*({)/);
    if (startMatch) {
      const startIndex = startMatch.index + startMatch[0].length - 1;
      let braceCount = 0;
      let endIndex = -1;

      for (let i = startIndex; i < html.length; i++) {
        if (html[i] === '{') braceCount++;
        if (html[i] === '}') {
          braceCount--;
          if (braceCount === 0) {
            endIndex = i + 1;
            break;
          }
        }
      }

      if (endIndex > 0) {
        const jsonStr = html.substring(startIndex, endIndex);
        try {
          return JSON.parse(jsonStr);
        } catch (err) {
          console.error('JSON parse error:', err.message);
          return null;
        }
      }
    }
    return null;
  }

  try {
    const jsonStr = match[1];
    return JSON.parse(jsonStr);
  } catch (err) {
    console.error('JSON parse error:', err.message);
    const startIndex = match.index + match[0].indexOf('{');
    let braceCount = 0;
    let endIndex = -1;

    for (let i = startIndex; i < html.length; i++) {
      if (html[i] === '{') braceCount++;
      if (html[i] === '}') {
        braceCount--;
        if (braceCount === 0) {
          endIndex = i + 1;
          break;
        }
      }
    }

    if (endIndex > 0) {
      const jsonStr = html.substring(startIndex, endIndex);
      try {
        return JSON.parse(jsonStr);
      } catch (err2) {
        console.error('JSON parse retry failed:', err2.message);
        return null;
      }
    }

    return null;
  }
}

function convertData(domains) {
  if (!domains || !Array.isArray(domains)) {
    return [];
  }

  return domains.map((domain, index) => ({
    rank: index + 1,
    domain_name: domain.domain_name || '',
    total_traffic: domain.total_traffic || 0
  }));
}

async function main() {
  try {
    console.log('Downloading South Korea rankings from Semrush...');

    const html = await download(SEMRUSH_URL);

    console.log('Download complete; parsing data...');

    const preloadedState = extractPreloadedState(html);

    if (!preloadedState) {
      throw new Error('window.__PRELOADED_STATE__ not found in HTML');
    }

    if (!preloadedState.data || !preloadedState.data.domains) {
      throw new Error('domains not found in preloaded state');
    }

    const domains = preloadedState.data.domains;
    console.log(`Found ${domains.length} domain row(s)`);

    const sites = convertData(domains);

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
