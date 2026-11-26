# Read-only registry/type-library discovery. No COM objects instantiated.
$ErrorActionPreference = 'Stop'
$roots = @('Registry::HKEY_CLASSES_ROOT\CLSID','Registry::HKEY_CLASSES_ROOT\WOW6432Node\CLSID')
$found = foreach ($root in $roots) {
 if (!(Test-Path $root)) { continue }
 foreach ($entry in Get-ChildItem $root -ErrorAction SilentlyContinue) {
  $name = $entry.GetValue('')
  $p = Join-Path $entry.PSPath 'ProgID'
  $prog = if (Test-Path $p) { (Get-Item $p).GetValue('') } else { '' }
  if ("$name $prog" -match 'Melexis|MPT|PTC04|PTC-04|MLX9032|MLX90330') {
   $t = Join-Path $entry.PSPath 'TypeLib'
   [pscustomobject]@{Name=$name;ProgID=$prog;CLSID=$entry.PSChildName;TypeLib=if(Test-Path $t){(Get-Item $t).GetValue('')}else{''};Registry=$root}
  }
 }
}
@($found) | ConvertTo-Json -Depth 4 | Set-Content -Encoding UTF8 'melexis-com-discovery.json'
$found | Format-Table -AutoSize
