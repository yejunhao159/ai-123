# 🎓 PromptX 智能教育AI系统

[![Version](https://img.shields.io/badge/version-3.0.0-blue)](https://github.com/yejunhao159/ai-123)
[![PromptX](https://img.shields.io/badge/PromptX-Compatible-green)](https://github.com/deepractice/promptx)
[![License](https://img.shields.io/badge/license-MIT-yellow)](./LICENSE)
[![Stars](https://img.shields.io/github/stars/yejunhao159/ai-123?style=social)](https://github.com/yejunhao159/ai-123/stargazers)

> **基于SLAN认知架构的智能教育系统 - 7个AI角色协作，提供真正的个性化教学体验**

<div align="center">

[🚀 快速开始](#-快速安装) • 
[📖 使用指南](#-使用方法) • 
[🎯 功能特性](#-核心特性) • 
[🤝 贡献指南](#-贡献指南) • 
[💬 问题反馈](https://github.com/yejunhao159/ai-123/issues)

</div>

## ✨ 核心特性

- 🧠 **SLAN认知引擎** - AI在后台真正运行认知决策（非模拟）
- 👥 **7角色协作** - 完整的AI教学团队，智能编排
- 🎯 **单一入口** - 一个工具搞定所有教育功能
- 📊 **Experience Chain** - 可视化学习轨迹
- 🚀 **零配置** - 开箱即用，3分钟完成安装

## 📦 包含内容

### 7个专业教学角色
- 🎓 **AI班主任** - 统筹协调，智能路由
- 💡 **故事讲述者** - 类比解释，建立直觉
- 💻 **技能教练** - 代码示例，动手练习
- 🔍 **困惑侦探** - 错误诊断，问题定位
- 📋 **任务分解专家** - 拆解步骤，逐步实现
- 🏆 **成就设计师** - 正向激励，成就感
- 📝 **经验累积官** - 知识沉淀，模式提取

### 核心工具
- `@tool://edu-ai-system` - 统一入口工具
- 完整的使用手册和API文档
- 教案管理系统

### 知识库
- 技术全景知识图谱
- OKR制定模板
- ZPD评估标准

## 🚀 快速安装

### 方式1：一键复制（推荐）

```bash
# 1. 克隆本仓库
git clone https://github.com/yejunhao159/ai-123.git
cd ai-123

# 2. 复制到你的PromptX项目
cp -r .promptx/resource/* /你的项目/.promptx/resource/

# 3. 在你的AI工具中刷新PromptX
# 告诉AI："请执行 promptx_init 刷新资源"
```

### 方式2：直接下载

1. 点击右上角 **Code** → **Download ZIP**
2. 解压后复制 `.promptx/resource/` 文件夹
3. 粘贴到你的PromptX项目中
4. 告诉AI刷新资源

### 方式3：使用安装脚本

```bash
# Linux/Mac
./scripts/install.sh

# Windows  
scripts\install.bat
```

## 💡 使用方法

### 基础使用

```javascript
// 最简单的开始
告诉AI：请使用 @tool://edu-ai-system 帮我学习编程

// 或者通过PromptX工具
告诉AI：执行 promptx_tool @tool://edu-ai-system
```

### 高级功能

```javascript
// 查看学习进度
@tool://edu-ai-system { "intent": "assess" }

// 继续上次学习
@tool://edu-ai-system { "intent": "continue" }

// 快速模式（跳过介绍）
@tool://edu-ai-system { 
  "config": { 
    "skipIntro": true, 
    "fastMode": true 
  }
}
```

## 📖 使用场景

### 场景1：零基础学编程
```
用户：我想学Python，完全零基础
系统：展示技术全景 → 制定OKR → 7角色协作教学
```

### 场景2：技术栈切换
```
用户：我会Vue，想学React
系统：识别已有知识 → 对比差异 → 快速迁移
```

### 场景3：项目实战
```
用户：想做一个全栈项目来学习
系统：任务分解 → 渐进实现 → 持续指导
```

## 🛠️ 技术架构

```
PromptX MCP
    ↓
edu-ai-system (单一入口)
    ↓
SLAN认知引擎
    ↓
7角色智能编排
    ↓
个性化教学输出
```

## 📊 学习效果示例

```
第1小时：理解React核心概念
├─ 故事讲述者：用积木类比组件
├─ 技能教练：Hello World实践
└─ 困惑侦探：解决JSX语法困惑

掌握度：75% | 信心度：85% | 下一步：State管理
```

## 🔧 配置选项

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `skipIntro` | boolean | false | 跳过技术全景介绍 |
| `fastMode` | boolean | false | 快速模式，简化流程 |
| `zpd` | number | 3 | 初始ZPD等级(1-10) |
| `style` | string | "mixed" | 学习风格偏好 |

## 📁 包结构

```
promptx-edu-ai-package/
├── .promptx/
│   └── resource/
│       ├── roles/          # 7个教学角色
│       ├── tools/          # 核心工具
│       └── knowledge/      # 知识库
├── scripts/                # 安装脚本
├── docs/                   # 文档
├── examples/               # 使用示例
└── README.md              # 本文档
```

## 🤝 贡献指南

欢迎贡献新的教学策略、角色优化或功能改进！

1. Fork 本项目
2. 创建特性分支
3. 提交更改
4. 开启 Pull Request

## 📄 许可证

MIT License - 自由使用和修改

## 🙏 致谢

- [PromptX](https://github.com/deepractice/promptx) - AI专业能力框架
- 认知科学理论 - Schön, Piaget, Vygotsky
- deepractice.ai - 产品设计理念

## 💬 支持与反馈

- 🐛 问题反馈：[GitHub Issues](https://github.com/yejunhao159/ai-123/issues)
- 💡 功能建议：[GitHub Discussions](https://github.com/yejunhao159/ai-123/discussions)
- 📚 技术支持：[PromptX社区](https://github.com/deepractice/promptx)
- 📧 联系作者：yejunhao159@gmail.com

## 🌟 如果有帮助，请给个Star

如果这个项目对你的学习有帮助，请点击右上角的 ⭐️ Star 按钮支持我们！

[![GitHub stars](https://img.shields.io/github/stars/yejunhao159/ai-123?style=social)](https://github.com/yejunhao159/ai-123/stargazers)

---

**Made with ❤️ by deepractice.ai | Powered by PromptX**

*"让AI教育触手可及"*