$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$healthUrl = 'http://127.0.0.1:8766/health'
$appUrl = 'http://127.0.0.1:8766/index.html'
function Open-AstralisApp {
    $edge = Get-Command msedge.exe -ErrorAction SilentlyContinue
    if ($edge) { Start-Process $edge.Source -ArgumentList @('--app=' + $appUrl) }
    else { Start-Process $appUrl }
}
function Add-AstralisShortcut {
    try {
        $desktop = [Environment]::GetFolderPath('Desktop')
        $shortcut = (New-Object -ComObject WScript.Shell).CreateShortcut((Join-Path $desktop 'Astralis.lnk'))
        $shortcut.TargetPath = Join-Path $root 'Installer et lancer Astralis.bat'
        $shortcut.WorkingDirectory = $root
        $shortcut.Description = 'Lancer Astralis'
        $shortcut.Save()
    } catch {}
}

# Astralis ne dépend que de la bibliothèque standard de Python.
try {
    $health = Invoke-WebRequest $healthUrl -TimeoutSec 2 -UseBasicParsing
    if ($health.StatusCode -eq 200) {
        Add-AstralisShortcut
        Open-AstralisApp
        exit 0
    }
} catch {}

$python = $null
$pythonArgs = @()
$installedPython = Join-Path $env:LOCALAPPDATA 'Programs/Astralis/Python314/python.exe'
if (Test-Path $installedPython) { $python = $installedPython }
$launcher = Get-Command py -ErrorAction SilentlyContinue
if (-not $python -and $launcher) {
    try {
        & $launcher.Source -3 -c 'import sys; raise SystemExit(0 if sys.version_info >= (3,10) else 1)' 2>$null
        if ($LASTEXITCODE -eq 0) { $python = $launcher.Source; $pythonArgs = @('-3') }
    } catch {}
}

if (-not $python) {
    $command = Get-Command python -ErrorAction SilentlyContinue
    if ($command) {
        try {
            & $command.Source -c 'import sys; raise SystemExit(0 if sys.version_info >= (3,10) else 1)' 2>$null
            if ($LASTEXITCODE -eq 0) { $python = $command.Source }
        } catch {}
    }
}

if (-not $python) {
    Write-Host 'Python 3.10+ est absent. Téléchargement de Python 3.14.10 depuis python.org…'
    $installer = Join-Path $env:TEMP 'astralis-python-3.14.10-amd64.exe'
    $target = Join-Path $env:LOCALAPPDATA 'Programs/Astralis/Python314'
    Invoke-WebRequest 'https://www.python.org/ftp/python/3.14.10/python-3.14.10-amd64.exe' -OutFile $installer
    $process = Start-Process -FilePath $installer -ArgumentList @(
        '/quiet', 'InstallAllUsers=0', 'PrependPath=0', 'Include_launcher=0',
        'Include_test=0', "TargetDir=$target", 'Include_pip=0'
    ) -Wait -PassThru
    if ($process.ExitCode -ne 0) { throw "Installation de Python échouée (code $($process.ExitCode))." }
    $python = Join-Path $target 'python.exe'
    if (-not (Test-Path $python)) { throw 'Python est introuvable après linstallation.' }
}

$listener = Get-NetTCPConnection -LocalPort 8766 -State Listen -ErrorAction SilentlyContinue
if ($listener) { throw 'Le port 8766 est utilisé par une autre application. Ferme-la puis relance Astralis.' }

Start-Process -FilePath $python -ArgumentList ($pythonArgs + @('server.py')) -WorkingDirectory $root -WindowStyle Hidden
$ready = $false
for ($attempt = 0; $attempt -lt 40; $attempt++) {
    Start-Sleep -Milliseconds 500
    try {
        $response = Invoke-WebRequest $healthUrl -TimeoutSec 2 -UseBasicParsing
        if ($response.StatusCode -eq 200) { $ready = $true; break }
    } catch {}
}
if (-not $ready) { throw 'Astralis ne répond pas sur le port 8766. Vérifie le pare-feu ou le fichier server.py.' }
Add-AstralisShortcut
Open-AstralisApp
Write-Host 'Astralis est lancé.'
