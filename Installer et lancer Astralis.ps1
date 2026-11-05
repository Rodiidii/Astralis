$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $MyInvocation.MyCommand.Path

$healthUrl = 'http://127.0.0.1:8766/health'

$appUrl = 'http://127.0.0.1:8766/index.html'

function Find-AstralisBrowser {
    $candidates = New-Object 'System.Collections.Generic.List[string]'
    foreach ($name in @('msedge.exe', 'chrome.exe')) {
        $command = Get-Command $name -ErrorAction SilentlyContinue | Select-Object -First 1
        if ($command -and $command.Source) { $candidates.Add($command.Source) }
    }
    foreach ($key in @(
        'Registry::HKEY_CURRENT_USER\SOFTWARE\Microsoft\Windows\CurrentVersion\App Paths\msedge.exe',
        'Registry::HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows\CurrentVersion\App Paths\msedge.exe',
        'Registry::HKEY_LOCAL_MACHINE\SOFTWARE\WOW6432Node\Microsoft\Windows\CurrentVersion\App Paths\msedge.exe',
        'Registry::HKEY_CURRENT_USER\SOFTWARE\Microsoft\Windows\CurrentVersion\App Paths\chrome.exe',
        'Registry::HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows\CurrentVersion\App Paths\chrome.exe',
        'Registry::HKEY_LOCAL_MACHINE\SOFTWARE\WOW6432Node\Microsoft\Windows\CurrentVersion\App Paths\chrome.exe'
    )) {
        try {
            $item = Get-Item -LiteralPath $key -ErrorAction Stop
            $value = $item.GetValue('')
            if ($value) { $candidates.Add([string]$value) }
        } catch {}
    }
    foreach ($base in @($env:ProgramFiles, ${env:ProgramFiles(x86)}, $env:LOCALAPPDATA)) {
        if (-not $base) { continue }
        foreach ($relative in @(
            'Microsoft\Edge\Application\msedge.exe', 'Google\Chrome\Application\chrome.exe',
            'Microsoft\Edge\Application\*\msedge.exe', 'Google\Chrome\Application\*\chrome.exe'
        )) {
            $pattern = Join-Path $base $relative
            if ($relative.Contains('*')) {
                Get-ChildItem -Path $pattern -File -ErrorAction SilentlyContinue | ForEach-Object { $candidates.Add($_.FullName) }
            } elseif (Test-Path -LiteralPath $pattern) { $candidates.Add($pattern) }
        }
    }
    foreach ($candidate in $candidates) {
        if ($candidate -and (Test-Path -LiteralPath $candidate -PathType Leaf)) { return $candidate }
    }
    return $null
}

function Install-AstralisBrowser {
    Write-Host 'Aucun navigateur compatible detecte. Installation automatique de Microsoft Edge...'
    $winget = Get-Command winget.exe -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($winget) {
        try {
            & $winget.Source install --id Microsoft.Edge --exact --silent --accept-package-agreements --accept-source-agreements
            if ($LASTEXITCODE -eq 0) {
                Start-Sleep -Seconds 2
                $installed = Find-AstralisBrowser
                if ($installed) { return $installed }
            }
        } catch {}
    }

    $is64Bit = [Environment]::Is64BitOperatingSystem
    $linkId = if ($is64Bit) { '2093437' } else { '2093505' }
    $msi = Join-Path $env:TEMP 'astralis-edge-stable.msi'
    Invoke-WebRequest -Uri ("https://go.microsoft.com/fwlink/?LinkID=$linkId") -OutFile $msi -UseBasicParsing
    $arguments = @('/i', ('"' + $msi + '"'), '/qn', '/norestart')
    $installer = Start-Process -FilePath 'msiexec.exe' -ArgumentList $arguments -Wait -PassThru
    if ($installer.ExitCode -eq 1603) {
        Write-Host 'Edge demande une installation avec droits administrateur. Une demande Windows va apparaitre.'
        $installer = Start-Process -FilePath 'msiexec.exe' -Verb RunAs -ArgumentList $arguments -Wait -PassThru
    }
    if ($installer.ExitCode -ne 0) { throw "Installation de Microsoft Edge echouee (code $($installer.ExitCode))." }
    Start-Sleep -Seconds 2
    $installed = Find-AstralisBrowser
    if (-not $installed) { throw 'Microsoft Edge a ete installe mais son executable reste introuvable.' }
    return $installed
}

function Open-AstralisApp {
    $browser = Find-AstralisBrowser
    if (-not $browser) { $browser = Install-AstralisBrowser }
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

    $listeners = @(Get-NetTCPConnection -LocalPort 8766 -State Listen -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique)

    if ($listeners.Count -eq 0) { return $false }

    $processes = @()
    foreach ($processId in $listeners) {
        $process = Get-CimInstance Win32_Process -Filter "ProcessId = $processId" -ErrorAction SilentlyContinue
        if (-not $process -or $process.Name -notmatch '^python(w)?\.exe$' -or $process.CommandLine -notmatch 'server\.py' -or (-not $ConfirmedAstralis -and $process.CommandLine -notmatch 'Astralis')) {
            throw 'Le port 8766 contient un programme qui nest pas une instance Astralis. Ferme-le avant de relancer.'
        }
        $processes += $process
    }

    foreach ($process in $processes) { Stop-Process -Id $process.ProcessId -Force -ErrorAction SilentlyContinue }

    for ($attempt = 0; $attempt -lt 20; $attempt++) {
        Start-Sleep -Milliseconds 250
        $remaining = @(Get-NetTCPConnection -LocalPort 8766 -State Listen -ErrorAction SilentlyContinue)
        if ($remaining.Count -eq 0) { return $true }
    }

    throw 'Des instances Astralis occupent encore le port 8766. Ferme les processus Python server.py et relance.'

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



$expectedVersion = (Get-Content (Join-Path $root 'VERSION') -Raw).Trim()
$expectedInstance = Get-ExpectedInstance

# Astralis ne dépend que de la bibliothèque standard de Python.

try {

    $health = Get-AstralisHealth

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
$actualHealth = $null

for ($attempt = 0; $attempt -lt 40; $attempt++) {

    Start-Sleep -Milliseconds 500

    try {

        $response = Invoke-WebRequest $healthUrl -TimeoutSec 2 -UseBasicParsing

        if ($response.StatusCode -eq 200) {
            $actualHealth = $response.Content | ConvertFrom-Json
            if ($actualHealth.ok -and $actualHealth.version -eq $expectedVersion -and $actualHealth.instance -eq $expectedInstance) { $ready = $true; break }
        }

    } catch {}

}

if (-not $ready) {
    if ($actualHealth) { throw "Mauvaise instance sur le port 8766. Attendu: Astralis $expectedVersion ($expectedInstance); trouve: $($actualHealth.version) ($($actualHealth.instance)). Ferme les autres instances." }
    throw 'Astralis ne répond pas sur le port 8766. Vérifie le pare-feu ou le fichier server.py.'
}

Add-AstralisShortcut

Open-AstralisApp

Write-Host "Astralis $expectedVersion est lance depuis $root. Instance: $expectedInstance."

