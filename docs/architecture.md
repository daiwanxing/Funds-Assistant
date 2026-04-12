# 项目架构总览

## 目标

本项目是一个以基金行情、自选管理和账户同步为核心的 Web 应用。

当前架构重点解决三件事：

- 基金与指数数据的稳定拉取
- 游客态与登录态的数据边界
- `Dashboard` 主页面的模块化组织与可维护样式体系

## 模块边界

### 页面层

- `src/pages/Dashboard`
  主工作台，负责自选、搜索、详情展示与登录引导
- `src/pages/Authentication`
  登录、回调、重置密码等认证流程

### 数据层

- `src/api`
  纯请求层，只负责请求与响应映射
- `src/composables`
  业务状态与数据组合逻辑
- `src/stores`
  登录态、自选列表等全局状态

### 展示层

- `src/components/ui`
  通用展示组件
- `src/components/biz`
  跨模块业务组件
- `src/pages/*/components`
  模块内聚业务组件

## 数据链路

### 基金数据

- 主数据源：东方财富
- 主职责：
  - 自选基金实时估值
  - 基金搜索
  - 基金详情
  - 持仓数据补充

详情见：
- `docs/market-data-sources.md`

### 账号与持久化

- 登录用户自选：服务端接口
- 游客自选：`sessionStorage`
- 本地偏好：`localStorage`

数据库变更规范见：
- `docs/supabase-migration-guidelines.md`

## 页面组织规则

- 页面组件放在 `src/pages/<Module>`
- 模块内业务组件放在 `src/pages/<Module>/components`
- 组件只要不止一个文件，就必须使用同名文件夹承载

## 样式规则

- 页面主样式采用 `scss`
- 颜色统一收敛到全局 token
- 组件样式独立维护
- 类名采用贴近语义的 BEM

## 测试策略

- 只保留高价值单元测试
- 优先覆盖业务规则、权限、状态流转、数据转换和事故回归点
- 避免堆积纯结构、纯样式、低风险样板测试
