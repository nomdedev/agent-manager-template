@echo off
REM publish.bat — Script para publicar @matiasscalbi/auto-audit-loop en npm (Windows)

echo ============================================
echo    📦 Publicar Auto-Audit Loop en npm
echo ============================================
echo.

REM Verificar que estamos en el directorio correcto
if not exist "package.json" (
    echo ❌ Error: No se encontró package.json
    echo    Ejecutar desde: npm-package\
    exit /b 1
)

REM Verificar login en npm
call npm whoami >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️  No estás logueado en npm
    echo    Ejecutar: npm login
    echo    O: npm adduser
    exit /b 1
)

REM Verificar build
if not exist "dist" (
    echo 📦 Build no encontrado. Compilando...
    call npm run build
)

REM Verificar templates
if not exist "templates" (
    echo ❌ Error: No se encontró templates\
    exit /b 1
)

REM Mostrar versión actual
for /f "tokens=*" %%a in ('node -p "require('./package.json').version"') do set VERSION=%%a
echo 📦 Versión actual: %VERSION%
echo.

REM Preguntar tipo de versión
set /p BUMP="¿Tipo de versión? [patch/minor/major] (default: patch): "
if "%BUMP%"=="" set BUMP=patch

REM Bump version
echo 📦 Bumping version: %BUMP%
call npm version %BUMP%

REM Publicar
echo.
echo 📦 Publicando a npm...
call npm publish --access public

REM Mostrar resultado
for /f "tokens=*" %%a in ('node -p "require('./package.json').version"') do set NEW_VERSION=%%a
echo.
echo ============================================
echo    ✅ Publicado!
echo ============================================
echo.
echo    Package: @matiasscalbi/auto-audit-loop@%NEW_VERSION%
echo    URL: https://www.npmjs.com/package/@matiasscalbi/auto-audit-loop
echo.
echo    Instalar:
echo    npm install -g @matiasscalbi/auto-audit-loop
echo.

pause
