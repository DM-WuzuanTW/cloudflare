@echo off
setlocal EnableDelayedExpansion

title Cloudflare Desktop - Auto Release Tool (Robust)

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
echo [Step 1/4] Syncing Git Repository...
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
echo [Step 2/4] Building Source Code...
call npm run build

echo.
echo [Step 3/4] Packaging...
call npx electron-builder --win --publish always

if %errorlevel% neq 0 (
    echo.
    echo [X] Build Failed.
    pause
    exit /b
)

REM --- FORCE RELEASE CREATION & UPLOAD ---
echo.
echo [Step 4/4] Verifying GitHub Release...

REM Check for GitHub CLI - try both PATH and common install location
set "GH_COMMAND="
where gh >nul 2>nul
if %errorlevel% equ 0 (
    set "GH_COMMAND=gh"
) else if exist "C:\Program Files\GitHub CLI\gh.exe" (
    set "GH_COMMAND=C:\Program Files\GitHub CLI\gh.exe"
)

if defined GH_COMMAND (
    REM Create release if not exists (idempotent-ish)
    echo    - Ensuring Release v%VERSION% exists...
    call "%GH_COMMAND%" release create v%VERSION% --title "Release v%VERSION%" --notes "Auto-generated release v%VERSION%" --verify-tag >nul 2>&1
    
    REM Upload assets manually - electron-builder sometimes fails to upload
    echo    - Uploading release assets...
    
    if exist "release\latest.yml" (
        echo      ^> Uploading latest.yml...
        call "%GH_COMMAND%" release upload v%VERSION% "release\latest.yml" --clobber
    ) else (
        echo      [ERROR] latest.yml not found!
    )
    
    if exist "release\Cloudflare Desktop Setup %VERSION%.exe" (
        echo      ^> Uploading installer exe...
        call "%GH_COMMAND%" release upload v%VERSION% "release\Cloudflare Desktop Setup %VERSION%.exe" --clobber
    ) else (
        echo      [ERROR] Installer exe not found!
    )
    
    if exist "release\Cloudflare Desktop Setup %VERSION%.exe.blockmap" (
        echo      ^> Uploading blockmap...
        call "%GH_COMMAND%" release upload v%VERSION% "release\Cloudflare Desktop Setup %VERSION%.exe.blockmap" --clobber
    ) else (
        echo      [WARNING] Blockmap not found (delta updates disabled)
    )
    
    echo    - Upload complete!
    goto :ReleaseSuccess
)

REM If we got here, GitHub CLI is not available
echo.
echo [ERROR] GitHub CLI (gh) is REQUIRED but not installed!
echo.
echo Please install GitHub CLI from: https://cli.github.com/
echo OR run: winget install GitHub.cli
echo.
echo After installation, run: gh auth login
echo.
pause
exit /b 1

:ReleaseSuccess

echo.
echo ========================================================
echo  SUCCESS! Release v%VERSION% is live.
echo  Link: https://github.com/DM-WuzuanTW/cloudflare/releases/tag/v%VERSION%
echo ========================================================
echo.
pause
