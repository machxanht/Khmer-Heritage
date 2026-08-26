# Licensing & Copyright Policy — HARD REQUIREMENT

Nothing may be used merely because Google/YouTube/Facebook displays it or offers a download button. Viewing ≠ permission. **Any asset with `UNKNOWN` license blocks release.**

## 1. License taxonomy & commercial verdicts

| Code | Meaning | Usable in commercial app? |
|---|---|---|
| `PD` | Public Domain | ✅ (verify jurisdiction/age) |
| `CC0-1.0` | CC0 | ✅ preferred |
| `CC-BY-4.0` | Attribution required | ✅ with attribution rendered |
| `CC-BY-SA-4.0` | Share-Alike | ✅ with attribution + share-alike compliance for derived content |
| `CC-BY-NC-4.0` | Non-commercial | ⛔ forbidden (commercial app) |
| `PERMISSION-REQUIRED` | Direct written permission granted | ✅ only within documented scope |
| `COPYRIGHTED` | All rights reserved | ⛔ unless PERMISSION evidence attached |
| `UNKNOWN` | Unverified | ⛔ never ship |

Usage priority: ① CC0/PD ② CC BY (attribute) ③ project-original content ④ documented written commercial permission ⑤ clearly licensed commercial content.

## 2. Forbidden practices

Re-uploading others' files · “free to listen” audio · unverified Google Images · treating a private Facebook post as public domain · stripping attribution · using NC content in a monetized app · inventing license metadata.

## 3. Mandatory per-asset record (`/licenses/asset-ledger.json`)

```json
{
  "assetId": "img-angkor-wat-cover",
  "file": "media/images/optimized/angkor-wat/cover.webp",
  "sourceUrl": "https://commons.wikimedia.org/wiki/File:Angkor_Wat.jpg",
  "creator": "Diego Delso",
  "license": "CC-BY-SA-4.0",
  "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0/",
  "attribution": "Photo: Diego Delso (CC BY-SA 4.0)",
  "dateAdded": "2026-08-26",
  "notes": "Derivative resized/WebP — share-alike applies"
}
```

An entry referencing an `assetId` absent from the ledger, or whose ledger license is `UNKNOWN`/`CC-BY-NC-4.0`, fails validation and cannot reach `PUBLISHED`.

## 4. Direct permissions

Must store: proof file path (PDF/email export in `licenses/evidence/`, git-ignored if sensitive), date, grantor name + role/contact, granted scope (where/which media/commercial yes-no), expiry if any, source profile/link. Verbal or chat-message consent is insufficient unless exported and archived.

## 5. Audio / Khmer music specifics (master §9)

Real Khmer recordings > AI imitation. Priority instruments/ensemble: Pin Peat; Roneat Aik, Roneat Thung, Kong Thom, Kong Tauch, Samphor, Skor Thom, Chhing, Sralai. Identify the rights holder before any commercial use of archival/personal recordings (incl. Chum Ngek collections, Folkways, university archives, individual musicians' posts).

Background music for Ouk Chatrang-style contexts must be: calm, contemplative, traditional Khmer, noble, restrained, loopable; avoid overly mournful takes, dominant Sralai solos, cinematic fantasy, generic Chinese/Thai sound.

## 6. Release gate (licensing audit)

Before any public build: run ledger lint — zero `UNKNOWN`, zero `CC-BY-NC`, every attribution string present in the app's credits view, evidence files present for every `PERMISSION-REQUIRED` asset.
