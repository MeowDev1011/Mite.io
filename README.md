# Mite.io 🧫🧬🎮 — Evolution action inside the bloodstream (EPIC EDITION) 🎉🎉🎉

![Logo Mite.io](mite_io_logo.png)

[![Play Online](https://img.shields.io/badge/Play%20Online-mite--io.ai.studio-brightgreen)](https://mite-io.pages.dev/)
[![License: Apache-2.0](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://github.com/MeowDev1011/Mite.io/blob/main/LICENSE)
[![Top Language](https://img.shields.io/github/languages/top/MeowDev1011/Mite.io)](https://github.com/MeowDev1011/Mite.io)
[![Repo Size](https://img.shields.io/github/repo-size/MeowDev1011/Mite.io)](https://github.com/MeowDev1011/Mite.io)

Mite.io is a fast-paced browser survival/evolution game set inside a living bloodstream. Grow by absorbing cells, split to attack or escape, avoid antibodies, and evolve your microbe to dominate the arena. This README is the long, emoji-rich, gamer-friendly edition — because games are fun! 😺🚀🦠

---

## Table of Contents 📚
1. What this is
2. Fautures (yes, Fautures — we like it) 🎯
3. Deep game details (mechanics & systems)
4. Repo layout & important files
5. How to run (dev & prod)
6. Controls & mobile play
7. Agent & integration pointers (see AGENTS.md)
8. Development + CI (see DEV.md)
9. Contributing, credit & support
10. Troubleshooting & FAQs
11. Live demo

---

## 1) What this is — Short Pitch 🧠
Mite.io is an arcade-style survival game: quick matches, emergent combat, and build variety via evolution (mutations). The player controls a microbe inside the bloodstream; gameplay emphasizes risk vs reward, positioning, and skillful use of split/eject mechanics. Perfect for short sessions and repeated mastery. 🎮⏱️

---

## 2) FAUTURES (BIG LIST — ALL THE THINGS) ✨🔥🎉
(We intentionally write "Fautures" — because you asked, and it's fun.)

- 🧠 Core engine: deterministic-ish canvas simulation (30–60+ FPS depending on device)
- 🚀 Split mechanic: split into multiple cells for offense/defense
- 💥 Eject mass: push mass as projectiles or feed allies
- 🧬 Mutations & evolution: choose upgrades mid-session, build synergies (speed, regen, mass-to-speed conversion)
- 🤖 AI bots: multiple bot archetypes (predator, grazer, kamikaze, evasive)
- 🎨 Skins & cosmetics: color palettes, patterns, special skins
- 🏷️ Store: spend local currency (cytes) for cosmetics
- 🏆 Achievements: progress & toasts, persistent local unlocks
- 🌍 i18n: translation support + device language detection
- 📱 Mobile-first controls: touch steering + adaptive HUD
- 🎧 Sound: SFX, music, mute & volume settings, mobile autoplay safe
- 🧰 Performance: object pooling, spatial partitioning, optimized collision checks
- 🔁 Replays: (planned) snapshot/replay for debugging and sharing

---

## 3) Deep game details (systems & mechanics) 🔬
Below are the primary systems and how they interact. This is useful for contributors, modders, or agent authors.

Gameplay loop
- Spawn in arena → roam and eat smaller cells → grow mass → split or eject to interact → race for leaderboard.

Mass & physics
- Mass determines radius/area and influences speed: heavier microbes are slower.
- Splitting divides mass between pieces (rounded). Recombination occurs over time when pieces are sufficiently close.
- Ejecting mass reduces own mass and creates small projectile entities.

Mutations & progression
- Mutations are one-time session upgrades. Example mutation categories:
  - Movement (speed, acceleration)
  - Combat (split damage multiplier, projectile mass)
  - Defense (regen, shield on spawn)
  - Utility (faster recombine, larger eject)

AI behavior
- Bots use simple behavior trees: seek food, avoid larger threats, chase smaller prey, or perform kamikaze runs based on archetype.

Economy & cosmetics
- Cytes are earned through play (achievements, time alive, kills) and stored locally.
- Store is cosmetic-only — no pay-to-win mechanics.

---

## 4) Repository layout & important files 📁
(Full list inside README header; here are files to inspect first)
- `src/game/engine.ts` — main loop, entity updates, physics, spawn rules
- `src/game/types.ts` — shared types and interfaces
- `src/components` — UI layer: TitleScreen, HUD, Modals
- `src/storage/profileStorage.ts` — local persistence logic
- `src/audio/soundEngine.ts` — audio handling and mobile policies

---

## 5) How to run — Dev & Production 🧰
Requirements: Node.js 18+, npm/pnpm/yarn.

Local dev
```bash
git clone https://github.com/MeowDev1011/Mite.io.git
cd Mite.io
npm install
cp .env.example .env # optional
npm run dev
# open http://localhost:3000
```

Build & preview
```bash
npm run build
npm run preview
```

---

## 6) Controls & Mobile Play 🕹️📱
- Mouse: aim (pointer direction)
- Space: split — release a child cell
- W: eject mass / spore
- Escape: pause / menu
- Touch: tap/drag to aim, on-screen split/eject buttons

Accessibility notes
- Volume and mute toggles available in HUD
- Language selection in Title screen (i18n)

---

## 7) Agents & integrations (summary) 🤖 — see AGENTS.md for full spec
- Agents can be Bot Agents, Observer Agents, Controller Agents, or Test Agents.
- Agent API: sendInput({aim,split,eject}), get snapshots, subscribe to events.
- Remote agents: use compact WebSocket snapshots with tick alignment.

See AGENTS.md for TypeScript interfaces, JSON schemas, WS examples, and a minimal headless bot.

---

## 8) Development & CI — quick note 👷 — see DEV.md for full guide
- Use `npm run lint` and `npm run build` before PRs.
- Suggested CI: GitHub Actions running lint & build. Consider adding headless smoke tests.

---

## 9) Contributing, credits & support ❤️
Contributions welcome: code, art, audio, testing, translations.
- Open an issue describing your idea, attach mockups or audio previews if relevant.
- Small PRs are easiest to review. Add tests when changing core logic.

Credits & attribution
- Lead: MeowDev1011 — design & engineering 😺
- Icons: lucide-react
- Styling: Tailwind CSS
- Logo: `mite_io_logo.png` (add credit in PR if not original)

How to support
- Star the project ⭐️ https://github.com/MeowDev1011/Mite.io
- Sponsor / donate: add link in README or via GitHub Sponsors

---

## 10) Troubleshooting & FAQs 🛠️
Q: Why is audio not playing on mobile? A: Mobile browsers require user interaction before audio playback — interact with the page to unlock audio. 🎧
Q: Why does the license badge say "not specified" sometimes? A: shields.io cache or missing LICENSE in default branch — we include a static Apache-2.0 badge linking to LICENSE.

---

## 11) Live demo & links 🚀
- Play online: https://mite-io.pages.dev/  
- Repo: https://github.com/MeowDev1011/Mite.io  
- Dev guide: https://github.com/MeowDev1011/Mite.io/blob/main/DEV.md  
- Agents guide: https://github.com/MeowDev1011/Mite.io/blob/main/AGENTS.md

---

If you want even more emoji density (one per line!), or a FULL gameplay design document (GDD) with maps, spawn tables, balance equations, and mutation trees — say the word and I’ll generate a long-form GDD next. 🎮📄🔥
