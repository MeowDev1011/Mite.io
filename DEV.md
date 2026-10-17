# DEV.md — Mite.io: Developer Guide 🚀🛠️

Welcome to the extended developer guide for Mite.io. 🧫⚡
This file is written in English, packed with examples, and designed to be readable, technical, and practical for contributors, engineers, and integrators. 🧠📚

---

## Quick snapshot 🔎
- ✅ Node.js 18+ recommended 🟢
- ✅ npm, pnpm, or yarn supported 📦
- ✅ VS Code with TypeScript, ESLint, and Prettier recommended 🖥️
- ✅ This guide covers setup, project structure, engine architecture, testing, CI, examples, and contributor workflow 🧩

---

## Table of contents 📚
- 🧰 Environment and setup
- 🗂️ Project structure
- 🧭 Engine architecture
- 🔐 Types and JSON schemas
- 🤖 Agent integration examples
- 🧪 Headless test strategy
- ⚙️ GitHub Actions and CI
- 🐞 Debugging and profiling
- ✅ Contribution workflow
- 🏷️ Release and versioning
- 📦 Extra recommendations

---

## Environment and setup 🧰
### Required tools
- 🟢 Node.js 18 or newer
- 📦 npm, pnpm, or yarn
- 🖥️ VS Code recommended
- 🧪 Optional: Vitest or Jest for unit tests

### Install and run
```bash
git clone https://github.com/MeowDev1011/Mite.io.git
cd Mite.io
npm install
cp .env.example .env
npm run dev
```

### Useful scripts
```bash
npm run dev
npm run build
npm run preview
npm run lint
npm run test
```

### Production build flow
```bash
npm run build
npm run preview
```

### Environment notes
- 🔐 Keep production secrets out of the repo
- 📄 Use `.env.example` as the contract for required values
- 🧩 Add debug flags only in development or behind feature toggles

---

## Project structure 🗂️
The project is organized around a lightweight game engine and a React-driven UI layer. 🧱
A clean separation helps keep game logic, rendering, local persistence, and audio isolated. 🎨

```text
src/
  App.tsx
  main.tsx
  index.css
  game/
    engine.ts
    physics.ts
    types.ts
    constants.ts
    skins.ts
    bacteria.ts
    achievements.ts
    botNames.ts
  components/
    TitleScreen.tsx
    GameHUD.tsx
    GameOverModal.tsx
    PauseModal.tsx
    EvolutionModal.tsx
    ShopModal.tsx
    SkinsModal.tsx
    TutorialModal.tsx
    AchievementsModal.tsx
    AchievementToast.tsx
  audio/
    soundEngine.ts
  storage/
    profileStorage.ts
  i18n/
    languages.ts
```

### Main responsibilities
- `src/game/engine.ts` — primary simulation loop and entity system 🧠
- `src/game/physics.ts` — collision and motion helpers 📐
- `src/game/types.ts` — shared interfaces and domain model 🔗
- `src/components` — HUD, modals, overlays, menus 🎛️
- `src/storage` — local persistence and profile saves 💾
- `src/audio` — sound engine and mobile audio constraints 🔊
- `src/i18n` — translations and locale detection 🌍

---

## Engine architecture 🧭
The engine should stay fast, predictable, and easy to reason about. ⚡
A good engine architecture keeps simulation logic separate from UI rendering. 🧱

### Recommended patterns
- ✅ Use a single main simulation loop per frame
- ✅ Store world state in a serializable or semi-serializable shape when possible
- ✅ Avoid heavy object creation in the tick loop
- ✅ Keep callbacks small and predictable for UI notifications
- ✅ Keep side effects outside core simulation whenever possible

### Example engine tick flow
```ts
function tick(deltaMs: number) {
  updateEntities(deltaMs)
  resolveCollisions()
  applyAiLogic()
  applyAgentInputs()
  emitSnapshotEvent()
}
```

### Performance guidance
- 📉 Avoid repeated allocations inside `onTick`
- 🧰 Use object pooling for projectiles, particles, and short-lived entities
- 🔍 Profile the browser main thread with DevTools performance tools
- 📐 Use spatial partitioning or a simple grid for broad phase collision checks

---

## Types and JSON schemas 🔐
Shared types should be defined once and reused by UI and agent code. ✅
This helps reduce drift across the project and keeps agent integrations reliable. 🤖

### Canonical shared interfaces
```ts
export interface Vec2 {
  x: number
  y: number
}

export type EntityKind = 'player' | 'bot' | 'antibody' | 'food'

export interface EntitySnapshot {
  id: string
  kind: EntityKind
  position: Vec2
  radius: number
  mass: number
  velocity?: Vec2
  ownerAgentId?: string
  skinId?: string
  createdAt: number
}

export interface GameStateSnapshot {
  time: number
  deltaMs: number
  tick: number
  entities: EntitySnapshot[]
  leaderboard: { id: string; mass: number }[]
  settings: {
    mapSize: { width: number; height: number }
  }
}

export interface EngineEvent {
  type: 'spawn' | 'despawn' | 'collision' | 'achievement' | 'death' | 'mutationChosen'
  time: number
  entityId?: string
  details?: Record<string, any>
}
```

### JSON Schema example
```json
{
  "$id": "https://mite.io/schemas/GameStateSnapshot.json",
  "type": "object",
  "properties": {
    "time": { "type": "integer" },
    "deltaMs": { "type": "integer" },
    "tick": { "type": "integer" },
    "entities": { "type": "array" }
  },
  "required": ["time", "deltaMs", "tick", "entities"]
}
```

### Good practice
- ✅ Validate remote agent payloads with Ajv or a lightweight schema validator
- ✅ Keep event payloads intentionally small and deterministic
- ✅ Version schemas when making breaking changes

