# ZeldaSys QA / Decision Log — 2610

> 当前命名周期：2610  
> 当前分支：`dev/2610-s1`  
> 建立日期：2026-10-04

## 记录约定

本文件用于保存：

- 用户与 AI 的重要需求讨论摘要；
- 用户明确给出的决策；
- AI 给出的可复查决策依据、方案比较、风险与结论摘要；
- 尚未解决的问题；
- 会影响 roadmap / 架构 / 实现的需求变化。

不保存隐藏的内部思维链（private chain-of-thought）。如需记录“推理”，记录能够供项目成员审查的理由、约束、备选方案、取舍和最终结论。

文件名中的 `2610` 不是永久固定值。后续按实际年月或用户指定的年份 / 月份 / 日期 / 时间命名；用户可随时要求改变日志命名规则。

实际代码、配置、测试、构建等开发实施过程，不写入本文件，统一进入对应周期的 `doc/devlog/dev-*-features.md`。

---

## 2026-10-04 — 初始需求

### 用户目标

实现一个类似《塞尔达传说：王国之泪》的合成 / 建造系统，用户可以自定义材料 / 零件。

长期客户端目标：

- Android；
- iOS；
- PWA；
- Windows；
- Linux；
- macOS。

初期优先：

- PWA；
- Android。

服务端若未来需要，使用 Node.js；没有云存储等实际需求前，不强行引入服务端。

文档流程：

1. 先讨论需求，并把中间成果保存到 `doc/prompt/idea/first/`；
2. 需求与技术路线收敛后，再把详细开发步骤写入 `doc/roadmap/master/`；
3. 根据 roadmap 开始实际开发。

### 第一轮方案整理摘要

AI 将核心问题拆成：

- 产品到底是建造工具还是完整游戏；
- 自定义零件做到参数化、模型导入还是完整编辑器；
- 连接是 Snap Point 还是任意表面；
- 实时物理是否属于 MVP；
- 是否首版就要功能件；
- 典型建造规模。

同时提出基础领域模型：

- `PartDefinition`
- `PartInstance`
- `Connection`
- `BuildDocument`

第一版讨论稿保存为：

`doc/prompt/idea/first/requirements-discussion-v0.md`

---

## 2026-10-04 — 第二轮需求确认

### 用户明确决定

1. 前期是纯建造沙盒 / 工具；以后再发展自定义角色、地图。
2. 首版自定义零件不仅有基础形状参数化，还需要支持类似 SVG 的导入；GLB / glTF 以后再讨论。
3. 连接必须支持类似《王国之泪》的任意表面粘合。
4. 首个 MVP 必须有实时重力、碰撞和刚体模拟。
5. 首版必须有轮子、马达、风扇等会动的功能零件。
6. 典型建造规模约 50 个零件。
7. 首轮只用 PWA / Android 试水。

### 决策影响摘要

这些决定意味着 MVP 已经不能按“静态 3D 装配编辑器”设计，而必须从一开始按“实时物理建造沙盒”设计。

关键影响：

- 物理引擎成为核心依赖，不是后置模块；
- Connection 必须保存任意表面局部 anchor，而不能只保存预定义 Snap Point；
- 轮子 / 马达要求旋转关节与驱动能力；
- 风扇要求持续施力能力；
- SVG 风格二维导入必须最终生成既可渲染又可碰撞的三维几何；
- 典型规模约 50 零件，可把首轮性能目标聚焦在中小型组合体，而无需过早面向上千刚体；
- PWA / Android 优先意味着 Web 端 3D / 物理技术路线必须认真考虑移动浏览器和 Android 容器的兼容性。

### 关于 SVG 风格导入的当前理解

目前只确认“类似 SVG 的二维矢量形状导入”，尚未确认需要完整兼容 SVG 标准。

较合理的首版处理链路是：

`2D path -> 轮廓规范化 -> 三角化 -> 挤出厚度 -> render mesh -> collider`

仍需明确支持的 SVG 子集、孔洞、stroke、transform、厚度、单位、凹形碰撞体等语义。

### 关于任意表面粘合的当前理解

连接建立时需要从接触点和表面法线得到双方局部 anchor，并在物理世界中创建固定约束。

这与 Snap Point 不同，必须验证：

