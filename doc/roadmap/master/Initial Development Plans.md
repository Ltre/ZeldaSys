# 初期开发计划

> ZeldaSys MVP 正式开发路线  
> 日期：2026-10-04  
> 工作分支：`dev/2610-s1`  
> 需求基线：`doc/prompt/idea/first/requirements-discussion-v2.md`  
> 技术基线：`doc/prompt/idea/first/technology-selection-v0.md`

## 0. MVP 定义

本路线交付：

- PWA；
- Android；
- 离线优先；
- 参数化基础零件；
- 受限 SVG 导入并挤出为 3D 零件；
- 任意表面粘合；
- 编辑态 / 模拟态；
- 实时重力、碰撞、刚体、连接约束；
- Wheel；
- Motor；
- Fan；
- 本地保存 / 加载；
- Undo / Redo；
- 典型约 50 零件。

首版不做：

- Node 服务端；
- 账号 / 云同步；
- GLB / glTF；
- 角色；
- 地图编辑器；
- 多人；
- 电池 / 电路 / 脚本；
- iOS / 桌面原生包。

## 1. Phase 0 — 工程骨架

### 1.1 初始化 workspace

建立：

- pnpm workspace；
- TypeScript strict；
- apps/client；
- packages/domain；
- packages/geometry；
- packages/physics；
- tests。

### 1.2 初始化 client

使用：

- Vite；
- React；
- Three.js；
- 基础全屏 canvas；
- 响应式 UI shell。

### 1.3 工程质量

配置：

- ESLint；
- Prettier；
- Vitest；
- Playwright；
- typecheck；
- build；
- test scripts。

### 1.4 验收

必须满足：

- `pnpm install` 成功；
- `pnpm build` 成功；
- `pnpm test` 成功；
- 浏览器显示空 3D 场景；
- domain package 无 Three / Rapier / React 依赖。

完成后提交。

## 2. Phase 1 — 四个高风险 PoC

本阶段优先级高于完整 UI。

### 2.1 PoC-A：Rapier 物理基线

实现最小场景：

- gravity；
- ground；
- dynamic box；
- fixed joint；
- revolute joint；
- motor；
- fan-like force；
- fixed timestep。

随后扩到：

- 50 bodies；
- 30+ fixed；
- 4 revolute；
- 2 motors；
- 2 fans。

记录：

- physics step ms；
- FPS；
- 崩溃 / 穿透；
- joint drift；
- Android 结果。

### 2.2 PoC-B：任意表面连接

最小交互：

1. 选 source；
2. 拖到 target；
3. ray / shape query 找 target surface；
4. 得到 point + normal；
5. 算 source candidate transform；
6. 法线对齐；
7. 绕法线旋转；
8. 显示 ghost preview；
9. 确认；
10. 转换为双方 local frame；
11. 创建 FixedJoint；
12. 启动物理。

测试：

- box-box；
- box-cylinder；
- 倾斜面；
- 连续连接 10+ 零件；
- 形成闭环约束。

### 2.3 PoC-C：SVG 自定义零件

实现受限 SVG：

- path；
- polygon；
- rect；
- circle；
- ellipse；
- holes。

流程：

- validate；
- parse；
- normalize；
- shape；
- extrude；
- mesh；
- collider。

fixture：

- rectangle.svg；
- circle.svg；
- concave-L.svg；
- hole.svg；
- unsupported-elements.svg。

验证：

- unsupported 明确报错；
- L 型 dynamic collider 不使用错误的单凸包；
- hole 可渲染；
- collider 策略结果可解释；
- Android 导入时间可接受。

### 2.4 PoC-D：Capacitor Android

完成：

- 加入 Android platform；
- Web bundle sync；
- 真机运行；
- Rapier WASM 加载；
- WebGL 场景；
- IndexedDB；
- File picker SVG；
- touch input。

### 2.5 Gate-1

四项 PoC 均通过才能进入完整产品实现。

如失败，先修技术路线，不允许带着关键风险继续堆 UI。

## 3. Phase 2 — Domain Model

### 3.1 Schema

定义版本化：

- PartDefinition；
- PartInstance；
- Connection；
- BuildDocument；
- FunctionalDefinition。

### 3.2 GeometrySource

首版：

- primitive；
- svg-contour。

