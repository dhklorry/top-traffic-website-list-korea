# top-traffic-list-taiwan Project Summary

For Traditional Chinese documentation, see [`專案摘要.zh-TW.md`](專案摘要.zh-TW.md).

**Project name:** Taiwan website traffic ranking fetcher  
**Version:** 1.0.1  
**License:** CC BY-NC-ND 4.0 International  
**Last updated:** January 2026

---

## 📋 Overview

`top-traffic-list-taiwan` fetches and merges Taiwan website traffic rankings from multiple sources. It supplies target site lists for the “digital public-service resilience testing” system so coverage includes Taiwan’s most important websites.

---

## 🎯 Core features

### 1. Multi-source fetching

| Source | Update frequency | Volume | Notes |
|---------|-----------------|--------|-------|
| **Tranco List** | Daily | ~12,000 entries | Multi-source, highest reliability |
| **Cloudflare Radar** | Daily | Top 100 | Real traffic, with categories |
| **AhrefsTop** | Monthly | Top 100 | Organic search rankings |
| **SimilarWeb** | Monthly | Top 50 | Multi-source aggregation |
| **Semrush** | Monthly | Top 100 | Clickstream data |

### 2. Data integration and merge

**merge-lists.js** (253 lines)
- Merges five sources into one format
- URL normalization (strip `www.`, lowercase)
- Preserves per-source rank fields
- Keeps the better (smaller) rank when duplicates exist
- Outputs `merged_lists_tw.json` (~250KB)

**Output format:**
```json
{
  "website": "example.com",
  "url": "https://example.com",
  "rank": {
    "tranco": 123,
    "cloudflare": 45,
    "ahrefs": 67,
    "similarweb": 23,
    "semrush": 89
  }
}
```

### 3. Cloud provider database

**cloud_providers_tw.json** (503 lines, ~12KB)

Identification data for cloud services used by sites:

**A. International public cloud (Taiwan nodes)**
- Amazon Web Services
- Google Cloud
- Microsoft Azure
- Cloudflare
- Akamai

**B. International public cloud (no known Taiwan nodes)**
- IBM Cloud, Huawei Cloud, DigitalOcean, Fastly, Vercel

**C. Local cloud providers**
- Chunghwa Telecom HiCloud, Far EasTone FETnet, Taiwan Mobile, etc.

**Identification fields:**
- ASN lists
- Organization keyword lists
- Notes

### 4. Data quality control

**check-duplicates.js**
- Finds domains in `tranco_list_tw.json` that collide after normalization (stripping `www.`)
- Writes results to `duplicates-check.json`

---

## 📊 Project statistics

### Code size
- **Total JavaScript:** 1,159 lines
- **Main files:**
  - `merge-lists.js`: 253 lines (merge)
  - `fetch-tranco.js`: Tranco fetch
  - `fetch-cloudflare.js`: Cloudflare Radar fetch
  - `fetch-ahrefs.js`: Ahrefs fetch
  - `fetch-similarweb.js`: SimilarWeb fetch
  - `fetch-semrush.js`: Semrush fetch
  - `check-duplicates.js`: Tranco post-normalization duplicate check

### Data file sizes
- `merged_lists_tw.json`: **250KB** (primary output)
- `tranco_list_tw.json`: **203KB**
- `cloudflare_radar_tw.json`: **20KB**
- `cloud_providers_tw.json`: **12KB**
- `ahrefs_top_tw.json`: **11KB**
- `semrush_top_tw.json`: **8.6KB**
- `similarweb_top_taiwan.json`: **5.5KB**

### Git changes (2024-12-01 to 2026-01-29)
- **Commits:** 17
- **Lines:** +23,122 / -6,810
- **Net:** +16,312 (mostly data files)

---

## 🚀 Usage

### Install dependencies
```bash
npm install
```

### Fetch each source
```bash
npm run tranco        # Tranco List
npm run cloudflare    # Cloudflare Radar (needs API token)
npm run ahrefs        # Ahrefs
npm run similarweb    # SimilarWeb
npm run semrush       # Semrush
```

