# AI-123 方法层架构文档

## 概述

方法层是AI-123教学系统的核心组件，提供了模板化、可组合的教学方法实现框架。通过标准化的配置和执行接口，支持多种教学方法的灵活组合和扩展。

## 架构设计

### 核心组件

```
src/layers/method/
├── index.js                 # 方法层主入口
├── MethodTemplate.js        # 方法模板基类
├── MethodRegistry.js        # 方法注册表
├── MethodExecutor.js        # 方法执行器
├── MethodLoader.js          # 方法加载器
└── implementations/         # 具体方法实现
    └── ComparativeTeachingMethod.js
```

### 配置系统

```
config/methods/              # 方法配置目录
├── comparative-teaching.json
├── practical-exercise.json
├── problem-diagnosis.json
├── task-decomposition.json
├── motivation-feedback.json
└── knowledge-sedimentation.json

schemas/
└── method-schema.json       # 方法配置Schema
```

## 主要特性

### 1. 模板化设计
- 统一的方法接口和生命周期
- 参数验证和类型检查
- 钩子机制支持扩展

### 2. 配置驱动
- JSON配置文件定义方法行为
- Schema验证确保配置正确性
- 支持热加载和动态更新

### 3. 组合执行
- 链式执行：串行组合多个方法
- 并行执行：同时运行多个方法
- 条件执行：基于条件动态选择方法

### 4. 扩展性
- 自定义实现类覆盖默认行为
- 中间件机制增强功能
- 插件化的钩子系统

## 使用方式

### 基础使用

```javascript
const { MethodLayer } = require('./src/layers/method');

// 创建方法层实例
const methodLayer = new MethodLayer();

// 执行单个方法
const result = await methodLayer.execute('comparativeTeaching', context, {
    concepts: ['Python', 'JavaScript'],
    comparisonAspects: ['语法', '性能', '生态'],
    outputFormat: 'table'
});
```

### 方法组合

```javascript
// 链式执行
const results = await methodLayer.executeChain([
    'comparativeTeaching',
    'practicalExercise', 
    'knowledgeSedimentation'
], context, {
    chainContext: true,
    strict: false
});

// 并行执行
const results = await methodLayer.executeParallel([
    'problemDiagnosis',
    'taskDecomposition'
], context, params);
```

### 方法注册

```javascript
const MethodLoader = require('./src/layers/method/MethodLoader');

const loader = new MethodLoader();
const loadResults = await loader.loadAllMethods();

// 注册到方法层
for (const methodName of loader.getLoadedMethodNames()) {
    const method = loader.getMethod(methodName);
    methodLayer.registerMethod(methodName, method);
}
```

## 已实现的教学方法

### 1. 对比教学法 (comparativeTeaching)
- **用途**: 通过对比分析加深理解
- **参数**: 概念列表、对比维度、目标受众
- **输出**: 结构化对比表格和分析洞察

### 2. 实践练习法 (practicalExercise)  
- **用途**: 通过动手实践巩固学习
- **参数**: 主题、技能水平、练习类型
- **输出**: 练习结果和反馈建议

### 3. 问题诊断法 (problemDiagnosis)
- **用途**: 系统化分析和解决问题
- **参数**: 问题描述、领域、诊断深度
- **输出**: 诊断报告和解决方案

### 4. 任务分解法 (taskDecomposition)
- **用途**: 将复杂任务分解为子任务
- **参数**: 任务描述、复杂度、分解策略
- **输出**: 任务层次结构和执行计划

### 5. 激励反馈法 (motivationFeedback)
- **用途**: 提供个性化激励和反馈
- **参数**: 表现数据、学习者画像、反馈风格
- **输出**: 个性化反馈和下一步建议

### 6. 知识沉淀法 (knowledgeSedimentation)
- **用途**: 系统化整理和固化学习成果
- **参数**: 学习内容、沉淀类型、组织方法
- **输出**: 结构化知识库和索引

## 扩展开发

### 创建新方法

1. **编写配置文件**
```json
{
  "name": "newMethod",
  "type": "custom",
  "description": "新的教学方法",
  "parameters": {
    "param1": {
      "type": "string", 
      "required": true
    }
  },
  "implementation": {
    "steps": [
      {
        "name": "step1",
        "action": "analyze"
      }
    ]
  }
}
```

2. **实现方法类** (可选)
```javascript
const MethodTemplate = require('../MethodTemplate');

class NewMethod extends MethodTemplate {
    async execute(context, params) {
        // 自定义实现逻辑
        return {
            result: 'method execution result'
        };
    }
}

module.exports = NewMethod;
```

### 添加中间件

```javascript
methodLayer.executor.use(async (context, params, methodName) => {
    // 执行前处理
    console.log(`执行方法: ${methodName}`);
    
    // 返回增强的上下文
    return {
        timestamp: new Date().toISOString(),
        requestId: generateRequestId()
    };
});
```

## 运行示例

```bash
# 运行演示程序
node examples/method-layer-demo.js

# 输出示例:
# === AI-123 方法层演示 ===
# 📦 正在加载教学方法...
# ✅ comparativeTeaching (自定义实现)
# ✅ practicalExercise (配置驱动)
# ...
```

## 配置参考

详细的配置格式请参考 `schemas/method-schema.json`，包含：
- 方法基本信息（名称、类型、描述）
- 参数定义和验证规则  
- 实现步骤和执行逻辑
- 钩子和中间件配置
- 元数据和示例

## 最佳实践

1. **方法设计原则**
   - 单一职责：每个方法专注一个教学目标
   - 可组合性：支持与其他方法组合使用
   - 参数验证：严格验证输入参数

2. **性能优化**
   - 异步执行：使用Promise和async/await
   - 缓存机制：缓存计算密集的结果
   - 错误处理：优雅处理异常情况

3. **扩展建议**
   - 优先使用配置驱动的方式
   - 只在需要复杂逻辑时创建自定义实现
   - 充分利用钩子机制扩展功能

## 后续规划

- [ ] 添加更多预置教学方法
- [ ] 实现方法版本管理
- [ ] 添加性能监控和分析
- [ ] 支持分布式方法执行
- [ ] 集成AI能力增强方法智能化