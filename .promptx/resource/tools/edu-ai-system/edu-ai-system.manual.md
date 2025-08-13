# 🎓 PromptX智能教育AI系统使用手册

## 概述

这是一个基于SLAN认知架构的7角色协作教学系统，集成了最新的教育学理论，提供个性化的编程学习体验。

## ✨ 核心特性

### 🧠 智能意图识别
- **多维度分析**：分析用户的学习意图、情绪状态、学习阶段
- **实时适应**：根据用户输入动态调整教学策略
- **情境感知**：理解学习上下文，提供精准的角色推荐

### 🎯 智能角色路由
- **7个专业角色**：班主任、故事讲述者、技能教练、困惑侦探、任务分解专家、成就设计师、经验累积官
- **动态切换**：基于学习状态和认知分析的智能角色切换
- **切换验证**：防止频繁切换，确保教学连贯性

### 📚 自动教案管理
- **实时更新**：基于学习进度自动更新教案
- **模式识别**：提取学习模式，优化教学策略
- **经验记录**：完整记录学习轨迹和认知状态变化

### 📁 智能档案管理
- **自动创建**：为每个学习会话创建结构化文件夹
- **时间标记**：按日期时间组织学习内容
- **多类型文件**：教案、代码、笔记、成就记录

## 🚀 使用方法

### 基础调用

```javascript
// 开始新的学习会话
@tool://edu-ai-system {
  "intent": "learn",
  "context": {
    "topic": "JavaScript基础"
  }
}

// 寻求帮助
@tool://edu-ai-system {
  "intent": "confused",
  "context": {
    "problem": "不理解函数的概念"
  }
}

// 请求练习
@tool://edu-ai-system {
  "intent": "practice",
  "context": {
    "skill": "循环语句"
  }
}
```

### 高级配置

```javascript
@tool://edu-ai-system {
  "intent": "learn",
  "context": {
    "sessionId": "custom-session-123",
    "currentTopic": "React Hooks",
    "previousRole": "story-teller"
  },
  "config": {
    "skipIntro": false,
    "autoCreateFiles": true,
    "detailed": true
  }
}
```

## 📊 意图识别系统

### 支持的意图类型

| 意图类别 | 关键词示例 | 推荐角色 |
|---------|-----------|---------|
| LEARNING | 学习、想学、教我、learn | ai-class-advisor |
| CONFUSED | 不懂、困惑、confused、为什么 | confusion-detective |
| PRACTICING | 练习、实践、写代码、practice | skill-coach |
| QUESTIONING | 这是什么、what is、怎么用 | story-teller |
| REVIEWING | 复习、回顾、总结、review | experience-accumulator |
| ACHIEVING | 完成了、做完了、finished | achievement-designer |
| STRUGGLING | 太难、卡住了、stuck | task-breakdown-expert |
| EXPLORING | 还有什么、其他、more | ai-class-advisor |

### 情绪状态识别

- **FRUSTRATED**：烦、难、头疼、搞不懂 → 困惑侦探
- **EXCITED**：有趣、好玩、酷、awesome → 成就设计师  
- **CONFIDENT**：简单、会了、理解了 → 技能教练
- **CURIOUS**：为什么、如何、原理 → 故事讲述者

### 学习阶段判断

- **INTRODUCTION**：第一次、新手、零基础 → 故事讲述者
- **COMPREHENSION**：理解、明白、懂了 → 班主任协调
- **APPLICATION**：怎么用、实践、应用 → 技能教练
- **ANALYSIS**：为什么、原理、深入 → 经验累积官

## 🎭 角色系统

### 角色定义

1. **AI班主任 (ai-class-advisor)**
   - 统筹规划、进度跟踪、角色协调
   - 适合：会话开始、整体指导、角色切换

2. **故事讲述者 (story-teller)**
   - 概念类比、故事解释、直觉建立
   - 适合：抽象概念、新知识引入

3. **技能教练 (skill-coach)**
   - 代码实践、渐进训练、技能提升
   - 适合：动手练习、技能强化

4. **困惑侦探 (confusion-detective)**
   - 问题诊断、障碍分析、精准解惑
   - 适合：学习困难、错误频发

5. **任务分解专家 (task-breakdown-expert)**
   - 任务拆解、步骤规划、渐进实现
   - 适合：复杂项目、压倒性任务

6. **成就设计师 (achievement-designer)**
   - 成就设计、动机激励、正向反馈
   - 适合：里程碑庆祝、动机提升

