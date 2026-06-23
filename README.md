# LeafWell

LeafWell 是一个面向家庭绿植养护的移动端 Web 应用，提供植物档案管理、养护任务、AI 养护咨询和植物图片识别等能力。项目基于 React、TypeScript、Vite 和 React Vant 构建，适合移动端浏览器或 H5 场景使用。

## 功能概览

- 植物管理：新增、编辑、删除植物档案，记录名称、品种、位置、浇水频率、健康状态、图片等信息。
- 本地持久化：植物、养护任务、养护记录和养护计划存储在浏览器 `localStorage`，刷新页面后不会丢失。
- 养护管理：查看待办任务、完成任务、生成养护计划，统计今日任务和逾期任务。
- AI 养护咨询：接入阿里云百炼 OpenAI 兼容接口，统一使用 `qwen3-vl-235b-a22b-thinking` 模型。
- 植物图片识别：上传植物图片，通过百炼视觉模型识别植物并给出养护建议。
- 移动端适配：使用 `lib-flexible` 和 `postcss-pxtorem` 进行移动端尺寸适配。

## 技术栈

- React 19
- TypeScript
- Vite 6
- React Router
- React Vant
- Zustand
- Axios
- vite-plugin-mock
- 阿里云百炼 OpenAI 兼容接口

## 快速开始

推荐使用 pnpm。

```bash
pnpm install
pnpm dev
```

如果本机没有 pnpm，可以使用 Corepack 或 npx：

```bash
corepack enable
corepack prepare pnpm@latest --activate
pnpm install
pnpm dev
```

或：

```bash
npx pnpm install
npx pnpm dev
```

开发服务默认地址：

```text
http://localhost:5173/
```

## 环境变量

在项目根目录创建 `.env.local`：

```env
VITE_BAILIAN_API_KEY=your-bailian-api-key
VITE_BAILIAN_MODEL=qwen3-vl-235b-a22b-thinking
VITE_BAILIAN_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
VITE_BAILIAN_CHAT_API_URL=https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions
```

注意：这是前端项目，`VITE_` 开头的变量会暴露到浏览器端。当前配置适合本地演示和课程项目；生产环境建议通过后端代理转发 AI 请求，避免 API Key 暴露。

## 常用脚本

```bash
pnpm dev       # 启动开发服务
pnpm build     # 类型检查并构建生产包
pnpm preview   # 预览生产构建
pnpm lint      # ESLint 检查
```

## 项目结构

```text
LeafWell/
├── public/                 # 静态资源
├── src/
│   ├── api/                # API 封装
│   ├── components/         # 通用组件和业务组件
│   ├── hooks/              # 自定义 Hooks
│   ├── pages/              # 页面
│   │   ├── ai/             # AI 咨询和植物识别
│   │   ├── care/           # 养护管理
│   │   ├── home/           # 首页
│   │   ├── plant/          # 植物管理
│   │   └── user/           # 用户中心
│   ├── store/              # Zustand 状态管理
│   └── utils/              # 工具函数、LLM 接入、本地数据初始化
├── mock/                   # mock 数据和接口
├── LLM/                    # 独立 LLM 示例封装
├── AIRecognition/          # 独立图片识别示例
├── package.json
├── pnpm-lock.yaml
└── vite.config.ts
```

## 数据说明

当前项目主要使用浏览器 `localStorage` 作为本地持久化方案：

- `plants`：植物档案
- `careTasks`：养护任务
- `careRecords`：养护记录
- `carePlans`：养护计划

首次进入应用时会写入少量演示数据。后续只会补齐缺失的 key，不会覆盖用户已经新增、编辑或删除的数据。

## AI 接入说明

AI 相关逻辑集中在：

- `src/utils/llm.ts`
- `src/pages/ai/index.tsx`
- `src/pages/ai/recognition/index.tsx`
- `src/store/ai.ts`

项目统一使用百炼模型：

```text
qwen3-vl-235b-a22b-thinking
```

聊天和植物图片识别都通过百炼 OpenAI 兼容 Chat Completions 接口调用。

## 构建

```bash
pnpm build
```

构建产物输出到 `dist/`。该目录已被 `.gitignore` 忽略，不会提交到仓库。

## 备注

- `.env.local`、`.claude`、`.npm-cache`、`node_modules`、`dist` 等本地文件不会上传。
- 如果修改了 `.env.local`，需要重启 Vite 开发服务后才会生效。
