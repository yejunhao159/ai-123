/**
 * 用户选择处理器 - 处理用户对教师团队的各种选择
 * @module UserChoiceHandler
 */

class UserChoiceHandler {
  constructor(eduSystem) {
    this.eduSystem = eduSystem;
    this.allTeachers = {
      'ai-class-advisor': { name: '班主任', emoji: '👩‍🏫', description: '学习规划和进度管理' },
      'story-teller': { name: '故事讲述者', emoji: '📖', description: '生动解释和概念类比' },
      'skill-coach': { name: '技能教练', emoji: '💪', description: '实践指导和代码练习' },
      'confusion-detective': { name: '困惑侦探', emoji: '🔍', description: '问题诊断和错误分析' },
      'task-decomposer': { name: '任务分解专家', emoji: '🧩', description: '复杂任务拆解' },
      'achievement-designer': { name: '成就设计师', emoji: '🏆', description: '目标设定和激励' },
      'experience-accumulator': { name: '经验积累官', emoji: '📚', description: '知识总结和复习' }
    };
  }

  /**
   * 处理用户选择
   */
  async handleChoice(choice, context = {}) {
    switch (choice.action) {
      case 'continue_primary':
        return this.continueWithPrimary(context);
      
      case 'show_all_teachers':
        return this.showAllTeachers(context);
      
      case 'team_mode':
        return this.switchToTeamMode(context);
      
      default:
        // 处理 switch_to_xxx 格式的选择
        if (choice.action.startsWith('switch_to_')) {
          const roleId = choice.action.replace('switch_to_', '');
          return this.switchToRole(roleId, context);
        }
        
        return this.handleUnknownChoice(choice, context);
    }
  }

  /**
   * 继续当前主要教师
   */
  continueWithPrimary(context) {
    return {
      success: true,
      action: 'continue',
      message: '好的，让我们继续当前的学习节奏...',
      nextStep: 'continue_conversation'
    };
  }

  /**
   * 显示所有可选教师
   */
  showAllTeachers(context) {
    const teacherList = Object.entries(this.allTeachers).map(([roleId, teacher]) => ({
      roleId,
      name: teacher.name,
      emoji: teacher.emoji,
      description: teacher.description,
      action: `select_${roleId}`,
      available: true
    }));

    return {
      success: true,
      mode: 'teacher-selection',
      data: {
        title: '🎓 选择你的专属老师',
        subtitle: '每位老师都有独特的教学风格，选择最适合你的！',
        teachers: teacherList,
        quickActions: [
          {
            label: '让系统推荐',
            action: 'auto_recommend',
            description: '基于当前情况自动选择最合适的老师'
          },
          {
            label: '回到团队模式',
            action: 'back_to_team',
            description: '听听所有老师的建议'
          }
        ]
      }
    };
  }

  /**
   * 切换到指定角色
   */
  async switchToRole(roleId, context) {
    if (!this.allTeachers[roleId]) {
      return {
        success: false,
        error: `未知的教师角色: ${roleId}`
      };
    }

    const teacher = this.allTeachers[roleId];
    const response = await this.eduSystem.executeWithRole(roleId, context.message, context.config);

    return {
      success: true,
      mode: 'role-switched',
      data: {
        switchMessage: `✅ 已切换到 ${teacher.emoji} ${teacher.name}`,
        description: teacher.description,
        ...response.data,
        quickSwitch: this.generateQuickSwitchOptions(roleId)
      }
    };
  }

  /**
   * 切换回团队模式
   */
  async switchToTeamMode(context) {
    const teamResponse = await this.eduSystem.execute({
      message: context.message,
      config: context.config,
      studentId: context.studentId
    });

    return {
      success: true,
      mode: 'back-to-team',
      data: {
        switchMessage: '🔄 已切换回教师团队模式',
        ...teamResponse.data
      }
    };
  }

  /**
   * 生成快速切换选项
   */
  generateQuickSwitchOptions(currentRoleId) {
    const otherTeachers = Object.entries(this.allTeachers)
      .filter(([roleId]) => roleId !== currentRoleId)
      .slice(0, 3) // 只显示3个选项
      .map(([roleId, teacher]) => ({
        roleId,
        name: teacher.name,
        emoji: teacher.emoji,
        action: `quick_switch_${roleId}`
      }));

    return {
      title: '快速切换到其他老师',
      options: otherTeachers,
      showAll: {
        label: '查看所有老师',
        action: 'show_all_teachers'
      }
    };
  }

  /**
   * 处理未知选择
   */
  handleUnknownChoice(choice, context) {
    return {
      success: false,
      error: '抱歉，我不理解这个选择',
      suggestion: '请尝试其他选项或重新开始对话',
      availableActions: [
        'continue_primary',
        'show_all_teachers', 
        'team_mode',
        'switch_to_[role_id]'
      ]
    };
  }

  /**
   * 解析用户的自然语言选择
   */
  parseNaturalChoice(message) {
    const messageLower = message.toLowerCase();
    
    // 角色名称映射
    const roleMapping = {
      '班主任': 'ai-class-advisor',
      '故事': 'story-teller',
      '故事讲述者': 'story-teller', 
      '教练': 'skill-coach',
      '技能教练': 'skill-coach',
      '侦探': 'confusion-detective',
      '困惑侦探': 'confusion-detective',
      '分解': 'task-decomposer',
      '任务分解': 'task-decomposer',
      '成就': 'achievement-designer',
      '成就设计师': 'achievement-designer',
      '积累': 'experience-accumulator',
      '经验积累': 'experience-accumulator'
    };

    // 查找角色关键词
    for (const [keyword, roleId] of Object.entries(roleMapping)) {
      if (messageLower.includes(keyword)) {
        return {
          action: `switch_to_${roleId}`,
          role: roleId,
          confidence: 0.8
        };
      }
    }

    // 其他常见选择
    if (messageLower.includes('继续') || messageLower.includes('不换')) {
      return { action: 'continue_primary', confidence: 0.9 };
    }

    if (messageLower.includes('看看') || messageLower.includes('所有') || messageLower.includes('选择')) {
      return { action: 'show_all_teachers', confidence: 0.9 };
    }

    if (messageLower.includes('团队') || messageLower.includes('一起')) {
      return { action: 'team_mode', confidence: 0.8 };
    }

    return null; // 无法识别
  }

  /**
   * 生成用户友好的选择提示
   */
  generateUserPrompt(teamResponse) {
    const primaryTeacher = teamResponse.data.primaryTeacher;
    const alternatives = teamResponse.data.otherTeachers.slice(0, 2);
    
    return {
      prompt: `🎯 ${primaryTeacher.name}建议：${primaryTeacher.message.substring(0, 50)}...\n\n你可以：`,
      options: [
        `💬 继续听${primaryTeacher.name}详细说明`,
        ...alternatives.map(teacher => `👂 听听${teacher.name}的想法`),
        `👥 查看所有老师的建议`,
        `✍️ 直接输入你想要的，比如："我想听故事" 或 "找班主任"`
      ],
      quickCommands: {
        'c': 'continue_primary',
        '1': `switch_to_${alternatives[0]?.role}`,
        '2': `switch_to_${alternatives[1]?.role}`,
        'a': 'show_all_teachers'
      }
    };
  }
}

module.exports = UserChoiceHandler;