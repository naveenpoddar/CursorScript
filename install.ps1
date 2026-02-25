$url = "https://github.com/naveenpoddar/cursorscript/releases/latest/download/cursorscript-windows-x64-baseline.zip"
$installDir = "$HOME\.cursorscript"
New-Item -ItemType Directory -Force -Path "$installDir\bin"

Invoke-WebRequest -Uri $url -OutFile "$installDir\temp.zip"
Expand-Archive -Path "$installDir\temp.zip" -DestinationPath "$installDir\temp_extract" -Force

Move-Item "$installDir\temp_extract\*\cursorx.exe" "$installDir\bin\cursorscript.exe" -Force
$oldPath = [Environment]::GetEnvironmentVariable("Path", "User")
[Environment]::SetEnvironmentVariable("Path", "$oldPath;$installDir\bin", "User")

Remove-Item "$installDir\temp.zip", "$installDir\temp_extract" -Recurse
Write-Host "✨ Installed! Restart PowerShell to use 'cursorscript'" -ForegroundColor Green