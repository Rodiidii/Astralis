$ErrorActionPreference = 'Stop'
$port = 8766
$netstat = Join-Path $env:SystemRoot 'System32\netstat.exe'
$listenerIds = @(
    & $netstat -ano -p tcp 2>$null |
        ForEach-Object {
            if ($_ -match "^\s*TCP\s+\S+:$port\s+\S+\s+LISTENING\s+(\d+)\s*$") {
                [int]$Matches[1]
            }
        } |
        Sort-Object -Unique
)

if ($listenerIds.Count -eq 0) {
    Write-Host "No server is listening on port $port."
    exit 0
}

foreach ($processId in $listenerIds) {
    $processInfo = Get-CimInstance Win32_Process -Filter "ProcessId = $processId" -ErrorAction SilentlyContinue
    if (-not $processInfo) { continue }
    Write-Host ("Stopping PID {0} ({1})" -f $processId, $processInfo.Name)
    Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
}

Start-Sleep -Milliseconds 700
$remaining = @(
    & $netstat -ano -p tcp 2>$null |
        Where-Object { $_ -match "^\s*TCP\s+\S+:$port\s+\S+\s+LISTENING\s+\d+\s*$" }
)

if ($remaining.Count -eq 0) {
    Write-Host "All servers on port $port are stopped."
    exit 0
}

Write-Warning "A process is still listening on port ${port}:"
$remaining | ForEach-Object { Write-Host $_ }
exit 1
