# 目标层 (Goal Layer)

目标层是ai-123项目的核心组件之一，负责管理学习目标、项目上下文和进度跟踪。

## 📁 架构结构

```
src/layers/goal/
├── index.js              # 目标层主模块
├── ProjectContext.js     # 项目上下文管理
├── GoalManager.js        # 目标管理器
├── ContextStore.js       # 上下文存储
├── ContextSerializer.js  # 序列化工具
├── test.js              # 完整功能测试
├── simple-test.js       # 基础模块测试
└── README.md            # 使用文档
```

## 🚀 快速开始

### 基本使用

```javascript
const GoalLayer = require('./src/layers/goal');

// 初始化目标层
const goalLayer = new GoalLayer();
await goalLayer.initialize({
    context: {
        learningTopic: 'JavaScript 进阶学习',
        userLevel: { current: 'intermediate' },
        projectInfo: { name: '学习项目', domain: 'frontend' }
    }
});

// 设置学习目标
const result = await goalLayer.setGoal({
    title: '掌握异步编程',
    description: '学习Promise、async/await等概念',
    type: 'learning',
    priority: 'high',
    estimatedDuration: 8 // 小时
});

// 更新进度
await goalLayer.updateProgress(result.goalId, {
    percentage: 50,
    details: '完成了Promise基础学习',
    milestones: ['Promise语法', '错误处理']
});

// 获取当前状态
const status = goalLayer.getStatus();
console.log('当前进度:', status.statistics.avgProgress);
```

## 📋 核心功能

### 1. 项目上下文管理

- **学习主题设置**: 定义当前学习的主要内容
- **用户水平跟踪**: 记录用户当前水平和ZPD（最近发展区）
- **学习风格偏好**: 支持个性化学习方式配置
- **历史记录**: 完整的学习轨迹记录

### 2. 目标管理系统

- **多维度目标**: 支持学习、练习、评估、项目等类型
- **层级化管理**: 支持父子目标关系
- **动态调整**: 根据学习进展调整目标难度和时间
- **进度跟踪**: 实时记录和分析学习进度

### 3. 上下文存储

- **多种存储方式**: 文件、内存、数据库存储
- **版本管理**: 支持上下文历史版本管理
- **数据完整性**: 校验和验证机制
- **备份恢复**: 完整的备份和恢复功能

### 4. 序列化系统

- **多格式支持**: JSON、二进制、压缩格式
- **压缩优化**: 可选的数据压缩功能
- **加密安全**: 支持数据加密存储
- **版本兼容**: 向前兼容的版本升级

## 🎯 使用场景

### 个人学习管理
```javascript
// 设置个人学习目标
await goalLayer.setGoal({
    title: '学习React框架',
    type: 'learning',
    difficulty: 'medium',
    assessmentCriteria: [
        { name: '概念理解', type: 'progress', weight: 0.3 },
        { name: '实践应用', type: 'quality', weight: 0.7 }
    ]
});
```

### 项目进度跟踪
```javascript
// 项目目标设置
await goalLayer.setGoal({
    title: '完成待办事项应用',
    type: 'project',
    priority: 'high',
    deadline: '2024-01-31',
    successMetrics: ['功能完整性', '代码质量', '用户体验']
});
```

### 技能评估
```javascript
// 评估学习成果
const assessment = await goalLayer.assessGoal(goalId);
console.log('评估结果:', assessment.overall);
console.log('改进建议:', assessment.recommendations);
```

## 📊 状态监控

### 获取详细状态
```javascript
const status = goalLayer.getStatus();
console.log('目标概览:', {
    总目标数: status.allGoals.length,
    当前目标: status.currentGoal?.title,
    完成率: status.statistics.completionRate,
    平均进度: status.statistics.avgProgress
});
```

### 上下文历史
```javascript
const history = await goalLayer.getContextHistory();
console.log('历史记录:', history.length);
```

## 🔧 配置选项

### 初始化配置
```javascript
await goalLayer.initialize({
    context: {
        learningTopic: '学习主题',
        userLevel: { current: 'beginner|intermediate|advanced' },
        learningStyle: {
            preferredFormat: 'text|video|interactive|mixed',
            pace: 'slow|moderate|fast',
            depth: 'overview|detailed|comprehensive'
        }
    },
    loadPreviousContext: true, // 是否加载之前的上下文
    contextId: 'specific-context-id' // 特定上下文ID
});
```

### 存储配置
```javascript
const contextStore = new ContextStore({
    storageType: 'file', // file|memory|database
    storageDir: './data/contexts',
    maxVersions: 10 // 最大版本数
});
```

### 序列化配置
```javascript
const serializer = new ContextSerializer({
    format: 'json', // json|binary|compressed
    compression: true,
    encryption: false
});
```

## 🧪 测试

### 运行基础测试
```bash
node src/layers/goal/simple-test.js
```

### 运行完整测试
```bash
node src/layers/goal/test.js
```

## 📈 性能特性

- **内存优化**: 高效的数据结构和缓存机制
- **异步处理**: 非阻塞的异步操作
- **容错处理**: 完善的错误处理和恢复机制
- **扩展性**: 模块化设计，易于扩展新功能

## 🔒 安全特性

- **数据验证**: 严格的输入验证和类型检查
- **加密存储**: 可选的数据加密功能
- **访问控制**: 基于角色的访问控制
- **审计日志**: 完整的操作日志记录

## 🤝 扩展开发

### 自定义目标类型
```javascript
// 扩展新的目标类型
const customGoal = {
    type: 'certification',
    customFields: {
        examDate: '2024-02-15',
        requiredScore: 80
    }
};
```

### 自定义评估标准
```javascript
// 添加自定义评估逻辑
goalManager.addCustomCriterion('practical-skill', async (goal) => {
    // 自定义评估逻辑
    return score;
});
```

## 📋 待办事项

- [ ] 实现数据库存储支持
- [ ] 添加可视化界面
- [ ] 集成机器学习推荐
- [ ] 支持多用户协作
- [ ] 添加移动端适配

## 📄 许可证

遵循项目主许可证。

---

*目标层是ai-123学习工具的核心组件，为个性化学习提供强大的目标管理和进度跟踪能力。*