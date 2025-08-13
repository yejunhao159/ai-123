# 快速开始示例

## 1. 第一次使用 - 探索技术全景

```javascript
// 告诉AI
"我想学编程，但不知道从哪里开始"

// 或使用工具
@tool://edu-ai-system
```

**系统响应流程：**
1. AI班主任介绍技术全景
2. 帮你理解前端、后端、全栈的区别
3. 根据你的兴趣和背景推荐方向
4. 制定3个月的OKR学习计划

## 2. 学习新概念 - 理解Promise

```javascript
@tool://edu-ai-system {
  "message": "我想理解JavaScript的Promise"
}
```

**角色协作流程：**
1. **故事讲述者**：用餐厅点餐类比解释异步
2. **技能教练**：提供渐进式代码练习
3. **困惑侦探**：解决你遇到的错误
4. **成就设计师**：庆祝你的理解

## 3. 项目实战 - Todo应用

```javascript
@tool://edu-ai-system {
  "message": "帮我做一个Todo List应用"
}
```

**任务分解流程：**
1. **任务分解专家**：
   - 设计数据结构
   - 创建界面
   - 实现增删改查
   - 添加本地存储

2. **技能教练**：逐步指导实现

3. **经验累积官**：总结学到的模式

## 4. 继续上次学习

```javascript
@tool://edu-ai-system {
  "intent": "continue"
}
```

系统会：
- 读取上次的教案
- 回顾已学内容
- 从中断点继续

## 5. 查看学习进度

```javascript
@tool://edu-ai-system {
  "intent": "assess"
}
```

生成报告：
- 已掌握的概念
- 当前ZPD等级
- 学习时间统计
- 下一步建议

## 6. 快速模式（熟悉用户）

```javascript
@tool://edu-ai-system {
  "config": {
    "skipIntro": true,
    "fastMode": true
  },
  "message": "直接教我React Hooks"
}
```

跳过介绍，直接进入教学。

## 常见问题解答

### Q: 系统如何知道我的水平？
A: 通过初始对话评估ZPD（最近发展区），并在教学过程中动态调整。

### Q: 可以学习哪些技术？
A: 支持所有主流编程语言和框架，包括但不限于：
- 前端：HTML/CSS/JS, React, Vue, Angular
- 后端：Node.js, Python, Java, Go
- 数据库：MySQL, MongoDB, Redis
- AI/ML：TensorFlow, PyTorch

### Q: 学习记录会保存吗？
A: 是的，保存在`.promptx/teaching/`目录下，可以随时继续。

### Q: 如何切换学习方向？
A: 随时告诉AI你想学习的新内容，系统会智能调整。

## 进阶技巧

### 1. 指定起始角色
```javascript
@tool://edu-ai-system {
  "startRole": "skill-coach",
  "message": "直接开始写代码"
}
```

### 2. 调整学习节奏
```javascript
@tool://edu-ai-system {
  "config": {
    "pace": "slow",  // slow/normal/fast
    "depth": "deep"   // shallow/normal/deep
  }
}
```

### 3. 专注某个方面
```javascript
@tool://edu-ai-system {
  "focus": "debugging",  // 专注调试技能
  "message": "教我调试技巧"
}
```