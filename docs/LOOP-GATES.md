# Loop Gates — Verificadores Objetivos

> Un gate es lo que decide si un loop ayuda o solo gasta.
> Sin gate, el loop es el agente estando de acuerdo con él mismo en repeat.

---

## Los 4 Tipos de Gate

### 1. Test Gate
```bash
pnpm test                    # Todos los tests
pnpm run test:unit           # Solo unitarios
pnpm run test:int            # Solo integración
```
**Retorna:** exit code 0 (pass) o non-zero (fail)
**Cuándo usar:** Siempre que haya test suite. Es el gate más confiable.

### 2. Build Gate
```bash
pnpm run build               # TypeScript compilation
tsc --noEmit                 # Type check sin emitir
```
**Retorna:** exit code 0 (compila) o non-zero (errores)
**Cuándo usar:** Para cambios en tipos, interfaces, imports.

### 3. Lint Gate
```bash
pnpm run lint                # ESLint
pnpm run format --check      # Prettier check
```
**Retorna:** exit code 0 (clean) o non-zero (violations)
**Cuándo usar:** Para style fixes, code formatting, reglas de calidad.

### 4. Type Gate
```bash
tsc --noEmit                 # Type check
pnpm run typecheck           # Si está configurado
```
**Retorna:** exit code 0 (types OK) o non-zero (type errors)
**Cuándo usar:** Para cambios en APIs, schemas, interfaces compartidas.

---

## Gate Composition (múltiples gates)

Un loop puede necesitar múltiples gates. Ejemplo:

```bash
# Gate compuesto: todos deben pasar
pnpm run lint && pnpm run typecheck && pnpm test
```

**Regla:** Si CUALQUIER gate falla, el loop no avanza. No hay "parcial".

---

## Maker-Checker Split

El agente que escribe el código (maker) NO es el que lo verifica (checker).

```
┌──────────┐     código      ┌──────────┐
│  MAKER   │ ──────────────→ │  CHECKER  │
│ (escribe)│                 │ (verifica)│
└──────────┘                 └──────────┘
     │                              │
     │         gate result          │
     │ ←─────────────────────────── │
     │                              │
  si PASS → merge              si FAIL → retry
```

**Implementación en Hermes:**
- Maker: subagent con role `leaf` y toolsets `['terminal', 'file']`
- Checker: otro subagent que solo corre `pnpm test && pnpm run lint`
- El checker no ve el razonamiento del maker

---

## Hard Stops

Todo loop DEBE tener un hard stop. Sin uno, el loop corre hasta que alguien nota la factura.

| Stop Type | Ejemplo | Cuándo usar |
|-----------|---------|-------------|
| Token budget | 100k tokens max | Siempre |
| Iteration count | 5 intentos max | Loops de fix/retry |
| Time limit | 10 min max | Loops de exploración |
| Cost cap | $2 USD max | Loops en cloud |

---

## Gate Rot

Los gates se pudren. Un test que aprobaba todo ayer puede no atrapar el failure mode de hoy.

**Spot-check semanal:**
1. Elegí 3 PRs que el loop aprobó esta semana
2. Verificá que el test que los aprobó realmente atrapa el failure mode
3. Si el gate no atrapa nada útil → actualizalo

---

## Integración con Pipeline de 7 Fases

| Fase | Gate existente | Loop Gate adicional |
|------|---------------|-------------------|
| 1. Domain | Requerimientos validados | — |
| 2. Architecture | Diseño aprobado | — |
| 3. Backend | APIs funcionales | Type gate |
| 4. Security | Sin hallazgos críticos | SAST gate |
| 5. Development | Build exitoso | Test + Lint gate |
| 6. QA | Tests pasando | Full gate compound |
| 7. Production | Verificación prod | Smoke test gate |