未来预留：

- gltf。

### 3.3 Connection

首版：

- fixed；
- revolute。

保存：

- localFrameA；
- localFrameB；
- params。

### 3.4 Command System

所有用户编辑通过 command：

- AddPart；
- DeletePart；
- TransformPart；
- ConnectParts；
- DisconnectParts；
- ChangePartProperty；
- DuplicatePart。

每个 command：

- execute；
- undo；
- redo 数据。

### 3.5 验收

纯 domain unit tests 覆盖：

- serialize / deserialize；
- schema validation；
- command undo / redo；
- 删除有连接零件；
- definition 被多个 instance 引用；
- migration 基础框架。

## 4. Phase 3 — Runtime Adapter

### 4.1 RenderAdapter

建立 domain id -> Three Object3D mapping。

要求：

- scene graph 不是数据源；
- 删除 / 重建不会丢 domain 信息；
- selection / highlight 独立。

### 4.2 PhysicsAdapter

建立 domain id -> Rapier handles mapping。

要求：

- handles 只存在 runtime；
- 从 BuildDocument 可完全重建 physics world；
- physics world 销毁重建无数据损失。

### 4.3 Runtime Coordinator

负责：

- editor mode；
- simulation mode；
- fixed timestep；
- rendering；
- transform sync。

## 5. Phase 4 — 编辑器基础

### 5.1 Camera

触屏优先：

- 单指对象操作；
- 双指 orbit / zoom；
- 避免手势冲突。

桌面：

- mouse orbit；
- wheel zoom。

### 5.2 Selection

实现：

- tap / click pick；
- selected outline / highlight；
- 空白取消；
- UI 层不抢 canvas 手势。

### 5.3 Transform

实现：

- move；
- rotate；
- 轴 / 平面约束；
- 精确 reset；
- duplicate；
- delete。

首版不要求复杂专业 DCC gizmo，但操作必须在手机可用。

### 5.4 Undo / Redo

UI 接入 domain command history。

## 6. Phase 5 — 基础零件库

至少：

- box / board；
- cylinder / rod；
- sphere；
- wheel base；
- fan base。

属性：

- size；
- color；
- density / mass policy；
- friction；
- restitution。

要求：

- definition 与 instance 分离；
- 同 definition 多 instance；
- 修改定义和修改实例的语义明确。

## 7. Phase 6 — 任意表面粘合正式实现

### 7.1 Candidate Detection

组合：

- Three Raycaster；
- Rapier scene query / shape cast；
- distance threshold。

### 7.2 Orientation

根据：

- target contact point；
- target normal；
- source candidate contact；
- source current orientation

计算 candidate transform。

规则：

- 接触面法线自动相向；
- 绕 normal 保留用户调整自由。

### 7.3 Preview

显示原创视觉：

- candidate ghost；
- contact marker；
- normal / rotation hint；
- valid / invalid 状态。

不能复刻 TOTK 的具体胶水美术。

### 7.4 Commit Connection

确认后：

- 写入 domain Connection；
- 保存 localFrameA/B；
- editor 中显示 connection marker；
- simulation 重建 FixedJoint。

### 7.5 Disconnect

用户可以：

- 选 connection；
- 删除；
- undo；
- redo。

### 7.6 验收

覆盖：

- 任意倾角；
- 凹形 SVG 零件；
- 多连接；
- connection loop；
- 保存 / 加载后 anchor 不漂移。

## 8. Phase 7 — 编辑 / 模拟状态机

状态：

- EDITING；
- ENTERING_SIMULATION；
- SIMULATING；
- EXITING_SIMULATION。

### 8.1 Run

- 保存编辑快照；
- rebuild / activate physics；
- dynamic bodies；
- gravity；
- joints；
- functional parts。

### 8.2 Stop

默认：

- 销毁模拟 runtime；
- 恢复 Run 前 BuildDocument；
- 重建 editor runtime。

### 8.3 验收

无论模拟中：

- 翻车；
- 掉落；
- 撞飞；
- 旋转；
- 风扇持续推进；

Stop 后都恢复原设计。

## 9. Phase 8 — 功能件

### 9.1 Wheel

- revolute axis；
- friction/contact；
- 可自由转动。

### 9.2 Motor

参数：

- enabled；
- direction；
- targetSpeed；
- maxTorque。

