# Topp 10
Enkelt og morsomt kategorispill!
Man får poeng ut ifra hvilket nummer på listen man greier å gjette!
https://toppti.nordby.dev/

Utgaver: VM 2026, Sommer 2024, Normal og Jul 2023 (velges under «Innstillinger»).

## Dev
For å kjøre dev server lokalt:
```npm run dev```

For å sjekke koden:
```npm run lint```

Tester (Jest for data og hjelpefunksjoner, Playwright for selve spillet på mobil og PC):
```npm test```
```npx playwright install chromium   # første gang
npm run test:e2e```

Spørsmålene ligger i `src/categories.js`, og utgavene (tema og farger) i `src/App.jsx`.

Testene kjøres også automatisk før hver commit (`.githooks/pre-commit`, slås på av `npm install`).

## Deploy
Push til `main` deployer automatisk til GitHub Pages via GitHub Actions (`.github/workflows/deploy.yml`). Lint og alle tester kjøres først, og deploy stopper hvis noe feiler.
