# AGENTS.md — PromptBench

## Tech Stack
- Vite + React 19 + TypeScript + Tailwind CSS
- No backend — all data in localStorage
- Deployed on Vercel (`ai-propmpt-hub.vercel.app`)

## File Editing Rules (CRITICAL)

**Never use PowerShell string manipulation on JSX/TSX files.** It breaks template
literals, Chinese characters, and regex patterns.

Correct approach:
1. Write a `.cjs` script to disk using `[System.IO.File]::WriteAllText` with UTF8
2. Execute with `node script.cjs`
3. Delete the script after

For files containing Chinese characters, use PowerShell `Set-Content -Encoding UTF8`
to write the entire file at once (here-string → Set-Content), not incremental edits.

## Font Scale

Redefined in `src/index.css` `@theme` block (not global replacements):
```css
@theme {
  --font-size-xs: 0.9375rem;   /* 15px */
  --font-size-sm: 1rem;         /* 16px */
  --font-size-base: 1rem;       /* 16px */
}
```

Use standard Tailwind classes — `text-xs`, `text-sm`, `text-base` work automatically.

CSS component overrides match the same scale:
- Labels/meta: `0.9375rem` (15px)
- Body text: `1rem` (16px)

## I18n Patterns

- `tq(en, zh)` — inline helper for Chinese/English switching
- `useT()` hook returns `{ t, lang, setLang }`
- Template-specific: `tName()`, `tShort()`, `tTips()` from `src/data/templates/helper.ts`
- Translation keys in `src/i18n/translations.ts`

## Theming

CSS custom properties in `src/index.css` `@theme` block:
- `--color-bench-*` prefix for all colors
- Dark theme only (no light mode)
- Accent: Warm Amber (`#d4a843`)

## Icons

Use Lucide React exclusively. No emoji icons.

## Project Structure

```
src/
  components/
    layout/        # TopNavbar, Layout, HomePage, errors
    templates/     # TemplateBrowser, TemplateCard, TemplateDetail
    workspace/     # GeneratePage (AI prompt generator)
    prompts/       # PromptsPage (saved prompts)
    dashboard/     # Dashboard (analytics)
  data/templates/  # Template definitions (48 templates)
  i18n/            # Language context + translations
  utils/           # analytics, clipboard, platform, renderer, storage
  types/           # TypeScript interfaces
```

## Build & Test

```bash
npm run build    # tsc -b && vite build
npx vitest run   # 30 tests across 4 files
```

## Git

- Do NOT push unless explicitly asked
- Branch prefix: `codex/`
- Remote: `git@github.com:mishishi/ai-propmpt-hub.git`
## Agent Behavior

- After significant changes, check if AGENTS.md needs updating (new conventions, gotchas, changed patterns). Keep it short.
- This file is a living document — git history IS the version log.
