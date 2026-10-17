# AGENTS.md — Mite.io: Agents Integration Guide (Technical) 🤖🧫

Purpose
- This document defines the technical contract for "agents" that integrate with the Mite.io game engine: AI bots, observers, analytics hooks, auto-test agents, or external controllers.  
- Read this if you are writing any automated participant (bot), telemetry/monitoring integration, or external controller that consumes or injects game events.

Table of contents
- Agent types
- Integration points & lifecycle
- Event payloads (TypeScript)
- Example agent (TypeScript)
- Performance & safety constraints
- Testing locally
- Registering an agent
- Troubleshooting & support

1) Agent types
- Bot Agent: an in-game autonomous player controlled by code running in the same runtime (client-side) or remotely (headless).  
- Observer Agent: reads engine events to produce logs, analytics, or visualization (no game input).  
- Controller Agent: sends control inputs (aim, split, eject) for testing or external play.  
- Test Agent: deterministic agent used by unit/integration tests to validate mechanics.

2) Integration points & lifecycle
- Agents may register callbacks with the engine or be provided a small agent API object.
- Typical lifecycle:
  - onRegister(agentContext) — called once when agent attached
  - onSpawn(entity) — called when the agent's controlled entity is spawned
  - onTick(deltaMs, state) — called every simulation tick (high-frequency)
  - onEvent(event) — receive low-frequency game events (achievement, death)
  - onDestroy() — cleanup and stop timers

3) Event payloads (TypeScript interfaces)
- Use these interfaces as the canonical contract. Keep implementations lightweight: only read fields you need.

```ts
// Minimal shared types for agents
export interface Vec2 { x: number; y: number }

export type EntityKind = 'player' | 'bot' | 'antibody' | 'food'

export interface EntitySnapshot {
  id: string
  kind: EntityKind
  position: Vec2
  radius: number
  mass: number
  velocity?: Vec2
  ownerAgentId?: string // present for controlled entities
  skinId?: string
  createdAt: number // epoch ms
}

export interface GameStateSnapshot {
  time: number // epoch ms
  deltaMs: number
  entities: EntitySnapshot[]
  leaderboard: { id: string; mass: number }[]
  settings: { mapSize: { width: number; height: number } }
}

export interface EngineEvent {
  type: 'spawn' | 'despawn' | 'collision' | 'achievement' | 'death' | 'mutationChosen'
  time: number
  entityId?: string
  details?: Record<string, any>
}
```

4) Agent API surface (recommended)
- The engine exposes a minimal agent API object on registration:

```ts
export interface AgentAPI {
  id: string
  sendInput(input: { aim?: Vec2; split?: boolean; eject?: number }): void
  getLastSnapshot(): GameStateSnapshot
  on(eventType: EngineEvent['type'], handler: (e: EngineEvent) => void): void
  off(eventType: EngineEvent['type'], handler: (e: EngineEvent) => void): void
  log(...args: any[]): void // for debug only, rate-limited
  config?: Record<string, any>
}
```

- Agents MUST call sendInput at most once per tick. Batch inputs into one call per tick.

5) Example: minimal TypeScript bot (client-side)
- This example demonstrates hooking the agent into the engine and issuing simple steering.

```ts
// exampleAgent.ts
import type { AgentAPI, GameStateSnapshot, Vec2 } from './agent-types'

export default function createChaserAgent(api: AgentAPI, targetId?: string) {
  let running = true
  api.on('spawn', (e) => api.log('spawn event', e))
  // simple tick handler
  function onTick(snapshot: GameStateSnapshot) {
    if (!running) return
    const me = snapshot.entities.find((s) => s.ownerAgentId === api.id)
    if (!me) return
    // pick nearest target
    const target = snapshot.entities
      .filter((s) => s.id !== me.id && s.kind !== 'food')
      .sort((a, b) => (distance(a.position, me.position) - distance(b.position, me.position)))[0]
    if (!target) return
    // aim toward target and occasionally split
    const aim = normalize(sub(target.position, me.position))
    const shouldSplit = me.mass > (target.mass * 1.2) && Math.random() < 0.01
    api.sendInput({ aim, split: shouldSplit })
  }

  return {
    start() {
      // engine will call onTick with snapshots; here we expect engine to wire `onTick` to our function
      api.log('chaser started')
    },
    stop() {
      running = false
      api.log('chaser stopped')
    }
  }
}

// small helpers
function sub(a: Vec2, b: Vec2): Vec2 { return { x: a.x - b.x, y: a.y - b.y } }
function distance(a: Vec2, b: Vec2) { return Math.hypot(a.x - b.x, a.y - b.y) }
function normalize(v: Vec2) { const d = Math.hypot(v.x, v.y) || 1; return { x: v.x / d, y: v.y / d } }
```

6) Performance & safety constraints
- onTick is high-frequency (e.g., 60Hz). Keep handlers extremely cheap: avoid heavy allocations, sync network calls, or expensive loops.  
- If you need heavy computation, offload to a WebWorker or run the agent headless on a server and send compact inputs.  
- The engine may throttle or disconnect agents that block the main thread or exceed CPU budgets.

7) Determinism & testing
- For test agents, prefer deterministic math: seed RNG externally and avoid Date.now() dependent logic in gameplay core.  
- Provide a "headless" mode that emits the same snapshots as the UI to run regression tests.

8) How to register an agent (example / conceptual)
- Client-side registration (pseudo):

```ts
import { engine } from './engine'
import createChaserAgent from './exampleAgent'

const api = engine.registerAgent({ id: 'agent-001', config: { difficulty: 'easy' } })
const agent = createChaserAgent(api)
agent.start()
```

- Remote agent (headless) pattern:
  - The client provides a compact snapshot over WebSocket (state diff or whitelist of relevant fields).
  - The remote agent returns an input object per tick. Keep payloads small.

9) Security & sandboxing
- Treat third-party agent code as untrusted if executed client-side. Prefer running third-party agents in an isolated iframe or worker and enforce rate limits.  
- Avoid exposing direct engine internals or secrets to agents.

10) Testing & debugging tips
- Add debug flags to the engine: show hitboxes, log top-N entity counts, enable verbose agent telemetry (rate-limited).  
- Provide a replay system that serializes snapshots to reproduce runs for debugging.

11) Contribution & proposing agent features
- Open an issue labeled `agent-spec` with a short design: data payloads, expected frequency, and a sample implementation.  
- If you propose a new agent API, include a migration plan and performance budget (ms per tick).

12) Contact & further docs
- Technical dev guide: DEV.md — https://github.com/MeowDev1011/Mite.io/blob/main/DEV.md  
- For security or infra concerns, open an issue: https://github.com/MeowDev1011/Mite.io/issues/new

---

This document aims to be the single source of truth for agent authors. If you need additional message schemas (e.g., analytics schema, telemetry events) I can add a dedicated JSON schema section next.
