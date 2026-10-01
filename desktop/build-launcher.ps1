$ErrorActionPreference = "Stop"

$desktop = Split-Path -Parent $MyInvocation.MyCommand.Path
$compiler = "$env:WINDIR\Microsoft.NET\Framework64\v4.0.30319\csc.exe"

if (-not (Test-Path -LiteralPath $compiler)) {
  throw "Le compilateur Windows .NET Framework est introuvable."
}

& $compiler /nologo /target:winexe /optimize+ `
  /reference:System.Windows.Forms.dll `
  /win32icon:"$desktop\think-anas-sahara.ico" `
  /out:"$desktop\think.anas.exe" `
  "$desktop\ThinkAnasLauncher.cs"

if ($LASTEXITCODE -ne 0) {
  throw "La création du lanceur think.anas a échoué."
}
