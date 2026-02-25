$appName = "cursorx"
$packageName = "cursorscript"
$installDir = "$HOME\.$packageName"
$url = "https://github.com/naveenpoddar/cursorscript/releases/latest/download/cursorscript-windows-x64-baseline.zip"

# 1. Prepare Directory
if (!(Test-Path $installDir)) { New-Item -ItemType Directory -Path $installDir }

# 2. Download and Extract
Write-Host "📥 Downloading latest build..." -ForegroundColor Cyan
Invoke-WebRequest -Uri $url -OutFile "$installDir\build.zip"

Write-Host "📦 Extracting all files..." -ForegroundColor Cyan
Expand-Archive -Path "$installDir\build.zip" -DestinationPath "$installDir\temp" -Force

# Move files from the subfolder (cursorscript-windows-x64-baseline) to the root .cursorscript folder
Move-Item -Path "$installDir\temp\*\*" -Destination "$installDir" -Force
Remove-Item -Path "$installDir\temp", "$installDir\build.zip" -Recurse -Force

# 3. Add to Path (User Level)
Write-Host "⚙️ Adding to Path..." -ForegroundColor Cyan
$oldPath = [Environment]::GetEnvironmentVariable("Path", "User")
if ($oldPath -notlike "*$installDir*") {
    $newPath = "$oldPath;$installDir"
    [Environment]::SetEnvironmentVariable("Path", $newPath, "User")
    $env:Path = $newPath # Update current session
}

Write-Host "✨ Done! All files are in $installDir" -ForegroundColor Green
Write-Host "👉 You might need to restart your terminal to use '$appName'"