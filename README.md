# Mite.io 🧫🧬🎮 — Evolución y acción dentro del torrente sanguíneo (EDICIÓN AMIGABLE) 🚀✨

![Logo Mite.io](mite_io_logo.png)

[![Jugar Online](https://img.shields.io/badge/Play%20Online-mite--io.ai.studio-brightgreen)](https://mite-io.pages.dev/)
[![Licencia: Apache-2.0](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://github.com/MeowDev1011/Mite.io/blob/main/LICENSE)
[![Top Language](https://img.shields.io/github/languages/top/MeowDev1011/Mite.io)](https://github.com/MeowDev1011/Mite.io)

¡Bienvenido a Mite.io! 🐱🧫

Este README está escrito para ser divertido, claro y extremadamente útil — con MUCHOS emojis por línea porque la vida es mejor con emoción. 😄🎉

---

## Índice 📚
- 🎯 Pitch rápido
- ✨ Fautures (una línea = un emoji) 
- 🚪 Cómo jugar rápido (Quickplay)
- 🎮 Controles y accesibilidad
- 🔬 Sistemas principales (física, split, eject)
- 🌳 Árbol de mutaciones y tablas de balance
- 🗺️ Mapa / spawns / reglas de arena (completo)
- 🛠️ Guía para desarrolladores (resumen tipo NASA, + links a DEV.md)
- 🤖 Integración de agentes (resumen y link a AGENTS.md)
- ⚙️ CI / pruebas headless (ejemplos de código)
- 🧩 Contribuir — checklist PR
- ❗ Troubleshooting & FAQs
- 🔗 Enlaces rápidos y demo

---

## 🎯 Pitch rápido
- 🦠 Eres un microbio en el torrente sanguíneo.
- 🍽️ Absorbe células para crecer.
- ✂️ Divide (split) para atacar o escapar.
- 💨 Expulsa masa para disparar o alimentar.
- 🧬 Elige mutaciones durante la partida para especializarte.
- 🏁 Partidas cortas, mucha acción y espacio para la maestría.

---

## ✨ FAUTURES (EMOJI POR LÍNEA) 🎉
- 🧠 Motor de simulación en canvas a 60 FPS (adaptable)
- ✂️ Mecánica de split: dividirse tácticamente
- 💨 Eject: expulsar masa como proyectil
- 🧬 Mutaciones: elecciones en partida que cambian tu build
- 🤖 Bots IA: predator, grazer, kamikaze, evasivo
- 🎨 Skins y tienda cosmética (cytes)
- 🏆 Logros y toasts de desbloqueo
- 🌍 i18n: detección de idioma y traducciones
- 📱 Controles táctiles + HUD adaptativo
- 🔊 Motor de audio con toggles y manejo móvil
- 🧰 Optimizaciones: pooling, particionado espacial
- 🔐 Seguridad: agentes en workers/iframes

---

## 🚪 Quickplay — Entra ya!
- 🔗 Demo: https://mite-io.pages.dev/
- 🖱️ Click play → selecciona skin → ¡a la arena! ⚔️
- ⏱️ Sesiones rápidas: reinicia y mejora tus mutaciones.

---

## 🎮 Controles & accesibilidad
- 🖱️ Mover / apuntar: ratón / dedo
- ⌨️ Split: Space
- 💨 Eject: W
- ⏸️ Pausa / menú: Escape
- 📱 Móvil: joystick virtual + botones de acción
- ♿ Opciones: volumen, idioma, contraste (plan)

---

## 🔬 Sistemas principales (detallado)
### 1) Masa → radio → velocidad
- 📏 Radio calculado desde masa: area ≈ masa, radius = sqrt(masa / PI) * k
- 🐢 Velocidad ↘ a medida que la masa aumenta según:

```text
speed = baseSpeed * (1 / (1 + mass / massScaling))
```

### 2) Split (división)
- ✂️ Al presionar Space: se crea una nueva entidad con masa = floor(masa * splitRatio)
- 🔁 Recombina cuando piezas están cerca y después de cooldown_recombine ms
- ⚠️ Parche de invulnerabilidad: niño tiene invuln_window ms (configurable)

### 3) Eject / proyectiles
- 💨 Eject resta ejectMass del jugador y crea un proyectil con velocidad impulse
- 💥 Proyectiles aplican empuje/dmg según projectileMass * dmgMultiplier

### 4) Mutations (elecciones en partida)
- 🧬 Ofertas en hitos (tiempo o masa) — pick 1/3
- 🔀 Tipos: movement, combat, defense, utility
- 📊 Reglas: algunas mutaciones stackean, otras no (ver constants.ts)

---

## 🌳 Árbol de mutaciones — Ejemplo (completo)
| Tier | ID | Tipo | Efecto | Stackable |
|---:|---|---|---|---:|
| 1 | M_SPEED_1 | Movement | +10% top speed | Sí |
| 1 | M_REGEN_1 | Defense | +0.5 HP/s | Sí |
| 2 | M_SPLIT_PWR | Combat | +20% split impulse | No |
| 2 | M_EJECT_BIG | Utility | +25% eject mass | No |
| 3 | M_REGEN_2 | Defense | +1.5 HP/s (si M_REGEN_1 presente) | Sí |

> 🔧 Lógica: aplicar mutaciones pasa por `applyMutation(entity, mutationId)` y debe validarse en tests.

---

## 🗺️ Mapa, spawns y reglas de la arena (COMPLETO)
### Arena
- 🗺️ Tamaño: width = 10000, height = 10000 (configurable en settings.mapSize)
- 🌊 Spawn points: generados procedimentalmente en capas (center-biased heatmap)

### Tables de spawn (ejemplo)
- Food spawn rate: baseFoodPerSecond = 10
- Antibody spawn rate: baseAntibodiesPerMinute = 2
- Bot spawn: mantener N bots activos según difficulty

### Reglas de reproducción y equilibrio
- 🍽️ Comida: pequeñas entidades estáticas, masa_food = 1–3
- 🛡️ Antibodies: hostiles, daño alto pero lento
- 🤝 Balance: ajustar constants.spawnRates y constants.balance multipliers

---

## 🛠️ Guía para desarrolladores (NASA-grade resumen) 🛰️
> Nota: DEV.md contiene la guía completa. Aquí incrustamos la versión “documento técnico” resumida pero exhaustiva.

### Requisitos exactos
- Node.js >= 18.x LTS ✅
- npm >= 9.x o pnpm/yarn ✅
- Editor recomendado: VSCode + ESLint + Prettier ✅

### Setup local (comandos)
```bash
git clone https://github.com/MeowDev1011/Mite.io.git
cd Mite.io
npm install
cp .env.example .env
npm run dev
```

### Scripts clave
- `npm run dev` — dev server (Vite) 🔁
- `npm run build` — build producción 🏗️
- `npm run preview` — preview build 👀
- `npm run lint` — comprobación TypeScript (tsc --noEmit) ✅
- `npm run test` — (sugerido) pruebas unitarias e integración 🧪

### Estructura de código (profunda)
- `src/game/engine.ts` — bucle principal, manager de entidades
- `src/game/physics.ts` — funciones puras de física
- `src/game/types.ts` — tipos compartidos entre engine y UI
- `src/components/*` — UI (React)
- `src/storage/profileStorage.ts` — adaptador localStorage y migraciones
- `src/audio/soundEngine.ts` — manejo audio y políticas móviles

### Arquitectura y mejores prácticas
- ✅ Mantener `engine.onTick` lo más puro y rápido posible
- ✅ Evitar allocations en tick: usar object pools
- ✅ Side-effects en adaptadores: storage, analytics, sonido
- ✅ Exponer debug flags para tuning en runtime (debug build)

---

## 🤖 Integración de agentes — Resumen (AGENTS.md) 📡
- 🔗 Ver AGENTS.md para el contrato completo (TypeScript interfaces, JSON Schema, WS proto)
- 📝 APIs: `sendInput({aim,split,eject})`, `getLastSnapshot()`, subscribe a eventos
- 🧪 Headless agents: snapshot over WS con `tick` alignment

---

## ⚙️ CI y pruebas headless — Ejemplos (copiar/pegar)
### GitHub Actions (CI básico)
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
  playtest:
    runs-on: ubuntu-latest
    needs: build
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 18
      - run: npm ci
      - run: npm run test:headless || echo "Headless tests not configured"
```

### Headless test runner (pseudo TS)
```ts
import { createEngineHeadless } from './src/game/engine'
const engine = createEngineHeadless({ seed: 42 })
engine.step(60000) // simula 60s
console.assert(engine.entities.length < 2000)
```

---

## 🧩 Contribuir — Checklist para PR ✅
- [ ] Ejecuté `npm run lint` y `npm run build`
- [ ] Añadí/actualicé tests relevantes
- [ ] Documenté cambios en README/DEV/AGENTS
- [ ] PR claro con descripción, pasos de prueba y screenshots si aplica

---

## ❗ Troubleshooting & FAQs (rápido)
- 🎧 Audio en móvil no suena: requiere interacción del usuario
- 🏷️ Licencia badge muestra "not specified": espera caché de shields.io o confirma LICENSE en rama por defecto
- 🧭 Canvas en blanco: abre DevTools y verifica errores; confirma existencia de `#root` en index.html

---

## 🔗 Enlaces rápidos
- 🎮 Demo: https://mite-io.pages.dev/
- 🐱 Repo: https://github.com/MeowDev1011/Mite.io
- 🧰 DEV guide: https://github.com/MeowDev1011/Mite.io/blob/main/DEV.md
- 🤖 AGENTS guide: https://github.com/MeowDev1011/Mite.io/blob/main/AGENTS.md

---

¿Quieres que genere ahora la GDD completa (mapas, tablas de spawn detalladas, fórmulas de balance y PDF listo para imprimir)? Si dices “GDD please”, te lo construyo entero. 🎮📄🔥
