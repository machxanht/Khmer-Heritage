# Khmer-Heritage
KHMER HERITAGE APPLICATION

Digital encyclopedia of Khmer heritage & culture — Android + iOS first, website later, all sharing one content source (Cloudflare R2, JSON-first).

## Governing documents (`docs/`)

| Doc | Purpose |
|---|---|
| [PROJECT_SPEC.md](docs/PROJECT_SPEC.md) | Architecture, phases, stack decision, acceptance criteria |
| [CONTENT_SCHEMA.md](docs/CONTENT_SCHEMA.md) | Content schema v1.0 — entries, categories, manifest, validation |
| [CONTENT_SOURCES.md](docs/CONTENT_SOURCES.md) | Source tiers, registry, research rules |
| [LICENSING.md](docs/LICENSING.md) | Hard licensing/copyright policy + release gate |
| [AI_BRIDGE.md](docs/AI_BRIDGE.md) | AI relay log between ChatGPT ↔ Codex (append-only) |

Binding specification: `KHMER_HERITAGE_MASTER_PLAN_AND_PROMPTS_e9028413-1 (1).txt` (repo root).

## Status

- Phase 0 — Foundation: complete ✅
- Stack decision: Expo (React Native) + TypeScript ✅ (AI_BRIDGE A-002)
- Phase 1 — Content Model: complete ✅ — `packages/content-schema`, `packages/content-client`, `content-seed/` (24 tests green)
- Phase 4 — Mobile foundation: in progress — Expo SDK 57 app (`app/`) with Home/Categories/Search/Settings/Category/Entry screens, km/en/vi i18n; `expo export` verified
- Run locally: `npm run seed` (serves content-seed on :8787) then `cd app && npx expo start`
- Next: AsyncStorage cache adapter, Phase 2 media pipeline, Phase 3 CMS; pending B2 R2 provisioning (owner).

