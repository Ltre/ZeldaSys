# 后期剩余开发计划

> 本文件只记录 MVP 后的明确方向，不与首版范围混写。  
> 当前优先级均低于 `Initial Development Plans.md`。

## 1. Post-MVP 第一批候选

### 1.1 更多机械关节

候选：

- hinge；
- prismatic / slider；
- piston；
- spring；
- ball joint；
- universal joint。

要求继续复用 Connection model，不增加独立的“特殊连接存档体系”。

### 1.2 功能件控制系统

从首版：

`enabled + params`

演进到：

`Input -> Logic/Controller -> Actuator`

候选输入：

- button；
- toggle；
- keyboard / gamepad binding；
- sensor。

候选 controller：

- sequence；
- timer；
- simple logic gates。

暂不承诺通用脚本语言。

### 1.3 保留模拟结果

增加：

- Apply simulation state；
- Keep current positions；
- 恢复 checkpoint。

必须明确 velocity 是否保存，不能模糊编辑状态与模拟瞬时状态。

## 2. 自定义零件第二阶段

### 2.1 SVG 编辑

候选：

- pivot editor；
- contour preview；
- scale；
- rotate origin；
- hole editor；
- simplified point editor。

### 2.2 GLB / glTF

进入前必须设计：

- asset sandbox；
- file size；
- triangle budget；
- collider generation；
- texture limits；
- animation 是否支持；
- material normalization。

默认不允许把任意 render mesh 直接作为 dynamic triangle-mesh collider。

## 3. 自定义地图

建造系统稳定后再设计：

- map document；
- static environment；
- spawn point；
- terrain；
- environment collider；
- map assets；
- build placement rules。

BuildDocument 与 MapDocument 保持分离。

## 4. 自定义角色

后续设计：

- CharacterDefinition；
- appearance；
- controller；
- character physics；
- ability / interaction system。

不得把角色逻辑塞进 PartDefinition。

## 5. 服务端

只有出现明确需求再创建 Node.js 服务端。

触发条件：

- account；
- cloud backup；
- cross-device sync；
- share link；
- public part library；
- community；
- multiplayer。

服务端出现时：

- BuildDocument 仍是客户端可独立存在的版本化数据；
- 云端是同步 / 分发层，不是客户端离线运行的前置条件。

## 6. 分享与作品格式

设计可移植 project package：

- manifest；
- BuildDocument；
- PartDefinitions；
- SVG/raw assets；
- preview image；
- checksums；
- schemaVersion。

做到：

- 导出文件；
- 导入文件；
- 无服务器分享。

之后再增加云分享。

## 7. iOS

PWA / Android 证明路线后：

- Capacitor iOS；
- Safari / WebKit；
- IndexedDB；
- WASM；
- touch；
- file import；
- App Store constraints。

## 8. Desktop

目标：

- Windows；
- Linux；
- macOS。

到时重新比较：

- Tauri；
- PWA install；
- Electron。

当前倾向优先评估 Tauri 2+，因为可以复用 Web 前端且覆盖桌面 / 移动，但是否采用由当时实际需求决定。

## 9. 更高规模性能

MVP 基线约 50 parts。

后期逐级测试：

- 100；
- 250；
- 500；
- 1000。

可能需要：

- island / assembly optimization；
- compound-body baking；
- sleeping tuning；
- worker；
- simplified colliders；
- LOD；
- instancing；
- connection graph partition。

注意：

Rapier 官方说明把多个 collider 放在同一 rigid body 上通常比用 fixed joint 连接多个 rigid body 更高效。

如果未来只需要“不再可拆”的结构，可研究 assembly bake / compound collider。

但首版普通连接仍保留独立 part + joint，以支持解除连接和可编辑性。

## 10. WebGPU

Three.js WebGPURenderer 成熟度达到项目要求后再评估。

迁移目标必须是：

- benchmark 明显改善；
- Android / iOS 覆盖可接受；
- 不破坏现有材质；
- fallback 明确。

不能仅为了“技术更新”迁移。

## 11. 多人

最后阶段之一。

需要重新定义：

- command serialization；
- ownership；
- physics authority；
- conflict；
- rollback；
- latency；
- deterministic expectations。

首版 Command System 和版本化 Domain Model 会为此预留基础，但 MVP 不承担实时多人复杂度。

## 12. 长期游戏化

当纯建造沙盒证明成立后，再讨论：

- 角色；
- 地图；
- 任务；
- 资源；
- 关卡；
- 战斗；
- 装置能源；
- 破坏；
- 作品挑战；
- 社区。

原则：

> 建造系统作为独立核心能力长期存在，游戏层消费它，而不是反过来让核心建造模型依赖某个具体游戏规则。
