#!/bin/bash

# PromptX 教育AI系统打包脚本
# 创建可分发的压缩包

set -e

VERSION="3.0.0"
PACKAGE_NAME="promptx-edu-ai-system-v${VERSION}"

echo "🎯 开始打包 PromptX 教育AI系统 v${VERSION}"

# 获取脚本目录
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_DIR"

# 创建临时打包目录
TEMP_DIR="/tmp/${PACKAGE_NAME}"
rm -rf "$TEMP_DIR"
mkdir -p "$TEMP_DIR"

echo "📦 复制文件到临时目录..."

# 复制所有必要文件
cp -r .promptx "$TEMP_DIR/"
cp -r scripts "$TEMP_DIR/"
cp -r examples "$TEMP_DIR/"
cp README.md "$TEMP_DIR/"
cp LICENSE "$TEMP_DIR/"
cp promptx-package.json "$TEMP_DIR/"

# 创建版本信息文件
cat > "$TEMP_DIR/VERSION" << EOF
PromptX 智能教育AI系统
Version: ${VERSION}
Build Date: $(date)
Author: deepractice.ai
EOF

# 创建校验文件
cd "$TEMP_DIR"
find . -type f -exec md5sum {} \; > CHECKSUMS.md5

echo "🗜️ 创建压缩包..."

# 创建不同格式的压缩包
cd /tmp

# ZIP格式（兼容性最好）
zip -r "${PACKAGE_NAME}.zip" "$PACKAGE_NAME/" > /dev/null
echo "✅ 创建了 ${PACKAGE_NAME}.zip"

# TAR.GZ格式（Linux/Mac推荐）
tar -czf "${PACKAGE_NAME}.tar.gz" "$PACKAGE_NAME/"
echo "✅ 创建了 ${PACKAGE_NAME}.tar.gz"

# 移动到项目目录
mv "${PACKAGE_NAME}.zip" "$PROJECT_DIR/"
mv "${PACKAGE_NAME}.tar.gz" "$PROJECT_DIR/"

# 清理临时目录
rm -rf "$TEMP_DIR"

echo ""
echo "🎉 打包完成！"
echo ""
echo "📦 生成的包文件："
echo "  • ${PACKAGE_NAME}.zip (适用于Windows)"
echo "  • ${PACKAGE_NAME}.tar.gz (适用于Linux/Mac)"
echo ""
echo "📋 包含内容："
echo "  • 7个专业教学角色"
echo "  • edu-ai-system统一工具"
echo "  • 完整的安装脚本"
echo "  • 使用文档和示例"
echo ""
echo "🚀 用户可以下载并解压后运行 ./scripts/install.sh 安装"