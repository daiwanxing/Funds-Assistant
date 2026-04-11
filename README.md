# Funds Assistant

> 基金行情查看 Web 应用。以自选基金为核心，提供实时估值、收益计算、基金详情和顶部市场走马灯。

## 项目定位

Funds Assistant 是一个面向基金跟踪场景的前端应用，重点不是做资讯门户，而是把用户最常看的几件事放在同一个界面里：

- 自选基金列表
- 实时估值与涨跌幅
- 持仓收益
- 基金详情走势图
- 顶部全球指数走马灯
- 登录后的云端自选同步

整体界面采用深色终端风格，当前主界面已经是 `header + aside + section` 的两栏结构。

## 当前功能

- 实时展示自选基金估值、涨跌幅、估算收益和更新时间
- 支持基金搜索，并从搜索结果直接加入自选
- 支持游客模式和登录态两套自选数据路径
- 登录后自选基金可通过 Supabase 云端同步
- 基金详情页支持区间切换和走势曲线查看
- 详情页底部展示基金经理、基金类型、基金规模、交易状态、最新净值日等摘要信息
- 顶部滚动展示主要市场指数

## 技术栈

| 类别 | 方案 |
|---|---|
| 前端 | Vue 3 + TypeScript |
| 构建 | Vite |
| 状态管理 | Pinia |
| 数据请求 | TanStack Query + Axios |
| 图表 | ECharts |
| 样式 | UnoCSS + CSS Tokens |
| 鉴权与数据 | Supabase |
| 本地开发网关 | Vercel Functions + rewrites |
| 测试 | Vitest + Vue Test Utils |

## 数据来源

基金与指数行情主要来自东方财富相关接口，应用内通过本地 `api/` 层与代理转发统一接入。

核心规则：

- 普通基金优先使用实时估值字段
- ETF / 场内基金优先使用交易所实时价格字段
- 当主接口缺失估值时，再走补全接口
- 页面组件不直接分支处理不同基金类型，统一走行情解析逻辑

## 本地运行

环境要求：

- Node.js `>= 20.19.0`
- pnpm

安装依赖：

```bash
pnpm install
```

推荐开发方式：

```bash
pnpm dev
```

这会启动本地 `vercel dev`，同时提供前端页面和 `api/` 下的本地接口。

如果只想调页面样式，也可以使用：

```bash
pnpm dev:ui
```

注意：这个模式不包含本地函数，登录、自选同步等接口可能返回 `404`。

## 常用命令

```bash
pnpm dev
pnpm dev:ui
pnpm build
pnpm type-check
pnpm lint
pnpm test:run
```

## 目录结构

```text
api/                    本地函数与代理入口
docs/                   设计文档、迁移文档、实现记录
public/                 静态资源
scripts/                本地开发脚本
src/
  api/                  前端请求层
  components/           通用组件
  composables/          业务逻辑
  constants/            常量
  layouts/              页面布局
  pages/                页面与页面级组件
  stores/               Pinia 状态
  styles/               全局样式令牌
  types/                类型定义
  utils/                工具函数
supabase/               数据库迁移与配置
```

## 当前仓库说明

- 当前远端仓库：`https://github.com/daiwanxing/Funds-Assistant`
- 当前仓库历史已重置为新的起点提交
- README 内容以当前项目状态为准，不再沿用旧仓库描述

## 补充说明

- 游客模式下，自选基金只保存在 `sessionStorage`
- 登录后，自选基金以 `/api/me/bootstrap` 和 `/api/me/watchlist` 为主数据源
- `localStorage` 只承担本地偏好和非账号信息，不再存登录用户自选
