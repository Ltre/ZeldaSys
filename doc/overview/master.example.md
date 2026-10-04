# Drop2Tunnel 功能与需求总览

> 本目录用于给后续开发者和 AI 提供“可追溯的项目事实”。它不仅描述现在有什么功能，还说明这些功能为什么存在、经历过哪些调整、当前代码如何实现，以及哪些历史方案已经被替代。

## 1. 文档基线

本套总览的初始创建阶段已经完成并冻结。长期维护工作在 `dev/doc-overview` 进行；当前已完整覆盖的应用源码事实为：

- 源码 Commit：`待填写最后维护时基于的版本`
- 源码提交时间：`2026-09-26T11:30:34Z`
- 首轮整理日期：2026-xx-xx
- 文档更新时间：2026-xx-xx

精确增量锚点见 [VERSION.md](./VERSION.md)。

**初始创建状态：已完成并冻结。** 文件级覆盖验收见 [COVERAGE.md](./COVERAGE.md)。

## 2. 产品总定位

xxxxxxxxxxxxxxxx
- xxxxxxxxx
- xxxxxxxxx
- xxxxxxxxx
- xxxxxxxxx

## 3. 建议阅读顺序

如果 AI 第一次接手项目：

1. 本 `master.md`；
2. [architecture.md](./architecture.md)；
3. [source-map.md](./source-map.md)；
4. 当前任务所属模块文档；
5. [tests-and-regressions.md](./tests-and-regressions.md)；
6. 对应历史时间线；
7. 再阅读具体源码 / Prompt / Devlog。

## 4. 模块导航

### 核心架构与隧道

- [architecture.md](./architecture.md) — 运行架构、数据边界、前后端职责、当前与未来设计边界。
- [aaaaaa.md](./aaaaaa.md) — aaa、aaa、aaa、aaa、aaa、aaa、aaa、aaa。
- [aaaaaa.md](./aaaaaa.md) — aaa、aaa、aaa、aaa、aaa、aaa、aaa、aaa。

### 其它其它其它其它其它其它其它其它其它其它

- [aaaaaa.md](./aaaaaa.md) — aaa、aaa、aaa、aaa、aaa、aaa、aaa、aaa。
- [aaaaaa.md](./aaaaaa.md) — aaa、aaa、aaa、aaa、aaa、aaa、aaa、aaa。
- [aaaaaa.md](./aaaaaa.md) — aaa、aaa、aaa、aaa、aaa、aaa、aaa、aaa。
- [aaaaaa.md](./aaaaaa.md) — aaa、aaa、aaa、aaa、aaa、aaa、aaa、aaa。
- [aaaaaa.md](./aaaaaa.md) — aaa、aaa、aaa、aaa、aaa、aaa、aaa、aaa。
- [aaaaaa.md](./aaaaaa.md) — aaa、aaa、aaa、aaa、aaa、aaa、aaa、aaa。

### 其它其它其它其它其它其它其它其它其它其它

- [aaaaaa.md](./aaaaaa.md) — aaa、aaa、aaa、aaa、aaa、aaa、aaa、aaa。
- [aaaaaa.md](./aaaaaa.md) — aaa、aaa、aaa、aaa、aaa、aaa、aaa、aaa。
- [aaaaaa.md](./aaaaaa.md) — aaa、aaa、aaa、aaa、aaa、aaa、aaa、aaa。
- [aaaaaa.md](./aaaaaa.md) — aaa、aaa、aaa、aaa、aaa、aaa、aaa、aaa。
- [aaaaaa.md](./aaaaaa.md) — aaa、aaa、aaa、aaa、aaa、aaa、aaa、aaa。
- [aaaaaa.md](./aaaaaa.md) — aaa、aaa、aaa、aaa、aaa、aaa、aaa、aaa。


### 平台与运维

- [aaaaaa.md](./aaaaaa.md) — aaa、aaa、aaa、aaa、aaa、aaa、aaa、aaa。
- [aaaaaa.md](./aaaaaa.md) — aaa、aaa、aaa、aaa、aaa、aaa、aaa、aaa。
- [aaaaaa.md](./aaaaaa.md) — aaa、aaa、aaa、aaa、aaa、aaa、aaa、aaa。


### 调研导航

- [source-map.md](./source-map.md) — 当前源码、Tests、Devlog、Prompt、Idea 的模块级对照索引。
- [COVERAGE.md](./COVERAGE.md) — 初始创建阶段的历史范围、当前源码文件归属和完成判定。
- [history/README.md](./history/README.md) — 历史时间线入口。

## 5. 信息来源优先级

### 5.1 当前实现事实

优先读取：(都是示例格式)

- `foreaxample.js`
- `foreaxample.js`
- `foreaxample.js`
- `foreaxample.js`
- `foreaxample.js`
- `foreaxample.js`


源码用于确认“现在真实执行什么”。

### 5.2 需求初衷与演进

重点读取：

- `doc/prompt/dev-prompt-log/*`
- `doc/devlog/*`
- `doc/prompt/ideas/*`
- Git Log。

Prompt 往往同时包含：原始需求、人工复现、Codex 处理说明、用户下一轮反例。必须按时间判断后者是否覆盖前者。

### 5.3 README / 旧 Overview

