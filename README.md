# AI 颜值评分

基于 React Native (Expo) 的 AI 人脸颜值评分应用。支持拍照或从相册选择照片，从五个维度分析面容并给出综合评分与提升建议。

## 功能

- 📸 拍照 / 相册选图
- 🧠 AI 分析（OpenRouter + DeepSeek Vision，可选）
- 📊 五维评分：对称、比例、肤质、轮廓、气质
- 💡 个性化提升建议
- 🎨 深色主题现代 UI

## 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器
npm start

# 真机体验 — 隧道模式（WSL 下可能失败，见「真机连接」）
npx expo start --tunnel

# 真机体验 — 局域网模式
npx expo start --lan
```

手机安装 [Expo Go](https://expo.dev/go)，扫描终端二维码即可在红米等 Android 真机上预览。隧道失败请看下方 **真机连接** 章节。

使用 Expo Go 扫描二维码，或在模拟器/真机上运行：

```bash
npm run android   # Android
npm run ios       # iOS（需 macOS）
npm run web       # Web 预览
```

## 真机连接（红米 / WSL2）

你在 **WSL2** 里开发时，终端显示的 IP 通常是 `172.x.x.x`，手机无法直接访问，所以 `--tunnel` 是常用方案。若出现 `failed to start tunnel` / `remote gone away`，这是 **Ngrok 服务不稳定**（Expo 内置版本较旧），可改用以下方式：

### ⚠️ 扫二维码后一直转圈？

终端显示 `Metro: exp://127.0.0.1:8081` 时，**手机连的是它自己的 localhost，不是电脑**，所以会无限加载。必须先做下面任一方案，再扫码。

### 方案 A：USB 连接（最稳，推荐）

1. 红米开启 **开发者选项 → USB 调试**，用数据线连电脑
2. 在 **Windows PowerShell** 执行（**每次插线后都要执行**）：

```powershell
adb reverse tcp:8081 tcp:8081
```

3. 在项目目录启动：

```bash
npx expo start --localhost
```

4. 用 Expo Go 扫码，或手动输入：`exp://127.0.0.1:8081`

> 没有执行 `adb reverse` 就扫 `127.0.0.1` 的码，一定会转圈。

### 方案 B：WSL 镜像网络（一劳永逸）

在 Windows 用户目录创建或编辑 `.wslconfig`：

```ini
[wsl2]
networkingMode=mirrored
hostAddressLoopback=true
```

PowerShell 执行 `wsl --shutdown` 后重新打开 WSL，再运行：

```bash
npx expo start --lan
```

此时二维码 IP 应为 `192.168.x.x`（与电脑同网段），手机连同一 WiFi 扫码即可。

### 方案 C：WiFi + 端口转发（无 USB、未开镜像网络时）

1. **Windows 管理员 PowerShell** 运行（必须管理员，否则端口转发不会生效）：

```powershell
# 方式一：资源管理器打开 \\wsl.localhost\Ubuntu\home\hezihua\workspace\ai-face-rating\scripts
#         双击 setup-wsl-port.bat（会弹出 UAC 管理员确认）

# 方式二：管理员 PowerShell 手动执行
wsl -e bash -c "cat /home/hezihua/workspace/ai-face-rating/scripts/setup-wsl-port.ps1" > $env:TEMP\setup-expo.ps1
powershell -ExecutionPolicy Bypass -File $env:TEMP\setup-expo.ps1
```

或直接粘贴（WSL IP 以 `wsl hostname -I` 为准）：

```powershell
netsh interface portproxy add v4tov4 listenport=8081 listenaddress=0.0.0.0 connectport=8081 connectaddress=172.17.12.43
netsh advfirewall firewall add rule name="Expo Metro 8081" dir=in action=allow protocol=TCP localport=8081
netsh interface portproxy show all
```

2. **先在 Windows 浏览器验证**（必须能打开再继续）：

```
http://192.168.0.105:8081
```

（IP 换成你 WiFi 的 IPv4，可用 `ipconfig` 查看 WLAN 那一行）

脚本成功时会输出类似 `exp://192.168.0.105:8081`（**不要用 192.168.1.100 等示例 IP**）。

3. WSL 里启动：

```bash
npx expo start --lan
```

4. 手机和电脑连 **同一 WiFi**，Expo Go **不要扫 WSL 的 172.x 二维码**，手动输入脚本输出的地址。

### 方案 D：重试隧道

```bash
npx expo start --tunnel --clear
```

若仍失败，优先用 **方案 A** 或 **方案 B**。

## 启用真实 AI 分析

1. 复制环境变量模板：

```bash
cp .env.example .env
```

2. 在 `.env` 中填入 OpenRouter API Key：

```
EXPO_PUBLIC_OPENROUTER_API_KEY=sk-or-v1-...
EXPO_PUBLIC_AI_MODEL=deepseek/deepseek-v4-flash-vision-exp
```

3. 重启 Expo 开发服务器

未配置 API Key 时，应用会使用本地智能评分引擎（基于图像数据的确定性算法，仅供演示）。

## 项目结构

```
app/                  # Expo Router 页面
  index.tsx           # 首页
  capture.tsx         # 选图/拍照
  analyzing.tsx       # 分析中
  result.tsx          # 结果页
src/
  components/         # UI 组件
  services/           # AI 评分服务
  constants/          # 主题常量
  types/              # TypeScript 类型
  utils/              # 工具函数
```

## 技术栈

- Expo SDK 57
- React Native 0.86
- Expo Router（文件路由）
- expo-image-picker（相机/相册）
- OpenRouter API + DeepSeek Vision（可选）

## 免责声明

评分结果仅供娱乐参考，不代表任何客观美学标准。请理性看待 AI 分析结果。
