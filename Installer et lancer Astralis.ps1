$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $MyInvocation.MyCommand.Path

$healthUrl = 'http://127.0.0.1:8766/health'

$appUrl = 'http://127.0.0.1:8766/index.html'

function Open-AstralisApp {

    $candidates = @(

        (Get-Command msedge.exe -ErrorAction SilentlyContinue | Select-Object -ExpandProperty Source -First 1),

        (Join-Path $env:ProgramFiles 'Microsoft/Edge/Application/msedge.exe'),

        (Join-Path ${env:ProgramFiles(x86)} 'Microsoft/Edge/Application/msedge.exe'),

        (Join-Path $env:LOCALAPPDATA 'Microsoft/Edge/Application/msedge.exe'),

        (Get-Command chrome.exe -ErrorAction SilentlyContinue | Select-Object -ExpandProperty Source -First 1),

        (Join-Path $env:ProgramFiles 'Google/Chrome/Application/chrome.exe'),

        (Join-Path ${env:ProgramFiles(x86)} 'Google/Chrome/Application/chrome.exe'),

        (Join-Path $env:LOCALAPPDATA 'Google/Chrome/Application/chrome.exe')

    )

    $browser = $candidates | Where-Object { $_ -and (Test-Path -LiteralPath $_) } | Select-Object -First 1

    if (-not $browser) { throw 'Aucun moteur Chromium trouvé. Installe Microsoft Edge ou Google Chrome, puis relance Astralis.' }

    Start-Process -FilePath $browser -ArgumentList @('--app=' + $appUrl, '--new-window')

}

function Get-AstralisHealth {

    $response = Invoke-WebRequest $healthUrl -TimeoutSec 2 -UseBasicParsing

    return ($response.Content | ConvertFrom-Json)

}

function Get-ExpectedInstance {

    $normalized = (Resolve-Path -LiteralPath $root).Path.TrimEnd('\').ToLowerInvariant()

    $sha = [Security.Cryptography.SHA256]::Create()

    try { $bytes = $sha.ComputeHash([Text.Encoding]::UTF8.GetBytes($normalized)) }

    finally { $sha.Dispose() }

    return ([BitConverter]::ToString($bytes).Replace('-', '').ToLowerInvariant()).Substring(0, 12)

}

function Stop-OldAstralisServer([switch]$ConfirmedAstralis) {

    $listener = Get-NetTCPConnection -LocalPort 8766 -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1

    if (-not $listener) { return $false }

    $process = Get-CimInstance Win32_Process -Filter "ProcessId = $($listener.OwningProcess)" -ErrorAction SilentlyContinue

    if (-not $process -or $process.Name -notmatch '^python(w)?\.exe$' -or $process.CommandLine -notmatch 'server\.py' -or (-not $ConfirmedAstralis -and $process.CommandLine -notmatch 'Astralis')) {

        throw 'Le port 8766 est utilisé par un autre programme. Ferme-le puis relance Astralis.'

    }

    Stop-Process -Id $listener.OwningProcess -Force

    Start-Sleep -Milliseconds 700

    return $true

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

    $health = Get-AstralisHealth

    $expectedVersion = (Get-Content (Join-Path $root 'VERSION') -Raw).Trim()

    $expectedInstance = Get-ExpectedInstance

    if ($health.version -eq $expectedVersion -and $health.instance -eq $expectedInstance) {

        Add-AstralisShortcut

        Open-AstralisApp

        exit 0

    }

    if ($health.ok -and $health.message -match 'Astralis local') { Stop-OldAstralisServer -ConfirmedAstralis }

    else { throw "Astralis attendu introuvable sur le port 8766. Ferme le programme actif." }

} catch {

    if ($_.Exception.Message -match 'port 8766') { throw }

}



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

if ($listener) { Stop-OldAstralisServer }



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

