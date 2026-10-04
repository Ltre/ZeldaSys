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

---

## 2026-10-04 — ZeldaSys 项目总览模板

### 实际修改

- 将 `doc/overview/master.md` 与 `doc/overview/master.example.md` 中遗留的 Drop2Tunnel 产品名称、示例和占位说明改成 ZeldaSys 项目风格，明确总览内容、文档链接和项目状态的写法。
- 全仓模板和源码中不再保留 Drop2Tunnel 的命名残留；QA 历史问答中保留用户要求的原始名称作为讨论记录。

本项未暂存、未提交。

---

## 2026-10-04 — Phase 1：PoC-A Rapier 物理基线（接续记录）

### 目标

按技术 PoC 路线验证 Rapier 在约 50 个刚体、固定连接、旋转关节、motor 与持续施力场景下的物理步进和约束稳定性，并确认该 WASM 依赖能通过当前 Web 工具链加载。

### 已有实现

- `packages/physics/src/pocA.ts` 建立 50 个 dynamic bodies、地面、30 个 fixed joints、4 个 revolute joints、2 个 motor 和 2 个 fan-like force。
- 固定物理步长为 1/60 秒。基准运行前预热 120 步，再统计 600 个 measured steps 的 average / p95 / max physics step、render FPS、最大 joint anchor drift、非有限刚体数量及碰撞指标。
- 碰撞 collider 启用 Rapier collision events。基准逐步计数 collision-start events；测量结束后读取最终 active contact pair 数量和该时刻最深接触穿透，避免在帧测量期间遍历碰撞对。
- `apps/client/src/runtime/ThreeViewport.ts` 将 50 个同构盒体用 `THREE.InstancedMesh` 绘制，并在每个 measured step 同步变换。
- `apps/client/src/ui/PocAPanel.tsx` 展示物理步时、FPS、joint drift、碰撞开始数、最终接触对、最终穿透和无效刚体数；`packages/physics/src/pocA.test.ts` 验证目标数量、固定步长、有限状态、连接漂移及接触数据。
- 客户端标题状态由 Phase 0 更新为 Phase 1 PoC-A。

### 兼容性修复

首次接入 `@dimforge/rapier3d@0.21.0` 时，Vite / Vitest ESM 工具链无法解析其 package entry。改用 Rapier 官方 bundler 兼容发行包 `@dimforge/rapier3d-compat`，并显式初始化模块以便 Vite / Vitest 共用加载路径。

### 当前验收状态与缺口

2026-10-04 在单个前台 Codex In-app Browser 桌面 Chromium 标签页实测 PoC-A（非 Google Chrome 品牌浏览器）：

- 场景：50 bodies、30 fixed joints、4 revolute joints、2 motors、2 fans；预热 120 步，测量 600 步，timestep 1/60 秒。
- physics step：avg 0.414 ms、p95 0.600 ms、max 1.300 ms。
- render FPS：60.1。
- joint anchor drift：0.0010；最终 active contact pairs：56；测量期间 collision starts：2；最终时刻最深接触穿透：0.0005 m；invalid bodies：0。
- 浏览器控制台：无 error / warning。画面中 50 个盒体落地并保持连接，未观察到穿透地面或约束发散。
- 本次 FPS 采用单个活动标签页读数；多个临时验收标签页同时运行会抢占渲染资源，已关闭临时标签后重测。

Android 真机尚未验收：`adb devices -l` 没有连接设备；当前环境没有 `emulator`、`sdkmanager`、`avdmanager`，仓库也尚无 Capacitor Android 工程。需要连接真实 Android 设备，并按 PoC-D 准备 Capacitor WebView 后，才能记录该项 FPS、温升和降频情况。Google Chrome 品牌浏览器专测也未执行；桌面结果来自 Codex In-app Browser 的 Chromium。

最终验证：

- `corepack pnpm@10.18.0 test`：PASS，2 个 test files / 2 个 tests。
- `corepack pnpm@10.18.0 lint`：PASS。
- `corepack pnpm@10.18.0 typecheck`：PASS，全部 4 个有脚本的 workspace packages。
- `corepack pnpm@10.18.0 build`：PASS；Vite 保留 bundle size warning（client JS 约 763 kB，Rapier chunk 约 4.33 MB / 1.67 MB gzip）。
- 本轮修改的 TS / TSX 文件已用 Prettier 格式化。

因此 PoC-A 桌面浏览器项通过；PoC-A 整体和 Gate-1 仍待 Android 真机 WebView 验收。当前工作树修改均未暂存、未提交。

### 源码提交锚点

- `3778ae9` — feat: add Rapier PoC-A physics benchmark
- `582fa58` — fix: use Rapier compat build for web toolchain
- `2af144d` — chore: normalize Rapier compat integration

以上是 PoC-A 已有源码提交锚点；本次接续的实现、桌面实测和验证为未暂存、未提交的工作树修改。桌面结果已记录；Android 真机数据仍待设备和 Capacitor WebView 工程就绪后追加，不把未运行的验证写成 PASS。
