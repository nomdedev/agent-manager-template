# 📦 Guía de Publicación en npm

> Cómo publicar `@matiasscalbi/auto-audit-loop` en el registry de npm

---

## Requisitos Previos

1. **Cuenta en npm**: https://www.npmjs.com/signup
2. **Node.js 18+**: `node --version`
3. **Autenticación**: `npm login` o `npm adduser`

---

## Paso 1: Login en npm

```bash
# Login interactivo
npm login

# O con token (CI/CD)
npm config set //registry.npmjs.org/:_authToken=${NPM_TOKEN}
```

Verificar:
```bash
npm whoami
# Debería mostrar tu username de npm
```

---

## Paso 2: Preparar el Package

```bash
cd npm-package/

# Instalar dependencias (si no lo hiciste)
npm install

# Build
npm run build

# Verificar estructura
ls -la dist/
ls -la templates/
```

Deberías ver:
```
dist/
  cli/
    bin.js
    init.js
templates/
  skill.md
  hook.sh
  script.js
  command.md
```

---

## Paso 3: Publicar

### Opción A: Script automático (Linux/Mac)

```bash
chmod +x publish.sh
./publish.sh
```

### Opción B: Script automático (Windows)

```cmd
publish.bat
```

### Opción C: Manual

```bash
# Bump version (patch/minor/major)
npm version patch

# Publicar con acceso público (scoped package)
npm publish --access public
```

---

## Paso 4: Verificar Publicación

```bash
# Verificar en el registry
npm view @matiasscalbi/auto-audit-loop

# Verificar versión
npm view @matiasscalbi/auto-audit-loop version

# Instalar globalmente
npm install -g @matiasscalbi/auto-audit-loop

# Verificar binarios
which auto-audit
which auto-audit-init

# Testear
auto-audit-init --help
auto-audit --help
```

---

## Paso 5: Instalar en un Proyecto

```bash
# Global (recomendado)
npm install -g @matiasscalbi/auto-audit-loop

# Inicializar en proyecto
cd ./mi-proyecto
auto-audit-init --yes

# Ejecutar auditoría
auto-audit src/index.ts "typescript-expert security-auditor"
```

---

## Troubleshooting

| Problema | Solución |
|----------|----------|
| "ENEEDAUTH" | Ejecutar `npm login` primero |
| "E403" | Verificar que el package name no esté tomado |
| "E429" | Rate limit de npm. Esperar unos minutos |
| "EPUBLISHCONFLICT" | Bump version: `npm version patch` |
| "Templates no encontrados" | Verificar que `templates/` esté en `files[]` del package.json |

---

## CI/CD (GitHub Actions)

```yaml
# .github/workflows/publish.yml
name: Publish to npm
on:
  push:
    branches: [main]
    tags: ['v*']

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          registry-url: 'https://registry.npmjs.org'
      - run: npm ci
      - run: npm run build
      - run: npm publish --access public
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

Configurar `NPM_TOKEN` en GitHub Settings → Secrets → Actions.

---

## Estructura Final del Package

```
npm-package/
├── package.json          # Configuración del package
├── tsconfig.json         # Configuración de TypeScript
├── README.md             # Documentación
├── LICENSE               # MIT License
├── .npmignore            # Archivos a excluir
├── publish.sh            # Script de publicación (Linux/Mac)
├── publish.bat           # Script de publicación (Windows)
├── src/
│   └── cli/
│       ├── bin.ts        # Entry point: auto-audit
│       └── init.ts       # Entry point: auto-audit-init
├── dist/                 # Compilado (incluido en npm)
│   └── cli/
│       ├── bin.js
│       └── init.js
└── templates/            # Templates (incluido en npm)
    ├── skill.md
    ├── hook.sh
    ├── script.js
    └── command.md
```

---

## Comandos Útiles

```bash
# Verificar package antes de publicar
npm pack --dry-run

# Verificar contenido del tarball
npm pack && tar -tf *.tgz

# Despublicar versión (cuidado!)
npm unpublish @matiasscalbi/auto-audit-loop@1.0.0

# Deprecar versión
npm deprecate @matiasscalbi/auto-audit-loop@1.0.0 "Use 1.0.1 instead"

# Listar versiones
npm view @matiasscalbi/auto-audit-loop versions
```

---

## Contacto

- **Autor**: Matias Scalbi
- **GitHub**: https://github.com/matiasscalbi/auto-audit-loop
- **Issues**: https://github.com/matiasscalbi/auto-audit-loop/issues
- **npm**: https://www.npmjs.com/package/@matiasscalbi/auto-audit-loop

---

*Última actualización: 2026-06-20*
