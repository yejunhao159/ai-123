# 🎓 PromptX智能教育AI系统 - 教师团队模式

## 工具标识
@tool://edu-ai-system

## 🌟 系统介绍

这是一个革命性的AI教育系统，采用**教师团队模式**而非传统的角色切换。就像真实的补习班，多位专业老师同时在场，随时根据你的需要提供帮助。

### 核心理念
**不是一个AI在切换人格，而是一个真正的教师团队在协作！**

## 👥 我们的教师团队

| 教师 | 专长 | 何时出现 |
|------|------|----------|
| 👩‍🏫 班主任 | 学习规划、进度管理、目标制定 | 开始学习、需要规划时 |
| 📖 故事讲述者 | 概念解释、生动类比、直觉理解 | 不理解概念、需要解释时 |
| 💪 技能教练 | 实践指导、代码练习、技能训练 | 需要练习、想写代码时 |
| 🔍 困惑侦探 | 问题诊断、错误分析、概念澄清 | 遇到错误、困惑时 |
| 🧩 任务分解专家 | 复杂任务拆解、步骤规划 | 任务复杂、不知道怎么开始时 |
| 🏆 成就设计师 | 激励设计、目标设定、进度可视化 | 需要鼓励、设定目标时 |
| 📚 经验积累官 | 知识总结、复习规划、长期记忆 | 需要总结、复习时 |

## 🚀 使用方式

### 🌟 最简单的开始（强烈推荐）
```javascript
promptx_tool @tool://edu-ai-system
```
**无需任何参数！** 系统会：
1. 所有老师同时分析你的情况
2. 推荐最合适的老师为你服务
3. 显示其他老师的建议供你选择

### 💬 自然对话方式
```javascript
promptx_tool @tool://edu-ai-system '{"message": "我想学React但完全没基础"}'
```

系统响应示例：
```
🎯 故事讲述者建议：让我用一个生动的故事来解释React...
👥 其他老师的建议：
   班主任：我来为你制定完整的学习路径
   技能教练：我们直接从代码开始练习

你可以选择：
1. 继续听故事讲述者说
2. 我想听班主任的建议  
3. 我想听技能教练的建议
4. 查看所有老师
```

### 🎯 指定老师
```javascript
promptx_tool @tool://edu-ai-system '{"selectedRole": "skill-coach", "message": "给我一些练习"}'
```

### 🎮 用户选择
```javascript
promptx_tool @tool://edu-ai-system '{"userChoice": {"action": "show_all_teachers"}}'
```

## 🎮 交互方式

### 1. 自然语言选择（最方便）
直接说出你想要的：
- "我想听故事" → 自动切换到故事讲述者
- "找班主任" → 自动切换到班主任  
- "继续听当前老师说" → 继续当前对话
- "看看所有老师" → 显示教师选择界面

### 2. 结构化选择
```javascript
// 切换到特定角色
{"selectedRole": "confusion-detective"}

// 执行特定动作
{"userChoice": {"action": "switch_to_story-teller"}}

// 显示所有教师
{"userChoice": {"action": "show_all_teachers"}}
```

### 3. 智能推荐
系统会根据你的问题自动推荐最合适的老师，同时显示其他选项。

## 📊 响应格式

### 教师团队模式响应
```json
{
  "success": true,
  "mode": "teacher-team",
  "data": {
    "primaryTeacher": {
      "role": "story-teller",
      "name": "故事讲述者", 
      "confidence": 0.85,
      "message": "让我用一个故事来解释...",
      "reason": "检测到概念理解困难"
    },
    "otherTeachers": [
      {
        "role": "skill-coach",
        "name": "技能教练",
        "preview": "我们来实际练习一下...",
        "confidence": 0.72
      }
    ],
    "userChoices": [
      {
        "label": "继续听故事讲述者说",
        "action": "continue_primary",
        "default": true
      },
      {
        "label": "我想听技能教练的建议", 
        "action": "switch_to_skill-coach"
      }
    ],
    "teamInsights": {
      "consensusLevel": 0.76,
      "diversityScore": 0.42
    }
  }
}
```

## 🔧 高级功能

### 会话管理
- 系统自动记录学习进度
- 支持断点续学
- 维护教师切换历史

### 智能分析
- **共识度**：教师们对最佳方案的一致程度
- **多样性**：不同视角和建议的丰富程度
- **置信度**：每个建议的可靠程度

### 个性化学习
- 学习阶段识别：exploring → learning → practicing → mastering
- 学生画像构建：基于历史记录分析学习偏好
- 上下文感知：根据对话历史调整教学策略

## 🎯 使用场景

### 场景1：完全新手
```bash
promptx_tool @tool://edu-ai-system
# 系统展示技术全景，班主任主导，其他老师补充
```

### 场景2：概念困惑
```bash
promptx_tool @tool://edu-ai-system '{"message": "什么是闭包？完全不懂"}'
# 故事讲述者主导，用生动比喻解释
```

### 场景3：代码错误
```bash
promptx_tool @tool://edu-ai-system '{"message": "我的代码报错了"}'
# 困惑侦探主导，技能教练协助
```

### 场景4：需要练习
```bash
promptx_tool @tool://edu-ai-system '{"message": "给我一些练习"}'
# 技能教练主导，任务分解专家协助
```

### 场景5：学习总结
```bash
promptx_tool @tool://edu-ai-system '{"message": "总结一下今天学的内容"}'
# 经验积累官主导，成就设计师协助
```

## 💡 最佳实践

### 1. 信任系统推荐
- 系统的教师推荐基于复杂的相关性分析
- 置信度高的推荐通常很准确

### 2. 主动选择老师
- 如果你有明确偏好，直接说出来
- "我想听故事版本" 比 "解释一下" 更精确

### 3. 探索不同视角
- 同一个问题，不同老师有不同解决方式
- 尝试听听其他老师的建议

### 4. 利用自然语言
- 系统支持很自然的表达方式
- 不需要记忆复杂的命令格式

## 🔍 调试和测试

### 检查系统状态
```bash
promptx_tool @tool://edu-ai-system '{"intent": "test"}'
```

### 查看所有教师
```bash
promptx_tool @tool://edu-ai-system '{"userChoice": {"action": "show_all_teachers"}}'
```

### 强制指定教师（用于测试）
```bash
promptx_tool @tool://edu-ai-system '{"selectedRole": "story-teller", "message": "测试故事讲述者"}'
```

## 🚀 与传统AI教育的区别

| 传统方式 | 教师团队模式 |
|----------|-------------|
| 单一AI角色 | 7个专业教师 |
| 用户猜测需要什么 | 系统智能推荐 + 用户可选择 |
| 机械式回答 | 个性化、有温度的教学 |
| 一问一答 | 多角度、协作式回答 |
| 难以切换风格 | 随时切换教学方式 |

## 📝 注意事项

1. **首次使用建议无参数调用**，让系统引导你
2. **系统会记忆你的选择偏好**，越用越智能
3. **可以随时说"我想换个老师"**，系统会理解
4. **每个老师都能看到你的学习历史**，确保连贯性

---

**让AI教育更像真实的教学场景！** 🎓✨