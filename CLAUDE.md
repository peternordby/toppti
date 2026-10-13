# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

"Topp 10" is a Norwegian party trivia game: each round shows a category with a hidden top-10 list. Players guess, and an answer scores the number of its position (#10 = 10 points). It is a static React + Vite single-page app, deployed at https://toppti.nordby.dev/.

## Commands

- `npm run dev`: dev server (`host: true`, so it is reachable from other devices on the LAN)
- `npm run build`: production build to `dist/`
- `npm run lint`: ESLint with `--max-warnings 0`, so any warning fails. It only covers `src/`. `react-refresh/only-export-components` means helpers exported for tests go in their own module (e.g. `src/answers.js`), not in `App.jsx`.
- `npm test`: Jest unit tests in `tests/unit/` (plain ESM, no Babel; runs through `node --experimental-vm-modules`). They check the question data in `categories.js` (10 answers each, no unknown keys such as a `kilder` typo, valid URLs) and `src/answers.js`. Run one file with `npm test -- tests/unit/answers.test.js`.
- `npm run test:e2e`: Playwright tests in `tests/e2e/` against a production build served by `vite preview` on port 4173. Projects: `mobile` (390×844), `small-phone` (375×667) and `desktop`. Run one with `npx playwright test --project=mobile -g "fits"`. Run `npx playwright install chromium` once first.
- A pre-commit hook (`.githooks/pre-commit`) runs lint, Jest and Playwright, taking about 10 s. `npm install` turns it on through the `prepare` script (`core.hooksPath`). Skip it with `git commit --no-verify`.
- One e2e test asserts that all 10 answers plus «Ikke på listen» fit above the bottom nav on every Normal question with 10 teams. Long new answers or extra UI above the list can break it.

Deployment happens through GitHub Actions (`.github/workflows/deploy.yml`) on every push to `main`. Pushing to `main` is a production release. The workflow runs lint, Jest and Playwright first, and any failure blocks the deploy. The site is served from the root of the custom domain `toppti.nordby.dev`, set under the repo's Settings → Pages, so `vite.config.js` uses `base: '/'`.

## Architecture

The app is two files:

- **`src/App.jsx`**: a single component with all game logic.
  - A `gamestate` string switches the screens: `start`, `teams` (the host enters team names), `rules`, `settings`, `started`, `finished`.
  - The host app tracks multiple teams. `results[questionIndex][teamIndex] = { place }`, and scores are derived by summing `place` (place = points, 0 = not on the list). Nothing is persisted, so a page reload loses the game. When `scoring` is false («Spill uten poeng»), no teams are tracked: answer rows render as plain `div`s, and there is no Stilling button, team switcher or «Ikke på listen» row.
  - The `THEMES` object defines each "edition" (utgave): label, title, subtitle and CSS colour variables, which are written onto `:root` when the theme changes.
- **`src/categories.js`**: all questions, keyed by edition. **The keys must match the `THEMES` keys in `App.jsx`**: adding an edition means adding an entry to both. `default` is the "normal mode" (labelled Normal).

Each question has this shape:

```js
{ id, navn, fasit: [10 strings, #1 first], kilde: '<source URL>', år: '<year of the data>' }
```

`App.jsx` renders `kilde` and `år` as the source link under the answers.

## Content conventions

- All UI text and question text are in Norwegian (bokmål). Country and language names in `fasit` are in Norwegian (e.g. `Kina`, `Etiopia`), while titles of films, songs and shows keep their original names.
- When updating a `fasit`, also update `kilde` and `år` to match the source the list came from. If a ranking changes daily (market caps, wealth), put the date in `navn`, e.g. `(per oktober 2026)`.
- The `vm2026` and `default` editions put the value after each answer (e.g. `'Erling Haaland (55)'`, `'India (1,48 mrd.)'`), using Norwegian number formatting. The other editions list names only.