通过 Rapier joint motor 驱动。

### 9.3 Fan

参数：

- enabled；
- thrust；
- localDirection。

每个 physics step：

- 从 localDirection 得到 world force direction；
- 对所属 body 施力。

### 9.4 UI

编辑态显示：

- axis；
- direction；
- enabled；
- parameter panel。

### 9.5 验收示例

必须能构造：

- 两轮 / 四轮简易车；
- motor 驱动车轮；
- 风扇推动车体；
- 风扇推翻不稳定结构。

## 10. Phase 9 — SVG 正式功能

### 10.1 Security / Validation

只接受白名单 SVG 元素。

拒绝 / 忽略：

- script；
- external resource；
- animation；
- filter；
- mask；
- text；
- unsupported href。

### 10.2 Import UI

用户选择：

- file；
- width；
- height；
- depth。

显示：

- 2D / 3D preview；
- unsupported warning；
- collider generation 状态。

### 10.3 ShapeDefinition

保存：

- normalized contour；
- holes；
- dimensions；
- pivot；
- source metadata；
- optional raw SVG。

### 10.4 Collider

默认：

- dynamic 非凸 -> convex decomposition / compound。

性能不达标时：

- 切换到 2D convex decomposition 后挤出。

### 10.5 验收

至少使用 Phase 1 的 fixture 集合，并新增极端尺寸、重复点、自交轮廓、空 path 等错误输入。

## 11. Phase 10 — Local Persistence

### 11.1 Dexie schema

至少表：

- builds；
- partDefinitions；
- assets；
- settings。

### 11.2 Autosave

策略：

- command 成功后标记 dirty；
- debounce save；
- 页面隐藏 / app background 尽量 flush；
- 保存失败必须提示。

### 11.3 Project Lifecycle

支持：

- new；
- rename；
- save；
- duplicate；
- delete；
- open。

### 11.4 Migration

每个 schemaVersion 有 migration 测试。

## 12. Phase 11 — PWA

实现：

- manifest；
- icons；
- service worker；
- offline app shell；
- WASM cache；
- offline reload；
- update UX。

验收：

- 首次在线安装；
- 断网重开；
- 打开已保存工程；
- 编辑；
- 保存；
- 全程无需服务端。

## 13. Phase 12 — Android

### 13.1 Capacitor

- stable Capacitor；
- Android project；
- package id；
- icons / splash；
- file picker；
- back button strategy；
- app pause / resume。

### 13.2 真机矩阵

至少：

- 一台中端 Android；
- 一台性能较好的 Android；
- Chrome PWA；
- Android WebView app。

### 13.3 数据一致性

同一 BuildDocument JSON 必须能在 PWA / Android 解释一致。

## 14. Phase 13 — 性能与稳定性

标准 benchmark scene：

- 50 parts；
- 35 fixed；
- 6 revolute；
- 2 motor；
- 2 fan；
- 5 SVG custom parts；
- ground。

记录：

- startup；
- import latency；
- physics ms；
- render FPS；
- memory；
- long-run 10 min stability。

优化优先：

1. collider complexity；
2. sleeping；
3. fixed timestep / substep；
4. draw calls；
5. geometry reuse；
6. UI rerender；
7. assets。

## 15. Phase 14 — MVP 验收

用户必须能完成完整任务：

1. 安装 / 打开；
2. 新建工程；
3. 添加基础零件；
4. 导入 SVG；
5. 任意表面粘合；
6. 加轮子；
7. 设置马达；
8. 加风扇；
9. Run；
10. 观察真实物理；
11. Stop 恢复设计；
12. 修改；
13. Undo / Redo；
14. 保存；
15. 退出；
16. 重开恢复。

同时要求：

- PWA pass；
- Android pass；
- benchmark pass；
- 无服务端也完整可用。

## 16. 提交策略

在 `dev/2610-s1`：

- 每个 Phase 至少一个可回滚 commit；
- 高风险 PoC 单独 commit；
- 不把多个无关功能塞进同一个提交；
- 每次提交前运行当前可运行的 typecheck / tests / build；
- 实际开发内容同步追加到 `doc/devlog/dev-2610-features.md`；
- 用户问答和决策继续追加到 `doc/devlog/QA-2610-log.md` 尾部。
