# AI 颜值评分

基于 React Native (Expo) 的 AI 人脸颜值评分应用。支持拍照、相册选图、**实时扫描评分**，从五个维度分析面容并给出综合评分与提升建议。

## 功能

- 📹 **实时扫描** — 前置摄像头动态预览分，定格后 AI 深度分析
- 📸 **拍照 / 相册** — 选图后五维评分
- 🧠 **AI 分析** — OpenRouter + DeepSeek Vision（可配置）
- 📊 **五维评分** — 对称、比例、肤质、轮廓、气质
- 💡 **个性化建议**
- 🎨 深色主题现代 UI

---

## 环境要求

- Node.js 18+
- npm
- [Expo Go](https://expo.dev/go)（真机调试）
- Windows + WSL2 或 macOS

---

## 快速开始

```bash
# 克隆 / 进入项目
cd ai-face-rating

# 安装依赖
npm install

# 配置 AI（可选，见下方「环境变量」）
cp .env.example .env

# 启动开发服务器
npm start
```

---

## 常用命令

### 本地开发

| 命令 | 说明 |
|------|------|
| `npm start` | 启动 Metro 开发服务器 |
| `npm run start:lan` | 局域网模式（配合 WSL 端口转发或镜像网络） |
| `npm run start:localhost` | 本机模式（配合 `adb reverse`） |
| `npm run start:tunnel` | 隧道模式（WSL 下常失败，见真机连接） |
| `npm run android` | 启动并打开 Android 模拟器 |
| `npm run ios` | 启动 iOS 模拟器（需 macOS） |
| `npm run web` | Web 预览 |

### EAS 云端打包

| 命令 | 说明 |
|------|------|
| `npm run build:preview` | **内测包**（Android APK，红米可直接安装） |
| `npm run build:android` | Google Play 正式包（AAB） |
| `npm run build:ios` | App Store 正式包（IPA，云端 Mac 编译） |
| `npm run submit:android` | 提交 Google Play |
| `npm run submit:ios` | 提交 App Store |

---

## 环境变量

### 本地开发（`.env`）

```bash
cp .env.example .env
```

```env
EXPO_PUBLIC_OPENROUTER_API_KEY=sk-or-v1-你的密钥
EXPO_PUBLIC_AI_MODEL=deepseek/deepseek-v4-flash-vision-exp
```

修改后需 **重启** `npm start`。

未配置 API Key 时，使用本地评分引擎（仅供演示）。

### 生产打包（expo.dev 控制台）

打包后的 App 需在 Expo 控制台配置环境变量：

1. 打开 [ai-face-rating 项目](https://expo.dev/accounts/hezihua_expo/projects/ai-face-rating)
2. **Environment variables** → 添加：
   - `EXPO_PUBLIC_OPENROUTER_API_KEY`
   - `EXPO_PUBLIC_AI_MODEL`

---

## 真机调试（红米 / WSL2）

> 详细排错见 [docs/开发问题总结.md](./docs/开发问题总结.md)

### 常见问题速查

| 现象 | 原因 | 处理 |
|------|------|------|
| `--tunnel` 报 `remote gone away` | Ngrok 不稳定 | 改用 USB 或端口转发 |
| 扫码后一直转圈 | 二维码是 `127.0.0.1` | 先 `adb reverse`，或用局域网 IP |
| 手动输入 IP 失败 | IP 填错或未做端口转发 | 用 `ipconfig` 查真实 IP |

### 方案 A：USB（最稳，推荐）

```powershell
# Windows PowerShell（每次插线执行）
adb reverse tcp:8081 tcp:8081
```

```bash
# WSL
npm run start:localhost
```

手机 Expo Go 输入：`exp://127.0.0.1:8081`

### 方案 B：WiFi + 端口转发

**① 管理员 PowerShell：**

```powershell
# WSL IP 以 wsl hostname -I 为准
netsh interface portproxy add v4tov4 listenport=8081 listenaddress=0.0.0.0 connectport=8081 connectaddress=172.17.12.43
netsh advfirewall firewall add rule name="Expo Metro 8081" dir=in action=allow protocol=TCP localport=8081
```

或双击运行 `scripts/setup-wsl-port.bat`（需管理员）。

**② 验证：** Windows 浏览器打开 `http://<你的WiFi-IP>:8081`（`ipconfig` 查看 WLAN IPv4）

**③ WSL 启动：**

```bash
npm run start:lan
```

**④ 手机 Expo Go 手动输入**（不要扫 172.x 二维码）：

```
exp://192.168.0.105:8081
```

> IP 必须是你电脑的真实地址，不要用文档示例 IP。

### 方案 C：WSL 镜像网络（长期推荐）

Windows 用户目录 `.wslconfig`：

```ini
[wsl2]
networkingMode=mirrored
hostAddressLoopback=true
```

执行 `wsl --shutdown` 重启 WSL 后，`npm run start:lan`，二维码应显示 `192.168.x.x`。

---

## Expo & EAS 账号

### 注册与费用

| 项目 | 说明 |
|------|------|
| **注册** | https://expo.dev/signup（GitHub / Google / 邮箱） |
| **EAS 免费档** | $0/月，每月 15 次 Android + 15 次 iOS 构建 |
| **超额** | 免费档不自动扣费，下月 1 日重置 |
| **Apple 上架** | Developer 账号 $99/年 |
| **Google 上架** | Play 开发者 $25 一次性 |

### 本项目 Expo 信息

| 项 | 值 |
|----|-----|
| 账号 | `hezihua_expo`（**个人账号**，非 team） |
| 项目 | `@hezihua_expo/ai-face-rating` |
| Project ID | `f1bb50ae-233c-4907-a596-df03816bc0ba` |
| 控制台 | https://expo.dev/accounts/hezihua_expo/projects/ai-face-rating |
| Android 包名 | `com.aifacerating.app` |
| iOS Bundle ID | `com.aifacerating.app` |

> 控制台请切换到 **个人账号 `hezihua_expo`**，团队里的 `hezihua` 是注册引导空项目，可删除，与本地代码无关。

### 首次关联（已完成可跳过）

```bash
npm install -g eas-cli
eas login
eas init --id f1bb50ae-233c-4907-a596-df03816bc0ba
```

关联后 `app.json` 会包含 `extra.eas.projectId`。

---

## 打包上架

### 第一次打包（推荐先打 Android 内测 APK）

```bash
eas login                    # 若未登录
npm run build:preview        # 仅 Android：eas build -p android --profile preview
```

- 首次构建会提示生成 Android 签名证书，选 **Yes** / 默认即可
- 构建在云端进行，完成后 [expo.dev](https://expo.dev) 项目页 → **Builds** 下载 APK
- 传到红米安装测试

### 正式上架

```bash
# Google Play（AAB）
npm run build:android
npm run submit:android

# App Store（IPA，无需本地 Mac）
npm run build:ios
npm run submit:ios
```

### 跨机开发（Windows 开发 → Mac / 云端打包）

```bash
# Windows/WSL 开发
git add . && git commit -m "feat: xxx" && git push

# Mac 或任意机器
git pull
npm install
cp .env.example .env
npm run build:ios    # 或 build:android
```

**勿提交 Git：** `node_modules/`、`.env`、`ios/`、`android/`、证书文件

---

## 项目结构

```
app/
  index.tsx           # 首页
  capture.tsx         # 拍照 / 相册
  live-scan.tsx       # 实时扫描评分
  analyzing.tsx       # AI 分析中
  result.tsx          # 结果页
src/
  components/         # UI 组件
  services/faceRating.ts   # AI 评分（OpenRouter / 本地）
  constants/          # 主题
  types/              # 类型
  utils/              # 工具
scripts/
  setup-wsl-port.ps1  # WSL 端口转发脚本
  setup-wsl-port.bat  # 一键管理员运行
eas.json              # EAS 构建配置
docs/
  开发问题总结.md      # 踩坑记录
```

---

## 技术栈

- Expo SDK 57 / React Native 0.86
- Expo Router、expo-camera、expo-image-picker
- OpenRouter API + DeepSeek Vision
- EAS Build 云端打包

---

## 开发问题总结

Metro 打包失败、WSL 真机连不上、Ngrok 隧道、端口转发等详细排查：

**[docs/开发问题总结.md](./docs/开发问题总结.md)**

---

## 免责声明

评分结果仅供娱乐参考，不代表任何客观美学标准。请理性看待 AI 分析结果。
