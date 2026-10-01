param(
  [string]$ProjectRoot = "",
  [string]$UserRoamingAppData = "",
  [string]$UserSid = ""
)

$ErrorActionPreference = "Stop"

$desktop = Split-Path -Parent $MyInvocation.MyCommand.Path
if ($ProjectRoot) {
  $root = $ProjectRoot
  $desktop = Join-Path $root "desktop"
} else {
  $root = Split-Path -Parent $desktop
}
$outer = Split-Path -Parent $root
$launcher = Join-Path $desktop "think.anas.exe"
$icon = Join-Path $desktop "think-anas-sahara.ico"
$appId = "com.thinkanas.desktop"
$shell = New-Object -ComObject WScript.Shell

function Set-ThinkAnasShortcut([string]$path) {
  $shortcut = $shell.CreateShortcut($path)
  $shortcut.TargetPath = $launcher
  $shortcut.Arguments = ""
  $shortcut.WorkingDirectory = $root
  $shortcut.IconLocation = "$icon,0"
  $shortcut.Description = "Ouvrir think.anas"
  $shortcut.Save()
}

$sourceShortcut = Join-Path $root "think.anas.lnk"
if (-not $ProjectRoot) {
  Set-ThinkAnasShortcut $sourceShortcut
  Set-ThinkAnasShortcut (Join-Path $outer "think.anas.lnk")
}

$roaming = if ($UserRoamingAppData) { $UserRoamingAppData } else { $env:APPDATA }
$programs = Join-Path $roaming "Microsoft\Windows\Start Menu\Programs"
Copy-Item -LiteralPath $sourceShortcut -Destination (Join-Path $programs "think.anas.lnk") -Force

$taskbar = Join-Path $roaming "Microsoft\Internet Explorer\Quick Launch\User Pinned\TaskBar"
if (Test-Path -LiteralPath $taskbar) {
  Get-ChildItem -LiteralPath $taskbar -Filter "*.lnk" | ForEach-Object {
    $pinned = $shell.CreateShortcut($_.FullName)
    $isThisApp =
      $pinned.TargetPath -eq $launcher -or
      ($pinned.TargetPath -like "*\electron.exe" -and $pinned.Arguments -like "*$root*main.mjs*")
    if ($isThisApp) {
      Copy-Item -LiteralPath $sourceShortcut -Destination $_.FullName -Force
    }
  }
}

$registration = if ($UserSid) {
  "Registry::HKEY_USERS\$UserSid\Software\Classes\AppUserModelId\$appId"
} else {
  "HKCU:\Software\Classes\AppUserModelId\$appId"
}
New-Item -Path $registration -Force | Out-Null
New-ItemProperty -Path $registration -Name "DisplayName" -Value "think.anas" -PropertyType String -Force | Out-Null
New-ItemProperty -Path $registration -Name "IconUri" -Value $icon -PropertyType String -Force | Out-Null

& "$env:WINDIR\System32\ie4uinit.exe" -show
