/**
 * Find duplicate sites in Tranco data after normalization
 *
 * Usage:
 *   node check-duplicates.js
 *
 * Checks tranco_list_tw.json for sites that collide after normalization
 * (e.g. www.example.com and example.com map to the same key).
 */

const fs = require('fs');
const path = require('path');

/**
 * Normalize hostname: strip www. prefix, keep other subdomains
 * @param {string} domain - raw hostname
 * @returns {string} normalized hostname
 */
function normalizeWebsite(domain) {
  if (!domain) return '';

  let normalized = domain.toLowerCase().trim();

  if (normalized.startsWith('www.')) {
    normalized = normalized.substring(4);
  }

  return normalized;
}

function checkDuplicates() {
  console.log('Checking for duplicate sites...\n');

  const trancoPath = path.join(__dirname, 'tranco_list_tw.json');
  const trancoData = JSON.parse(fs.readFileSync(trancoPath, 'utf8'));

  const normalizedMap = new Map();

  for (const item of trancoData) {
    const domain = item.domain;
    if (!domain) continue;

    const normalized = normalizeWebsite(domain);

    if (!normalizedMap.has(normalized)) {
      normalizedMap.set(normalized, []);
    }

    normalizedMap.get(normalized).push({
      domain: domain,
      rank: item.rank,
      url: item.url
    });
  }

  const duplicates = [];

  for (const [normalized, domains] of normalizedMap.entries()) {
    if (domains.length > 1) {
      duplicates.push({
        normalized: normalized,
        domains: domains
      });
    }
  }

  duplicates.sort((a, b) => a.normalized.localeCompare(b.normalized));

  console.log(`Total Tranco rows: ${trancoData.length}`);
  console.log(`Unique after normalization: ${normalizedMap.size}`);
  console.log(`Duplicate groups: ${duplicates.length}`);
  console.log(`\nAll duplicate groups:\n`);

  duplicates.forEach((dup, index) => {
    console.log(`${index + 1}. ${dup.normalized} (normalized)`);
    dup.domains.forEach(d => {
      console.log(`   - ${d.domain} (rank: ${d.rank}, url: ${d.url})`);
    });
    console.log('');
  });

  const output = {
    total: trancoData.length,
    unique: normalizedMap.size,
    duplicates: duplicates.length,
    duplicateList: duplicates.map(dup => ({
      normalized: dup.normalized,
      domains: dup.domains
    }))
  };

  const outputPath = path.join(__dirname, 'duplicates-check.json');
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2), 'utf8');

  console.log(`\nWrote details to duplicates-check.json`);
}

checkDuplicates();