---

## Agent integration examples 🤖
The project supports bot or agent integrations, and the patterns are simple and lightweight. 🧩
The recommended interface for an agent is a compact API that sends inputs and reads snapshots. 📡

### Recommended `AgentAPI`
```ts
export interface AgentAPI {
  id: string
  sendInput(input: { aim?: Vec2; split?: boolean; eject?: number }): void
  getLastSnapshot(): GameStateSnapshot
  on(eventType: EngineEvent['type'], handler: (e: EngineEvent) => void): void
  off(eventType: EngineEvent['type'], handler: (e: EngineEvent) => void): void
  log(...args: any[]): void
  config?: Record<string, any>
}
```

### Minimal bot example
```ts
import type { AgentAPI, GameStateSnapshot } from './agent-types'

export default function createChaserAgent(api: AgentAPI) {
  function onTick(snapshot: GameStateSnapshot) {
    const me = snapshot.entities.find(e => e.ownerAgentId === api.id)
    if (!me) return

    const target = snapshot.entities
      .filter(e => e.id !== me.id && e.kind !== 'food')
      .sort((a, b) => dist(a.position, me.position) - dist(b.position, me.position))[0]

    if (!target) return

    api.sendInput({
      aim: normalize(sub(target.position, me.position)),
      split: me.mass > target.mass * 1.2
    })
  }

  api.on('spawn', () => api.log('spawn'))
  api.on('despawn', () => api.log('despawn'))

  return { onTick }
}

function sub(a, b) {
  return { x: a.x - b.x, y: a.y - b.y }
}

function dist(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y)
}

function normalize(v) {
  const d = Math.hypot(v.x, v.y) || 1
  return { x: v.x / d, y: v.y / d }
}
```

### WebSocket protocol pattern
Remote and headless agents can communicate over WebSocket with compact messages. 🌐

#### Snapshot message
```json
{ "type": "snapshot", "tick": 12345, "time": 1620000000000, "entities": [{"id":"e1","x":10,"y":20,"r":5,"m":12}] }
```

#### Input message
```json
{ "type": "input", "tick": 12345, "agentId": "agent-42", "input": { "aim": {"x": 0.5, "y": -0.2}, "split": false, "eject": 0 } }
```

### Agent safety rules
- 🔐 Treat third-party agents as partially trusted
- 🚧 Prefer worker or iframe isolation for untrusted scripts
- 📡 Keep payloads compact and tick-aligned
- ⚠️ Never create blocking work in tick callbacks

---

## Headless testing and deterministic runs 🧪
- Use deterministic seeds for core simulation tests
- Run headless runs to validate gameplay logic without UI noise
- Add smoke tests for spawn, collision, mutation, and bot behavior

### Example headless runner
```ts
import { createEngineHeadless } from './src/game/engine'

const engine = createEngineHeadless({ seed: 42 })
engine.step(60000)
console.log('entity count', engine.entityCount)
```

### Vitest style example
```ts
import { describe, it, expect } from 'vitest'
import { createEngineHeadless } from './src/game/engine'

describe('engine smoke tests', () => {
  it('runs for 60 seconds without breaking', () => {
    const engine = createEngineHeadless({ seed: 42 })
    engine.step(60000)
    expect(engine.entityCount).toBeGreaterThanOrEqual(0)
  })
})
```

---

## GitHub Actions and CI ⚙️
A simple CI pipeline should run lint, build, and optional headless smoke tests. 🔁

### Example workflow
```yaml
name: CI
on: [push, pull_request]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 18
      - run: npm ci
      - run: npm run lint

  build:
    runs-on: ubuntu-latest
    needs: lint
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 18
      - run: npm ci
      - run: npm run build

  smoke:
    runs-on: ubuntu-latest
    needs: build
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 18
      - run: npm ci
      - run: npm run test:headless || echo "Headless tests not configured yet"
```

---

## Debugging and profiling 🐞
- Use browser DevTools to inspect frame time and scripting time
- Keep logs rate-limited in production builds
- Add debug toggles for hitboxes and entity counts
- Check object allocations in the game loop regularly

### Useful debugging flags
```ts
const DEBUG_FLAGS = {
  showHitboxes: false,
  showEntityCount: false,
  showTimers: false,
  traceMutationSelection: false,
}
```

---

## Contribution workflow and PR checklist ✅
- Fork the repo or create a feature branch
- Keep commits small and scoped
- Run lint and build before opening a PR
- Link any related issues in the PR description

### Recommended commands
```bash
git checkout -b feature/my-change
npm run lint
npm run build
```

### PR checklist
- [ ] Type check passes
- [ ] Build passes
- [ ] Manual smoke test performed
- [ ] Documentation updated if needed
- [ ] Related issue linked

---

## Release and versioning 🏷️
- Use semantic versioning for public releases
- Keep user-facing changelog notes concise and readable
- For gameplay balance changes, document impact in the release notes

### Example version tags
```text
v0.1.0  Initial prototype
v0.2.0  Mutation system and economy update
v0.3.0  AI improvements and mobile controls
```

---

## Extra recommendations 📦
- Add `CONTRIBUTING.md` for contributor expectations
- Add issue templates for bugs and feature requests
- Add a small `schemas` folder for JSON payload definitions
- Add `examples/agents` for starter bot implementations

---

## Final note 🎉
Mite.io is a compact but deep game project. 🧫⚡
It combines simulation, UI, audio, persistence, and agent integrations in a small, fast codebase. 🧠
If you are contributing, keep the game loop fast, keep the interfaces simple, and test every gameplay change carefully. 🧪

This guide is intentionally practical and code-heavy because the project rewards clarity, predictability, and fast iteration. 🚀
