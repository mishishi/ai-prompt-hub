# AGENTS.md — PromptBench

## Tech Stack
- Vite + React 19 + TypeScript + Tailwind CSS
- No backend — all data in localStorage
- Deployed on Vercel (`ai-prompt-bench.vercel.app`)

## File Editing Rules (CRITICAL)

**Never use `node -e "..."` for editing files.** PowerShell mangles quotes, `﻿# AGENTS.md — PromptBench

## Tech Stack
- Vite + React 19 + TypeScript + Tailwind CSS
- No backend — all data in localStorage
- Deployed on Vercel (`ai-prompt-bench.vercel.app`)

,
`--`, backticks before Node sees them. This is the #1 cause of corrupted files.

Correct approach (no exceptions):
1. Write a `.cjs` script to disk using `[System.IO.File]::WriteAllText`
2. Execute with `node script.cjs`
3. Delete with `rm script.cjs`

**Anti-patterns — NEVER do these:**
- `node -e "fs.writeFileSync(...) "` — PowerShell eats `﻿# AGENTS.md — PromptBench

## Tech Stack
- Vite + React 19 + TypeScript + Tailwind CSS
- No backend — all data in localStorage
- Deployed on Vercel (`ai-prompt-bench.vercel.app`)

 and `"`
- `node -e " ...replace('...','...')..." ` — quotes conflict
- `(Get-Content file) -replace '...','...' | Set-Content` — breaks UTF8 JSX

**For simple single-line replacements** (no JSX, no CSS vars, no Chinese):
- `node -e "..." ` is acceptable ONLY if the code contains no: `﻿# AGENTS.md — PromptBench

## Tech Stack
- Vite + React 19 + TypeScript + Tailwind CSS
- No backend — all data in localStorage
- Deployed on Vercel (`ai-prompt-bench.vercel.app`)

, `"`, `'`, `--`, Chinese characters
- When in doubt, use `.cjs`

**Line ending trap:** Git may convert CRLF↔LF on checkout. Before replacing text, always
check actual line endings with `file.indexOf("\r\n")`. Files can switch between `\r\n`
and `\n` after `git checkout`.

**Silent failure trap:** `.replace()` returns the original string when no match is found —
it never throws. Multi-step replace chains silently skip failed steps, leaving half-fixed files.
Always verify: check `c.includes('success marker')` and `process.exit(1)` on failure.

**Prefer `apply_patch` for targeted edits.** Patch format shows exact line-level diffs,
fails loudly on mismatch, and is easier to review than regex replacements.

**Before complex edits — mandatory stash flow:**
1. `git stash push -m "pre-edit: <what>"` — saves all uncommitted changes
2. Make the changes
3. If broken: `git checkout -- <file>` then `git stash pop` — restores original state
4. NEVER `git checkout -- .` without stashing first — it discards uncommitted work
5. This applies to ANY multi-step edit, not just "complex" ones. If unsure, stash.

**If >3 changes in one file**, rewrite the whole file instead of chaining `.replace()`.
Read → construct new content → `writeFileSync` once. Fewer moving parts, fewer failures.

**Always normalize line endings** before string matching. Read with `fs.readFileSync(f, 'utf8')`,
then `c = c.replace(/\r\n/g, '\n')`. Write back with `\n`. This eliminates Windows CRLF
matching failures.

**Read before edit — mandatory.** Before ANY file modification, verify current state:
1. Search for key identifiers in the target file to see what already exists
2. Never assume the file is in clean/original state
3. If re-adding reverted code, verify what was lost vs what remains
4. Skipping this is the #1 cause of duplicate declarations

**Never git checkout without git stash first.** git checkout -- file discards uncommitted changes. Always: git stash then git checkout then edit then git stash pop if needed.

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

## Environment

- .env file is gitignored, contains DATABASE_URL for local dev
- Do NOT delete .env - it is needed locally and safe from commits

## Build & Test

```bash
npm run build    # tsc -b && vite build
npx vitest run   # 30 tests across 4 files
```


## Mandatory Post-Edit Verification

After ANY file modification, run ALL FOUR before reporting success:
- `npx tsc --noEmit` (covers src/ + server/ + api/ + lib/)
- `npx vite build`
- `npx vitest run`
- `npx tsx server/index.ts` — start server briefly to verify runtime compilation (Ctrl+C after boot)
- `npx eslint src/ --ext .ts,.tsx --max-warnings 0` (if eslint configured)

If any fail, fix the error and re-verify. Do NOT report "done" until all pass clean.

**Never commit without passing tests.** Run tests as part of the verification flow before `git commit`.

When adding new interactive elements (buttons, onClick handlers, new components),
also add at least one Vitest smoke test that renders the component.

## Git

- Do NOT push unless explicitly asked
- Branch prefix: `codex/`
- Remote: `git@github.com:mishishi/ai-prompt-bench.git`
## Agent Behavior

- After significant changes, check if AGENTS.md needs updating (new conventions, gotchas, changed patterns). Keep it short.
- This file is a living document — git history IS the version log.


## Vercel Deployment Rules (CRITICAL)

### ESM Import Paths
- Vercel Node runtime is strict ESM — every relative import MUST have explicit path + .js extension
- `from "../../lib/db"` → ❌ dir import unsupported
- `from "../../lib/db/index"` → ❌ missing extension
- `from "../../lib/db/index.js"` → ✅ correct

### Database
- Schema changes require `npx drizzle-kit push` before deploy
- DATABASE_URL is auto-set by Vercel Storage — never hardcode

### vercel.json
- Write with Node, never PowerShell (BOM breaks JSON)
- Must include SPA rewrites + functions.regions
