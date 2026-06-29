/**
 * Cloudflare Radar Taiwan traffic ranking fetcher
 *
 * Usage:
 *   1. Create API token: https://dash.cloudflare.com/profile/api-tokens
 *   2. Copy .env.example to .env and set CLOUDFLARE_API_TOKEN
 *   3. node fetch-cloudflare.js
 */

require('dotenv').config();

const https = require('https');
const fs = require('fs');

const API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;

if (!API_TOKEN || API_TOKEN === 'YOUR_API_TOKEN_HERE') {
  console.error('Error: set CLOUDFLARE_API_TOKEN in .env');
  console.error('Steps:');
  console.error('  1. Open .env');
  console.error('  2. Replace YOUR_API_TOKEN_HERE with your Cloudflare API token');
  process.exit(1);
}
const OUTPUT_FILE = 'cloudflare_radar_tw.json';

const API_BASE = 'https://api.cloudflare.com/client/v4/radar/ranking/top';

function fetchRadarData(location = 'TW', limit = 100) {
  return new Promise((resolve, reject) => {
    const url = new URL(API_BASE);
    url.searchParams.set('location', location);
    url.searchParams.set('limit', limit.toString());
    url.searchParams.set('format', 'json');

    const options = {
      hostname: url.hostname,
      path: url.pathname + url.search,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`,
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.success) {
            resolve(json.result);
          } else {
            reject(new Error(`API error: ${JSON.stringify(json.errors)}`));
          }
        } catch (e) {
          reject(new Error(`JSON parse failed: ${e.message}`));
        }
      });
    });

    req.on('error', (e) => {
      reject(e);
    });

    req.end();
  });
}

async function main() {
  try {
    console.log('Downloading Taiwan rankings from Cloudflare Radar...');

    const result = await fetchRadarData('TW', 100);

    const topDomains = result.top_0 || result.top || [];
    const domains = topDomains.map((item) => ({
      rank: item.rank,
      domain: item.domain,
      categories: item.categories || []
    }));

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(domains, null, 2));

    console.log('------------------------------------------------');
    console.log('Download complete.');
    console.log(`Domains: ${domains.length}`);
    console.log(`Wrote: ${OUTPUT_FILE}`);
    console.log('First 5:', domains.slice(0, 5));
  } catch (err) {
    console.error('Error:', err.message);
  }
}

main();
