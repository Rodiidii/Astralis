$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName UIAutomationClient
Add-Type @'
using System;
using System.Runtime.InteropServices;
public class AstralisWindowMessages {
 [DllImport("user32.dll")] public static extern bool PostMessage(IntPtr h, uint m, IntPtr w, IntPtr l);
}
'@
$titles = ConvertFrom-Json -InputObject $env:ASTRALIS_WINDOW_TITLES
if($env:ASTRALIS_CLOSE_TRACE){Add-Content -LiteralPath $env:ASTRALIS_CLOSE_TRACE -Value ('titles: '+($titles -join '|'))}
if (-not $titles.Count) { return }
$root = [System.Windows.Automation.AutomationElement]::RootElement
$windows = $root.FindAll([System.Windows.Automation.TreeScope]::Children,[System.Windows.Automation.Condition]::TrueCondition)
foreach ($window in $windows) {
 try {
  $title = $window.Current.Name
  if ($title -match ' - (Google Chrome|Microsoft Edge)$') { continue }
  if($env:ASTRALIS_CLOSE_TRACE -and $title -like 'Astralis *'){Add-Content -LiteralPath $env:ASTRALIS_CLOSE_TRACE -Value ('candidate: '+$title)}
  if ($title -notin $titles) { continue }
  $process = Get-Process -Id $window.Current.ProcessId -ErrorAction Stop
  if($env:ASTRALIS_CLOSE_TRACE){Add-Content -LiteralPath $env:ASTRALIS_CLOSE_TRACE -Value ($title+' / '+$process.ProcessName)}
  if ($process.ProcessName -notin @('msedge','chrome')) { continue }
  # A regular browser window can contain unrelated tabs: leave it alone.
  $edits = $window.FindAll([System.Windows.Automation.TreeScope]::Descendants,(New-Object System.Windows.Automation.PropertyCondition([System.Windows.Automation.AutomationElement]::ControlTypeProperty,[System.Windows.Automation.ControlType]::Edit)))
  $regularBrowser = $false
  if($env:ASTRALIS_CLOSE_TRACE){foreach($edit in $edits){Add-Content -LiteralPath $env:ASTRALIS_CLOSE_TRACE -Value ('edit: '+$edit.Current.Name)}}
  foreach ($edit in $edits) { if (-not $edit.Current.IsOffscreen -and $edit.Current.BoundingRectangle.Width -gt 10 -and $edit.Current.Name -match 'address|adresse|search bar') { $regularBrowser=$true; break } }
  if ($regularBrowser) { continue }
  [void][AstralisWindowMessages]::PostMessage([IntPtr]$window.Current.NativeWindowHandle,0x0010,[IntPtr]::Zero,[IntPtr]::Zero)
 } catch {if($env:ASTRALIS_CLOSE_TRACE){Add-Content -LiteralPath $env:ASTRALIS_CLOSE_TRACE -Value $_.Exception.Message}}
}
