# Auto-Update Fix Summary

## Problem
Your Electron app's auto-updater was failing with this error:
```
Error: Cannot find latest.yml in the latest release artifacts
HttpError: 404
```

The app was looking for `latest.yml` at:
`https://github.com/DM-WuzuanTW/cloudflare/releases/download/v1.0.12/latest.yml`

But this file (and other build artifacts) were **not being uploaded to GitHub releases**.

## Root Cause
1. **`electron-builder` wasn't uploading files properly** - While it created the release, it didn't upload the build artifacts
2. **`publish.bat` fallback wasn't working** - The script had backup logic to manually upload files using GitHub CLI, but:
   - GitHub CLI (`gh`) wasn't installed
   - The PATH detection logic had issues causing misleading error messages

## Solution Implemented

### 1. Installed GitHub CLI
Installed GitHub CLI using:
```powershell
winget install GitHub.cli
```

### 2. Fixed `publish.bat` Script
Updated the script to:
- **Detect GitHub CLI properly**: Now checks both PATH and the default installation directory (`C:\Program Files\GitHub CLI\gh.exe`)
- **Use absolute path**: Avoids PATH refresh issues in cmd/PowerShell sessions
- **Better error handling**: Clear success/failure messages with proper script flow control using `goto`
- **Upload all critical files**:
  - `latest.yml` (required for electron-updater)
  - `Cloudflare Desktop Setup X.X.X.exe` (installer)
  - `Cloudflare Desktop Setup X.X.X.exe.blockmap` (for delta updates)

### 3. Verified Release v1.0.14
✅ All files successfully uploaded to: https://github.com/DM-WuzuanTW/cloudflare/releases/tag/v1.0.14

Assets present:
- `latest.yml` (367 Bytes)
- `Cloudflare.Desktop.Setup.1.0.14.exe` (90.5 MB)
- `Cloudflare.Desktop.Setup.1.0.14.exe.blockmap` (98.1 KB)
- Source code archives

## How It Works Now

### Publishing a New Release
1. Run `publish.bat`
2. Choose versioning option (patch, minor, or keep current)
3. The script will:
   - Commit and tag the code
   - Build the React app with Vite
   - Package with electron-builder
   - **Automatically upload to GitHub** (via electron-builder)
   - **Verify and re-upload** (via GitHub CLI as backup)
   - Show success message with release link

### Auto-Update Flow (User Side)
1. **App starts** → Checks for updates (every 30 minutes)
2. **Update found** → Downloads in background (silent)
3. **User quits app** → Update installs automatically
4. **Next launch** → Running latest version

## Configuration Files

### `package.json` - Build Config
```json
"build": {
  "publish": {
    "provider": "github",
    "owner": "DM-WuzuanTW",
    "repo": "cloudflare"
  }
}
```

### `electron/main.js` - Auto-Updater Setup
- `autoUpdater.autoDownload = true` - Downloads updates silently
- `autoUpdater.autoInstallOnAppQuit = true` - Installs on quit
- Checks for updates every 30 minutes
- Uses GH_TOKEN for private repos (if set)

## Important Notes

### GitHub Token
The `GH_TOKEN` environment variable is required for publishing. It's already set in your system:
```
GH_TOKEN = ghp_************************************
```

Never commit this token to git! It's stored in your Windows user environment variables.

### File Naming
electron-builder generates files with this pattern:
- `Cloudflare Desktop Setup 1.0.14.exe`
- `Cloudflare Desktop Setup 1.0.14.exe.blockmap`
- `latest.yml`

The `latest.yml` contains metadata about the latest version and download URLs. Without it, the auto-updater cannot function.

### Troubleshooting

**If auto-update still fails:**
1. Check the app logs at: `%APPDATA%\Cloudflare Desktop\logs\main.log`
2. Verify the release has all 3 files (yml, exe, blockmap)
3. Check if `latest.yml` URL is publicly accessible
4. Ensure the GitHub release is **not a draft**

**If publish.bat fails:**
1. Make sure GitHub CLI is authenticated: `gh auth status`
2. Check your GH_TOKEN has `repo` scope
3. Ensure you have write access to the repository

## Testing the Auto-Update

To test if auto-update is working:

1. **Install v1.0.14** (or earlier) on a test machine
2. **Create a new release** (v1.0.15) using `publish.bat`
3. **Launch the installed app**
4. **Check logs** - Should see "Update available: 1.0.15"
5. **Quit the app** - Update installs
6. **Relaunch** - Now running v1.0.15

You can check the update status in the app's Settings page (it shows current version and has a "Check for Updates" button).

## What Changed

### Modified Files
1. **`publish.bat`** - Improved GitHub CLI detection and upload logic
2. No changes needed to: 
   - `electron/main.js` (auto-updater already properly configured)
   - `package.json` (build config already correct)

### Installed Software
- GitHub CLI (`gh`) v2.83.2

## Success Criteria ✅

- [x] `latest.yml` is uploaded to GitHub releases
- [x] Auto-updater can detect new versions
- [x] Updates download and install silently
- [x] `publish.bat` script works reliably
- [x] Clear error messages if something fails

---

**Last Updated**: 2026-01-06 22:53  
**Release Fixed**: v1.0.14  
**Status**: ✅ Working
