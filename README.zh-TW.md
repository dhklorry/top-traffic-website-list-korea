# 台灣網站流量排名抓取工具

英文文件請見 [`README.md`](README.md)。

從多個來源抓取台灣網站流量排名清單的工具集，包含：
- [Tranco List](https://tranco-list.eu/) - 全球前 100 萬網站排名
- [Cloudflare Radar](https://radar.cloudflare.com/) - Cloudflare 的台灣流量排名（前 100 名）
- [AhrefsTop](https://ahrefstop.com/websites/taiwan) - Ahrefs 的台灣 Organic Search 流量排名（前 100 名）
- [SimilarWeb](https://www.similarweb.com/top-websites/taiwan/) - SimilarWeb 的台灣網站流量排名（前 50 名）
- [Semrush](https://www.semrush.com/trending-websites/tw/all) - Semrush 的台灣網站流量排名（前 100 名）

## 📊 資料來源

### Tranco List
[Tranco List](https://tranco-list.eu/) - 結合 Alexa, Cisco Umbrella, Majestic, Chrome User Experience Report 等多來源的網站排名，比單一來源更具可靠性與穩定性。

引用：Victor Le Pochat, Tom Van Goethem, Samaneh Tajalizadehkhoob, Maciej Korczyński, Wouter Joosen. 2019. 〈Tranco: A Research-Oriented Top Sites Ranking Hardened Against Manipulation〉. *Proceedings of the 26th Annual Network and Distributed System Security Symposium (NDSS 2019)*. https://doi.org/10.14722/ndss.2019.23386

- 原始資料每日更新
- 篩選條件：網域結尾為 `.tw`

### Cloudflare Radar
[Cloudflare Radar](https://radar.cloudflare.com/) - Cloudflare 提供的全球網路流量分析平台，依據 [1.1.1.1](https://1.1.1.1/) DNS 查詢量產生網域排名。提供台灣地區的前 100 名網站排名，包含網站分類資訊。資料透過 [Cloudflare Radar API](https://developers.cloudflare.com/radar/) 的 [`/radar/ranking/top`](https://developers.cloudflare.com/radar/investigate/domain-ranking-datasets/) 端點取得。

- 排名時間範圍：過去 24 小時，每日更新（詳見 [Domains ranking](https://developers.cloudflare.com/radar/investigate/domain-ranking-datasets/)）
- 需要 Cloudflare API Token，請在 `.env` 檔案中設定 `CLOUDFLARE_API_TOKEN`

### AhrefsTop
[AhrefsTop](https://ahrefstop.com/websites/taiwan) - 基於 Ahrefs 有機搜尋流量估算的網站排名。提供台灣地區的前 100 名網站排名，包含網站類別和搜尋流量數據。資料每月更新。

- 原始資料每月更新

### SimilarWeb
[SimilarWeb](https://www.similarweb.com/top-websites/taiwan/) - SimilarWeb 提供的網站流量分析平台，透過多種數據來源（包括直接測量、合作夥伴數據、公開數據等）收集網站流量資訊。提供台灣地區的前 50 名網站排名，包含網站類別和排名變化數據。

- 原始資料每月更新

### Semrush
[Semrush](https://www.semrush.com/trending-websites/tw/all) - Semrush 提供的網站流量分析平台，透過點擊流數據（clickstream data）收集真實用戶行為數據。提供台灣地區的前 100 名網站排名與預估總流量數據。

- 原始資料每月更新

## 🚀 使用方式

```bash
npm install
npm run <tranco|cloudflare|ahrefs|similarweb|semrush|merge>
```

## 📁 輸出檔案

### Tranco List
執行後會產生 `tranco_list_tw.json`，格式如下：

```json
[
  {
    "rank": 123,
    "domain": "example.com.tw",
    "url": "https://example.com.tw"
  },
  ...
]
```

### Cloudflare Radar
執行後會產生 `cloudflare_radar_tw.json`，格式如下：

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
執行後會產生 `ahrefs_top_tw.json`，格式如下：

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
**注意**：`search_traffic_K` 欄位為以 K 為單位的純數字（例如 "80.4M" 轉換為 80400）。

### SimilarWeb
執行後會產生 `similarweb_top_tw.json`，格式如下：

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
執行後會產生 `semrush_top_tw.json`，格式如下：

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
執行後會合併以上所有清單，產生 `merged_lists_tw.json`

```

## 📜 授權

本專案在 ISIF 研究專案期間（2026 年 12 月 31 日前）採用 [CC BY-NC-ND 4.0 International](https://creativecommons.org/licenses/by-nc-nd/4.0/)（姓名標示─非商業性─禁止改作 4.0 國際）。

2026 年 12 月 31 日後，本專案之資料與腳本將釋出至公有領域（Public Domain）。研究期間若需超出 CC BY-NC-ND 4.0 限制之使用，請聯絡 Irvin Chen（Open Culture Foundation；ORCID：[https://orcid.org/0009-0002-1059-7130](https://orcid.org/0009-0002-1059-7130)）：irvin@ocf.tw（請 cc hi@ocf.tw）。

完整條款與建議署名格式請見 [LICENSE](LICENSE)。機器可讀引用資訊見 [`CITATION.cff`](CITATION.cff)。

## 🙏 致謝

This work was supported by a grant from the APNIC Foundation, via the Information Society Innovation Fund (ISIF Asia).
