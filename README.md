# Actually...

Actually... is an evidence-native research agent for the claims people make too confidently at work. Paste a memo, Slack dump, or AI answer and it turns the fog into a short brief: claim → evidence → grade → next check.

The demo ships with three replay fixtures so a judge can try the complete flow without an API key or fragile live search:

- **Should we migrate payments to Stripe?** — a mixed internal memo.
- **Fact-check this AI strategy answer** — four overconfident claims.
- **Competitor all moved to event-driven architecture** — Slack lore and blog summaries.

## Run it

Requires Node 18+.

```bash
npm install
npm run dev
```

Open `http://localhost:3000`, choose a scenario, and click **Grade these claims**. The replay pipeline shows claim extraction, parallel research, evidence reduction, grading, and brief synthesis with realistic timing. Copy markdown and re-check contested claims are included in the results experience.

For live wiring, copy `.env.example` to `.env.local`, set `OPENAI_API_KEY`, and use `OPENAI_MODEL=gpt-5.6`. The API seam is `POST /api/analyze` followed by `GET /api/runs/:runId`; the fixture path is intentionally deterministic for demo day.

## Architecture

```mermaid
flowchart LR
  A[Paste or fixture] --> B[Claim extraction]
  B --> C1[Pro agent]
  B --> C2[Con agent]
  B --> C3[Numbers agent]
  B --> C4[Precedent agent]
  C1 & C2 & C3 & C4 --> D[Programmatic evidence reduction]
  D --> E[Decision layer: solid / shaky / contested / unknown]
  E --> F[Brief + evidence map]
```

GPT-5.6 is the intended runtime model. In the full live pipeline, the four investigators fan out per important claim; Programmatic Tool Calling owns the bounded reduction step (dedupe, filter, join, rank) before the grading model sees compact evidence packs. This starter keeps that contract visible while using cached evidence for a reliable MVP demo.

## Codex + build notes

Codex accelerated the build by scaffolding the Next app, defining the typed claim/evidence shape, generating the replay fixtures, and iterating the complete input → progress → results → export path in one workspace. Key decisions: fixture-first reliability over live search for judging, CSS over a component library to keep the visual identity opinionated, and an explicit decision layer rather than a generic summary.

## Demo script (under 3 minutes)

1. Open the Stripe fixture and point out the mixed claims.
2. Run it: call out the four parallel investigator roles and the five visible stages.
3. On results, show the decisive bottom line, then contrast solid, shaky, contested, and unknown cards.
4. Click **Re-check contested only**, then **Copy markdown**.
5. Return to the home screen and run the AI strategy fixture to show that the system catches absolute language and preserves caveats.
