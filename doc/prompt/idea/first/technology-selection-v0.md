# ZeldaSys 技术选型（v0）

> 日期：2026-10-04  
> 状态：首版技术基线  
> 目标平台：PWA / Android  
> 对应需求：`doc/prompt/idea/first/requirements-discussion-v2.md`

## 1. 结论

首版采用：

- 语言：TypeScript
- UI：React
- 构建：Vite
- 3D：Three.js
- 首版渲染器：Three.js WebGLRenderer
- 物理：@dimforge/rapier3d-compat（WebAssembly）
- 本地数据库：IndexedDB + Dexie
- PWA：vite-plugin-pwa / Workbox
- Android：Capacitor
- 单元测试：Vitest
- 浏览器端 E2E：Playwright
- 包管理 / workspace：pnpm workspace
- 服务端：首版不创建；未来需要时使用 Node.js

核心原则：

> React 只负责 UI，不管理每帧 3D/物理更新。Three.js、Rapier、领域状态分别通过 adapter/service 层连接。

## 2. 为什么选 Three.js

### 2.1 与 SVG 自定义零件高度匹配

Three.js 官方已有：

- SVGLoader；
- Shape；
- holes；
- ShapeUtils.triangulateShape；
- ExtrudeGeometry。

因此首版 SVG 流程可以自然实现：

`SVG -> SVGLoader/自定义校验 -> Shape/contour -> ExtrudeGeometry -> render mesh`

来源：

- https://threejs.org/docs/pages/SVGLoader.html
- https://threejs.org/docs/pages/Shape.html
- https://threejs.org/docs/pages/ShapeUtils.html
- https://threejs.org/docs/pages/ExtrudeGeometry.html

### 2.2 任意表面连接需要的 picking 能力成熟

Three.js Raycaster 可返回：

- 命中点；
- face；
- faceIndex；
- normal。

它适合编辑态的指针 / 触摸选取和目标表面预览。

来源：

- https://threejs.org/docs/pages/Raycaster.html

### 2.3 保持物理层独立

ZeldaSys 的领域模型和物理连接不应该绑定某一个“完整游戏引擎”。

Three.js 更适合作为渲染层，Rapier 作为物理层：

`Domain -> RenderAdapter(Three) / PhysicsAdapter(Rapier)`

以后若更换其中一层，BuildDocument 不必重写。

## 3. WebGLRenderer vs WebGPURenderer

首版使用：

> WebGLRenderer

不把 WebGPURenderer 作为 MVP 前置条件。

Three.js 官方说明 WebGPURenderer 已支持 WebGPU，并可回退 WebGL2，但仍处于 experimental 状态，同时部分 ShaderMaterial / 后处理路径与 WebGLRenderer 不兼容。

首版 PWA / Android 更重视：

- Android WebView 覆盖面；
- 可预测性；
- 调试成熟度；
- 快速验证 50 刚体场景。

因此：

- MVP：WebGLRenderer；
- 后期：单独评估 WebGPURenderer。

来源：

- https://threejs.org/manual/pages/webgpurenderer

## 4. 为什么选 Rapier 3D

Rapier JavaScript 版是 WebAssembly 物理引擎，提供 ZeldaSys MVP 直接需要的能力。

### 4.1 刚体

支持：

- Dynamic；
- Fixed；
- KinematicPositionBased；
- KinematicVelocityBased；
- CCD。

编辑态可以使用 kinematic / 自定义 query 辅助；模拟态使用 dynamic。

来源：

- https://rapier.rs/docs/user_guides/javascript/rigid_bodies/

### 4.2 Joint

官方支持：

- Fixed；
- Revolute；
- Prismatic；
- Spherical；
- Generic；
- joint motor。

其中：

- 普通任意表面粘合 -> Fixed；
- Wheel / Motor -> Revolute + motor；
- 后期滑轨 -> Prismatic。

来源：

- https://rapier.rs/docs/user_guides/javascript/joints/

### 4.3 Scene Query

官方提供：

- ray cast；
- shape cast；
- point projection；
- intersection with shape。

这些能力对“靠近任意表面 -> 找到接触位置 -> 防穿透 -> 生成预览”非常重要。

来源：

- https://rapier.rs/docs/user_guides/javascript/scene_queries/

### 4.4 SVG 动态非凸 collider

Rapier 支持：

- convex hull；
- convex mesh；
- compound shape；
- triangle mesh；
- convex decomposition / VHACD。

官方明确不建议给 dynamic rigid body 直接使用 triangle mesh，而建议对非凸动态物体使用 convex decomposition / compound shape。

因此 SVG 挤出后的动态零件首版 PoC 应验证：

`Extruded mesh -> convexDecomposition -> compound collider`