### Merge lists
```bash
npm run merge         # → merged_lists_tw.json
```

### Environment
Create `.env`:
```
CLOUDFLARE_API_TOKEN=your_token_here
```

---

## 📈 Development timeline

### November 2025 (source integration)

**2025-11-26**
- ✅ Tranco List fetch script
- ✅ Tranco .tw results (20251126)

**2025-11-27**
- ✅ Cloudflare Radar Taiwan top 100 script and results (20251127)
- ✅ Tranco: switch to list including subdomains
- ✅ Tranco .tw subdomain results (20251127)

**2025-11-28**
- ✅ Ahrefs Taiwan top 100 script and results (20251128)
- ✅ Semrush Taiwan top 100 script and results (20251128)
- ✅ SimilarWeb Taiwan top 50 script and results (20251128)
- ✅ README update

### December 2025 (merge)

**2025-12-04**
- ✅ Merge lists (`merge-lists.js`)
- ✅ Improved merge ranking logic

### January 2026 (expansion)

**2026-01-05**
- ✅ `cloud_providers_tw.json`
- ✅ Temporary CC BY-NC-ND 4.0 license (ISIF research period)

**2026-01-06**
- ✅ `npm run merge`
- ✅ README update
- ✅ List update (20260106)
- ✅ Tranco expanded from ~6,000 to ~12,000 entries

**2026-01-15**
- ✅ ASN statistics moved to main repo (`web-resilience-test`)

---

## 🔧 Technical architecture

### Stack
- **Language:** Node.js
- **Dependencies:**
  - `adm-zip`: ZIP handling (Tranco)
  - `dotenv`: environment variables

### Data pipeline

```
1. Fetch sources
   ├─ Tranco List (CSV/ZIP)
   ├─ Cloudflare Radar (API)
   ├─ Ahrefs (scraper)
   ├─ SimilarWeb (scraper)
   └─ Semrush (scraper)

2. Convert to JSON per source

3. Merge
   └─ merge-lists.js → merged_lists_tw.json

4. Quality check (optional)
   └─ check-duplicates.js — Tranco domains that collide after normalization
   └─ writes duplicates-check.json
```

---

## 📁 Output files

### Primary
- **`merged_lists_tw.json`**: unified list for the main project

### Per-source raw data
- `tranco_list_tw.json`
- `cloudflare_radar_tw.json`
- `ahrefs_top_tw.json`
- `similarweb_top_taiwan.json`
- `semrush_top_tw.json`

### Auxiliary
- `cloud_providers_tw.json`: cloud provider identification

---

## 🎯 Goals and usage

### Goals
1. **Test targets:** site lists for resilience testing
2. **Multi-source coverage:** breadth and reliability
3. **Standardization:** one format for downstream tools

### Use cases
- Test target list for `web-resilience-test`
- Sort order for `generate_statistic.js`
- Cloud provider identification during testing

---

## 📝 Notes

### Update cadence
- **Tranco, Cloudflare Radar:** daily (run regularly)
- **Ahrefs, SimilarWeb, Semrush:** monthly

### Special cases
- Sites with only Cloudflare Radar rank may be apps or APIs
- Cloudflare Radar requires `CLOUDFLARE_API_TOKEN` in `.env`

### License
- **CC BY-NC-ND 4.0** during the ISIF research period

---

## 🔗 Related links

- **Project path:** `/Users/Irvin/Coding/smc git/web-resilience-test/top-traffic-list-taiwan/`
- **Main project:** https://github.com/irvin/web-resilience-test
- **Sources:**
  - [Tranco List](https://tranco-list.eu/)
  - [Cloudflare Radar](https://radar.cloudflare.com/)
  - [AhrefsTop](https://ahrefstop.com/websites/taiwan)
  - [SimilarWeb](https://www.similarweb.com/top-websites/taiwan/)
  - [Semrush](https://www.semrush.com/trending-websites/tw/all)

---

## 🙏 Acknowledgements

This work was supported by a grant from the APNIC Foundation, via the Information Society Innovation Fund (ISIF Asia).

---

**Last updated:** January 29, 2026
