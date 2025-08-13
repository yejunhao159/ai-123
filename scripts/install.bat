@echo off
REM PromptX 教育AI系统安装脚本 (Windows版)
REM Version: 3.0.0
REM Author: deepractice.ai

setlocal enabledelayedexpansion

echo.
echo ============================================
echo.
echo     PromptX 智能教育AI系统
echo        Version 3.0.0
echo        Powered by deepractice.ai
echo.
echo ============================================
echo.

REM 检查当前目录
echo [检查] 验证安装环境...

if not exist ".promptx" (
    echo [错误] 当前目录不是PromptX项目
    echo [提示] 请先在你的AI工具中执行 'promptx_init' 初始化项目
    pause
    exit /b 1
)

echo [成功] 检测到PromptX项目

REM 确认安装
echo.
echo 即将安装以下内容：
echo   - 7个专业教学角色
echo   - edu-ai-system统一入口工具  
echo   - 技术全景知识库
echo   - 角色交接协议
echo.
set /p CONFIRM=是否继续安装？(Y/N): 

if /i not "%CONFIRM%"=="Y" (
    echo 安装已取消
    pause
    exit /b 0
)

echo.
echo [开始] 安装教育AI系统...

REM 获取脚本目录
set SCRIPT_DIR=%~dp0
set SOURCE_DIR=%SCRIPT_DIR%..

REM 创建必要的目录
if not exist ".promptx\resource\roles" mkdir ".promptx\resource\roles"
if not exist ".promptx\resource\tools" mkdir ".promptx\resource\tools"
if not exist ".promptx\resource\knowledge" mkdir ".promptx\resource\knowledge"
if not exist ".promptx\teaching" mkdir ".promptx\teaching"

REM 复制角色文件
echo [安装] 复制角色文件...
xcopy /E /I /Y "%SOURCE_DIR%\.promptx\resource\roles\*" ".promptx\resource\roles\" >nul 2>&1

REM 复制工具文件
echo [安装] 复制工具文件...
copy /Y "%SOURCE_DIR%\.promptx\resource\tools\edu-ai-system.tool.js" ".promptx\resource\tools\" >nul 2>&1
copy /Y "%SOURCE_DIR%\.promptx\resource\tools\edu-ai-system.manual.md" ".promptx\resource\tools\" >nul 2>&1

REM 复制知识库
echo [安装] 复制知识库...
copy /Y "%SOURCE_DIR%\.promptx\resource\knowledge\tech-landscape.knowledge.md" ".promptx\resource\knowledge\" >nul 2>&1

REM 验证安装
echo [验证] 检查安装结果...

set INSTALL_SUCCESS=1

if not exist ".promptx\resource\tools\edu-ai-system.tool.js" (
    echo [错误] 工具文件安装失败
    set INSTALL_SUCCESS=0
)

if not exist ".promptx\resource\roles\ai-class-advisor" (
    echo [错误] 角色文件安装失败
    set INSTALL_SUCCESS=0
)

if %INSTALL_SUCCESS%==1 (
    echo.
    echo ============================================
    echo            安装成功！
    echo ============================================
    echo.
    echo 快速开始：
    echo.
    echo 1. 在你的AI工具中告诉AI：
    echo    "请执行 promptx_init 刷新资源"
    echo.
    echo 2. 然后开始使用：
    echo    "请使用 @tool://edu-ai-system 帮我学习编程"
    echo.
    echo 祝你学习愉快！
    echo.
) else (
    echo.
    echo [错误] 安装失败，请检查错误信息
)

pause