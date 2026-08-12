# Developer notes

Requires [Node.js](https://nodejs.org/) 20+ and [Task](https://taskfile.dev/).

## Setup

```sh
task setup
```

Installs dependencies and prepares git hooks (Husky + lint-staged).

## Day-to-day

| Command | What it does |
| --- | --- |
| `task dev` | Start the Astro dev server |
| `task build` | Validate flashcard JSON, then build to `dist/` |
| `task validate` | Validate flashcard JSON only |
| `task lint` | Autofix lint issues and format sources |
| `task lint-check` | Lint without writing changes |
| `task format` | Format with Prettier |
| `task format-check` | Check formatting without writing |
| `task test` | Run a production build as validation |
| `task clean` | Remove `dist/`, `build/`, `node_modules/`, lockfile |
| `task quick-start` | Install deps and start the dev server |
| `task help` | List available Task commands |

Full definitions live in [`Taskfile.yml`](Taskfile.yml).

## Flashcard data

- Bank JSON lives in `public/*.json`.
- Validate with `task validate` (also runs as part of `task build` and the pre-commit hook).

## Pre-commit

Husky runs on every commit:

1. `lint-staged` — ESLint/Prettier on staged `src` files
2. `npm run validate:flashcards` — same check as `task validate`
