# ZeldaSys 成熟物理建造系统案例调研（v0）

> 日期：2026-10-04  
> 状态：技术 / 产品决策输入  
> 目的：不是寻找一个“直接照抄”的游戏，而是找出已经被成熟产品验证的交互和系统模式。

## 1. 结论摘要

当前最值得 ZeldaSys 组合参考的不是单一产品，而是：

> **TOTK 的连接交互 + Besiege 的编辑/模拟状态模型 + Scrap Mechanic 的功能件控制模型 + Trailmakers 的易用建造体验 + Poly Bridge 3 的自定义形状编辑思路。**

Space Engineers 可作为后期复杂机械关节、子结构和脚本化能力的参考。

不建议完整复刻任何一个商业游戏的实现，也不应复制其美术、UI、素材或专有资源。这里研究的是经过验证的系统设计模式。

## 2. The Legend of Zelda: Tears of the Kingdom

### 成熟度与相关性

这是 ZeldaSys 最直接的产品体验标杆。

Nintendo 官方说明 Ultrahand 可以抓取、旋转并把物体连接到其它结构；官方开发者访谈还特别提到，高可见度的“胶”是为了让用户明显知道物体是否已经连接。

2024 GDC 的技术分享披露了一个更重要的工程结论：早期高自由度 Ultrahand 与非物理驱动物体之间会不断冲突，团队最终倾向让世界交互统一由物理驱动，从而减少脚本规则与物理解算互相打架的问题。

### ZeldaSys 应借鉴

- “拿起 -> 靠近 -> 预览 -> 连接”的短交互链；
- 强烈、直观的已连接视觉反馈；
- 让功能件真正通过物理作用，而不是大量脚本特判；
- 系统规则尽量统一，使用户能组合出设计者没有逐一预制的结果；
- 用户预期优先于追求纯粹真实物理。

### 不应照搬

- 不照搬 Zelda IP、美术、胶水造型、声音和设备外观；
- ZeldaSys 首版目标约 50 零件，需要主动考虑更大约束图的性能；
- ZeldaSys 有自定义 SVG 零件，会比固定游戏素材产生更多碰撞体复杂度。

### 来源

- Nintendo Ask the Developer:
  https://www.nintendo.com/us/whatsnew/ask-the-developer-vol-9-the-legend-of-zelda-tears-of-the-kingdom-part-4/
- GDC Vault:
  https://www.gdcvault.com/play/1034667/Tunes-of-the-Kingdom-Evolving----Developers
- Game Developer:
  https://www.gamedeveloper.com/programming/how-nintendo-did-the-impossible-with-tears-of-the-kingdom-s-physics-system

## 3. Besiege

### 成熟度与相关性

Besiege 是成熟的“建造 -> 运行物理 -> 失败 -> 回编辑器修改”范式。

Steam 将其定义为 physics building game，拥有灵活建造系统、70+ 种方块和复杂物理，并公开展示超过 200,000 个社区机器作品。

其 UI / 社区文档明确区分 Build Mode 与 Simulation Mode：

- Build Mode 中物理和方块动作停止，用户安心编辑；
- Simulation Mode 中启用重力、物理和机器控制；
- 可以停止模拟回到建造。

这与 ZeldaSys 已确定的编辑态 / 模拟态非常接近。

### ZeldaSys 应借鉴

- 编辑态和模拟态必须是一级产品概念；
- 用户不应该一边精确摆放一边和重力打架；
- “失败很便宜”：运行后翻车，再立即回到设计；
- Undo / Redo、保存 / 加载属于建造工具核心能力；
- 物理机器本身应由可组合部件构成。

### 不应照搬

- Besiege 偏块式建造，ZeldaSys 必须保留任意表面连接；
- ZeldaSys 的移动触控 UI 不能直接复制桌面端密集工具栏。

### 来源

- Steam:
  https://store.steampowered.com/app/346010/Besiege/
- Besiege UI 社区文档:
  https://besiege.fandom.com/wiki/Category:User_Interface

## 4. Trailmakers

### 成熟度与相关性

Trailmakers 的价值主要不在“任意表面粘合”，而在于如何把复杂载具建造做得容易上手。

官方 Steam 页面强调从零开始建造车辆、数百种影响空气动力和功能等表现的模块、可靠物理，以及同时面向新用户和硬核工程玩家的 Builder。

### ZeldaSys 应借鉴

- 功能件应具有清晰类别和明确效果；
- 建造器必须让第一次接触工程沙盒的人也能完成简单载具；
- 基础操作少而统一，高级复杂度来自组合，不来自大量编辑器模式；
- 轮子、推进器等部件的方向和有效作用应在编辑时就可视化。

### 不应照搬

- Trailmakers 更偏规则化模块 / 拼块；
- ZeldaSys 不能为了容易实现而退回固定网格连接。

### 来源

- Steam:
  https://store.steampowered.com/app/585420/Trailmakers/

## 5. Scrap Mechanic

### 成熟度与相关性

Scrap Mechanic 对 ZeldaSys 的“功能件系统”非常有参考意义。

正式版 Steam 页面把它定位为以强建造工具和物理为核心的机器沙盒，并提供 400+ 建造零件以及大量玩家扩展部件。

它长期形成的交互模型把机器拆成运动机构、动力输出、控制器和输入。Controller 可精确控制 Bearings / Pistons，并由 Trigger 或 Driver's Seat 激活。

### ZeldaSys 应借鉴

首版可以把功能件保持简单：

- Wheel / Hinge：运动自由度；
- Motor：给关节提供驱动；
- Fan：产生方向力；
- enabled：最简单输入。

后续如果要增加逻辑系统，再扩展：

`Input -> Logic / Controller -> Actuator`

而不是首版就加入复杂电路或脚本。

