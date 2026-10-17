# Mite.io 🧫🧬 — Evolution action inside the bloodstream

![Logo Mite.io](mite_io_logo.png)

[![Play Online](https://img.shields.io/badge/Play%20Online-mite--io.ai.studio-brightgreen)](https://mite-io.pages.dev/)
[![License](https://img.shields.io/github/license/MeowDev1011/Mite.io?style=flat-square)](https://github.com/MeowDev1011/Mite.io/blob/main/LICENSE)
[![Top Language](https://img.shields.io/github/languages/top/MeowDev1011/Mite.io?style=flat-square)](https://github.com/MeowDev1011/Mite.io)
[![Repo Size](https://img.shields.io/github/repo-size/MeowDev1011/Mite.io?style=flat-square)](https://github.com/MeowDev1011/Mite.io)
[![TypeScript](https://img.shields.io/badge/TypeScript-%E2%9D%A4-blue?style=flat-square)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-Ready-brightgreen?style=flat-square)](https://vitejs.dev/)

Mite.io is an action growth/evolution game set inside the bloodstream. Grow by absorbing cells, split to attack or escape, avoid antibodies, and compete to dominate the environment. 🎮🧪

Play now: https://mite-io.pages.dev/
---

## Table of Contents
- What this is
- Features (expanded)
- Repository structure
- How to run (dev & prod)
- Controls
- Key files and architecture
- Contributing
- Troubleshooting
- License & credits (expanded)

---

## What this is
Mite.io is a fast-paced action game that combines growth mechanics, splitting, and evolution choices (mutations). It’s implemented with TypeScript, React, and Vite. The client runs a canvas-based simulation with an emphasis on smooth performance, responsive controls, and emergent multiplayer-like bot interactions.

---

## Features (expanded)
- 60 FPS canvas renderer with a custom lightweight game engine (entities: player, bots, antibodies).
- Evolution / mutation system: make choices during gameplay that permanently alter abilities or stats for that session (speed, mass conversion, defensive traits).
- Splitting mechanic: split to attack other microbes or to escape dangerous situations; split mass distribution and recombination behavior.
- Mass ejection / spore mechanic: eject mass to feed or to create projectiles.
- AI-driven bots with varied behaviors and procedurally generated bot names.
- Achievements system with unlock notifications and progress tracking.
- In-game store where players can spend "cytes" (local currency) to buy skins and cosmetic upgrades.
- Skins and visual customization (color palettes, patterns) with preview in the UI.
- Local profile storage (cytes balance, selected skin, preferred language, achievements) using browser localStorage.
- Sound engine with mute toggle, volume settings, and mobile autoplay handling.
- Internationalization support with device language detection and a simple translation lookup table.
- Responsive UI and touch controls for mobile devices (touch heading, virtual steering, and mobile HUD layout).
- Pause, tutorial, and step-by-step onboarding for new players.
- Leaderboard snapshot (local/session-based) and in-game stat HUD (size, speed, nearby threats).
- Achievement toasts and modular modal system for UI: Evolution choices, Shop, Skins, Achievements, Pause, Game Over.
- Optimized rendering with object pooling and efficient collision checks for stable performance in browsers.

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

How it fits together: App.tsx creates a GameEngine instance (src/game/engine.ts). The engine runs the simulation and calls React callbacks (onStatsUpdate, onLeaderboardUpdate, onAchievementUnlocked), while React handles rendering UI overlays and modals.

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
The project is distributed under the Apache-2.0 license. See LICENSE in the repository root for full terms and contributor guidance.

---

## Credits & Resources (expanded)
This section lists the main libraries, assets, and contributors that made Mite.io possible. If you used or modified any asset or third-party code, make sure to follow its license and attribution requirements.

Core technologies
- TypeScript — language used across the client and game code (static types and safer tooling).
- React — UI and component rendering.
- Vite — fast development server and build tool.
- Tailwind CSS — utility-first styling for UI components.

Libraries and utilities
- lucide-react — vector icons used in the UI.
- tinycolor2 or similar (if used) — color utilities for skins and palettes.
- Any bundler plugins or helper libs referenced in package.json.

Assets
- Logo: `mite_io_logo.png` — original artwork included in repo. If the logo was created by a third party, please credit the artist here.
- Sound effects and music — ensure third-party audio assets have proper attribution and license details. If you added sounds from free libraries (e.g., freesound.org, opengameart.org), list them with author and URL here.

Contributors
- MeowDev1011 — primary author and maintainer (code, design, game rules).
- Additional contributors (please add your GitHub handle and role):
  - @your-contributor-handle — role / what they contributed

Acknowledgements
- Community testers and early playtesters that provided bug reports and balance feedback.
- Inspiration: .io games that mix growth and splitting mechanics.

How to add credits
- If you contributed art, music, or code, please open a PR to add your name and what you contributed under "Contributors" above. Include links to your portfolio or license if required.

Third-party licenses
- This project bundles or references third-party libraries. Check each package.json dependency for license details. When redistributing assets, ensure you comply with their license terms.

---

## Live demo
Play online: https://mite-io.pages.dev/
Repo: https://github.com/MeowDev1011/Mite.io