若 Android 上导入耗时或 collider 复杂度不可接受，再改为：

`2D contour -> 2D convex decomposition -> 每块挤出 -> compound collider`

来源：

- https://rapier.rs/docs/user_guides/javascript/colliders/
- https://rapier.rs/javascript3d/classes/ColliderDesc.html


### 4.5 Bundler / WASM 发行包选择

Phase 1 PoC-A 的第一次真实 CI 验证发现：`@dimforge/rapier3d@0.21.0` 在当前 Vitest/Vite ESM 链路中无法解析 package entry。

因此 MVP 改用官方提供的：

> `@dimforge/rapier3d-compat@0.21.0`

该兼容发行版把 WASM 以 base64 内嵌到 JavaScript 中，代价是包体更大，但官方明确将它作为 bundler 无法正确处理 WASM 时的兼容方案。ZeldaSys 当前更重视 PWA / Android WebView / 测试链路的一致可加载性，因此接受这一包体成本。

兼容包初始化必须显式：

`await RAPIER.init()`

运行时使用单例 Promise 保证只初始化一次。

未来若确认 Vite、Vitest、Capacitor 全链路能稳定支持独立 WASM 文件，可重新评估切回非 compat 包以减小 JavaScript 包体。

## 5. 为什么不首选 Babylon.js + Havok

Babylon.js + Havok 是可行的强力备选，不是因为能力不足而淘汰。

Havok WebAssembly 已免费以 MIT 许可提供，Babylon Physics V2 也支持刚体、mesh / convex hull、约束、motor、shape cast 等能力。

来源：

- https://github.com/BabylonJS/Documentation/blob/master/content/features/featuresDeepDive/physics/v2/usingHavok.md
- https://github.com/BabylonJS/havok

本项目首版仍优先 Three.js + Rapier，主要因为：

1. SVGLoader / Shape / ExtrudeGeometry 与现有自定义 SVG 需求天然贴合；
2. ZeldaSys 希望领域 / 渲染 / 物理解耦，而不是依赖一个更完整的一体化引擎抽象；
3. Rapier API 本身已经直接满足固定连接、旋转关节、motor、scene query、convex decomposition；
4. 技术 PoC 可以分别替换 Three 或 Rapier，风险隔离更清晰。

保留 fallback：

> 如果 Rapier 在约束稳定性或 Android 性能 PoC 中失败，则 Babylon.js + Havok 是第一备选路线。

## 6. 为什么用 React，但不用 React Three Fiber 作为核心运行层

React 负责：

- 工程列表；
- 零件库；
- 工具栏；
- 属性面板；
- 模态框；
- SVG 导入；
- 设置；
- 状态提示。

Three.js canvas / Rapier simulation loop 由独立 runtime 管理。

不让 React component state 成为：

- 每帧 Transform；
- rigid body velocity；
- physics world；
- renderer scene graph

的事实来源。

原因：

- 物理步进需要固定 timestep；
- 渲染频率与 UI render 不应互相绑定；
- 保存的是 Domain Model，而不是 React tree。

React 官方当前仍完整支持 TypeScript；正式建项目时锁定当时最新稳定 19.x 小版本。

来源：

- https://react.dev/learn/typescript
- https://react.dev/versions

## 7. 本地持久化

选择：

> IndexedDB + Dexie

原因：

- PWA 原生可用；
- 可保存结构化 BuildDocument；
- 可保存用户 PartDefinition；
- 可保存 SVG 原文 / Blob 等资产；
- TypeScript API 成熟；
- Android Capacitor WebView 可复用同一层数据逻辑。

Dexie 4 官方提供 TypeScript 支持。

来源：

- https://dexie.org/docs/Typescript

注意：

持久化层只能保存领域数据，不保存 Three Object3D 或 Rapier handle 作为长期事实。

## 8. Android 方案

首版使用：

> Capacitor stable（当前稳定线 v8）

原因：

- 官方直接支持 Web / PWA / Android / iOS；
- 可以将同一份 web bundle 同步到 Android；
- Android 工程仍是标准 Android Studio 工程；
- 后续需要文件系统、分享、原生性能采样等能力时可以增加原生插件。

Capacitor 8 当前要求 Node.js 22+，Android 目标由官方版本矩阵管理。

来源：

- https://capacitorjs.com/docs
- https://capacitorjs.com/docs/getting-started/environment-setup
- https://capacitorjs.com/docs/basics/workflow

### 为什么首版不选 Tauri

Tauri 2 已支持桌面和移动，也支持任意 Web 前端，长期可以成为 Windows / Linux / macOS 打包候选。

但现在使用它会提前引入：

- Rust toolchain；
- Tauri IPC / permission 模型；
- 移动端额外工程复杂度。