### 不应照搬

- 首版不要引入资源、电池、电路网络；
- 不要一次复制数百种部件；
- ZeldaSys 的普通结构连接仍是任意表面，而不是块连接体系。

### 来源

- Steam:
  https://store.steampowered.com/app/387990/
- Controller:
  https://scrapmechanic.fandom.com/wiki/Controller

## 6. Space Engineers

### 成熟度与相关性

Space Engineers 的参考价值主要在更复杂的机械结构。

官方功能列表包含 rotors、wheels、pistons、programmable blocks 等大量功能方块。官方 Wiki 对 Mechanical Blocks 的模型也很清晰：Rotor、Hinge、Piston 可以驱动附属 subgrid。

### ZeldaSys 应借鉴

长期数据模型中不要把所有连接都写死成 `fixed`。

Connection 应保留：

- fixed
- revolute / hinge
- prismatic
- spring

等未来扩展空间。

功能件最好绑定“关节 / 刚体行为”，而不是直接控制视觉 Transform。

### 来源

- Features:
  https://www.spaceengineersgame.com/features/
- Mechanical Blocks:
  https://spaceengineers.wiki.gg/wiki/Mechanical_Blocks

## 7. Poly Bridge 3

### 成熟度与相关性

它不是 3D Zelda 类建造游戏，但对 ZeldaSys 的“用户自定义形状”需求有直接参考价值。

官方 Steam 页面明确提供用户创建 textured custom shapes；更新记录和 Workshop 显示 Custom Shapes 已形成 anchor、pivot、顶点编辑和大量 UGC 内容。

### ZeldaSys 应借鉴

- 自定义形状与放置实例应分层；
- shape 自己具有局部坐标和 pivot；
- anchor / pivot 是用户编辑体验的重要概念；
- 自定义形状需要独立版本化，而不是把最终网格散落在 BuildDocument 中。

### 注意

Poly Bridge 3 的 custom shape 并不能证明“SVG 导入”本身应该怎样实现；它只证明了“用户自定义轮廓 + pivot / anchor + 持久化 UGC”是一条成熟产品路线。

### 来源

- Steam:
  https://store.steampowered.com/app/1850160/Poly_Bridge_3/
- Workshop:
  https://steamcommunity.com/app/1850160/workshop/

## 8. 代码层面的辅助案例（非成熟产品标杆）

### Creasiege

GitHub 上存在一个 Unity 的 Besiege-like prototype，具有 Edit mode / Play mode、vehicle save/load、active parts key binding、part property editing 和 destruction physics。

它更适合作为“代码结构思路”旁证，而不是成熟产品决策依据。

来源：

https://github.com/BenPyton/creasiege

### BuildArena / BesiegeField

2025-2026 出现的 BuildArena、BesiegeField 等项目把 Besiege 机器表示进一步抽象成可由 AI / 程序生成和测试的结构。

它们后续可能对 ZeldaSys 的 BuildDocument、机器序列化、自动测试场景、物理回归测试有参考价值。

来源：

- https://github.com/AI4Science-WestlakeU/BuildArena
- https://github.com/Godheritage/BesiegeField

## 9. 推荐的 ZeldaSys 产品 DNA

| ZeldaSys 子系统 | 第一参考 | 第二参考 | 原因 |
| --- | --- | --- | --- |
| 任意表面连接 UX | TOTK | - | 最接近项目核心目标 |
| 已连接视觉反馈 | TOTK | - | 大幅降低用户判断成本 |
| 编辑 / 模拟状态机 | Besiege | TOTK | 建造稳定、失败成本低 |
| 刚体机器组合 | Besiege | Space Engineers | 已验证复杂机器可组合性 |
| Wheel / Motor / Fan 功能件 | Scrap Mechanic | Trailmakers | 部件行为简单但组合空间大 |
| 新手可用的 Builder | Trailmakers | TOTK | 降低工程沙盒学习成本 |
| 自定义矢量零件 | Poly Bridge 3 | - | shape / pivot / UGC 模型成熟 |
| 更高级关节 | Space Engineers | Scrap Mechanic | rotor / hinge / piston 模型清晰 |

## 10. 对 ZeldaSys 当前方案的直接决策

调研后，没有发现需要推翻当前 v2 需求的成熟案例，反而有几项得到加强：

1. 保留编辑态 / 模拟态分离。Besiege 已长期验证这种模式适合物理机器建造。
2. 普通连接保持任意表面粘合。这是 ZeldaSys 相比 Besiege / Trailmakers / Scrap Mechanic 的核心差异化。
3. 功能件首版保持少而清晰。Wheel + Motor + Fan 足以验证物理机器能力，控制模型先用 enabled + 参数。
4. 功能件必须走真实物理关节 / 力。TOTK 的开发经验表明，脚本驱动对象和物理对象混合会显著增加系统冲突。
5. SVG 输入必须先规范化成内部 ShapeDefinition，不应让 SVG DOM 直接侵入物理和存档层。
6. 连接视觉反馈是 MVP 功能，不是美化项。任意表面连接如果没有明确预览与已连接反馈，在触屏上会非常难用。

## 11. 推荐优先实际体验的三个产品

如果只挑三个亲自体验 / 看完整建造流程：

1. **Besiege**：重点看 Build -> Simulate -> Stop -> Edit 的节奏、失败后的恢复成本和机器参数编辑。
2. **Scrap Mechanic**：重点看 Bearing / Engine / Controller / Thruster / Seat 是怎样组成一套“功能件语言”的。
3. **Trailmakers**：重点看它如何把载具建造做得比传统工程软件更容易上手。

TOTK 已经是产品目标本身，重点继续观察它的抓取、旋转、粘合预览、拆除和装置激活反馈即可。