- 表面命中；
- 接触姿态；
- 防穿透；
- 多连接闭环；
- 触屏精确操作；
- 物理稳定性。

### 是否进入正式 roadmap

当前决定暂不进入 `doc/roadmap/master`。

剩余需要先确定的四组问题：

- SVG 风格导入的首版输入规范；
- 马达 / 风扇等功能件的控制语义；
- 编辑态与模拟态之间的位置 / 状态规则；
- 任意表面粘合时的姿态调整规则。

完成这一轮后，应已有足够信息开始正式技术选型和 roadmap。


---

## 2026-10-04 — 第三轮需求确认与案例调研

### 最后四组需求正式确认

用户确认上一轮给出的 1～4 项推荐全部采用：

1. SVG 风格零件直接导入受限 `.svg` 子集，规范化成内部轮廓后再生成 3D mesh / collider；
2. Motor / Fan 使用简单 enabled + 参数模型，进入模拟时统一启动，首版不做电池 / 电路；
3. 编辑态与模拟态分离，开始模拟前保存编辑快照，停止模拟默认恢复快照；
4. 任意表面粘合采用接触面法线对齐 + 绕法线可调角度 + 粘合预览 + 确认，普通连接为固定约束，特殊运动部件使用旋转关节。

需求基线已更新到：

`doc/prompt/idea/first/requirements-discussion-v2.md`

状态：核心产品需求已达到进入技术选型与正式 roadmap 的条件。

### 成熟案例调研结论

已调研并整理：

`doc/prompt/idea/first/case-study-research-v0.md`

推荐的 ZeldaSys 参考组合：

- TOTK：任意连接交互、连接视觉反馈、统一物理驱动原则；
- Besiege：编辑态 / 模拟态、失败后快速恢复、物理机器建造节奏；
- Scrap Mechanic：Bearing / Controller / Engine / Thruster 一类功能件组合语言；
- Trailmakers：让复杂载具建造保持新手可用；
- Poly Bridge 3：自定义 shape、pivot、anchor、UGC 数据模型；
- Space Engineers：后期复杂关节和 subgrid 设计。

当前没有发现成熟案例要求推翻 ZeldaSys v2 的核心设计。

### 原始问答记录新规则

从本次开始，本文件尾部固定保留：

