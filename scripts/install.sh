#!/bin/bash

# PromptX 教育AI系统安装脚本
# Version: 3.0.0
# Author: deepractice.ai

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logo
echo -e "${BLUE}"
echo "╔════════════════════════════════════════════╗"
echo "║                                            ║"
echo "║    🎓 PromptX 智能教育AI系统               ║"
echo "║       Version 3.0.0                        ║"
echo "║       Powered by deepractice.ai            ║"
echo "║                                            ║"
echo "╚════════════════════════════════════════════╝"
echo -e "${NC}"

# 检查当前目录
echo -e "${YELLOW}📍 检查安装环境...${NC}"

# 检查是否存在.promptx目录
if [ ! -d ".promptx" ]; then
    echo -e "${RED}❌ 错误：当前目录不是PromptX项目${NC}"
    echo -e "${YELLOW}💡 提示：请先在你的AI工具中执行 'promptx_init' 初始化项目${NC}"
    exit 1
fi

# 获取源目录和目标目录
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
SOURCE_DIR="$(dirname "$SCRIPT_DIR")"
TARGET_DIR="$(pwd)"

echo -e "${GREEN}✅ 检测到PromptX项目：$TARGET_DIR${NC}"

# 确认安装
echo -e "${YELLOW}即将安装以下内容：${NC}"
echo "  • 7个专业教学角色"
echo "  • edu-ai-system统一入口工具"
echo "  • 技术全景知识库"
echo "  • 角色交接协议"
echo ""
read -p "是否继续安装？(y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}安装已取消${NC}"
    exit 0
fi

# 开始安装
echo -e "${BLUE}🚀 开始安装...${NC}"

# 1. 备份现有文件（如果存在）
if [ -d ".promptx/resource/roles" ] || [ -d ".promptx/resource/tools" ]; then
    echo -e "${YELLOW}📦 备份现有文件...${NC}"
    BACKUP_DIR=".promptx/backup/$(date +%Y%m%d_%H%M%S)"
    mkdir -p "$BACKUP_DIR"
    
    if [ -d ".promptx/resource/roles" ]; then
        cp -r .promptx/resource/roles "$BACKUP_DIR/" 2>/dev/null || true
    fi
    if [ -d ".promptx/resource/tools" ]; then
        cp -r .promptx/resource/tools "$BACKUP_DIR/" 2>/dev/null || true
    fi
    
    echo -e "${GREEN}✅ 备份完成：$BACKUP_DIR${NC}"
fi

# 2. 复制角色文件
echo -e "${BLUE}📋 安装角色文件...${NC}"
mkdir -p .promptx/resource/roles

for role in ai-class-advisor story-teller skill-coach confusion-detective \
            task-decomposer achievement-designer experience-accumulator; do
    if [ -d "$SOURCE_DIR/.promptx/resource/roles/$role" ]; then
        cp -r "$SOURCE_DIR/.promptx/resource/roles/$role" .promptx/resource/roles/
        echo -e "  ✓ $role"
    fi
done

# 复制交接协议
cp "$SOURCE_DIR/.promptx/resource/roles/HANDOVER-PROTOCOL.md" .promptx/resource/roles/ 2>/dev/null || true

# 3. 复制工具文件
echo -e "${BLUE}🔧 安装工具文件...${NC}"
mkdir -p .promptx/resource/tools
cp "$SOURCE_DIR/.promptx/resource/tools/edu-ai-system.tool.js" .promptx/resource/tools/
cp "$SOURCE_DIR/.promptx/resource/tools/edu-ai-system.manual.md" .promptx/resource/tools/
echo -e "  ✓ edu-ai-system"

# 4. 复制知识库
echo -e "${BLUE}📚 安装知识库...${NC}"
mkdir -p .promptx/resource/knowledge
cp "$SOURCE_DIR/.promptx/resource/knowledge/tech-landscape.knowledge.md" .promptx/resource/knowledge/
echo -e "  ✓ tech-landscape"

# 5. 创建教案目录
echo -e "${BLUE}📝 创建教案目录...${NC}"
mkdir -p .promptx/teaching
echo -e "  ✓ .promptx/teaching"

# 6. 验证安装
echo -e "${BLUE}🔍 验证安装...${NC}"

INSTALL_SUCCESS=true

# 检查关键文件
if [ ! -f ".promptx/resource/tools/edu-ai-system.tool.js" ]; then
    echo -e "${RED}  ✗ 工具文件未找到${NC}"
    INSTALL_SUCCESS=false
fi

if [ ! -d ".promptx/resource/roles/ai-class-advisor" ]; then
    echo -e "${RED}  ✗ 角色文件未找到${NC}"
    INSTALL_SUCCESS=false
fi

if [ "$INSTALL_SUCCESS" = true ]; then
    echo -e "${GREEN}✅ 安装验证通过${NC}"
    
    # 成功信息
    echo ""
    echo -e "${GREEN}╔════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║         🎉 安装成功！                       ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${BLUE}📖 快速开始：${NC}"
    echo -e "1. 在你的AI工具中告诉AI："
    echo -e "   ${YELLOW}'请执行 promptx_init 刷新资源'${NC}"
    echo ""
    echo -e "2. 然后开始使用："
    echo -e "   ${YELLOW}'请使用 @tool://edu-ai-system 帮我学习编程'${NC}"
    echo ""
    echo -e "${BLUE}📚 更多信息：${NC}"
    echo -e "   • README: $TARGET_DIR/README.md"
    echo -e "   • 手册: .promptx/resource/tools/edu-ai-system.manual.md"
    echo ""
    echo -e "${GREEN}祝你学习愉快！🚀${NC}"
else
    echo -e "${RED}❌ 安装验证失败，请检查错误信息${NC}"
    exit 1
fi