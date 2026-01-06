@echo off
setlocal EnableDelayedExpansion

title Cloudflare Desktop - Auto Release Tool

echo ========================================================
echo       Cloudflare Desktop - Auto Release Tool
echo ========================================================

REM Listen for user input - Force clean previous git locks if any
if exist ".git\index.lock" (
    echo [Fix] Removing stale git index.lock...
    del ".git\index.lock"
)

REM Check Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo Error: Node.js is not installed or not in PATH.
    pause
    exit /b
)

REM --- AUTO-DETECT GITHUB TOKEN ---
if not "%GH_TOKEN%"=="" goto TokenFound
for /f "tokens=3*" %%a in ('reg query HKCU\Environment /v GH_TOKEN 2^>nul') do set GH_TOKEN=%%a
if not "%GH_TOKEN%"=="" goto TokenFound

REM Try GitHub CLI
where gh >nul 2>nul
if %errorlevel% equ 0 (
    echo [Info] GitHub CLI detected. Fetching token...
    for /f %%t in ('gh auth token') do set GH_TOKEN=%%t
)
if not "%GH_TOKEN%"=="" goto TokenFound

echo.
echo [!] Electron-Builder needs a GitHub Token to release.
set /p "GH_TOKEN=Please paste your GitHub Token: "
if "%GH_TOKEN%"=="" (
    echo [Error] No token. Cannot release.
    pause
    exit /b
) else (
    setx GH_TOKEN "%GH_TOKEN%"
)

:TokenFound
set GH_TOKEN=%GH_TOKEN%

REM --- VERSION MANAGEMENT ---
for /f "delims=" %%v in ('node -p "require('./package.json').version"') do set PROJ_VERSION=%%v

echo.
echo Current Version: v%PROJ_VERSION%
echo.
echo Select action:
echo [1] Use current version (v%PROJ_VERSION%) - You manually updated package.json
echo [2] Auto-increment Patch (v%PROJ_VERSION% + 0.0.1)
echo [3] Auto-increment Minor
echo.
set /p "CHOICE=Enter choice (1/2/3) [Default: 2]: "
if "%CHOICE%"=="" set CHOICE=2

if "%CHOICE%"=="2" (
    echo [Update] Bumping Patch version...
    call npm version patch --no-git-tag-version
)
if "%CHOICE%"=="3" (
    echo [Update] Bumping Minor version...
    call npm version minor --no-git-tag-version
)

REM Re-read version after update
for /f "delims=" %%v in ('node -p "require('./package.json').version"') do set VERSION=%%v

echo.
echo --------------------------------------------------------
echo  Releasing Version: v%VERSION%
echo --------------------------------------------------------
echo.

REM --- GIT OPERATIONS ---
echo [Step 1/3] Syncing Git Repository...
git add .
call git commit -m "chore: release v!VERSION!" >nul 2>&1
echo    - Code committed.

echo    - Pushing to GitHub...
call git push origin main

REM Handle Tag
echo    - Tagging release v!VERSION!...
call git tag -d v!VERSION! >nul 2>&1
call git push origin :refs/tags/v!VERSION! >nul 2>&1
call git tag v!VERSION!
call git push origin v!VERSION!

REM --- BUILD & PUBLISH ---
echo.
echo [Step 2/3] Building Source Code...
call npm run build

echo.
echo [Step 3/3] Packaging and Uploading to GitHub...
call npx electron-builder --win --publish always

if %errorlevel% neq 0 (
    echo.
    echo [X] Build/Publish Failed.
    pause
    exit /b
)

echo.
echo ========================================================
echo  SUCCESS! Release v%VERSION% is live.
echo  Link: https://github.com/DM-WuzuanTW/cloudflare/releases/tag/v%VERSION%
echo ========================================================
echo.
pause