`## 2026-10-04 — 技术选型与正式 Roadmap

### 技术基线

正式选择：

- TypeScript；
- React：只负责 UI；
- Vite；
- Three.js；
- MVP 使用 WebGLRenderer；
- Rapier 3D / WASM；
- IndexedDB + Dexie；
- vite-plugin-pwa / Workbox；
- Capacitor stable；
- pnpm workspace；
- Vitest；
- Playwright。

服务端首版仍不创建。

### 架构决策

核心分层：

`Domain -> RenderAdapter(Three) / PhysicsAdapter(Rapier)`

React 不保存每帧物理 Transform，也不让 React render cycle 驱动物理步进。

领域模型不得持久化：

- Three Object3D；
- Rapier rigid-body handle；
- collider handle；
- joint handle。

这些都属于可重建 runtime。

### Three.js 选择理由

- 官方 SVGLoader 可作为受限 SVG 输入链路基础；
- Shape / holes / ExtrudeGeometry 直接覆盖二维轮廓挤出；
- Raycaster 可提供表面 picking；
- 与独立 Rapier 物理层组合后，领域层耦合较低。

MVP 使用 WebGLRenderer；WebGPURenderer 后期再评估，因为 Three 官方目前仍把后者标记为 experimental。

### Rapier 选择理由

直接提供：

- rigid body；
- CCD；
- fixed joint；
- revolute joint；
- prismatic joint；
- joint motor；
- ray cast；
- shape cast；
- point projection；
- convex decomposition / compound collider。

这与首版：

- 任意表面粘合；
- Wheel；
- Motor；
- Fan；
- SVG 动态非凸零件

高度对应。

Babylon.js + Havok 作为第一物理 / 引擎备选。如果 Rapier 的 Android 性能或复杂约束稳定性 PoC 失败，再切换评估，而不是提前增加一体化引擎耦合。

### Android 选择理由

首版使用 Capacitor，因为当前只验证 PWA / Android：

- 同一份 Web bundle；
- Android Studio 标准工程；
- 可增加 Kotlin 原生插件；
- 路径比现在引入 Tauri + Rust 更短。

Tauri 留作未来 Windows / Linux / macOS 桌面阶段重新评估。

### 正式 Roadmap

已写入：

- `doc/prompt/idea/first/technology-selection-v0.md`
- `doc/roadmap/master/Initial Development Plans.md`
- `doc/roadmap/master/Remaining Development Plans.md`

Roadmap 的第一个产品开发 Gate 不是 UI，而是四个高风险 PoC：

1. Rapier 约 50 零件物理性能；
2. 任意表面粘合与 FixedJoint；
3. SVG -> Extrude -> dynamic collider；
4. PWA / Capacitor Android 同源运行。

四项都通过后再冻结技术栈并进入完整 MVP 实现。

## 2026-10-04 — PoC-A 中断点核对（Codex 接续）

### 当前检查结论

- 当前分支为 `dev/2610-s1`，HEAD 与 `origin/dev/2610-s1` 同为 `2af144d`。
- 最新提交完成 Rapier compat 集成规范化；前一提交修复了普通 Rapier 包在当前 Vite / Vitest 工具链中的入口解析问题。
- PoC-A 当前包含 50 个刚体、30 个 fixed joints、4 个 revolute joints、2 个 motors、2 个 fan-like forces，并测量物理 step、渲染 FPS、joint anchor drift、碰撞事件、最终接触穿透和非有限刚体。
- 单个前台 Codex In-app Browser 桌面 Chromium 标签实测通过：FPS 60.1；physics step avg / p95 / max 为 0.414 / 0.600 / 1.300 ms；anchor drift 0.0010；最终 56 个 contact pairs；600 个 measured steps 中有 2 次 collision starts；最终时刻最深接触穿透 0.0005 m；invalid bodies 0；控制台无 error / warning。Google Chrome 品牌浏览器未专门实测。
- Android 真机仍待验收：`adb devices -l` 返回空设备列表；环境缺少 `emulator`、`sdkmanager`、`avdmanager`，仓库也没有 Capacitor Android 工程，因此无法记录设备 FPS、温升或降频。
- 测试、lint、typecheck、build 均已完成并通过；build 仍提示 client 与 Rapier 产物超过 500 kB chunk 建议阈值。开发事实已更新到 `dev-2610-features.md`。
- 当前工作树有未暂存的既有与本轮修改；index 为空。Codex 客户端约定继续有效：不暂存、不提交。

### 本轮 QA / 验收判断

- 桌面性能结果是在关闭临时验收标签页后取得；多个同时运行的 Three.js 标签会争用渲染资源，因此最终记录只采用单个前台标签页的 600 步读数。
- 碰撞开始事件在每个 measured step 计数；活动接触对与最深接触穿透在最后一个 measured step 读取，以免碰撞对遍历本身拉低 FPS。穿透数值代表最终帧的最大接触穿透，不代表整个测量窗口的历史峰值。
- 50 个盒体落地后保持稳定连接；桌面 Chromium 未观察到穿过地面或约束发散。Android 真机 WebView 验收仍是 PoC-A 的未完成部分，Gate-1 暂不通过。
- 下一步需在真实 Android 设备上运行同一场景并记录 FPS、物理 step、碰撞/穿透、温升与明显降频；按 roadmap 在 PoC-D 接入 Capacitor WebView 后再执行该项。

### 接续路线

先在 `dev/2610-s1` 补完并验收 PoC-A，记录桌面浏览器与 Android 真机结果；之后按 roadmap 完成 PoC-B 任意表面连接、PoC-C SVG 几何与碰撞体、PoC-D Capacitor Android 同源运行。四项 Gate-1 全通过后再进入完整 Domain Model 和产品实现。当前 Codex 客户端约定优先：开发完成不暂存、不提交。

---

### 原始问答记录维护规则

规则：

- 每组记录编号格式优先使用 `YYMMDD-N`，例如 `261004-1`；
- 同一天按 1、2、3……递增；
- “问”尽量保存用户原始消息；
- “答”保存 AI 对该问题的最终正式答复；
- 不记录中间工具调用、进度播报、隐藏内部思维链；
- Web UI 的临时引用标记如无法长期保存，可改写成稳定来源名称 / URL；
- 结构化决策摘要继续写在本固定追加区之前；
- **原始问答记录区必须始终保持为文件最后一个章节**；
- 以后新增问答只继续追加到文件尾部，不要求用户手工从网页复制。

---

## 原始问答记录（固定追加区）

[编号261004-1]问：

https://github.com/Ltre/ZeldaSys/blob/dev/2610-s1/doc/prompt/dev-prompt-log/first.md

实现一个类似王国之泪的合成/建造系统，用户可以自定义材料

服务端用node
客户端支持android/ios/pwa/windows/linux/mac

服务端初期非必要，除非需要云存储数据
客户端先做pwa/android

具体需求还没有，需要讨论后，先放到 doc/prompt/idea 目录中，
等有了正式的具体开发路线，才会在 doc/roadmap/master 目录存储详细开发步骤文档。

先做：
1、讨论需求，保存中间成果例如需求文档，存到 doc/prompt/idea/first 目录。
2、根据中间成果，逐步定下详细开发步骤，保存到 doc/roadmap/master 目录。
3、根据详细开发步骤文档，开始开发。

请在dev/2610-s1分支及时提交代码并push到github

答：

第一轮需求讨论已经整理并直接提交到 `dev/2610-s1`，GitHub 上已完成 push。

新增文档：`doc/prompt/idea/first/requirements-discussion-v0.md`  
Commit：`c163b1d4426145e03c88a0e49460b7ad8a3b26cf`

这版没有修改 `doc/roadmap/master`，因为目前几个底层需求还会直接改变技术路线。文档里已经把已确认事项、候选 MVP、领域模型、零件自定义分层、连接模型、物理模式、离线存储和服务端触发条件拆开了。

下一轮最值得先定这几个问题：

1. 最终定位是纯建造沙盒/工具，还是以后要发展成带角色、地图的游戏？
2. 首版自定义零件只做基础形状参数化，还是必须支持用户导入 GLB/glTF？
3. 连接必须像《王国之泪》一样支持任意表面粘合，还是首版可以先用 Snap Point？
4. 首个 MVP 是否必须包含实时重力、碰撞和刚体模拟？
5. 首版是否必须有轮子、马达、风扇这一类“会动”的功能零件？
6. 典型建造规模大约是多少：几十、几百，还是上千零件？

我的当前基线建议是：**PWA/Android 优先、离线优先、暂不做服务端；先建立 `PartDefinition + PartInstance + Connection + BuildDocument` 这套核心模型；优先把编辑态建造闭环跑通，再决定物理和复杂连接。**

你可以直接按上面 6 项回复你的倾向，我会继续把结论沉淀到 `doc/prompt/idea/first/`；等需求足够收敛后，再开始写正式的 `doc/roadmap/master`。


[编号261004-2]问：

1、前期先纯建造沙盒/工具，以后再发展自定义角色、地图
2、首版自定义零件不只做基础形状参数化，还要支持类似SVG的导入，至于GLB/glTF以后再说
3、连接必须像《王国之泪》一样支持任意表面粘合
4、首个 MVP 必须包含实时重力、碰撞和刚体模拟
5、首版必须有轮子、马达、风扇这一类“会动”的功能零件
6、典型建造规模大约50

先PWA/android试水

至于【结论沉淀到 `doc/prompt/idea/first/`；等需求足够收敛后，再开始写正式的 `doc/roadmap/master`。】你自己安排。

在后续开发之前，跟你约定好：
我跟你的讨论记录和你的推理记录 保存到 要保存到doc/devlog/QA-2610-log.md，
你实际的开发记录，要保存到doc/devlog/dev-2610-features.md
其中的`2610` 不是写死的，日后会根据实际月份修改，甚至我可以随时要求改为指定的年份月份日期时间

答：

已按你的要求固化并提交到 `dev/2610-s1`，分支已更新到 GitHub。

本次新增：

- `doc/prompt/idea/first/requirements-discussion-v1.md`
- `doc/devlog/QA-2610-log.md`
- `doc/devlog/dev-2610-features.md`

Commit：`13bc2d7c190e0fbf00bc539ce5c9f0d26f98692e`

日志规则也已经正式写进去：`QA-2610-log.md` 保存讨论、决策、方案权衡和可复查的推理摘要；`dev-2610-features.md` 只记录真正发生的代码、配置、测试、Bug 修复等开发事实。`2610` 明确不是固定值，以后按实际周期或你指定的年月日时间调整。隐藏的内部思维链不会落库，但会把足以审查设计决策的理由、备选方案和取舍记录完整。

我决定**现在还不写 `doc/roadmap/master`**。大方向已经够清楚，但还有 4 个会直接改变实现的数据语义需要最后收敛。为了减少来回讨论，我建议采用下面这组默认方案，你可以逐项修改，也可以直接回复“全部按推荐”：

1. **SVG 风格零件**：直接允许导入 `.svg`；首版支持 `path / polygon / rect / circle / ellipse` 和闭合填充、孔洞；忽略 text/filter/mask 等复杂特性；stroke 不作为实体；导入时用户设置“宽高 + 挤出厚度”；内部统一转成我们自己的轮廓格式，再生成 mesh 和碰撞体。
2. **马达 / 风扇控制**：每个功能件有 `enabled` 和参数。马达设转速、最大扭矩、方向；风扇设推力、方向。进入“运行”状态后所有 enabled 装置启动。首版不做电池、能源、线路和逻辑编程。
3. **编辑态 / 模拟态**：点“运行”时保存编辑快照；点“停止”默认恢复运行前状态，这样试验翻车不会毁掉作品。编辑态仍做碰撞/穿透辅助，但不让重力把结构掉下来。以后可增加“保留模拟结果”。
4. **任意表面粘合**：接近目标时自动找到接触面，让两个接触面法线对齐，但保留绕接触法线的旋转自由度；用户可在确认连接前旋转调整。显示粘合位置和姿态预览，确认后生成固定约束。轮轴/马达等特殊件则生成旋转关节，而不是普通固定连接。

如果这四项也确定，下一步我认为就应该停止继续写泛泛的 Idea 文档，开始做**技术选型比较 + 正式 `doc/roadmap/master`**，随后再进入代码开发。


[编号261004-3]问：

1～4 全部按推荐。

附加需求：

一、你搜下往上有没有成熟的zelda类似游戏/系统的案例，提供给我决策

二、我看了你写的 doc/devlog/QA-2610-log.md ，你还需要在这个文档的尾部位置固定追加我跟你的问+答记录，例如

```
[编号261004-1]问：
     XXXXXXXXXXXXXXXXXXXXXXXX

