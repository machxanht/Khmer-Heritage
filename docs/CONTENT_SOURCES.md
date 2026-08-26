# Content Sources Policy & Registry

Hard rule: every important factual claim has a source. AI may assist research outlines, rewriting, translation, tagging, proofreading — **AI output is never a source**. When sources conflict: do not guess; record uncertainty or present the differing views.

## 1. Source tiers (preference order)

- **T1 — Cambodian institutions:** Ministry of Culture & Fine Arts; APSARA National Authority; National Museum of Cambodia; Royal Academy of Cambodia; Buddhist Institute; national archives.
- **T2 — Scholarly/international:** UNESCO World Heritage Centre; universities; museums (e.g., Guimet, Smithsonian); peer-reviewed publications; ethnomusicology archives (e.g., University of Washington Ethnomusicology Archives, Smithsonian Folkways).
- **T3 — Licensed open repositories:** Wikimedia Commons, Freesound — **per-file license check mandatory**; CC BY-NC filtered out for commercial use.
- Not acceptable as basis: Google Images results of unknown license, personal Facebook posts treated as public domain, YouTube/"free to listen" audio.

## 2. Registry

Columns: id · name · tier · url · license posture · verification notes.

| id | Name | Tier | URL | License posture | Notes |
|---|---|---|---|---|---|
| src-apsara | APSARA National Authority | T1 | apsaraauthority.gov.kh | institution; verify per page | primary for temples/Angkor complex |
| src-mocfa | Ministry of Culture & Fine Arts | T1 | mocfa.gov.kh | official | verify per publication |
| src-nmc | National Museum of Cambodia | T1 | cambodiamuseum.info | object images vary | request permission for photos |
| src-rac | Royal Academy of Cambodia | T1 | rac.gov.kh | official | language/script authority |
| src-unesco-whc | UNESCO World Heritage Centre | T2 | whc.unesco.org/en/list/668 | website content ©; facts citable | cite as fact source, do not copy text wholesale |
| src-efeo | École française d'Extrême-Orient | T2 | efeo.net | scholarly | historical/archaeological studies |
| src-folkways | Smithsonian Folkways | T2 | folkways.si.edu | per-album license | audio licensing via rights dept |
| src-uwea | UW Ethnomusicology Archives | T2 | musiclib.washington.edu/ethno | access-request | Pin Peat field recordings |
| src-commons | Wikimedia Commons | T3 | commons.wikimedia.org | per-file CC/PD | record exact file + license URL |
| src-freesound | Freesound | T3 | freesound.org | per-file CC0/CC-BY/(BY-NC excluded) | check each sound page |
| src-chum-ngek | Chum Ngek — "Music of Cambodia" recordings | T2 | survey ongoing | rights holder must be identified | commercial use needs permission (master §9) |

Rules: add a row before using any new source; fill `verified-by` + `date` when a human confirms license posture; remove/mark any source that fails verification.

## 3. Citation format in entries (`SourceRef`)

`{ id, title, publisher, url?, datePublished?, dateAccessed, note? }` — `dateAccessed` mandatory; `url` omitted only for print/archive material (say so in `note`).

## 4. Pilot entries (§20) → starting sources

| Entry | Start from |
|---|---|
| Angkor Wat · Bayon · Angkor Thom | src-unesco-whc, src-apsara, src-efeo |
| Apsara | src-nmc, src-efeo, scholarly iconography papers |
| Khmer architecture · sculpture | src-nmc, museum catalogs, src-efeo |
| Pin Peat · Roneat Aik | src-uwea, src-folkways, ethnomusicology literature |
| Clothing · festivals · script · crafts · cuisine · history timeline | T1/T2 institutional pages + academic histories; no blog scraping |

Each pilot entry must prove: schema compliance, sources, license metadata, media, related links, multilingual (km+en).
