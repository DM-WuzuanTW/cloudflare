@echo off
setlocal EnableDelayedExpansion

set LOGFILE=publish_log.txt
echo ======================================================== > %LOGFILE%
echo       Cloudflare Desktop - Auto Release Tool (Logged) >> %LOGFILE%
echo       Date: %date% %time% >> %LOGFILE%
echo ======================================================== >> %LOGFILE%

title Cloudflare Desktop - Auto Release Tool

echo.
echo [Info] Logs will be saved to %LOGFILE%
echo.

REM --- CHECK DEPENDENCIES ---
call :Log "Checking environment..."

if exist ".git\index.lock" (
    call :Log "[Fix] Removing stale git index.lock..."
    del ".git\index.lock"
)

where node >nul 2>nul
if %errorlevel% neq 0 (
    call :Log "[Error] Node.js is not installed."
    pause
    exit /b
)

REM --- GITHUB TOKEN ---
if not "%GH_TOKEN%"=="" goto TokenFound
for /f "tokens=3*" %%a in ('reg query HKCU\Environment /v GH_TOKEN 2^>nul') do set GH_TOKEN=%%a
if not "%GH_TOKEN%"=="" goto TokenFound

where gh >nul 2>nul
if %errorlevel% equ 0 (
    call :Log "[Info] GitHub CLI detected. Fetching token..."
    for /f %%t in ('gh auth token') do set GH_TOKEN=%%t
)

if "%GH_TOKEN%"=="" (
    echo.
    echo [!] GitHub Token Not Found.
    set /p "GH_TOKEN=Please paste your GitHub Token: "
    if "!GH_TOKEN!"=="" (
        call :Log "[Error] No token provided. Exiting."
        pause
        exit /b
    ) else (
        setx GH_TOKEN "!GH_TOKEN!"
        call :Log "[Info] Token saved to environment."
    )
)
:TokenFound
set GH_TOKEN=%GH_TOKEN%
call :Log "[Info] GitHub Token: Found (Hidden)"

REM --- VERSIONING ---
for /f "delims=" %%v in ('node -p "require('./package.json').version"') do set PROJ_VERSION=%%v
call :Log "[Info] Current package.json version: v%PROJ_VERSION%"

echo.
echo Current Version: v%PROJ_VERSION%
echo Select action:
echo [1] Use current version (v%PROJ_VERSION%) - You manually updated package.json
echo [2] Auto-increment Patch (v%PROJ_VERSION% + 0.0.1)
echo [3] Auto-increment Minor
echo.
set /p "CHOICE=Enter choice (1/2/3) [Default: 2]: "
if "%CHOICE%"=="" set CHOICE=2

if "%CHOICE%"=="2" (
    call :Log "[Action] Bumping Patch version..."
    call npm version patch --no-git-tag-version >> %LOGFILE% 2>&1
)
if "%CHOICE%"=="3" (
    call :Log "[Action] Bumping Minor version..."
    call npm version minor --no-git-tag-version >> %LOGFILE% 2>&1
)

for /f "delims=" %%v in ('node -p "require('./package.json').version"') do set VERSION=%%v
call :Log "[Info] Target Release Version: v%VERSION%"

REM --- GIT SYNC ---
call :Log "[Step 1/3] Syncing Git Repository..."

call :Log "   - Git Adding all files..."
git add . >> %LOGFILE% 2>&1

call :Log "   - Committing changes..."
call git commit -m "chore: release v!VERSION!" >> %LOGFILE% 2>&1

call :Log "   - Pushing to branch main..."
call git push origin main >> %LOGFILE% 2>&1

call :Log "   - Handling Tags..."
call git tag -d v!VERSION! >> %LOGFILE% 2>&1
call git push origin :refs/tags/v!VERSION! >> %LOGFILE% 2>&1
call git tag v!VERSION! >> %LOGFILE% 2>&1
call git push origin v!VERSION! >> %LOGFILE% 2>&1

REM --- BUILD & PUBLISH ---
call :Log "[Step 2/3] Building Source Code..."
call npm run build >> %LOGFILE% 2>&1
if %errorlevel% neq 0 (
    call :Log "[Error] Vite Build Failed. Check log."
    goto ErrorHandler
)

call :Log "[Step 3/3] Packaging and Uploading to GitHub with electron-builder..."
REM We use --publish always to ensure it uploads
call npx electron-builder --win --publish always >> %LOGFILE% 2>&1

if %errorlevel% neq 0 (
    call :Log "[Error] Electron-Builder Failed. Check log."
    goto ErrorHandler
)

REM --- LATEST.YML CHECK ---
call :Log "[Step 4/3] Verifying Release Assets..."
if exist "release\latest.yml" (
    where gh >nul 2>nul
    if %errorlevel% equ 0 (
        call :Log "[Fix] Forcing upload of latest.yml via GitHub CLI..."
        call gh release upload v%VERSION% release/latest.yml --clobber >> %LOGFILE% 2>&1
    ) else (
        call :Log "[Warn] 'gh' CLI not found. Skipping manual latest.yml upload."
    )
) else (
    call :Log "[Warn] release\latest.yml not found. Auto-update might fail."
)

call :Log "[Success] Release v%VERSION% completed successfully."
echo.
echo ========================================================
echo  SUCCESS!
echo  Log file: %LOGFILE%
echo  Link: https://github.com/DM-WuzuanTW/cloudflare/releases/tag/v%VERSION%
echo ========================================================
echo.
pause
exit /b

:ErrorHandler
echo.
echo [!] Process Failed. See %LOGFILE% for details.
pause
exit /b

:Log
echo %~1
echo %~1 >> %LOGFILE%
exit /b
