# 必须以管理员身份运行 PowerShell
# 右键「开始」→ 终端(管理员) → 粘贴运行

$ErrorActionPreference = "Stop"

$wslIp = (wsl hostname -I).Trim().Split(" ")[0]
if (-not $wslIp) { throw "无法获取 WSL IP，请先启动 WSL" }

$lanIp = (
  Get-NetIPAddress -AddressFamily IPv4 |
  Where-Object {
    $_.InterfaceAlias -match "WLAN|Wi-Fi|无线" -and
    $_.IPAddress -notlike "169.*" -and
    $_.IPAddress -notlike "172.*"
  } |
  Select-Object -First 1
).IPAddress

if (-not $lanIp) {
  Write-Host "未自动识别 WiFi IP，请运行 ipconfig 查看「无线局域网适配器 WLAN」的 IPv4"
  $lanIp = Read-Host "请输入你的 WiFi IPv4 地址"
}

Write-Host "WSL IP:  $wslIp"
Write-Host "WiFi IP: $lanIp"
Write-Host ""

# 端口转发：局域网 8081 → WSL 8081
netsh interface portproxy delete v4tov4 listenport=8081 listenaddress=0.0.0.0 2>$null
netsh interface portproxy add v4tov4 listenport=8081 listenaddress=0.0.0.0 connectport=8081 connectaddress=$wslIp

# 防火墙放行
netsh advfirewall firewall delete rule name="Expo Metro 8081" 2>$null
netsh advfirewall firewall add rule name="Expo Metro 8081" dir=in action=allow protocol=TCP localport=8081

Write-Host "端口转发已配置："
netsh interface portproxy show all
Write-Host ""

# 验证 Windows 能否访问
try {
  $code = (Invoke-WebRequest -Uri "http://${lanIp}:8081" -UseBasicParsing -TimeoutSec 5).StatusCode
  Write-Host "验证成功：http://${lanIp}:8081 返回 HTTP $code" -ForegroundColor Green
} catch {
  Write-Host "验证失败：http://${lanIp}:8081 仍无法访问" -ForegroundColor Red
  Write-Host "请确认 WSL 里已运行 npx expo start --lan"
  Write-Host "若仍失败，尝试在 .wslconfig 中设置 networkingMode=mirrored 后 wsl --shutdown"
}

Write-Host ""
Write-Host "=========================================="
Write-Host "WSL 运行:  npx expo start --lan"
Write-Host "手机 Expo Go 输入:"
Write-Host "  exp://${lanIp}:8081"
Write-Host "=========================================="
