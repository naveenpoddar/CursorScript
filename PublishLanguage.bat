@echo off
setlocal enabledelayedexpansion

:: Check for uncommitted changes
set HAS_CHANGES=0
for /f "tokens=*" %%i in ('git status --porcelain') do set HAS_CHANGES=1

if "!HAS_CHANGES!"=="1" (
    echo ⚠️  You have uncommitted changes:
    git status -s
    echo.
    set /p COMMIT_NOW="Stage and commit these changes before tagging? (y/n) [y]: "
    if "!COMMIT_NOW!"=="" set COMMIT_NOW=y
    
    if /i "!COMMIT_NOW!"=="y" (
        set DEFAULT_MSG=chore: prepare release
        set /p MSG="Enter commit message [default: !DEFAULT_MSG!]: "
        if "!MSG!"=="" set MSG=!DEFAULT_MSG!
        
        echo ➕ Staging changes...
        git add .
        echo 💾 Committing changes...
        git commit -m "!MSG!"
        echo ⬆️ Pushing changes to origin...
        git push
        echo.
    ) else (
        set /p CONTINUE="Continue tagging without committing? (y/n) [n]: "
        if /i "!CONTINUE!" neq "y" exit /b 1
    )
)

:check_commits
:: Get the latest tag from git using version sort (most robust method)
set LATEST_TAG=
for /f "tokens=*" %%a in ('git tag --sort=-v:refname') do (
    set LATEST_TAG=%%a
    goto :found_tag
)

:found_tag
:: If no tag exists, start at v0.0.0
if not defined LATEST_TAG (
    set LATEST_TAG=v0.0.0
    echo ℹ️  No tags found in repository, starting from v0.0.0
) else (
    echo Latest tag found: %LATEST_TAG%
    
    :: Check if there are any commits since the last tag
    :: Note: describe will still tell us if HEAD matches the tag or how many commits away it is
    for /f "tokens=*" %%c in ('git rev-list %LATEST_TAG%..HEAD --count 2^>nul') do (
        set COMMITS_SINCE=%%c
    )
    if not defined COMMITS_SINCE set COMMITS_SINCE=unknown

    if "!COMMITS_SINCE!"=="0" (
        echo.
        echo ℹ️  No new commits since %LATEST_TAG%.
        set /p FORCE="Create a new tag anyway? (y/n) [n]: "
        if /i "!FORCE!" neq "y" exit /b 0
    ) else if "!COMMITS_SINCE!"=="unknown" (
        echo 📈 Tag %LATEST_TAG% is not in the current branch history.
    ) else (
        echo 📈 There are !COMMITS_SINCE! new commit(s^) since %LATEST_TAG%
    )
)

:: Strip the 'v' prefix if it exists for calculation
set VERSION_NUM=%LATEST_TAG%
if "%VERSION_NUM:~0,1%"=="v" set VERSION_NUM=%VERSION_NUM:~1%

:: Parse Major.Minor.Patch
for /f "tokens=1,2,3 delims=." %%a in ("%VERSION_NUM%") do (
    set MAJOR=%%a
    set MINOR=%%b
    set PATCH=%%c
)

:: Ensure we have values
if "!MAJOR!"=="" set MAJOR=0
if "!MINOR!"=="" set MINOR=0
if "!PATCH!"=="" set PATCH=0

:: Increment the Patch version
set /a NEW_PATCH=!PATCH! + 1
set SUGGESTED_TAG=v!MAJOR!.!MINOR!.!NEW_PATCH!

echo.
set /p NEW_TAG="Enter new version [default: %SUGGESTED_TAG%]: "

:: If user pressed Enter, use the suggested tag
if "!NEW_TAG!"=="" set NEW_TAG=%SUGGESTED_TAG%

echo.
echo 🚀 Creating tag !NEW_TAG!...
git tag !NEW_TAG!

if %ERRORLEVEL% NEQ 0 (
    echo ❌ Failed to create tag. It might already exist.
    pause
    exit /b %ERRORLEVEL%
)

echo ⬆️ Pushing tag !NEW_TAG! to GitHub...
git push origin !NEW_TAG!

if %ERRORLEVEL% NEQ 0 (
    echo ❌ Failed to push tag to origin.
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo ✨ Successfully published !NEW_TAG!
pause
