/**
 * Taiwan site ranking fetcher (Tranco List)
 *
 * Downloads the Tranco top-1m list, filters .tw domains, writes JSON.
 *
 * Usage:
 *   1. Node.js v16+
 *   2. npm install adm-zip
 *   3. node fetch-tranco.js
 *
 * Output: tranco_list_tw.json — [{ rank, domain, url }, ...]
 * Source: https://tranco-list.eu/
 */

const https = require('https');
const fs = require('fs');
const AdmZip = require('adm-zip');

const TRANCO_URL = 'https://tranco-list.eu/top-1m-incl-subdomains.csv.zip';
const OUTPUT_FILE = 'tranco_list_tw.json';

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

      const data = [];
      res.on('data', (chunk) => data.push(chunk));
      res.on('end', () => resolve(Buffer.concat(data)));
    }).on('error', (err) => {
      reject(err);
    });
  });
}

async function main() {
  try {
    console.log('Downloading latest Tranco list...');

    const buffer = await download(TRANCO_URL);

    console.log('Download complete; extracting and processing...');

    const zip = new AdmZip(buffer);
    const csvEntry = zip.getEntries().find(e => e.entryName === 'top-1m.csv');

    if (!csvEntry) {
      throw new Error('top-1m.csv not found in ZIP archive');
    }

    const csvText = csvEntry.getData().toString('utf8');

    const lines = csvText.split('\n');
    const twSites = [];

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      const parts = trimmed.split(',');
      if (parts.length < 2) continue;

      const rank = parseInt(parts[0], 10);
      const domain = parts[1].trim();

      if (!Number.isFinite(rank)) continue;

      if (domain.endsWith('.tw')) {
        twSites.push({
          rank,
          domain,
          url: `https://${domain}`,
        });
      }
    }

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(twSites, null, 2));

    console.log('------------------------------------------------');
    console.log('Done.');
    console.log(`Source lines (incl. blanks): ${lines.length}`);
    console.log(`.tw sites: ${twSites.length}`);
    console.log(`Wrote: ${OUTPUT_FILE}`);
    console.log('First 5:', twSites.slice(0, 5));
  } catch (err) {
    console.error('Error:', err);
  }
}

main();
