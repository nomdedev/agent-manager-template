#!/bin/bash
# publish.sh — Script para publicar @matiasscalbi/auto-audit-loop en npm

set -e

echo "╔════════════════════════════════════════════╗"
echo "║   📦 Publicar Auto-Audit Loop en npm     ║"
echo "╚════════════════════════════════════════════╝"
echo ""

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    echo "❌ Error: No se encontró package.json"
    echo "   Ejecutar desde: npm-package/"
    exit 1
fi

# Verificar login en npm
if ! npm whoami > /dev/null 2>&1; then
    echo "⚠️  No estás logueado en npm"
    echo "   Ejecutar: npm login"
    echo "   O: npm adduser"
    exit 1
fi

# Verificar build
if [ ! -d "dist" ]; then
    echo "📦 Build no encontrado. Compilando..."
    npm run build
fi

# Verificar templates
if [ ! -d "templates" ]; then
    echo "❌ Error: No se encontró templates/"
    exit 1
fi

# Mostrar versión actual
VERSION=$(node -p "require('./package.json').version")
echo "📦 Versión actual: $VERSION"
echo ""

# Preguntar si es patch, minor o major
read -p "¿Tipo de versión? [patch/minor/major] (default: patch): " BUMP
BUMP=${BUMP:-patch}

# Bump version
echo "📦 Bumping version: $BUMP"
npm version $BUMP

# Publicar
echo ""
echo "📦 Publicando a npm..."
npm publish --access public

# Mostrar resultado
NEW_VERSION=$(node -p "require('./package.json').version")
echo ""
echo "╔════════════════════════════════════════════╗"
echo "║   ✅ Publicado!                            ║"
echo "╚════════════════════════════════════════════╝"
echo ""
echo "   Package: @matiasscalbi/auto-audit-loop@$NEW_VERSION"
echo "   URL: https://www.npmjs.com/package/@matiasscalbi/auto-audit-loop"
echo ""
echo "   Instalar:"
echo "   npm install -g @matiasscalbi/auto-audit-loop"
echo ""
