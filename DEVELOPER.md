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
| `task bump-patch` | Raise the patch version (also `bump-minor`, `bump-major`) |
| `task version-check` | Check the version was raised above the base branch |
| `task clean` | Remove `dist/`, `build/`, `node_modules/`, lockfile |
| `task quick-start` | Install deps and start the dev server |
| `task help` | List available Task commands |

Full definitions live in [`Taskfile.yml`](Taskfile.yml).

## Versioning and releases

`package.json` is the source of truth for the release number. The app prints it in the bottom corner of the homepage, linked to the matching GitHub release, so you can tell at a glance which version is live.

Every pull request must raise the version:

```sh
task bump-patch   # or bump-minor / bump-major
```

That rewrites `package.json` and `package-lock.json` without tagging; commit the change alongside your work. CI fails a pull request whose version still matches the base branch or reuses a tag that already exists. Run `task version-check` locally to see the same result.

What happens once the change lands:

| Event | Result |
| --- | --- |
| Pull request merged into the mainline | A release `vX.Y.Z` is created and published to GitHub Pages |
| Commit pushed straight to the mainline | Release `vX.Y.Z` is recreated at that commit and the site is rebuilt |
| Release created by hand in GitHub | The site is rebuilt and published from that tag |

Pushing on its own never changes what is live: [`build.yml`](.github/workflows/build.yml) only lints, builds, and checks the version, while [`release.yml`](.github/workflows/release.yml) cuts the release and [`deploy.yml`](.github/workflows/deploy.yml) publishes it.

Hotfixes pushed directly to the mainline keep their version number on purpose, so the release for that version is replaced in place rather than adding a new one. Bump the version instead whenever you want a distinct release.

## Flashcard data

- Bank JSON lives in `public/*.json`.
- Validate with `task validate` (also runs as part of `task build` and the pre-commit hook).

## Pre-commit

Husky runs on every commit:

1. `lint-staged` — ESLint/Prettier on staged `src` files
2. `npm run validate:flashcards` — same check as `task validate`