当前目标只是 PWA / Android 试水，因此 Capacitor 路径更短。

未来桌面阶段重新比较：

- Tauri；
- Electron；
- 纯 PWA install。

Tauri 来源：

- https://v2.tauri.app/start/

## 9. PWA

使用：

- Vite；
- vite-plugin-pwa；
- Workbox。

要求：

- app shell 可离线启动；
- Three/Rapier WASM 资产正确缓存；
- 用户工程不依赖网络；
- service worker 更新不能在编辑过程中破坏当前工程；
- 新版本必须有数据库 schema migration。

来源：

- https://vite-pwa-org.netlify.app/guide/

## 10. 推荐代码结构

首版采用 workspace，但不过度拆包。

建议：

```
ZeldaSys/
  apps/
    client/
      src/
        app/
        ui/
        runtime/
        editor/
        persistence/
      android/
  packages/
    domain/
    geometry/
    physics/
  tests/
    fixtures/
    performance/
  doc/
```

职责：

### packages/domain

纯 TypeScript：

- PartDefinition
- PartInstance
- Connection
- BuildDocument
- command / undo / redo
- schema version
- serialization

不得 import：

- three
- rapier
- react
- capacitor

### packages/geometry

负责：

- primitive geometry description；
- SVG validation；
- SVG -> contour；
- contour -> mesh；
- collider source geometry；
- pivot / local bounds。

允许依赖 Three 的 geometry helpers，但对上层暴露自己的结果结构。

### packages/physics

负责 Rapier adapter：

- PhysicsWorld；
- RigidBody mapping；
- Collider mapping；
- Fixed / Revolute joints；
- Motor；
- Fan force；
- fixed timestep；
- scene query。

对 domain 不暴露 Rapier handle 作为持久字段。

### apps/client

负责：

- React UI；
- Three renderer；
- editor state machine；
- pointer / touch；
- PWA；
- Capacitor Android。

## 11. 时间模型

模拟采用：

- 固定 physics timestep：目标 1/60s；
- render 使用 requestAnimationFrame；
- accumulator；
- 限制单帧最大 physics substeps，避免低性能设备发生 spiral of death；
- 渲染 Transform 从 physics snapshot / interpolation 得到。

编辑态不运行正常重力模拟。

## 12. 数据模型硬约束

### PartDefinition

至少：

- id
- schemaVersion
- name
- geometrySource
- physicalMaterial
- colliderDefinition
- functionalDefinition?
- pivot

### PartInstance

至少：

- id
- definitionId
- transform
- instanceOverrides?

### Connection

至少：

- id
- type
- partA
- partB
- localFrameA
- localFrameB
- params

首版 type：

- fixed
- revolute

### BuildDocument

至少：

- id
- schemaVersion
- name
- partInstances
- connections
- usedDefinitionIds
- timestamps

## 13. 首轮高风险 PoC

在做完整 UI 之前必须依次验证：

### PoC-A：Rapier 50 件性能

场景：

- 50 dynamic rigid bodies；
- 30+ fixed joints；
- 4 revolute joints；
- 2 motors；
- 2 fans；
- ground collision。

设备：

- 桌面 Chrome；
- 至少一台真实 Android 中端设备的 Capacitor WebView。

结果需要记录：

- physics step 时间；
- render FPS；
- 是否爆约束 / 抖动；
- 温升 / 明显降频现象。

### PoC-B：任意表面粘合

必须证明：

- 触摸 / 鼠标选物体；
- 找到目标任意表面；
- 获取 point + normal；
- 自动法线对齐；
- 绕法线旋转；
- 预览；
- 确认生成 local frames；
- FixedJoint 在模拟态保持稳定。

### PoC-C：SVG -> 3D -> Dynamic Collider

至少用：

- 矩形；
- 圆；
- L 型凹多边形；
- 带孔洞轮廓。

证明：

- 导入；
- 标准化；
- 挤出；
- 渲染；
- convex decomposition；
- 作为 dynamic rigid body 稳定碰撞。

### PoC-D：Android 同源运行

证明同一工程：

- 浏览器 PWA 可运行；
- Capacitor Android 可运行；
- Rapier WASM 加载；
- IndexedDB 数据保存 / 重开恢复；
- SVG 文件导入；
- 触控工作。

## 14. 技术选型冻结条件

PoC A-D 全部通过后，首版栈正式冻结。

允许改变核心引擎的情况：

- Rapier 50 件约束无法达到可接受稳定性 / 性能；
- SVG 动态 collider 在 Android 不可接受；
- Capacitor WebView 对 WASM / WebGL 存在无法规避的问题；
- Three.js 编辑交互能力不足且替换成本低于继续补齐。

若无上述阻断，不在 MVP 中途因为“另一个库看起来更好”而切换核心技术。
