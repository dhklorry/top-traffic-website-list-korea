#!/usr/bin/env node
'use strict';

// Convert a BigQuery CrUX export with `website,rank_bucket` columns into
// the input format used by the resilience batch checker.
// Usage:
//   node prepare-crux-list.js input.csv output.json

const fs = require('node:fs/promises');

function usage() {
  console.error('Usage: node prepare-crux-list.js input.csv output.json');
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    if (quoted) {
      if (char === '"' && text[index + 1] === '"') {
        field += '"';
        index += 1;
      } else if (char === '"') {
        quoted = false;
      } else {
        field += char;
      }
    } else if (char === '"') {
      quoted = true;
    } else if (char === ',') {
      row.push(field);
      field = '';
    } else if (char === '\n') {
      row.push(field.replace(/\r$/, ''));
      rows.push(row);
      row = [];
      field = '';
    } else {
      field += char;
    }
  }

  if (quoted) throw new Error('CSV contains an unclosed quoted field');
  if (field || row.length) {
    row.push(field.replace(/\r$/, ''));
    rows.push(row);
  }
  return rows.filter(rowData => rowData.some(value => value !== ''));
}

function convert(rows) {
  if (!rows.length) throw new Error('CSV is empty');
  const headers = rows[0].map(header => header.trim());
  const websiteColumn = headers.indexOf('website');
  const rankBucketColumn = headers.indexOf('rank_bucket');

  if (websiteColumn === -1 || rankBucketColumn === -1) {
    throw new Error('CSV must contain website and rank_bucket columns');
  }

  const seenUrls = new Set();
  return rows.slice(1).map((row, rowIndex) => {
    const line = rowIndex + 2;
    const url = (row[websiteColumn] || '').trim();
    const rankBucket = Number((row[rankBucketColumn] || '').trim());

    if (!/^https?:\/\//i.test(url)) {
      throw new Error(`Row ${line}: website must be a full http(s) URL`);
    }
    const parsedUrl = new URL(url);
    if (parsedUrl.username || parsedUrl.password) {
      throw new Error(`Row ${line}: URL credentials are not allowed`);
    }
    if (!Number.isInteger(rankBucket) || rankBucket < 1) {
      throw new Error(`Row ${line}: rank_bucket must be a positive integer`);
    }
    if (seenUrls.has(url)) throw new Error(`Row ${line}: duplicate website URL`);
    seenUrls.add(url);

    return {
      website: parsedUrl.host,
      url,
      rank_bucket: rankBucket
    };
  });
}

async function main(args = process.argv.slice(2)) {
  if (args.length !== 2) {
    usage();
    process.exitCode = 1;
    return;
  }

  const [inputPath, outputPath] = args;
  const csv = await fs.readFile(inputPath, 'utf8');
  const targets = convert(parseCsv(csv));
  await fs.writeFile(outputPath, `${JSON.stringify(targets, null, 2)}\n`, 'utf8');
  console.log(`Created ${outputPath} with ${targets.length} website origins.`);
}

if (require.main === module) {
  main().catch(error => {
    console.error(`Error: ${error.message}`);
    process.exitCode = 1;
  });
}

module.exports = { convert, parseCsv };
