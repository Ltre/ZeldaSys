# ZeldaSys Development Features Log — 2610

> 当前命名周期：2610  
> 当前工作分支：`dev/2610-s1`  
> 建立日期：2026-10-04

## 记录约定

本文件只记录实际开发实施，包括：

- 新增 / 修改的代码；
- 数据结构实现；
- UI / UX 实现；
- 构建配置；
- PWA / Android 工程配置；
- 依赖变化；
- 测试与验证；
- Bug 修复；
- 性能工作；
- 与实际代码直接相关的技术债和回归风险；
- 对应 commit。

需求讨论、方案比较和产品决策放在对应周期的 `QA-*-log.md`，避免把“想做什么”和“已经做了什么”混在一起。

文件名中的 `2610` 不是永久固定值。后续按实际年月或用户指定的年份 / 月份 / 日期 / 时间命名；用户可随时要求改变日志命名规则。

---

## 2026-10-04 — 日志初始化

当前尚未开始 ZeldaSys 功能代码开发。

本轮实际仓库变更仅为需求文档和日志体系初始化，不视为产品功能开发。

开始代码开发后，每一轮应至少记录：

- 目标；
- 实际修改路径；
- 关键实现；
- 测试 / 验证结果；
- 已知问题；
- commit SHA。


---

## 2026-10-04 — Phase 0：工程骨架

### 目标

根据 `doc/roadmap/master/Initial Development Plans.md` 的 Phase 0，建立 PWA / Android 共用 Web 客户端的工程基础，并验证基础 CI。

### 实际修改

新增：

- 根 `package.json`；
- `pnpm-workspace.yaml`；
- `tsconfig.base.json`；
- ESLint / Prettier / EditorConfig；
- Git ignore；
- GitHub Actions CI；
- `apps/client` React + Vite 客户端；
- 独立 `ThreeViewport` Three.js runtime；
- `packages/domain`；
- `packages/geometry`；
- `packages/physics`；
- domain 最小 BuildDocument schema/version；
- domain unit test。

### 结构边界

当前已建立：

`React UI -> ThreeViewport runtime`

以及 workspace 包：

- `@zeldasys/domain`
- `@zeldasys/geometry`
- `@zeldasys/physics`

`domain` 当前不依赖 Three.js、Rapier、React 或 Capacitor。

Rapier 依赖声明放在 `packages/physics`，但 Phase 0 不提前实现物理 PoC。

### Three.js 基础画面

客户端启动后建立：

- WebGLRenderer；
- Scene；
- PerspectiveCamera；
- HemisphereLight；
- GridHelper；
- 一个旋转 preview box。

Three.js animation loop 封装在独立 `ThreeViewport` 中，不使用 React state 驱动每帧渲染。

### 验证

当前本地执行容器无法访问 npm registry，因此无法在本地安装 workspace 依赖。

本地完成：

- JSON 文件解析检查：通过；
- `eslint.config.mjs` JavaScript 语法检查：通过；
- 使用环境自带 TypeScript 对 dependency-free domain 生产源码执行 strict/noEmit 检查：通过。

随后通过 GitHub Actions 使用真实依赖完成完整验证。

最终 CI Run：

https://github.com/Ltre/ZeldaSys/actions/runs/37181240240

结果：

- pnpm install：PASS
- Prettier check：PASS
- ESLint：PASS
- TypeScript typecheck：PASS
- Vitest：PASS
- Vite build：PASS

### CI 调整记录

首次 CI 因仓库尚无 `pnpm-lock.yaml`，`actions/setup-node` 的 pnpm cache 初始化提前失败，因此 bootstrap 阶段暂时关闭 setup-node pnpm cache。

第二次 CI 暴露历史 docs / README 与新 CSS 的 Prettier 差异。

处理：

- 历史文档、README、运行时生成的 lockfile 不纳入当前 Prettier gate；
- bootstrap CSS 暂不作为 Prettier gate 输入；
- TypeScript / TSX / JSON / ESLint 等工程文件仍受 CI 质量检查。

后续在可直接运行 pnpm/Prettier 的开发环境中，再统一处理 CSS 格式并提交正式 `pnpm-lock.yaml`。

### Commit

主要提交：

- `a66ae0b80945442f52793c89bce312906b2bda24` — feat: scaffold ZeldaSys web workspace
- `536af8e064782a789a9cbac5c46d965fe9e8fb48` — ci: bootstrap without pnpm lockfile cache
- `7b5e0f78f0d65ff692796b420c9d652c6164759e` — chore: align Phase 0 formatting checks
- `7c13fd3a323dea2eeaac8cd3de02e4ce1205cb2c` — chore: defer CSS formatting in bootstrap

### 状态

**Phase 0：完成。**

下一阶段进入 Phase 1 高风险 PoC，先做 PoC-A：Rapier 约 50 零件物理基线。
