# Mite.io 🧫🧬 — Acción evolutiva dentro del torrente sanguíneo

[![Play Online](https://img.shields.io/badge/Play%20Online-mite--io.ai.studio-brightgreen)](https://mite-io.ai.studio)
[![License](https://img.shields.io/github/license/MeowDev1011/Mite.io)](https://github.com/MeowDev1011/Mite.io/blob/main/LICENSE)
[![Top Language](https://img.shields.io/github/languages/top/MeowDev1011/Mite.io)](https://github.com/MeowDev1011/Mite.io)
[![Repo Size](https://img.shields.io/github/repo-size/MeowDev1011/Mite.io)](https://github.com/MeowDev1011/Mite.io)
[![TypeScript](https://img.shields.io/badge/TypeScript-%E2%9D%A4-blue)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-Ready-brightgreen)](https://vitejs.dev/)

Mite.io es un juego de acción multijugador/singleplayer (front-end) ambientado dentro del torrente sanguíneo. Creces absorbiendo células, te separas para atacar o escapar, esquivas anticuerpos y compites por dominar el entorno. 🧪🎮

Juega ahora: https://mite-io.ai.studio 🚀

---

## Tabla de contenidos
- 📌 ¿Qué es?
- 🧩 Características
- 🏗 Estructura del repositorio (rápido recorrido)
- 🚀 Cómo ejecutar (desarrollo / producción)
- 🎮 Controles y jugabilidad
- 🛠 Desarrollo y arquitectura (qué archivos leer)
- 🤝 Contribuir
- 🐞 Depuración y problemas comunes
- 📝 Licencia y créditos

---

## 📌 ¿Qué es?
Mite.io es un juego de acción con mecánicas de crecimiento y evolución en un escenario microscópico. Ideal para jugadores que disfrutan de partidas cortas y repletas de decisiones rápidas (split, eject, mutaciones). Está implementado en TypeScript + React + Vite.

---

## 🧩 Características
- Render por canvas a 60 FPS con un motor de juego propio (simulación de microbios, anticuerpos, bots). ⚙️
- Evoluciones / mutaciones que cambian habilidades del jugador. 🧬
- Logros, tienda y skins personalizables. 🏷️✨
- Guardado de perfil local (cytes, skins, idioma). 💾
- Sonido y efectos gestionados por un sound engine (mute toggle). 🔊
- Internacionalización (i18n) con detección de idioma. 🌐

---

## 🏗 Estructura principal del repositorio
```
package.json                 # scripts y dependencias (Vite, React, Tailwind, etc.)
index.html                  # entry html
vite.config.ts              # configuración de Vite
.tsconfig.json              # TypeScript config
.env.example                # variables de entorno de ejemplo
mite_io_logo.png            # logo / recursos
src/
  main.tsx                  # punto de entrada React
  App.tsx                   # orchestrator: instancia GameEngine, HUD y modales
  index.css                 # estilos globales (Tailwind + custom)
  audio/
    soundEngine.ts          # motor de sonido (control mute/play)
  game/
    engine.ts               # MOTOR del juego (loop, entidades, física, bots) ← archivo grande y central
    types.ts                # tipos TS: GameState, GameStats, LeaderboardEntry, MutationId...
    constants.ts            # constantes del juego (tamaños, masses, timers)
    skins.ts                # definición de skins y colores
    bacteria.ts             # lógica de bacterias/bots
    achievements.ts         # lógica / meta de logros
    botNames.ts             # nombres para bots
  components/
    TitleScreen.tsx         # pantalla de inicio
    GameHUD.tsx             # HUD en partida (radar, estado, botones)
    GameOverModal.tsx       # modal de final de partida
    PauseModal.tsx          # pausa
    EvolutionModal.tsx      # elegir mutación
    ShopModal.tsx           # tienda
    SkinsModal.tsx          # selector de skins
    TutorialModal.tsx       # tutorial interactivo
    AchievementsModal.tsx   # galería de logros
    AchievementToast.tsx    # notificación
  storage/
    profileStorage.ts       # guardado local del perfil (cytes, skin, idioma, prefs)
  i18n/
    languages.ts            # detección de idioma y traducciones
```

Cómo encaja: App.tsx crea y controla una instancia de GameEngine (src/game/engine.ts). El engine hace la simulación y llama a callbacks que actualizan React (HUD, modales, estado). El audio, perfiles y skins están desacoplados en módulos propios para mantener el motor limpio.

---

## 🚀 Cómo ejecutar (rápido)
Requisitos: Node.js (v18+ recomendado) y npm / pnpm / yarn.

1. Clona el repo:
```bash
git clone https://github.com/MeowDev1011/Mite.io.git
cd Mite.io
```

2. Instala dependencias:
```bash
npm install
# o
# pnpm install
# yarn
```

3. Copia variables de entorno si necesitas (hay .env.example):
```bash
cp .env.example .env
```

4. Ejecuta en modo desarrollo (Vite, puerto 3000):
```bash
npm run dev
# abre http://localhost:3000
```

5. Construir para producción:
```bash
npm run build
npm run preview   # preview local del build
```

Scripts útiles (desde package.json):
- dev: vite --port=3000 --host=0.0.0.0
- build: vite build
- preview: vite preview
- clean: rm -rf dist server.js
- lint: tsc --noEmit

---

## 🎮 Controles / Jugabilidad
- Movimiento: apunta con el ratón (mouse steer). 🖱️
- Split / dividir: Barra espaciadora (Space) — divide tu microbio para atacar/escapar. ⚔️
- Eject / expulsar masa: W (KeyW). 🟢
- Pausa / menú: Esc (Escape). ⏸️
- También hay soporte touch: swipes/touch para heading en móvil.

---

## 🛠 Desarrollo — archivos importantes (he leído el código)
- src/game/engine.ts — Núcleo del motor: loop de render, gestión de entidades (player, bots, anticuerpos), físicas y colisiones. Es el archivo más grande y donde se aplica la mayoría de la lógica del juego.
- src/game/types.ts — Define GameState, GameStats, LeaderboardEntry, MutationId y tipos compartidos entre engine y UI.
- src/audio/soundEngine.ts — Controla reproducción y mute de sonidos; usado por la UI y el motor.
- src/storage/profileStorage.ts — Persistencia local del perfil (selectedSkinId, cytes, preferredLanguage). Útil para comportamientos de UI y para restaurar preferencias.
- src/components/* — UI reactiva para todas las pantallas (TitleScreen, HUD, modales). Observa cómo App.tsx conecta callbacks del engine con estos componentes.
- src/game/skins.ts — Contiene MICROBE_SKINS y lógica de colores/skins. Cambiar ahí impacta visualmente en el motor.
- src/game/achievements.ts — Definición y condiciones de logros; dispara el achievement toast.

Puntos de integración:
- engine.onStatsUpdate → actualiza HUD/mini-radar.
- engine.onAchievementUnlocked → dispara AchievementToast.
- profileStorage.getProfile() → usado por HUD y para aplicar skins.

---

## 🤝 Contribuir
¡Contribuciones bienvenidas! 🙌
- Abre issues para bugs o mejoras.
- Haz PRs pequeñas y descriptivas.
- Añade tests o validaciones de tipos donde sea necesario.
- Antes de PR: ejecuta `npm run lint` y asegúrate de que la build local pase.

Plantilla rápida para PR:
- Qué cambias (1–2 líneas)
- Por qué (motivación)
- Archivos principales modificados
- Cómo probarlo localmente

---

## 🐞 Problemas comunes / Debug
- Canvas negro / sin renderización:
  - Asegúrate de dar permisos cross-origin si cargas assets externos.
  - Revisa console por errores TS/Runtime.
- Sonido no se reproduce en móvil:
  - Revisa política de autoplay; algunos navegadores requieren interacción previa.
- Perfil no guarda cambios:
  - Comprueba `localStorage` y permisos del navegador; profileStorage guarda localmente.

---

## 🧾 Licencia
El código principal usa licencia Apache-2.0 (ver encabezado en archivos y LICENSE si se añade). Consulta el archivo LICENSE en el repo para detalles.

---

## ❤️ Agradecimientos / Recursos
- Hecho con TypeScript + React + Vite.
- Iconos / UI: lucide-react y Tailwind (configuración mínima).
- Logo: mite_io_logo.png (en la raíz).

---

ENGLISH BELOW / INGLÉS ABAJO

---

# Mite.io 🧫🧬 — Evolution action inside the bloodstream

[![Play Online](https://img.shields.io/badge/Play%20Online-mite--io.ai.studio-brightgreen)](https://mite-io.ai.studio)
[![License](https://img.shields.io/github/license/MeowDev1011/Mite.io)](https://github.com/MeowDev1011/Mite.io/blob/main/LICENSE)
[![Top Language](https://img.shields.io/github/languages/top/MeowDev1011/Mite.io)](https://github.com/MeowDev1011/Mite.io)
[![Repo Size](https://img.shields.io/github/repo-size/MeowDev1011/Mite.io)](https://github.com/MeowDev1011/Mite.io)
[![TypeScript](https://img.shields.io/badge/TypeScript-%E2%9D%A4-blue)](https://www.typescriptlang.org/)

Mite.io is an action growth/evolution game set inside the bloodstream. Grow by absorbing cells, split to attack or escape, avoid antibodies, and compete to dominate the environment. 🎮🧪

Play now: https://mite-io.ai.studio 🚀

---

## Quick links
- Live demo: https://mite-io.ai.studio
- Repo: https://github.com/MeowDev1011/Mite.io

---

## What this is
Mite.io is a fast-paced action game with growth and mutation mechanics. Implemented with TypeScript, React and Vite. The client runs a canvas-based game engine at 60 FPS and provides UI for skins, store, achievements and localization.

## How to run
(see Spanish section above for full commands)

1. git clone https://github.com/MeowDev1011/Mite.io.git
2. npm install
3. cp .env.example .env
4. npm run dev -> open http://localhost:3000

---

If you'd like, I can:
- Add screenshots and a demo GIF to the README.
- Create CONTRIBUTING.md and ISSUE/PR templates.
- Add a short troubleshooting section for common engine issues.

Have it published and linked to https://mite-io.ai.studio as requested. 🎉
