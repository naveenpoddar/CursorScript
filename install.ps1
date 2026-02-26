$appName = "cursorx"
$packageName = "cursorscript"
$installDir = "$HOME\.$packageName"
$url = "https://github.com/naveenpoddar/cursorscript/releases/latest/download/cursorscript-windows-x64-baseline.zip"
$parts = 6

# 0. Stop the application
if (Get-Process -Name $appName -ErrorAction SilentlyContinue) {
    Write-Host "🛑 Stopping running instance of $appName..." -ForegroundColor Yellow
    Stop-Process -Name $appName -Force
    Start-Sleep -Seconds 1
}

# 1. Prepare Directory
if (Test-Path $installDir) { Remove-Item -Path $installDir -Recurse -Force }
New-Item -ItemType Directory -Path $installDir -Force

# 2. Parallel Download Logic
Write-Host "📥 Downloading in $parts parallel parts..." -ForegroundColor Cyan

# Get File Size first
$request = [System.Net.HttpWebRequest]::Create($url)
$request.Method = "HEAD"
$response = $request.GetResponse()
$totalLength = $response.ContentLength
$response.Close()

$chunkSize = [Math]::Ceiling($totalLength / $parts)
$jobs = @()

for ($i = 0; $i -lt $parts; $i++) {
    $start = $i * $chunkSize
    $end = (($i + 1) * $chunkSize) - 1
    if ($end -ge $totalLength) { $end = $totalLength - 1 }
    
    $partPath = "$installDir\part$i.tmp"
    
    # Start a background job for each segment
    $jobs += Start-Job -ArgumentList $url, $partPath, $start, $end -ScriptBlock {
        param($u, $path, $s, $e)
        $client = New-Object System.Net.WebClient
        $client.Headers.Add("Range", "bytes=$s-$e")
        $client.DownloadFile($u, $path)
    }
}

# Wait for all chunks to finish
$jobs | Wait-Job | Out-Null
$jobs | Remove-Job

# 3. Reassemble the file
Write-Host "🧩 Reassembling parts..." -ForegroundColor Cyan
$destFile = "$installDir\build.zip"
$output = [System.IO.File]::Create($destFile)

for ($i = 0; $i -lt $parts; $i++) {
    $partPath = "$installDir\part$i.tmp"
    $bytes = [System.IO.File]::ReadAllBytes($partPath)
    $output.Write($bytes, 0, $bytes.Length)
    Remove-Item $partPath
}
$output.Close()

# 4. Extraction and Cleanup
Write-Host "📦 Extracting all files..." -ForegroundColor Cyan
$tempDir = Join-Path $installDir "temp"
Expand-Archive -Path $destFile -DestinationPath $tempDir -Force
Get-ChildItem -Path "$tempDir\*\*" | Move-Item -Destination $installDir -Force
Remove-Item -Path $tempDir, $destFile -Recurse -Force

# 5. Path Management (Simplified)
Write-Host "⚙️ Adding $installDir to Path..." -ForegroundColor Cyan
$oldPath = [Environment]::GetEnvironmentVariable("Path", "User")
if ($oldPath -split ';' -notcontains $installDir) {
    [Environment]::SetEnvironmentVariable("Path", "$oldPath;$installDir".TrimEnd(';'), "User")
    $env:Path = "$env:Path;$installDir"
    Write-Host "✅ Path updated." -ForegroundColor Green
}

Write-Host "✨ Done! Restart terminal and type '$appName'."