`README.md`、`doc/other/PROJECT_OVERVIEW.md` 等可帮助理解早期产品定位，但其版本早于当前基线，不能单独作为当前事实。

## 6. “当前能力”与“计划”的写法

本目录刻意区分：

- **当前源码已有**；
- **历史上有过但已废弃**；
- **Prompt 已提出但尚未进入源码基线**；
- **未来架构设计**。

例如：

- 示例示例示例示例示例示例示例示例示例示例示例示例示例示例示例示例
- 示例示例示例示例示例示例示例示例示例示例示例示例示例示例示例示例
- 示例示例示例示例示例示例示例示例示例示例示例示例示例示例示例示例
- 示例示例示例示例示例示例示例示例示例示例示例示例示例示例示例示例
- 示例示例示例示例示例示例示例示例示例示例示例示例示例示例示例示例

后续更新时，仍应只在功能真正合入目标源码后把它从“计划”移动到“当前实现”。

## 7. 维护原则

1. **保留需求初衷**：不只写按钮，还解释为什么存在。
2. **记录 UI 细节**：稳定 DOM、位置、PC/移动差异、浮层、手势、history。
3. **记录执行链路**：XXX → XXX → XXX → XXX → XXX → XXX → XXX → XXX。
4. **记录数据所有权**：Tech1、Tech2、Tech2、Tech2、Tech2、Tech2、Tech2、TechN。
5. **记录失败路径**：取消、离线、刷新、重启、缓存丢失、远端失败、旧版本、示例文字、示例文字。
6. **标明历史方案**：已废弃方案不能和现状混写。
7. **保留高风险回归**：Tech1、Tech2、Tech2、Tech2、Tech2、Tech2、Tech2、TechN。
8. **避免名字推断**：无法从源码/日志/Prompt 支持的结论标记待核实。
9. **重视人工验收**：下一轮用户实测可推翻上一轮“已修复”。
10. **更新 VERSION**：每次把最新代码合进 `dev/doc-overview` 后，先从旧锚点做增量调研。

## 8. 本轮首轮扫描范围

首轮建立时已经：

- 枚举仓库顶层、`server`、`client`、`pages`、`tests`、`scripts`、`docs`、`prompt`；
- 唧唧歪歪唧唧歪歪唧唧歪歪唧唧歪歪唧唧歪歪唧唧歪歪唧唧歪歪；
- 唧唧歪歪唧唧歪歪唧唧歪歪唧唧歪歪唧唧歪歪唧唧歪歪唧唧歪歪；
- 唧唧歪歪唧唧歪歪唧唧歪歪唧唧歪歪唧唧歪歪唧唧歪歪唧唧歪歪；
- 唧唧歪歪唧唧歪歪唧唧歪歪唧唧歪歪唧唧歪歪唧唧歪歪唧唧歪歪；
- 唧唧歪歪唧唧歪歪唧唧歪歪唧唧歪歪唧唧歪歪唧唧歪歪唧唧歪歪；
- 唧唧歪歪唧唧歪歪唧唧歪歪唧唧歪歪唧唧歪歪唧唧歪歪唧唧歪歪；
- 唧唧歪歪唧唧歪歪唧唧歪歪唧唧歪歪唧唧歪歪唧唧歪歪唧唧歪歪；

“首轮完整”表示已经建立全模块导航与主要行为/历史边界，不表示以后无需读源码。本文档体系的目的正是让后续增量更新不再从零开始。唧唧歪歪唧唧歪歪唧唧歪歪唧唧歪歪唧唧歪歪。

## 9. 后续 Agent 的增量维护规则

这是本套文档的长期维护约定，后续接手者必须遵循：

1. **工作来源固定看 `dev/doc-overview` 当前内容。** 用户会把其它开发分支中需要沉淀的成果及时合并到 `dev/doc-overview`。Agent 不需要追踪“某篇文档最初来自哪个开发分支”，也不要在模块文档头部写死“基于某分支”。
2. **增量扫描时排除 `doc/overview/**`。** 需要关注的是 `dev/doc-overview` 中除本目录以外的最新源码、Tests、Prompt、Devlog、Ideas、Guide、配置和其它相关文档变化；`doc/overview` 是整理结果，不应反过来作为判断“项目新变化”的输入。
3. **Git Commit 是可复现锚点，分支名不是。** 模块文档可以保留“源码基线 Commit”，但必须同时写“文档更新时间”。分支会持续切换、合并，不能用分支名表达某篇文档的事实基线。
4. **只推进已经完整覆盖的源码锚点。** 如果 `dev/doc-overview` HEAD 后面只有 `docs/overview/**` 文档提交，而没有新的非 Overview 项目变化，则全局源码锚点不需要推进。
5. **判断变更范围时，以非 Overview 路径为准。** 实际比较应等价于“从上次源码锚点到当前 `dev/doc-overview`，忽略 `docs/overview/**` 后还发生了什么变化”，再据此选择需要更新的模块文档。
6. **不要主动跨分支拼接未合并事实。** 如果某项开发只存在于其它分支、尚未进入 `dev/doc-overview`，默认不把它写成当前实现；除非用户明确要求研究该分支。
7. **每次修改模块文档都刷新更新时间。** Commit 表示本文已核对到的源码事实锚点；“文档更新时间”表示该 Markdown 最近一次实际整理日期，两者含义不同。
