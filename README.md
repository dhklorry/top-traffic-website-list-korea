# Korea Website Traffic Ranking Fetcher

The source data and scripts in this repository are for South Korea.

A toolkit for fetching South Korea website traffic rankings from multiple sources:

- [Tranco List](https://tranco-list.eu/) — global top 1 million sites
- [Cloudflare Radar](https://radar.cloudflare.com/) — South Korea traffic top 100 (Cloudflare)
- [AhrefsTop](https://ahrefstop.com/websites/korea) — Korea organic search traffic top 100
- [SimilarWeb](https://www.similarweb.com/top-websites/korea-republic-of/) — South Korea website traffic top 50
- [Semrush](https://www.semrush.com/trending-websites/kr/all) — South Korea website traffic top 100

## 📊 Data sources

### Tranco List
[Tranco List](https://tranco-list.eu/) combines Alexa, Cisco Umbrella, Majestic, Chrome User Experience Report, and other sources for more reliable, stable rankings than any single provider.

Citation: Victor Le Pochat, Tom Van Goethem, Samaneh Tajalizadehkhoob, Maciej Korczyński, and Wouter Joosen. 2019. *Tranco: A Research-Oriented Top Sites Ranking Hardened Against Manipulation*. In *Proceedings of the 26th Annual Network and Distributed System Security Symposium (NDSS 2019)*. https://doi.org/10.14722/ndss.2019.23386

- Source data updates daily
- Filter: domains ending in `.kr`

### Cloudflare Radar
[Cloudflare Radar](https://radar.cloudflare.com/) ranks domains by [1.1.1.1](https://1.1.1.1/) DNS query volume. Provides South Korea top 100 with category metadata via the [Cloudflare Radar API](https://developers.cloudflare.com/radar/) [`/radar/ranking/top`](https://developers.cloudflare.com/radar/investigate/domain-ranking-datasets/) endpoint using location `KR`.

- Ranking window: last 24 hours, updates daily (see [Domains ranking](https://developers.cloudflare.com/radar/investigate/domain-ranking-datasets/))
- Requires a Cloudflare API token in `.env` as `CLOUDFLARE_API_TOKEN`

### AhrefsTop
[AhrefsTop](https://ahrefstop.com/websites/korea) ranks sites by estimated organic search traffic. Korea top 100 with category and search traffic; updated monthly.

- Source data updates monthly

### SimilarWeb
[SimilarWeb](https://www.similarweb.com/top-websites/korea-republic-of/) aggregates direct measurement, partner data, and public sources. South Korea top 50 with category and rank change; updated monthly.

- Source data updates monthly

### Semrush
[Semrush](https://www.semrush.com/trending-websites/kr/all) uses clickstream data for real user behavior. South Korea top 100 with estimated total traffic; updated monthly.

- Source data updates monthly

## 🚀 Usage

```bash
npm install
npm run <tranco|cloudflare|ahrefs|similarweb|semrush|merge>
```

## 📁 Output files

### Tranco List
Produces `tranco_list_kr.json`:

```json
[
  {
    "rank": 123,
    "domain": "example.co.kr",
    "url": "https://example.co.kr"
  },
  ...
]
```

### Cloudflare Radar
Produces `cloudflare_radar_kr.json`:

```json
[
  {
    "rank": 1,
    "domain": "google.com",
    "categories": [
      {
        "id": 145,
        "name": "Search Engines",
        "superCategoryId": 26
      }
    ]
  },
  ...
]
```

### AhrefsTop
Produces `ahrefs_top_kr.json`:

```json
[
  {
    "rank": 1,
    "website": "wikipedia.org",
    "category": "Reference",
    "search_traffic_K": 80400
  },
  ...
]
```

**Note:** `search_traffic_K` is a plain number in thousands (e.g. "80.4M" → 80400).

### SimilarWeb
Produces `similarweb_top_korea-republic-of.json`:

```json
[
  {
    "rank": 1,
    "website": "google.com",
    "category": "Computers Electronics and Technology > Search Engines"
  },
  ...
]
```

### Semrush
Produces `semrush_top_kr.json`:

```json
[
  {
    "rank": 1,
    "domain_name": "google.com",
    "total_traffic": 971810009
  },
  ...
]
```

### Merge
Merges all lists into `merged_lists_kr.json`.

## 📜 License

During the ISIF research period (through December 31, 2026), this project is licensed under [CC BY-NC-ND 4.0 International](https://creativecommons.org/licenses/by-nc-nd/4.0/).

After December 31, 2026, data and scripts will be released into the Public Domain. For uses beyond CC BY-NC-ND 4.0 during the research period, contact Irvin Chen (Open Culture Foundation; ORCID: [https://orcid.org/0009-0002-1059-7130](https://orcid.org/0009-0002-1059-7130)) at irvin@ocf.tw (cc hi@ocf.tw).

See [LICENSE](LICENSE) for full terms and suggested attribution. See also [`CITATION.cff`](CITATION.cff) for machine-readable citation metadata.

## 🙏 Acknowledgements

This work was supported by a grant from the [APNIC Foundation](https://apnic.foundation/) ([ROR: 01y4y6h16](https://ror.org/01y4y6h16)), via the Information Society Innovation Fund (ISIF Asia).
