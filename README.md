# CocoaGuard AI

**On-device AI for cocoa disease diagnosis — built for Ghanaian farmers.**
Final-year project. Photograph a cocoa leaf or pod, get an instant diagnosis
(anthracnose / black pod / CSSVD / healthy) with confidence score, treatment
steps, and Twi voice advice — even offline.

## Problem

Cocoa diseases (black pod, CSSVD, anthracnose) destroy harvests, but extension
agents are scarce and lab diagnosis is slow. Farmers need an instant,
field-ready answer on a phone with poor connectivity.

## Objectives

1. Classify 4 cocoa conditions from a phone photo, on-device.
2. Work offline after first visit (cached model + advice + queue).
3. Explain every result: confidence, treatment steps, prevention, isolation.
4. Map community outbreaks anonymously for early warning.
5. Score weather-driven black-pod risk from rain + humidity.

## How it works

```
photo → TF.js MobileNetV3-small (browser, 224px)
        ├── confidence ≥ 0.55 → result + advice + Twi voice
        └── confidence < 0.55 → OpenRouter vision LLM fallback
                 → saved to Supabase (RLS) → dashboard + community map
Offline: scans queue in IndexedDB, sync when back online.
```

## Dataset & training

- **Primary:** KaraAgroAI Cocoa (CC0, Harvard Dataverse DOI `10.7910/DVN/BBGQSP`)
  — detection format, bounding boxes cropped into class folders.
- **Supplement:** Kaggle black-pod mirrors for class balance.
- Split: stratified 80/10/10, per-class cap 2000, augmentation for minorities.
- Model: MobileNetV3-small fine-tune, `Rescaling(1/127.5, offset=-1)` baked in
  as first layer (browser runs raw pixels). See
  `notebooks/cocoa_classifier_training.ipynb` (19 cells).
- Export: TF.js GraphModel in `public/models/` (`model.json` + shards).

## Evaluation

> Metrics pending a clean re-run of the notebook on the final frozen split.
> The notebook in-repo was saved without cell outputs, so no numbers are
> quoted here rather than inventing them. Re-run procedure:

```bash
# in Colab, top to bottom, then record:
# accuracy, per-class precision/recall/F1, confusion matrix
```

Report the 4×4 confusion matrix and per-class F1 in your thesis; target
honest numbers over high ones, with error analysis on the worst class.

## Architecture

```
app/                  Next.js 15 (App Router): /, /scan, /dashboard, /map, /result/[scanId]
├── api/classify-llm  server-only OpenRouter fallback (key never hits browser)
└── api/health        liveness probe
lib/                  classifier.ts (TF.js), model.ts (labels/thresholds),
                      llm-fallback.ts, advice.ts, weather.ts, offline-queue.ts,
                      supabase.ts / supabase-server.ts, auth.ts (anon sessions)
components/           CameraCapture, ResultCard, ConfidenceBar, AdvicePanel,
                      VoiceAdvice (Twi), WeatherRiskCard, MapView, DashboardCharts
supabase/schema.sql   profiles + scans (RLS: owner-only) + community_scans
                      view (sanitized, anon-readable) + scan-images bucket
public/models/        exported TF.js GraphModel
public/sw.js          service-worker offline cache
```

## Getting started

```bash
npm install
cp .env.example .env.local   # fill Supabase URL + anon key, OPENROUTER_API_KEY
npm run dev                  # http://localhost:3000
```

Supabase setup: run `supabase/schema.sql` in the SQL editor (creates tables,
RLS policies, `community_scans` view, storage bucket).

## Scripts

| Command     | Purpose              |
| ----------- | -------------------- |
| `npm run dev`   | dev server (Turbopack) |
| `npm run build` | production build       |
| `npm run start` | serve production build |
| `npm run lint`  | ESLint                 |

## Privacy & ethics

- Anonymous sessions by default; scans are private unless the user opts into
  the community map (only class + confidence + rounded GPS shared).
- No names, no exact farm locations in public data.
- Advice is informational, not a substitute for an extension officer.

## Limitations

- 4 classes only; poor lighting/blur lowers confidence (by design → LLM
  fallback or "retake photo").
- Model trained on Ghanaian cocoa images; other regions/varieties untested.
- Weather risk is heuristic, not epidemiological prediction.

## License

MIT — see [LICENSE](LICENSE).