答：
     YYYYYYYYYYYYYYYYYY
     YYYYYYYYYYYYYYYYYY
     YYYYYYYYYYYYYYYYYY
     YYYYYYYYYYYYYYYYYY


[编号261004-2]问：
     XXXXXXXXXXXXXXXXXXXXXXXX

答：
     YYYYYYYYYYYYYYYYYY
     YYYYYYYYYYYYYYYYYY
     YYYYYYYYYYYYYYYYYY
     YYYYYYYYYYYYYYYYYY
```

这样我就不必每次都要从网页手动复制粘贴我跟你的gpt问答记录到文档那个了

答：

已确认 1～4 全部采用，并把需求基线升级为 `requirements-discussion-v2.md`。到这一版为止，核心产品语义已经达到进入技术选型和正式 roadmap 的条件。

成熟案例调研的结论不是“找一个游戏照抄”，而是按子系统组合参考：

| ZeldaSys 子系统 | 推荐参考 |
| --- | --- |
| 任意表面连接、粘合反馈 | The Legend of Zelda: Tears of the Kingdom |
| 编辑态 / 模拟态 | Besiege |
| Wheel / Motor / Fan 等功能件语言 | Scrap Mechanic |
| 新手友好的载具 Builder | Trailmakers |
| 自定义 shape / pivot / anchor | Poly Bridge 3 |
| 后期高级机械关节 / subgrid | Space Engineers |

最重要的几个结论：

- TOTK 2024 GDC 分享的核心经验之一，是尽量让交互对象统一遵循物理，而不是让脚本运动与物理解算长期互相打架；这支持 ZeldaSys 的 Motor / Fan / Connection 都走真实物理关节与施力。
- Besiege 已长期验证“Build -> Simulate -> Stop -> Edit”的低失败成本循环，非常适合我们已经确定的编辑态 / 模拟态。
- Scrap Mechanic 很适合作为功能件语言参考：先用少量明确的运动机构、动力件、控制件组合创造复杂机器，而不是首版就上电路或脚本。
- Trailmakers 值得重点研究的是如何降低工程建造的上手门槛。
- Poly Bridge 3 的 custom shapes、anchor、pivot 和 UGC 体系适合参考 SVG 自定义零件的数据分层，但它本身不是 SVG 导入实现范本。

我的建议因此是：**ZeldaSys 的产品 DNA 定为“TOTK 交互 + Besiege 状态机 + Scrap Mechanic 功能件 + Trailmakers 易用性 + Poly Bridge 3 自定义形状模型”，Space Engineers 作为后期复杂机械参考。**

完整案例和来源已经整理到：

`doc/prompt/idea/first/case-study-research-v0.md`

QA 日志规则也已经调整：文件尾部固定为“原始问答记录（固定追加区）”，按 `YYMMDD-N` 编号；今天前面的正式问答也会回填。以后每次保存你的原始问题和我的最终答复，不再需要你从网页手动复制；工具调用、进度播报和隐藏内部思维链不会混进原始问答区。


[编号261004-4]问：

好的，同意，继续

答：

已继续完成“技术选型 + 正式 roadmap”，并提交到 `dev/2610-s1`。

首版技术栈确定为：

- TypeScript + React + Vite；
- Three.js / WebGLRenderer；
- Rapier 3D WebAssembly；
- IndexedDB + Dexie；
- vite-plugin-pwa / Workbox；
- Capacitor Android；
- Vitest + Playwright；
- pnpm workspace。

关键架构原则是 React 只负责 UI，Three.js / Rapier 使用独立 runtime，领域数据不绑定渲染对象和物理 handle。

选择 Three.js 的主要原因是 SVGLoader、Shape/holes、ExtrudeGeometry、Raycaster 与 ZeldaSys 的 SVG 自定义零件和任意表面连接非常吻合。Rapier 则直接支持 Fixed / Revolute / Prismatic joints、joint motor、scene query、convex decomposition 等首版能力。

MVP 先用 WebGLRenderer，不把仍处于 experimental 状态的 WebGPURenderer 作为首版依赖。

Android 首版使用 Capacitor；Tauri 留到未来桌面平台再评估。

正式路线已经写入：

- `doc/prompt/idea/first/technology-selection-v0.md`
- `doc/roadmap/master/Initial Development Plans.md`
- `doc/roadmap/master/Remaining Development Plans.md`

技术 / roadmap 提交：

`8cb83f9737fa0adb22e9793b7f486d53854242f0`

路线把四个高风险 PoC 放在完整 UI 之前：

1. 50 零件 Rapier 性能；
2. 任意表面粘合；
3. SVG -> 3D -> dynamic collider；
4. Capacitor Android 真机同源运行。

四项全部通过 Gate-1 后，才正式冻结技术栈进入完整 MVP。


[编号261004-5]问：

这个项目在chatgpt开发了一半就意外中断，请你检查现有文档、git commit log、现有开发的代码，从中断的位置继续执行。在执行之前，我需要确认你找到了中断点在哪、下一步执行什么、总体项目目标是什么、全局路线怎样

目前开发分支处于 dev/2610-s1 ，在本codex客户端约定：开发完代码不要提交/不要暂存（这个跟在chatgpt web页面约定的及时提交代码的约定不同）。

我跟你的问+答的记录、你的推理记录、你的开发记录，在项目中都会有对应的位置存储，这个你要查出来，告诉我，我要确认你到底有没有看懂这些约定

答：

检查结果：当前分支是 `dev/2610-s1`，HEAD 与 origin 同为 `2af144d chore: normalize Rapier compat integration`。接续点在 Phase 1 的 PoC-A：50 刚体物理基准代码已经写出，随后修复并规范化了 Rapier compat 在 Vite / Vitest 工具链中的集成；目前没有桌面 Chrome 或 Android 真机验收结果，PoC-A 还不能算完成。

PoC-A 现有实现测量物理 step 平均值、p95、最大值、joint anchor drift 和非有限刚体数，但还缺 roadmap / 技术选型要求的 render FPS、穿透/碰撞表现与 Android 设备结果。下一步应先补齐并验收 PoC-A，随后依次完成 PoC-B 任意表面粘合、PoC-C SVG 挤出与动态碰撞体、PoC-D Capacitor Android 同源运行；四项通过 Gate-1 后，才进入完整 Domain Model、Runtime Adapter、编辑器和其余 MVP 阶段。

总体目标是一个 PWA / Android 优先、离线优先的 3D 物理建造沙盒：参数化或受限 SVG 零件、任意表面粘合、编辑/模拟状态切换、重力/碰撞/刚体与约束，以及 Wheel / Motor / Fan，典型作品约 50 个零件；首版不做服务端、账号云同步、角色、地图和多人。全局路线和分阶段验收见 `doc/roadmap/master/Initial Development Plans.md` 与 `doc/roadmap/master/Remaining Development Plans.md`。

约定位置：问答原文与可审查的决策理由摘要写入 `doc/devlog/QA-2610-log.md`，其中原始问答固定放在文件尾部；隐藏内部思维链不保存。实际代码、配置、测试和验证事实写入 `doc/devlog/dev-2610-features.md`。最初开发 Prompt 与分支/操作提示在 `doc/prompt/dev-prompt-log/first.md`。该文件中的 ChatGPT Web 及时提交惯例由你当前明确的 Codex 本地约定覆盖：继续在 `dev/2610-s1` 工作，不暂存、不提交。

本轮只做了只读检查和 QA 留档，没有继续 PoC 代码实现。请确认是否按“先完成 PoC-A 验收，再按 B、C、D 顺序推进”的路线继续。


[编号261004-6]问：

源码中带有Drop2Tunnel 名称和占位内容的模板 可以现在改成本项目风格的，避免日后被误解。

请继续在`dev/2610-s1`  分支开发，除了约定的问+答的记录、你的推理记录、你的开发记录，还要最后提供git commit log用的title/description，要方便分别复制

答：

已把项目总览与总览模板中的 Drop2Tunnel 名称和占位内容改成 ZeldaSys 项目风格，避免后续照搬时产生误解。工作继续在 `dev/2610-s1`，按 Codex 本地约定不暂存、不提交。

建议的 commit title：`docs: adapt overview templates for ZeldaSys`

建议的 commit description：`Replace Drop2Tunnel template labels and placeholder content with ZeldaSys project guidance.`


[编号261004-7]问：

继续剩余事项：**补记本轮最终验证与 QA 问答；完成 PoC-A 桌面浏览器和 Android 真机验收

答：

桌面 PoC-A 已在单个前台 Codex In-app Browser 桌面 Chromium 标签页通过：50 bodies、30 fixed joints、4 revolute joints、2 motors、2 fans；600 个 measured steps 的 physics step avg / p95 / max 为 0.414 / 0.600 / 1.300 ms，FPS 60.1，anchor drift 0.0010，最终 56 个 contact pairs、2 次 collision starts、最终时刻最深接触穿透 0.0005 m、invalid bodies 0；控制台无 error / warning。该结果不是 Google Chrome 品牌浏览器的专门实测。

最终工程验证通过：Vitest 2 个文件 / 2 个测试、ESLint、workspace TypeScript typecheck、Vite production build。build 仍有大 chunk 警告（client JS 约 763 kB、Rapier chunk 约 4.33 MB / 1.67 MB gzip）。

Android 真机验收无法在当前环境完成：`adb devices -l` 没有设备，Android SDK 的 emulator 工具缺失，仓库目前也没有 Capacitor Android 工程。PoC-A 与 Gate-1 因此仍待真实 Android WebView 数据；需要连接开启 USB 调试的设备，并在 Capacitor Android 工程就绪后继续测 FPS、碰撞、温升和降频。

本轮源码、开发记录和 QA 摘要均留在 `dev/2610-s1` 工作树中，没有暂存或提交。

建议的 commit title：`feat: instrument PoC-A collision and rendering metrics`

建议的 commit description：`Add collision diagnostics and instanced 50-body rendering; record desktop Chromium acceptance and keep Android WebView validation pending a connected device.`
