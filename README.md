# Mite.io 🧫🧬 — Evolution action inside the bloodstream

[![Play Online](https://img.shields.io/badge/Play%20Online-mite--io.ai.studio-brightgreen)](https://mite-io.pages.dev/)
[![License](https://img.shields.io/github/license/MeowDev1011/Mite.io)](https://github.com/MeowDev1011/Mite.io/blob/main/LICENSE)
[![Top Language](https://img.shields.io/github/languages/top/MeowDev1011/Mite.io)](https://github.com/MeowDev1011/Mite.io)
[![Repo Size](https://img.shields.io/github/repo-size/MeowDev1011/Mite.io)](https://github.com/MeowDev1011/Mite.io)
[![TypeScript](https://img.shields.io/badge/TypeScript-%E2%9D%A4-blue)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-Ready-brightgreen)](https://vitejs.dev/)

Mite.io is an action growth/evolution game set inside the bloodstream. Grow by absorbing cells, split to attack or escape, avoid antibodies, and compete to dominate the environment. 🎮🧪

Play now: https://mite-io.pages.dev/
---

## Table of Contents
- What this is
- Features
- Repository structure
- How to run (dev & prod)
- Controls
- Key files and architecture
- Contributing
- Troubleshooting
- License & credits

---

## What this is
Mite.io is a fast-paced action game that combines growth mechanics, splitting, and evolution choices (mutations). It’s implemented with TypeScript, React, and Vite. The client runs a canvas-based game engine at 60 FPS and provides UI for skins, shop, achievements, and localization.

---

## Features
- 60 FPS canvas renderer with a custom game engine (entities: player, bots, antibodies)
- Evolution / mutation choices that change player abilities
- Achievements, store, and customizable skins
- Local profile storage (cytes balance, selected skin, preferred language)
- Sound engine with mute toggle
- Internationalization support with device language detection

---

## Repository layout (important files)
```
package.json                 # scripts & deps (Vite, React, Tailwind, etc.)
index.html                  # entry point HTML
vite.config.ts              # Vite configuration
.tsconfig.json              # TypeScript config
.env.example                # example env vars
mite_io_logo.png            # logo image
src/
  main.tsx                  # React entry: createRoot -> App
  App.tsx                   # Orchestrator: mounts GameEngine and UI components
  index.css                 # global styles (Tailwind + custom)
  audio/
    soundEngine.ts          # sound manager (play, mute)
  game/
    engine.ts               # GAME ENGINE: loop, entities, physics, bots (core logic)
    types.ts                # shared TS types (GameState, GameStats, MutationId...)
    constants.ts            # game constants
    skins.ts                # skin definitions and colors
    bacteria.ts             # bot / bacteria logic
    achievements.ts         # achievement definitions/logic
    botNames.ts             # bot name generator
  components/
    TitleScreen.tsx         # start screen UI
    GameHUD.tsx             # in-game HUD (radar, controls)
    GameOverModal.tsx       # end-of-game modal
    PauseModal.tsx          # pause menu
    EvolutionModal.tsx      # pick mutation modal
    ShopModal.tsx           # shop UI
    SkinsModal.tsx          # skin selector
    TutorialModal.tsx       # step-by-step tutorial
    AchievementsModal.tsx   # achievements gallery
    AchievementToast.tsx    # achievement popup
  storage/
    profileStorage.ts       # local profile persistence (localStorage)
  i18n/
    languages.ts            # translations & language detection
```

How it fits together: App.tsx creates a GameEngine instance (src/game/engine.ts). The engine runs the simulation and calls React callbacks (onStatsUpdate, onLeaderboardUpdate, onAchievementUnlocked, etc.). UI components read profileStorage for preferences and trigger engine actions (split, eject, pause).

---

## How to run (quick)
Requirements: Node.js (v18+ recommended) and npm/pnpm/yarn.

Clone and install:
```bash
git clone https://github.com/MeowDev1011/Mite.io.git
cd Mite.io
npm install
```

Create an env file if needed:
```bash
cp .env.example .env
```

Development (Vite, port 3000):
```bash
npm run dev
# open http://localhost:3000
```

Build and preview production:
```bash
npm run build
npm run preview
```

Useful npm scripts (from package.json):
- dev: vite --port=3000 --host=0.0.0.0
- build: vite build
- preview: vite preview
- clean: rm -rf dist server.js
- lint: tsc --noEmit

---

## Controls
- Movement: aim with mouse (mouse steering)
- Split: Spacebar (split your microbe to attack or evade)
- Eject mass / spore: W
- Pause / Menu: Escape
- Mobile: touch controls supported (touch heading / virtual steering)

---

## Key files & architecture (what I inspected)
- src/game/engine.ts — core game loop and simulation (entities, collision, bot AI). This file contains the main runtime logic.
- src/game/types.ts — shared TypeScript types used across engine and UI.
- src/audio/soundEngine.ts — central sound control used by App and engine.
- src/storage/profileStorage.ts — reads/writes local profile (cytes, skins, language). Useful for restoring user preferences.
- src/components/* — UI components that render TitleScreen, HUD, and modals. App.tsx wires engine callbacks to these components.
- src/game/skins.ts — skin definitions; updating this changes the player appearance.
- src/game/achievements.ts — achievement rules and triggers.

Integration points:
- engine.onStatsUpdate → updates HUD and mini-map
- engine.onAchievementUnlocked → triggers AchievementToast
- profileStorage.getProfile() → used by HUD and to re-apply skins

---

## Contributing
Contributions welcome! Please open issues for bugs or feature requests and make small, focused PRs.

Before submitting a PR:
- Run `npm run lint` (tsc --noEmit)
- Ensure the change is scoped and tested locally (run dev and smoke test)

PR template suggestion (include in CONTRIBUTING.md):
- Summary of change
- Motivation
- Files changed
- How to test

I can add CONTRIBUTING.md and ISSUE/PR templates if you want.

---

## Troubleshooting
- Canvas not rendering: confirm #root exists and main.tsx mounts createRoot; check console for runtime errors.
- Sounds not playing on mobile: autoplay policies require a user interaction before audio playback.
- Profile not persisting: check browser localStorage permissions.

---

## License
The code contains Apache-2.0 license headers in files. Check LICENSE in repo root for full terms.

---

## Credits & Resources
- Built with TypeScript + React + Vite
- UI icons: lucide-react
- Styling: Tailwind (setup present in package.json)
- Logo: mite_io_logo.png

---

## Live demo
Play online: https://mite-io.pages.dev/
Repo: https://github.com/MeowDev1011/Mite.io
