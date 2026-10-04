# ZeldaSys 项目总览

> 本文是 ZeldaSys 的入口索引，帮助开发者区分产品目标、当前实现和后续计划。它不替代源码、需求记录或开发路线；涉及当前行为时，以代码为准。

## 产品定位

ZeldaSys 首版目标是一个 PWA / Android 优先、离线优先的 3D 物理建造沙盒。用户可以组合参数化零件或导入受限 SVG 轮廓，在零件任意表面建立连接，并在编辑态与模拟态之间切换。模拟包含重力、碰撞、刚体约束和 Wheel、Motor、Fan 等功能件。典型作品规模约为 50 个零件。

首版暂不包含账号与云同步、服务端、角色、地图编辑、多人协作或 GLB / glTF 导入。

## 当前开发状态

当前工作分支为 `dev/2610-s1`。工程骨架（Phase 0）已建立。Phase 1 正在验证高风险技术 PoC：

- **PoC-A — Rapier 物理基线：** 桌面 Chromium 已验收（60.1 FPS、physics step avg 0.414 ms、anchor drift 0.0010、最终穿透 0.0005 m）；Android 真机 WebView 待设备与 Capacitor 工程就绪后验收。
- **PoC-B — 任意表面连接：** 尚待实现与验证。
- **PoC-C — SVG 自定义零件：** 尚待实现与验证。
- **PoC-D — Capacitor Android 同源运行：** 尚待实现与验证。

四项 PoC 全部通过 Gate-1 后，才进入完整产品实现。状态更新以开发日志和最近代码为准。

## 建议阅读顺序

1. [README](../../README.md)：仓库简述。
2. [需求基线 v2](../prompt/idea/first/requirements-discussion-v2.md)：已确认的首版产品语义。
3. [技术选型](../prompt/idea/first/technology-selection-v0.md)：架构边界、技术选择及 PoC 验收条件。
4. [成熟案例调研](../prompt/idea/first/case-study-research-v0.md)：产品与交互参考。
5. [初期开发计划](../roadmap/master/Initial%20Development%20Plans.md)：Phase 0 到 MVP 验收的路线。
6. [后期剩余计划](../roadmap/master/Remaining%20Development%20Plans.md)：MVP 之后的候选方向。
7. [QA 与决策日志](../devlog/QA-2610-log.md) 和 [开发记录](../devlog/dev-2610-features.md)：讨论、决策理由及实际实施记录。
8. [初始开发 Prompt 记录](../prompt/dev-prompt-log/first.md)：最初需求和协作约定。

## 代码导航

- `apps/client/`：React + Vite 客户端；`src/runtime/` 管理 Three.js 场景，`src/ui/` 放置界面。
- `packages/domain/`：与 UI、渲染及物理引擎解耦的领域数据；目前包含版本化的空 BuildDocument 基础。
- `packages/geometry/`：几何能力包；SVG 导入 PoC 尚未实现。
- `packages/physics/`：Rapier 物理适配与 PoC-A 基准。
- `.github/workflows/ci.yml`：持续集成配置。

## 信息来源规则

- **当前运行行为：** 以相应源码与测试为准。
- **已确认需求：** 以 `doc/prompt/idea/first/requirements-discussion-v2.md` 和 QA 决策日志为准。
- **计划与验收标准：** 以 `doc/roadmap/master/` 和技术选型文档为准。
- **实际开发历史：** 以 `doc/devlog/dev-*-features.md` 和 Git commit log 为准。
- **问答与可审查的推理摘要：** 以 `doc/devlog/QA-*-log.md` 为准；该日志不保存隐藏的内部思维链。

需求或实现变化时，先核实对应源码与记录，再更新本文中的状态和导航。不要把路线计划写成已完成能力。
