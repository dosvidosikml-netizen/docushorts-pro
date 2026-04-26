# NeuroCine Storyboard vFinal+ Site Build

Added production Storyboard Engine with:

- `/storyboard` UI route
- SAFE / GROK mode switcher
- scene scoring rule: every scene is internally improved to 8+/10 before output
- `/api/storyboard` OpenRouter API route
- `openai/gpt-5.4` default model
- `engine/sceneEngine_v2.js` duration control + JSON normalization + validation

## Environment

Create `.env.local` locally:

```env
OPENROUTER_API_KEY=your_openrouter_key_here
OPENROUTER_MODEL=openai/gpt-5.4
NEXT_PUBLIC_SITE_URL=https://neurocine.online
```

Do not upload real `.env.local` with secrets.

## Use

Run site and open:

```text
/storyboard
```

Modes:

- `SAFE / GPT` — safer wording, stable JSON, best for API/site.
- `GROK / RAW` — stronger cinematic prompts for video generation.

## API

POST `/api/storyboard`

```json
{
  "script": "...",
  "duration": 60,
  "mode": "safe"
}
```

or

```json
{
  "script": "...",
  "duration": 60,
  "mode": "raw"
}
```