7. **经验累积官 (experience-accumulator)**
   - 经验总结、模式提取、知识沉淀
   - 适合：学习回顾、知识整合

### 角色切换矩阵

```
班主任 → 故事讲述者/技能教练/困惑侦探
故事讲述者 → 技能教练/困惑侦探/成就设计师
技能教练 → 困惑侦探/成就设计师/任务分解专家
困惑侦探 → 故事讲述者/任务分解专家/班主任
任务分解专家 → 技能教练/故事讲述者/班主任
成就设计师 → 经验累积官/班主任/技能教练
经验累积官 → 班主任/故事讲述者/技能教练
```

## 📁 学习档案结构

系统会自动创建以下文件结构：

```
AI-Learning-Portfolio/
├── Sessions/
│   └── 2024-08-13_14-30_JavaScript基础/
│       ├── lesson-plan.md      # 教案记录
│       ├── practice-code.js    # 练习代码
│       ├── notes.md           # 学习笔记
│       └── achievements.json   # 成就记录
├── Progress/
│   ├── skill-tree.json        # 技能树进度
│   ├── zpd-history.json       # ZPD变化历史
│   └── confidence-tracking.json # 信心度跟踪
├── Projects/
│   └── [实战项目文件夹]
└── Knowledge-Base/
    ├── concepts-mastered.md   # 已掌握概念
    ├── common-errors.md       # 常见错误记录
    └── best-practices.md      # 最佳实践收集
```

## 🧠 SLAN认知引擎

### 认知处理流程

1. **Sense (感知)**：分析用户输入和学习环境
2. **Learn (学习)**：更新知识状态和技能水平
3. **Adapt (适应)**：调整教学策略和难度
4. **Navigate (导航)**：决定下一步行动和角色

### 认知状态跟踪

- **困惑程度 (confusionLevel)**：0-1，影响角色选择
- **ZPD水平 (zpdLevel)**：最近发展区评估
- **信心指数 (confidenceLevel)**：学习者自信程度
- **上次活动 (lastActivity)**：影响后续决策

## 🔧 配置选项

### 系统配置

```javascript
{
  "config": {
    "skipIntro": false,           // 跳过介绍
    "autoCreateFiles": true,      // 自动创建文件
    "detailed": false,            // 详细模式
    "fastMode": false,            // 快速模式
    "initialZPD": 5,             // 初始ZPD等级
    "learningStyle": "mixed"      // 学习风格偏好
  }
}
```

### 会话配置

```javascript
{
  "context": {
    "sessionId": "custom-id",     // 自定义会话ID
    "currentTopic": "React",      // 当前主题
    "previousRole": "story-teller", // 上一个角色
    "timeLimit": 3600,            // 时间限制(秒)
    "difficulty": "intermediate"   // 难度级别
  }
}
```

## 📈 最佳实践

### 1. 学习会话规划
- 每个会话专注一个主题
- 设置合理的时间预期
- 定期进行知识回顾

### 2. 意图表达技巧
- 明确表达学习需求
- 描述当前困惑点
- 反馈学习感受

### 3. 角色协作优化
- 信任系统的角色切换
- 积极配合角色特色
- 及时反馈效果

### 4. 档案管理
- 定期查看学习记录
- 整理重要笔记
- 跟踪技能进度

## 🚨 常见问题

### Q: 角色切换太频繁怎么办？
A: 系统内置防频繁切换机制，如果仍有问题可以设置 `"fastMode": false`

### Q: 如何指定特定角色？
A: 在 context 中设置 `"preferredRole": "role-name"`

### Q: 学习档案在哪里？
A: 默认在当前目录的 `AI-Learning-Portfolio` 文件夹

### Q: 如何重置学习进度？
A: 使用新的 sessionId 或删除对应的档案文件夹

## 🔄 更新日志

### v3.1.0 (当前版本)
- ✅ 新增智能意图识别系统
- ✅ 重构角色路由引擎
- ✅ 集成自动教案管理
- ✅ 添加学习档案系统
- ✅ 融合最新教育学理论

### v3.0.0
- 基础7角色协作系统
- SLAN认知架构
- Experience Chain机制

## 🤝 支持与反馈

如遇问题请通过以下方式获取帮助：
- GitHub Issues: https://github.com/yejunhao159/ai-123/issues
- 技术文档: README.md
- 社区支持: PromptX社区