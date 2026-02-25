$appName = "cursorx"
$packageName = "cursorscript"
$installDir = "$HOME\.$packageName"
$url = "https://github.com/naveenpoddar/cursorscript/releases/latest/download/cursorscript-windows-x64-baseline.zip"

# 1. Prepare Directory
if (!(Test-Path $installDir)) { 
    New-Item -ItemType Directory -Path $installDir -Force 
}

# 2. Download and Extract
Write-Host "📥 Downloading latest build..." -ForegroundColor Cyan
Invoke-WebRequest -Uri $url -OutFile "$installDir\build.zip"

Write-Host "📦 Extracting all files..." -ForegroundColor Cyan
# Extract to a temp folder first to handle the nested directory structure
$tempDir = Join-Path $installDir "temp"
Expand-Archive -Path "$installDir\build.zip" -DestinationPath $tempDir -Force

# 3. Move the .exe to the root of $installDir
# This assumes cursorx.exe is inside the nested folder in the ZIP
Get-ChildItem -Path "$tempDir\*\*" | Move-Item -Destination $installDir -Force

# Cleanup temp files
Remove-Item -Path $tempDir, "$installDir\build.zip" -Recurse -Force

# 4. Add to Path (User Level)
Write-Host "⚙️ Adding $installDir to Path..." -ForegroundColor Cyan
$oldPath = [Environment]::GetEnvironmentVariable("Path", "User")

# Check if the path is already there to avoid duplicates
if ($oldPath -split ';' -notcontains $installDir) {
    $newPath = "$oldPath;$installDir".TrimEnd(';')
    [Environment]::SetEnvironmentVariable("Path", $newPath, "User")
    $env:Path = "$env:Path;$installDir" # Update current session immediately
    Write-Host "✅ Path updated successfully." -ForegroundColor Green
}
else {
    Write-Host "ℹ️ Path already exists in environment variables." -ForegroundColor Yellow
}

Write-Host "✨ Done! All files are in $installDir" -ForegroundColor Green
Write-Host "👉 Restart your terminal and type '$appName' to begin."