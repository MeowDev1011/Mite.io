# DEV.md — Mite.io: Developer Guide (Professional & Technical) 🛠️👨‍💻

Purpose
- Developer reference: setup, architecture, contribution workflow, CI suggestions, and recommended test strategies.

Quick links (permanent)
- Repo: https://github.com/MeowDev1011/Mite.io  
- README: https://github.com/MeowDev1011/Mite.io/blob/main/README.md  
- Engine: https://github.com/MeowDev1011/Mite.io/blob/main/src/game/engine.ts  
- Types: https://github.com/MeowDev1011/Mite.io/blob/main/src/game/types.ts  
- Profile storage: https://github.com/MeowDev1011/Mite.io/blob/main/src/storage/profileStorage.ts  
- Package: https://github.com/MeowDev1011/Mite.io/blob/main/package.json

Requirements
- Node.js 18+ (LTS recommended)  
- npm / pnpm / yarn  
- Optional: VSCode + TypeScript, ESLint, Prettier extensions

Local setup
1. git clone https://github.com/MeowDev1011/Mite.io.git  
2. cd Mite.io  
3. npm install  
4. cp .env.example .env (if needed)  
5. npm run dev (opens at http://localhost:3000)

Scripts
- dev — vite dev server  
- build — production build  
- preview — preview build  
- lint — tsc --noEmit  
- (add) test — unit / integration test runner (Vitest/Jest) recommended

Project layout & responsibilities
- src/game — engine.ts (loop), types.ts, constants.ts, skins, AI/bot logic  
- src/components — UI: TitleScreen, HUD, Modals  
- src/audio — soundEngine.ts, assets  
- src/storage — profile persistence  
- src/i18n — languages & detection

Development workflow
- Fork (recommended) → branch feature/xxx → small focused PRs  
- Run lint & build before opening PR: npm run lint && npm run build  
- PR template should include summary, motivation, files changed, testing steps

Coding standards & tests
- TypeScript types for shared models in src/game/types.ts  
- Isolate side effects (storage, audio) behind small adapters  
- Add unit tests for pure logic (collision math, mutation application)  
- Use lightweight integration tests for engine tick progression in headless mode

CI recommendations
- GitHub Actions:
  - jobs: lint (tsc), build (vite build), optional test job
  - Run on PRs and push to main
- Optionally add a `playtest` job that runs a headless simulation smoke test for regressions

Assets & licensing
- Add asset metadata (author, license, source) in ASSETS.md or credits section.  
- Respect third-party licenses and list them in Credits.

How to contribute non-code
- Art/audio: open an issue with samples, then PR adding files under /public/assets or /assets plus Credits entry.  
- Docs: PRs are welcome for README, AGENTS.md, DEV.md, and CONTRIBUTING.md.

Encouragement
- Add "good first issue" tasks for newcomers. We accept small fixes, docs, and asset contributions. Open an issue if you want to help but need guidance.

Need more?
- I can add:
  - A GitHub Actions workflow example
  - A minimal Vitest/Jest test template
  - JSON schemas for agent telemetry and event payloads
  - CONTRIBUTING.md and ISSUE/PR templates

---

If these look good, tell me which edits to apply to AGENTS.md (tone, extra schemas, or examples) and whether I should create both files in the repository now.
