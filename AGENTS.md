# AGENTS.md — Mite.io: Agents Integration Guide (Technical) 🤖🧫🎯

Welcome! This is the canonical, technical guide for agents that integrate with Mite.io.
It targets: bot authors, telemetry consumers, external controllers, headless test runners, and integrations.
This version adds detailed schemas, WebSocket examples, lifecycle rules, quotas, and debugging tips — with extra emojis because why not. 🎉🧪

Table of contents
- Agent types
- Integration points & lifecycle
- Event payloads (TypeScript) & JSON schemas
- WebSocket protocol example
- Agent API surface
- Example agent (TypeScript) + minimal CLI runner
- Telemetry & analytics events
- Performance, quotas & safety
- Testing, replay & determinism
- Registering, onboarding & contribution
- Troubleshooting & debugging

---

## Agent types 🧩
- **Bot Agent** — autonomous in-game player; may run client-side (in worker/iframe) or headless server-side. 🤖
- **Observer Agent** — read-only; consumes snapshots and events for analytics, replays, or visualizations. 👁️📊
- **Controller Agent** — test harness or remote player that injects inputs (aim/split/eject). 🎛️
- **Test Agent** — deterministic agent used in CI or local regression tests. ✅

Each agent type has different trust & performance expectations — treat third-party bot agents as partial trust and sandbox accordingly.

---

## Integration points & lifecycle 🔁
Agents typically interact via a compact API provided by the engine. Lifecycle callbacks are:
- `onRegister(agentContext)` — once when the agent attaches. ✅
- `onSpawn(entity)` — when an entity controlled by the agent is spawned. 🐣
- `onTick(deltaMs, snapshot)` — high-frequency tick (engine may run at 30–120Hz). ⚡
- `onEvent(event)` — lower-frequency game events (achievement, death, mutationChosen). 🔔
- `onDestroy()` — cleanup, flush telemetry, stop timers. 🧹

Engine guarantees:
- `onTick` calls are ordered and monotonic but not strictly real-time under heavy load.
- Agents should be resilient to skipped ticks and late snapshots.

---

## Event payloads (TypeScript) & JSON schema 📐
Use these types as the canonical contract. Keep payloads minimal and stable.

```ts
// agent-types.ts
export interface Vec2 { x: number; y: number }
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
  createdAt: number // epoch ms
}

export interface GameStateSnapshot {
  time: number // epoch ms
  deltaMs: number
  tick: number
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

Example JSON Schema (GameStateSnapshot — partial):

```json
{
  "$id": "https://mite.io/schemas/GameStateSnapshot.json",
  "type": "object",
  "properties": {
    "time": {"type": "integer"},
    "deltaMs": {"type": "integer"},
    "tick": {"type": "integer"},
    "entities": {"type": "array"}
  },
  "required": ["time","deltaMs","tick","entities"]
}
```

---

## WebSocket protocol example 🌐
For remote/headless agents we recommend a compact protocol over WebSocket. Keep messages small.

Client → Server (agent host) example (snapshot):
```json
{ "type": "snapshot", "tick": 12345, "time": 1620000000000, "entities": [{"id":"e1","x":10,"y":20,"r":5,"m":12}]} 
```

Agent → Server (input) example:
```json
{ "type": "input", "tick": 12345, "agentId": "agent-42", "input": { "aim": {"x": 0.5, "y": -0.2}, "split": false, "eject": 0 } }
```

Design rules:
- Use `tick` to match snapshots → inputs. Never apply inputs without tick alignment. ⛓️
- Compress or delta-encode snapshots when running many agents remotely. 🔽

---

## Agent API surface (recommended) 🧭
The engine should expose a minimal, stable API for agents:

```ts
export interface AgentAPI {
  id: string
  sendInput(input: { aim?: Vec2; split?: boolean; eject?: number }): void
  getLastSnapshot(): GameStateSnapshot
  on(eventType: EngineEvent['type'], handler: (e: EngineEvent) => void): void
  off(eventType: EngineEvent['type'], handler: (e: EngineEvent) => void): void
  log(...args: any[]): void // rate-limited
  config?: Record<string, any>
}
```

Rules:
- Call `sendInput()` at most once per tick. Multiple calls may be coalesced or rejected.
- Avoid blocking operations in callbacks. Offload heavy work to workers.

---

## Example: minimal TypeScript bot (client-side) 🧪
A compact example demonstrates a chaser bot that targets nearest non-food entity.

```ts
// exampleAgent.ts (same as in agent-types earlier, simplified)
import type { AgentAPI, GameStateSnapshot } from './agent-types'
export default function createChaserAgent(api: AgentAPI) {
  function onTick(snapshot: GameStateSnapshot) {
    const me = snapshot.entities.find(e=> e.ownerAgentId===api.id)
    if(!me) return
    const target = snapshot.entities
      .filter(e=> e.id!==me.id && e.kind!=='food')
      .sort((a,b)=>dist(a.position,me.position)-dist(b.position,me.position))[0]
    if(!target) return
    api.sendInput({ aim: normalize(sub(target.position, me.position)), split: me.mass > target.mass*1.2 })
  }
  api.on('spawn',()=>api.log('spawn'))
  api.on('despawn',()=>api.log('despawn'))
  // engine should wire the onTick handler
  return { onTick }
}
```

Small CLI runner example (pseudo):
```bash
# run a headless agent that connects via WS
node headless-agent.js --server=wss://mite-io.example/ws --agentId=agent-01
```

---

## Telemetry & analytics events 📈
Suggested event types and payloads (lightweight):
- `agent.connected` — { agentId, time }
- `agent.disconnected` — { agentId, time, reason }
- `game.start` / `game.end` — { matchId, duration }
- `achievement.unlocked` — { agentId, achievementId }

Design telemetry to be anonymizable and privacy-safe. Keep PII out of telemetry.

---

## Performance, quotas & safety ⚠️⏱️
- Budget per-agent: aim for < 1ms per tick on main thread; if you exceed this, move to a worker. 🧰
- Network budget: prefer < 2KB snapshot diffs per tick for remote agents. 📡
- The engine may enforce disconnects for agents that exceed CPU/network budgets.
- Run untrusted agent code in workers/iframes and sanitize inputs.

---

## Testing, replay & determinism 🔁🧪
- Provide a headless deterministic mode where seeds and RNG are controllable. 🎲
- Implement a replay recorder that writes snapshots to a JSONL or compressed binary for debugging. 🗄️
- CI tests: use deterministic test agents to validate physics, split/recombine, and mutation effects.

---

## Registering, onboarding & contribution ✍️🤝
- To propose agent API changes, open an issue labeled `agent-spec` with:
  - proposed payloads
  - performance budget
  - migration plan
  - sample implementation
- Fork, implement a sample agent (in `examples/agents/`) and open a PR with your tests.

---

## Troubleshooting & debugging 🐞🔬
- If an agent is unresponsive: check tick alignment, latency, and snapshot completeness.
- For noisy logs: enable rate-limited debug logs in AgentAPI (engine side).
- Use replay files to reproduce non-deterministic failures.

---

## Next steps & extensions ✨
If you want, I can add:
- Full JSON Schema files for all payloads
- WS protocol RFC-style doc
- Example headless agent using node + ws package
- A small test harness and CI job for headless smoke tests

Happy agenting! 🎉🧠
