<!--
 ═══════════════════════════════════════════════════════════════
  Diego Framework
  Created by Jose Lee <joelee1942@gmail.com>

  For Pampo — my Kwan Ambassador
 ═══════════════════════════════════════════════════════════════
-->
# Diego — Documentacion Completa

> **Filosofia:** Calidad con shortcuts. Rapido por defecto, riguroso cuando lo pides con `--thorough`.

Diego es un framework de gestion de proyectos para Claude Code. Toma lo mejor de GSD (subagentes, paralelizacion) y lo combina con shortcuts para ir rapido. El resultado: menos gates obligatorios, menos overhead, y la misma calidad cuando la necesitas.

---

## Tabla de Contenidos

1. [Conceptos Fundamentales](#conceptos-fundamentales)
2. [Core Loop — El Ciclo Principal](#core-loop)
3. [Shortcuts — Atajos Rapidos](#shortcuts)
4. [Session — Gestion de Sesion](#session)
5. [Roadmap — Gestion de Fases](#roadmap)
6. [Milestones — Hitos del Proyecto](#milestones)
7. [Pre-Planning — Preparacion](#pre-planning)
8. [Config — Configuracion](#config)
9. [Flag Global: --thorough](#flag-global-thorough)
10. [Perfiles de Modelo](#perfiles-de-modelo)
11. [Estructura de Proyecto](#estructura-de-proyecto)
12. [Agentes](#agentes)
13. [Checkpoints y Simbolos](#checkpoints-y-simbolos)
14. [Flujos de Trabajo Comunes](#flujos-de-trabajo-comunes)
15. [Tips y Buenas Practicas](#tips-y-buenas-practicas)

---

## Conceptos Fundamentales

### Que es Diego?

Diego organiza tu trabajo de desarrollo en:

- **Milestones** — Versiones grandes del producto (v1, v2)
- **Fases** — Bloques de trabajo dentro de un milestone (auth, API, UI)
- **Planes** — Documentos ejecutables con tareas, acceptance criteria y boundaries
- **Tareas** — Unidades atomicas de trabajo con verificacion

### El Loop Principal

```
init → plan → execute → unify → (siguiente fase)
  │                                      │
  └──────────── repeat ─────────────────┘
```

1. **Init:** Define que construir (una vez por proyecto)
2. **Plan:** Crea un plan detallado para una fase
3. **Execute:** Ejecuta el plan con commits atomicos
4. **Unify:** Reconcilia plan vs realidad, cierra el loop
5. **Repite** para la siguiente fase

### Fast vs Thorough

Diego es **rapido por defecto**. Los pasos opcionales (research, plan-check, verification) se SALTAN a menos que agregues `--thorough`.

| Gate | Fast (default) | --thorough |
|------|---------------|------------|
| Research antes de plan | SKIP | Activo |
| Verificacion del plan | SKIP | Activo (max 2 iter.) |
| Verificacion post-ejecucion | SKIP | Activo |
| Reconciliacion UNIFY | Minimal | Full con AC check |
| Logging de decisiones | Solo criticas | Todo |

---

## Core Loop

### `/diego:init`

**Inicializa un nuevo proyecto.** Es lo primero que ejecutas. Diego te hace preguntas adaptativas para entender tu proyecto y crea toda la estructura de planificacion.

**Sintaxis:**
```
/diego:init
```

**Que hace:**
1. **Questioning** — Te pregunta sobre vision, usuarios, tech stack, constraints y scope. Las preguntas se adaptan segun el contexto (si ya hay codigo, infiere el stack).
2. **PROJECT.md** — Crea el documento de vision del proyecto.
3. **REQUIREMENTS.md** — Organiza requisitos en P0 (must have), P1 (should have), P2 (nice to have).
4. **ROADMAP.md** — Divide el trabajo en fases con goals claros.
5. **STATE.md** — Inicializa el tracking de posicion y progreso.
6. **config.json** — Crea configuracion por defecto.

**Que genera:**
```
.planning/
├── PROJECT.md          ← Vision, usuarios, stack, constraints
├── REQUIREMENTS.md     ← Requisitos priorizados P0/P1/P2
├── ROADMAP.md          ← Fases con goals y status
├── STATE.md            ← Posicion actual del proyecto
├── config.json         ← Configuracion de Diego
└── phases/             ← Directorios vacios por fase
    ├── 01-foundation/
    ├── 02-auth/
    └── ...
```

**Ejemplo:**
```
/diego:init
> "Estoy construyendo una API REST para gestion de inventario..."
```

**Cuando usarlo:** Una sola vez al inicio del proyecto. Si el proyecto ya esta inicializado, te lo dice y sugiere `/diego:progress`.

---

### `/diego:plan [phase]`

**Crea un plan ejecutable para una fase.** El plan incluye tareas, acceptance criteria (Given/When/Then), waves de paralelizacion y boundaries.

**Sintaxis:**
```
/diego:plan 1
/diego:plan 2 --thorough
```

**Argumentos:**
- `[phase]` — Numero de fase (ej: 1, 2, 3)
- `--thorough` — Activa research previo + verificacion del plan

**Que hace:**
1. Lee contexto: PROJECT.md, REQUIREMENTS.md, ROADMAP.md, summaries previos
2. **(--thorough)** Spawns diego-researcher para investigar antes de planear
3. Spawns diego-planner para crear el plan
4. **(--thorough)** Verifica calidad del plan (AC coverage, testabilidad)
5. Escribe `{phase_dir}/{NN-MM}-PLAN.md`
6. Commit automatico si `commit_docs: true`

**Formato del plan generado:**
```markdown
---
phase: 1
plan: 1
wave: 1
autonomous: true
---

<objective>
Que construir y por que.
</objective>

<acceptance_criteria>
## AC-1: Login funcional
Given un usuario con credenciales validas
When envia POST /api/login con email y password
Then recibe un JWT token con status 200

## AC-2: Proteccion de rutas
Given un request sin token valido
When accede a una ruta protegida
Then recibe 401 Unauthorized
</acceptance_criteria>

<tasks>
<task id="1">
  <name>Crear endpoint de login</name>
  <files>src/auth/login.controller.ts</files>
  <action>Implementar POST /api/login que valide credenciales y retorne JWT</action>
  <verify>curl -X POST localhost:3000/api/login -d '{"email":"test@test.com","password":"test"}' | jq .token</verify>
  <done>AC-1 satisfecho</done>
</task>
</tasks>

<boundaries>
## NO TOCAR
- database/migrations/*
- src/config/secrets.ts
</boundaries>
```

**Acceptance Criteria (AC):** Cada criterio usa formato Given/When/Then para que sea medible y verificable. El executor verifica cada AC al terminar.

**Waves:** Las tareas se agrupan por dependencia. Wave 1 son tareas independientes (se ejecutan en paralelo), Wave 2 depende de Wave 1, etc.

**Boundaries:** Archivos que NO deben modificarse. El executor los respeta estrictamente.

---

### `/diego:execute [phase]`

**Ejecuta todos los planes pendientes de una fase.** Usa subagentes en paralelo por wave. Cada tarea genera un commit atomico.

**Sintaxis:**
```
/diego:execute 1
/diego:execute 2 --thorough
```

**Argumentos:**
- `[phase]` — Numero de fase
- `--thorough` — Activa verificacion post-ejecucion

**Que hace:**
1. Descubre planes incompletos y los agrupa por wave
2. **Wave Loop:**
   - Lee planes del wave actual
   - Spawn 1 diego-executor por plan (paralelo dentro del wave)
   - Cada executor: ejecuta tareas → verifica → commit → SUMMARY.md
   - Espera a que todos terminen
   - Avanza al siguiente wave
3. Actualiza progreso en ROADMAP.md
4. **(--thorough)** Spawn diego-verifier para verificar AC
5. Auto-UNIFY si `auto_unify: true`

**Commits generados:**
```
feat(p01-t01): create login endpoint
feat(p01-t02): add JWT token generation
feat(p01-t03): add route protection middleware
docs(p01): plan 01-01 summary
```

**Manejo de errores:**
- Si una tarea falla verificacion: retry (max 2 intentos)
- Si sigue fallando: se registra como desviacion y continua
- Nunca se salta una tarea silenciosamente

**Output:**
```
╔═══════════════════════════════════════════════╗
║  DIEGO — Phase 1 Executed                    ║
╚═══════════════════════════════════════════════╝

Plans: 2/2
Tasks: 7/8 (1 deviation)
Commits: 8
```

---

### `/diego:verify [phase]`

**Verifica que una fase logro su objetivo.** Usa analisis goal-backward: parte del goal de la fase y verifica hacia atras si el codebase lo cumple.

**Sintaxis:**
```
/diego:verify 1
```

**Que hace:**
1. Lee el goal de la fase desde ROADMAP.md
2. Lee todos los PLAN.md y SUMMARY.md de la fase
3. Spawn diego-verifier con analisis:
   - **Goal Check:** El codebase entrega lo prometido?
   - **AC Check:** Cada criterio de aceptacion pasa?
   - **Artifact Check:** Todos los archivos esperados existen?
   - **Integration Check:** El codigo nuevo funciona con el existente?
   - **Regression Check:** Hay regresiones obvias?
4. Escribe `{NN}-VERIFICATION.md`

**Cuando usarlo:**
- Despues de ejecutar una fase importante
- Antes de un milestone review
- Cuando quieres asegurarte de que todo funciona
- Automaticamente en modo `--thorough`

**Output:**
```
─── Verification Complete ─────────────────────
Phase 1: PASS
AC: 5/5 passed
Issues: 0
Recommendation: proceed to Phase 2
```

---

### `/diego:unify [phase]`

**Reconcilia plan vs realidad y cierra el loop de la fase.** Compara lo que se planeo con lo que realmente se construyo.

**Sintaxis:**
```
/diego:unify 1
/diego:unify 1 --thorough
```

**Que hace:**

**Modo Minimal (default):**
1. Verifica que todos los SUMMARY.md existen
2. Spot-check: archivos clave existen en disco
3. Actualiza STATE.md con status de completado
4. Marca fase como completa en ROADMAP.md

**Modo Full (--thorough):**
1. Verificacion completa de cada AC
2. Ejecuta todos los comandos `<verify>` de todas las tareas
3. Detecta cambios no intencionados
4. Reporte detallado de reconciliacion

**Por que es importante:**
UNIFY cierra el feedback loop. Sin el, acumulas deuda: planes que dicen una cosa y codigo que hace otra. UNIFY fuerza la sincronizacion.

**Output:**
```
─── Phase 1 Unified ───────────────────────────
✓ 2 plans reconciled
✓ 5/5 acceptance criteria met
✓ No deviations

◇ DECISION: Phase 1 complete — moving to Phase 2

Next: /diego:plan 2
```

---

### `/diego:progress`

**Muestra el estado del proyecto y sugiere la siguiente accion.** Es tu brujula — te dice donde estas y a donde ir.

**Sintaxis:**
```
/diego:progress
```

**Que muestra:**
1. Milestone actual y version
2. Perfil de modelo activo
3. Barra de progreso por fases
4. Detalle de cada fase (plans completados)
5. Posicion actual (fase, plan, status)
6. Ultimas decisiones
7. Blockers activos
8. **Siguiente accion sugerida**

**Routing inteligente:**

| Status | Sugerencia |
|--------|------------|
| `initialized` | `/diego:plan 1` |
| `planned` | `/diego:execute {N}` |
| `executed` | `/diego:unify {N}` |
| `unified` | `/diego:plan {N+1}` |
| `phase_completed` | `/diego:plan {N+1}` |
| `paused` | `/diego:resume` |
| `blocked` | Resolver blockers |

**Output:**
```
╔═══════════════════════════════════════════════╗
║  DIEGO — Project Progress                    ║
╚═══════════════════════════════════════════════╝

Milestone: v1.0 | Profile: balanced | Mode: ⚡ fast

Phases: [████████░░░░] 66% — 2 of 3

✓ Phase 1: Foundation (3/3 plans)
✓ Phase 2: Authentication (2/2 plans)
⟳ Phase 3: API Endpoints (0/2 plans)

─── Current ───────────────────────────────────
Phase: 3 — API Endpoints
Status: planning

─── Suggested ─────────────────────────────────
/diego:plan 3
```

---

## Shortcuts

Los shortcuts son la diferencia clave de Diego. Para tareas donde el ciclo completo es overkill.

### `/diego:do <description>`

**All-in-one: plan + execute + unify en un shot.** El comando estrella de Diego. Para cuando sabes exactamente que quieres.

**Sintaxis:**
```
/diego:do add user authentication with JWT
/diego:do refactor payment module to strategy pattern
/diego:do add dark mode toggle --thorough
```

**Flujo interno:**
1. Crea directorio en `.planning/quick/{NNN}-{slug}/`
2. Spawn diego-planner en modo `quick-plan` (1-3 tareas, ~30% contexto)
3. **Sin esperar aprobacion**, spawn diego-executor inmediatamente
4. Auto-UNIFY minimal
5. Actualiza STATE.md con decision
6. Commit docs

**Diferencia con el Core Loop:**
- No pide aprobacion del plan
- Plan es minimal (1-3 tareas)
- Todo en un solo shot
- Ideal para features medianas que puedes describir en una frase

**Con --thorough:** Agrega research + plan-check + verification + full UNIFY.

**Ejemplos:**
```
/diego:do add pagination to user list endpoint
/diego:do create error boundary component for React forms
/diego:do add rate limiting middleware to Express routes
/diego:do setup GitHub Actions CI pipeline
```

---

### `/diego:fix <description>`

**Shortcut para bugs: diagnose + plan + execute.** Primero investiga, luego arregla.

**Sintaxis:**
```
/diego:fix login button not responding on mobile
/diego:fix memory leak in dashboard component
/diego:fix API returning 500 on large payloads --thorough
```

**Flujo interno:**
1. Spawn diego-debugger con metodo cientifico:
   - **Observar:** Leer logs, reproducir, identificar archivos
   - **Hipotesis:** Formular 1-3 causas posibles
   - **Probar:** Testear cada hipotesis con evidencia
   - **Concluir:** Identificar root cause
2. Escribe `DIAGNOSIS.md`
3. Spawn diego-planner en modo `fix-plan`
4. Spawn diego-executor
5. Auto-UNIFY

**Cuando usar fix vs quick:**
- **fix:** Cuando no sabes la causa del bug (necesitas diagnostico)
- **quick:** Cuando ya sabes que arreglar (solo ejecutar)

**Output:**
```
─── Bug Fixed ─────────────────────────────────
🔧 login button not responding on mobile

Root Cause: Click handler attached to wrong element due to z-index overlap
Fix: Moved event listener to parent container, added pointer-events
Commits: fix(quick-login-fix-t01): resolve click handler z-index [abc1234]
Tests: 3/3 passing
```

---

### `/diego:quick <description>`

**Tarea rapida: execute + unify.** Sin planificacion. Para cuando ya tienes el plan en la cabeza.

**Sintaxis:**
```
/diego:quick add error boundary to payment form
/diego:quick update navbar links to new routes
/diego:quick remove deprecated API endpoints
```

**Flujo interno:**
1. Analiza la descripcion
2. Lee archivos relevantes del codebase
3. Hace los cambios directamente
4. Commit atomico
5. Crea SUMMARY.md minimal
6. Actualiza STATE.md

**Diferencia con `do`:**
- `do` planifica primero (crea PLAN.md), luego ejecuta
- `quick` ejecuta directamente sin plan
- `quick` es para tareas simples y claras
- `do` es para tareas que necesitan estructura

**Tabla comparativa:**

| | `do` | `fix` | `quick` |
|---|------|-------|---------|
| Planifica | Si (auto) | Si (post-diagnosis) | No |
| Diagnostica | No | Si | No |
| Ejecuta | Si | Si | Si |
| Unifica | Si (auto) | Si (auto) | Si (auto) |
| Ideal para | Features | Bugs | Tweaks |

---

## Session

Gestion de sesiones para trabajo continuo entre multiples conversaciones de Claude.

### `/diego:pause [reason]`

**Crea un handoff y pausa el trabajo.** Guarda contexto para poder continuar despues.

**Sintaxis:**
```
/diego:pause
/diego:pause going to lunch
/diego:pause blocked on API design decision
```

**Que hace:**
1. Lee STATE.md para posicion actual
2. Resume lo completado en esta sesion
3. Identifica siguientes pasos
4. Escribe `.planning/HANDOFF.md` con:
   - Estado actual (fase, plan, status)
   - Que se hizo
   - Que falta
   - Decisiones importantes
   - Preguntas abiertas
5. Actualiza STATE.md a `paused`
6. Commit

**Cuando usarlo:**
- Antes de cerrar una sesion de Claude
- Cuando necesitas cambiar de contexto
- Cuando estas bloqueado y necesitas pensar

---

### `/diego:resume`

**Restaura contexto de una sesion previa.** Lee el HANDOFF.md y te pone al dia.

**Sintaxis:**
```
/diego:resume
```

**Que hace:**
1. Busca HANDOFF.md
2. Lee STATE.md y ROADMAP.md
3. Muestra resumen:
   - Que se hizo en la sesion anterior
   - Que sigue
   - Preguntas abiertas pendientes
4. Sugiere siguiente accion
5. Elimina HANDOFF.md (ya fue consumido)

**Output:**
```
╔═══════════════════════════════════════════════╗
║  DIEGO — Resuming Project                    ║
╚═══════════════════════════════════════════════╝

Phase: 2 — Authentication
Last Updated: 2026-03-01

─── From Last Session ─────────────────────────
Completed login endpoint and JWT generation.
Pending: route protection middleware.

─── Next Steps ────────────────────────────────
1. Implement auth middleware
2. Add to protected routes

─── Suggested ─────────────────────────────────
/diego:execute 2
```

---

### `/diego:handoff`

**Genera un documento de handoff comprensivo.** Mas detallado que pause — diseñado para compartir contexto con otra persona o sesion.

**Sintaxis:**
```
/diego:handoff
```

**Diferencia con pause:**
- `pause` es rapido, para ti mismo
- `handoff` es comprensivo, para compartir con otros
- `handoff` incluye overview completo del proyecto, decisiones arquitectonicas, riesgos

---

## Roadmap

Gestion dinamica del roadmap sin tener que editar archivos manualmente.

### `/diego:add-phase <description>`

**Agrega una fase al final del roadmap.**

**Sintaxis:**
```
/diego:add-phase WebSocket real-time notifications
/diego:add-phase Admin dashboard with analytics
```

**Que hace:**
1. Determina el siguiente numero de fase
2. Crea directorio: `.planning/phases/{NN}-{slug}/`
3. Agrega seccion en ROADMAP.md con goal y status pending
4. Commit

**Output:**
```
─── Phase Added ───────────────────────────────
✓ Phase 4: WebSocket real-time notifications
  Directory: .planning/phases/04-websocket-real-time-notifications/

Next: /diego:plan 4
```

---

### `/diego:remove-phase <N>`

**Elimina una fase futura del roadmap.**

**Sintaxis:**
```
/diego:remove-phase 5
/diego:remove-phase 3 --force
```

**Protecciones:**
- No puedes eliminar la fase actual en ejecucion
- Si la fase tiene planes, necesitas `--force`
- Elimina la seccion del ROADMAP.md y el directorio

---

### `/diego:insert-phase <after> <description>`

**Inserta una fase entre fases existentes usando numeracion decimal.**

**Sintaxis:**
```
/diego:insert-phase 2 urgent security hotfix
```

Esto crea la fase 2.1 entre la fase 2 y la 3. Si 2.1 ya existe, crea 2.2.

**Cuando usarlo:**
- Trabajo urgente que no puede esperar
- Descubriste un prerequisito que falta
- Hotfix de seguridad

---

## Milestones

### `/diego:milestone <name>`

**Crea un nuevo milestone (version del producto).**

**Sintaxis:**
```
/diego:milestone v2.0 Premium Features
```

**Que hace:**
1. Verifica si el milestone actual esta completo
2. Actualiza PROJECT.md con nuevo contexto
3. Pregunta por nuevos requisitos
4. Crea/actualiza REQUIREMENTS.md
5. Resetea STATE.md para el nuevo milestone

---

### `/diego:complete-milestone`

**Archiva un milestone completado.**

**Sintaxis:**
```
/diego:complete-milestone
```

**Que hace:**
1. Verifica que todas las fases estan completas
2. Crea resumen del milestone en `.planning/milestones/{version}-{name}/`
3. Archiva ROADMAP.md del milestone
4. Prepara para el siguiente milestone

---

## Pre-Planning

Preparacion opcional antes de planificar. Util para proyectos complejos.

### `/diego:discuss [phase]`

**Captura vision y preferencias antes de planificar.** Conversacion adaptativa para entender como quieres que se construya algo.

**Sintaxis:**
```
/diego:discuss 2
/diego:discuss
```

**Que pregunta:**
1. Como deberia verse/sentirse esta fase cuando este terminada?
2. Preferencias de implementacion (patrones, librerias)?
3. Hay referencia o prior art?
4. Que te preocupa?

**Genera:** `CONTEXT.md` en el directorio de la fase. El planner lo lee para respetar tus preferencias.

**Cuando usarlo:**
- Antes de `/diego:plan` para fases complejas
- Cuando tienes opiniones fuertes sobre la implementacion
- Cuando quieres guiar la arquitectura

---

### `/diego:research <topic>`

**Investiga un tema o ecosistema.** Spawn diego-researcher para buscar best practices, comparar alternativas y recomendar un approach.

**Sintaxis:**
```
/diego:research JWT vs session-based auth for microservices
/diego:research state management options for React 2026
/diego:research database migration strategies for PostgreSQL
```

**Genera:** `RESEARCH-{slug}.md` con:
- Summary
- Key findings
- Recommended approach con rationale
- Alternatives considered (tabla comparativa)
- Dependencies
- Risks
- Sources con links

**Cuando usarlo:**
- Antes de tomar decisiones arquitectonicas
- Cuando no conoces bien el ecosistema
- Automaticamente en `--thorough` mode antes de planificar

---

### `/diego:map-codebase`

**Analiza el codebase existente en 4 dimensiones.** Spawns 4 agentes mapper en paralelo.

**Sintaxis:**
```
/diego:map-codebase
```

**Genera 5 documentos en `.planning/codebase/`:**

| Archivo | Analiza |
|---------|---------|
| `TECH.md` | Lenguajes, frameworks, deps, build tools |
| `ARCHITECTURE.md` | Modulos, data flow, patterns, APIs |
| `QUALITY.md` | Tests, error handling, code style |
| `CONCERNS.md` | Tech debt, seguridad, performance |
| `SUMMARY.md` | Sintesis de los 4 analisis |

**Cuando usarlo:**
- Al inicio de un proyecto con codebase existente
- Antes de un refactor grande
- Para entender un proyecto nuevo

---

## Config

### `/diego:settings`

**Configura el workflow y perfil de Diego.**

**Sintaxis:**
```
/diego:settings
```

**Opciones configurables:**

| Setting | Valores | Default | Que hace |
|---------|---------|---------|----------|
| `model_profile` | quality / balanced / budget | balanced | Que modelo usa cada agente |
| `commit_docs` | true / false | true | Auto-commit docs de planificacion |
| `branching_strategy` | none / phase-branch / feature-branch | none | Estrategia de branching |
| `thorough_default` | true / false | false | Modo thorough por defecto |
| `auto_unify` | true / false | true | Auto-UNIFY despues de execute |

**Configuracion directa:** Edita `.planning/config.json`:
```json
{
  "model_profile": "quality",
  "commit_docs": true,
  "branching_strategy": "phase-branch",
  "thorough_default": false,
  "auto_unify": true
}
```

---

### `/diego:help`

**Muestra esta referencia.**

```
/diego:help
```

---

## Flag Global: --thorough

Agrega `--thorough` a **cualquier comando** para activar todos los gates opcionales.

**Que activa:**

| Gate | Sin flag | Con --thorough |
|------|----------|----------------|
| Research antes de planificar | SKIP | Spawn diego-researcher |
| Verificacion del plan | SKIP | Plan-check (max 2 iteraciones) |
| Verificacion post-ejecucion | SKIP | Spawn diego-verifier |
| Reconciliacion UNIFY | Minimal (archivos existen?) | Full (verificar cada AC) |
| Logging de decisiones | Solo criticas | Todo decision logged |

**Cuando usar --thorough:**
- Fases criticas (auth, payments, security)
- Antes de un release
- Cuando quieres maxima confianza
- Para features complejas con muchas interdependencias

**Cuando NO usar:**
- Tareas simples y claras
- Iteraciones rapidas
- Prototipado

**Ejemplos:**
```
/diego:plan 1 --thorough      ← Research + plan-check
/diego:execute 1 --thorough   ← Verification post-ejecucion
/diego:do add auth --thorough  ← Todo: research + plan-check + verification + full unify
```

---

## Perfiles de Modelo

Cada agente de Diego usa un modelo de IA diferente segun el perfil configurado.

### Tabla de Modelos

| Agente | quality | balanced | budget |
|--------|---------|----------|--------|
| diego-planner | opus | opus | sonnet |
| diego-executor | opus | sonnet | sonnet |
| diego-verifier | sonnet | sonnet | haiku |
| diego-researcher | opus | sonnet | haiku |
| diego-mapper | sonnet | haiku | haiku |
| diego-debugger | opus | sonnet | sonnet |

### Cuando usar cada perfil

- **quality:** Arquitectura compleja, decisiones criticas, problemas nuevos. Mejor razonamiento, mayor costo.
- **balanced** (default): Trabajo de desarrollo normal. Buen balance entre capacidad y costo.
- **budget:** Tareas repetitivas, mapeo simple, alto volumen. Menor costo.

### Cambiar perfil
```
/diego:settings
```
O edita `config.json`: `"model_profile": "quality"`

---

## Estructura de Proyecto

Cuando ejecutas `/diego:init`, se crea esta estructura:

```
.planning/
├── PROJECT.md              ← Vision, usuarios, stack
├── REQUIREMENTS.md         ← Requisitos P0/P1/P2
├── ROADMAP.md              ← Fases con goals y progreso
├── STATE.md                ← Posicion actual, decisiones, blockers
├── config.json             ← Configuracion de Diego
├── HANDOFF.md              ← Contexto para resume (temporal)
│
├── phases/
│   ├── 01-foundation/
│   │   ├── 01-01-PLAN.md          ← Plan con AC y boundaries
│   │   ├── 01-01-SUMMARY.md       ← Resultado de ejecucion
│   │   ├── 01-02-PLAN.md          ← Segundo plan (si aplica)
│   │   ├── 01-02-SUMMARY.md
│   │   ├── 01-VERIFICATION.md     ← Reporte de verificacion
│   │   └── CONTEXT.md             ← Vision capturada (opcional)
│   │
│   └── 02-auth/
│       └── ...
│
├── quick/                  ← Tareas rapidas (do/fix/quick)
│   ├── 001-add-logout/
│   │   ├── PLAN.md
│   │   └── SUMMARY.md
│   └── 002-fix-header/
│       ├── DIAGNOSIS.md    ← Solo para fix
│       ├── PLAN.md
│       └── SUMMARY.md
│
├── research/               ← Documentos de investigacion
│   └── RESEARCH-jwt-auth.md
│
├── codebase/               ← Analisis de codebase
│   ├── TECH.md
│   ├── ARCHITECTURE.md
│   ├── QUALITY.md
│   ├── CONCERNS.md
│   └── SUMMARY.md
│
└── milestones/             ← Milestones archivados
    └── v1.0-mvp/
```

**Compatibilidad:** La estructura `.planning/` es compatible con GSD. Puedes usar ambos frameworks en el mismo proyecto.

---

## Agentes

Diego usa 6 agentes especializados (vs 11 de GSD):

### diego-planner
**Crea planes ejecutables.** Analiza contexto, divide en tareas, asigna waves, escribe AC.
- Modos: full-plan, quick-plan, fix-plan
- Spawned por: plan, do, fix

### diego-executor
**Ejecuta planes.** Tarea por tarea, commit atomico, verificacion, SUMMARY.md.
- Respeta boundaries estrictamente
- Retry en fallos (max 2)
- Spawned por: execute, do, fix, quick

### diego-verifier
**Verifica resultados.** Analisis goal-backward, AC verification, artifact check.
- Modos: phase-verify, plan-check
- Solo en --thorough o /diego:verify explicito

### diego-researcher
**Investiga ecosistemas.** Web search, documentacion, comparativas.
- Solo en --thorough o /diego:research explicito
- Output: RESEARCH.md

### diego-mapper
**Analiza codebases.** 4 dimensiones: tech, architecture, quality, concerns.
- Usa modelo barato (haiku en budget)
- Spawned por: map-codebase

### diego-debugger
**Diagnostica bugs.** Metodo cientifico: observar → hipotesis → probar → concluir.
- Output: DIAGNOSIS.md
- Spawned por: fix

---

## Checkpoints y Simbolos

Diego usa simbolos consistentes en su output:

### Simbolos de Status
| Simbolo | Significado |
|---------|-------------|
| `✓` | Completado / exito |
| `⟳` | En progreso |
| `○` | Pendiente |
| `✗` | Fallido |
| `⚡` | Modo fast (default) |
| `🔍` | Modo thorough |

### Tipos de Checkpoint
| Marcador | Tipo | Cuando |
|----------|------|--------|
| `◇ DECISION` | Eleccion arquitectonica | Siempre se loguea |
| `◆ CHECKPOINT` | Verificacion automatica | Fast: solo fallos. Thorough: todo |
| `● ACTION` | Accion visible (commit, branch) | Siempre se muestra |
| `⊘ GATE` | Gate opcional | Fast: skip. Thorough: ejecutar |

### Barras de Progreso
```
[████████░░░░] 66% — Phase 2 of 3
[████████████] 100% — All plans executed
```

---

## Flujos de Trabajo Comunes

### Proyecto nuevo desde cero
```
/diego:init                    ← Define proyecto y roadmap
/diego:plan 1                  ← Planifica primera fase
/diego:execute 1               ← Ejecuta
/diego:progress                ← Revisa estado, ve siguiente accion
/diego:plan 2                  ← Siguiente fase...
```

### Feature rapida
```
/diego:do add user avatar upload with S3
```

### Bug fix
```
/diego:fix form validation not working on Safari
```

### Tarea minima
```
/diego:quick update footer copyright year
```

### Proyecto con investigacion previa
```
/diego:init
/diego:research best auth patterns for microservices 2026
/diego:discuss 1               ← Capture preferences antes de planear
/diego:plan 1 --thorough       ← Plan con research incluido
/diego:execute 1 --thorough    ← Ejecucion con verificacion
```

### Sesion continua (multi-dia)
```
# Dia 1
/diego:init
/diego:plan 1
/diego:execute 1
/diego:pause going home

# Dia 2
/diego:resume                  ← Restaura contexto
/diego:plan 2                  ← Continua donde dejaste
```

### Mapear codebase existente antes de trabajar
```
/diego:map-codebase            ← Analiza tech, arch, quality, concerns
/diego:init                    ← Ahora define el proyecto con contexto
```

---

## Tips y Buenas Practicas

### Velocidad
- Usa `do` para features claras — evita el ciclo plan/execute/unify manual
- Usa `quick` para cambios triviales — ni siquiera planifica
- Solo usa `--thorough` para fases criticas
- El perfil `budget` es suficiente para la mayoria de tareas simples

### Calidad
- Usa `--thorough` para auth, payments, security
- Corre `/diego:verify` antes de milestones
- Usa `/diego:discuss` para fases donde tienes opiniones fuertes
- Las boundaries en PLAN.md previenen cambios accidentales

### Organizacion
- `/diego:progress` es tu brujula — usalo frecuentemente
- `/diego:pause` antes de cerrar sesion — tu yo futuro te lo agradecera
- Las decisiones se loguean automaticamente en STATE.md
- Cada commit es atomico y trazable a un task

### Cuando usar cada comando

| Situacion | Comando |
|-----------|---------|
| Empezar proyecto | `/diego:init` |
| Necesito planificar | `/diego:plan N` |
| Ejecutar lo planificado | `/diego:execute N` |
| Verificar que funciona | `/diego:verify N` |
| Cerrar una fase | `/diego:unify N` |
| Feature en un shot | `/diego:do <desc>` |
| Algo esta roto | `/diego:fix <desc>` |
| Cambio rapido | `/diego:quick <desc>` |
| Donde estoy? | `/diego:progress` |
| Me voy | `/diego:pause` |
| Volvi | `/diego:resume` |
| Antes de planear | `/diego:discuss` |
| No conozco el tema | `/diego:research <topic>` |
| Codebase nuevo para mi | `/diego:map-codebase` |

---

## CLI Helper: diego-tools.cjs

Diego tiene un CLI helper deterministico en Node.js que maneja toda la logica no-creativa. Los workflows lo llaman para operaciones como:

```bash
# Cargar estado del proyecto
node ~/.claude/diego/bin/diego-tools.cjs state load

# Resolver modelo para un agente
node ~/.claude/diego/bin/diego-tools.cjs resolve-model planner

# Agregar fase al roadmap
node ~/.claude/diego/bin/diego-tools.cjs phase add "nueva fase"

# Commit con convenciones Diego
node ~/.claude/diego/bin/diego-tools.cjs commit "feat(p01): description"

# Generar slug
node ~/.claude/diego/bin/diego-tools.cjs generate-slug "My Feature Name"
# → my-feature-name
```

No necesitas interactuar directamente con diego-tools — los workflows lo usan internamente.
