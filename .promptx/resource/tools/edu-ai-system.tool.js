/**
 * 统一教育AI系统入口 - 智能路由到最合适的学习路径
 * 
 * @tool://edu-ai-system
 * @version 2.0.0
 * @author deepractice.ai
 */

const fs = require('fs');
const path = require('path');
const TeacherTeamAnalyzer = require('./teacher-team-analyzer');
const UserChoiceHandler = require('./user-choice-handler');

module.exports = {
  // 初始化教师团队分析器和用户选择处理器
  teacherTeam: new TeacherTeamAnalyzer(),
  userChoiceHandler: null, // 延迟初始化，避免循环依赖
  
  // 初始化方法
  init() {
    if (!this.userChoiceHandler) {
      const UserChoiceHandler = require('./user-choice-handler');
      this.userChoiceHandler = new UserChoiceHandler(this);
    }
  },
  
  getDependencies() {
    return [];
  },
  
  // 增强版教案管理 - 实现Experience Chain和状态持久化
  lessonManager: {
    dir: '.promptx/teaching',
    memoryDir: '.promptx/memory',
    
    ensureDir() {
      if (!fs.existsSync(this.dir)) {
        fs.mkdirSync(this.dir, { recursive: true });
      }
      if (!fs.existsSync(this.memoryDir)) {
        fs.mkdirSync(this.memoryDir, { recursive: true });
      }
    },
    
    createLesson(studentId, objective) {
      this.ensureDir();
      const sessionId = `session-${Date.now()}`;
      const lesson = {
        meta: {
          sessionId,
          studentId,
          startTime: new Date().toISOString(),
          objective,
          currentRole: 'ai-class-advisor'
        },
        cognitiveState: {
          currentZPD: 3,
          masteredConcepts: [],
          strugglingPoints: [],
          learningStyle: 'mixed',
          confusionLevel: 0,
          readyForPractice: false
        },
        experienceChain: [],
        transitionRules: {
          'confusion_high': 'confusion-detective',
          'concept_new': 'story-teller',
          'practice_ready': 'skill-coach',
          'task_done': 'achievement-designer'
        }
      };
      
      fs.writeFileSync(
        path.join(this.dir, `${sessionId}.json`),
        JSON.stringify(lesson, null, 2)
      );
      
      return lesson;
    },
    
    loadLesson(sessionId) {
      const filePath = path.join(this.dir, `${sessionId}.json`);
      if (fs.existsSync(filePath)) {
        return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      }
      return null;
    },
    
    getLatestLesson(studentId) {
      this.ensureDir();
      const files = fs.readdirSync(this.dir)
        .filter(f => f.endsWith('.json'))
        .sort((a, b) => b.localeCompare(a));
      
      for (const file of files) {
        const lesson = this.loadLesson(file.replace('.json', ''));
        if (lesson && lesson.meta.studentId === studentId) {
          return lesson;
        }
      }
      return null;
    },
    
    addExperience(sessionId, experience) {
      const lesson = this.loadLesson(sessionId);
      if (lesson) {
        // Experience Chain实现
        const enhancedExperience = {
          ...experience,
          id: `exp-${Date.now()}`,
          timestamp: new Date().toISOString(),
          previous: lesson.experienceChain.length > 0 ? 
            lesson.experienceChain[lesson.experienceChain.length - 1].id : null,
          zpd_assessment: this.assessZPD(experience, lesson.experienceChain),
          confidence_level: this.calculateConfidence(experience, lesson.cognitiveState)
        };
        
        lesson.experienceChain.push(enhancedExperience);
        
        // 更新认知状态
        this.updateCognitiveState(lesson, enhancedExperience);
        
        fs.writeFileSync(
          path.join(this.dir, `${sessionId}.json`),
          JSON.stringify(lesson, null, 2)
        );
        
        return enhancedExperience;
      }
    },
    
    // ZPD评估算法
    assessZPD(experience, experienceChain) {
      if (experienceChain.length === 0) return 3; // 默认中级
      
      const recent = experienceChain.slice(-3); // 最近3次经验
      const successRate = recent.filter(exp => exp.success).length / recent.length;
      
      if (successRate > 0.8) return Math.min(10, recent[recent.length-1].zpd_level + 1);
      if (successRate < 0.3) return Math.max(1, recent[recent.length-1].zpd_level - 1);
      return recent[recent.length-1].zpd_level || 3;
    },
    
    // 置信度计算
    calculateConfidence(experience, cognitiveState) {
      let confidence = 0.5; // 基础置信度
      
      // 基于理解深度
      if (experience.understanding === 'deep') confidence += 0.3;
      else if (experience.understanding === 'shallow') confidence -= 0.2;
      
      // 基于实践成功率
      if (experience.practice_success) confidence += 0.2;
      
      // 基于困惑程度
      confidence -= (cognitiveState.confusionLevel / 100) * 0.3;
      
      return Math.max(0, Math.min(1, confidence));
    },
    
    // 认知状态更新
    updateCognitiveState(lesson, experience) {
      const state = lesson.cognitiveState;
      
      // 更新掌握概念
      if (experience.new_concept && experience.understanding !== 'confused') {
        state.masteredConcepts.push(experience.new_concept);
      }
      
      // 更新困惑点
      if (experience.confusion_point) {
        if (!state.strugglingPoints.includes(experience.confusion_point)) {
          state.strugglingPoints.push(experience.confusion_point);
        }
      }
      
      // 更新困惑度
      if (experience.confusion_level !== undefined) {
        state.confusionLevel = experience.confusion_level;
      }
      
      // 更新ZPD
      state.currentZPD = experience.zpd_assessment || state.currentZPD;
      
      // 判断是否准备实践
      state.readyForPractice = state.confusionLevel < 30 && 
                              experience.understanding === 'clear';
    }
  },

  getMetadata() {
    return {
      name: 'edu-ai-system',
      description: 'PromptX智能教育AI系统 - 唯一入口，7角色协作，SLAN认知引擎',
      version: '3.0.0',
      category: 'education',
      author: 'deepractice.ai',
      tags: ['education', 'ai-team', 'okr', 'slan', 'unified'],
      manual: '@manual://edu-ai-system',
      aliases: ['edu-ai-quickstart', 'edu-workflow-launcher', 'software-engineering-edu']
    };
  },

  getSchema() {
    return {
      type: 'object',
      properties: {
        intent: {
          type: 'string',
          description: '用户意图（可选，系统会智能识别）',
          enum: ['explore', 'learn', 'continue', 'assess', 'help']
        },
        
        message: {
          type: 'string',
          description: '用户的自然语言描述（可选）'
        },
        
        config: {
          type: 'object',
          description: '高级配置（可选）',
          properties: {
            skipIntro: { type: 'boolean', default: false },
            fastMode: { type: 'boolean', default: false }
          }
        }
      }
    };
  },

  validate() {
    return { valid: true, errors: [] };
  },

  async execute(params = {}) {
    // 确保初始化
    this.init();
    
    const { intent, message, config = {}, selectedRole, userChoice, studentId = 'default' } = params;
    
    // 如果是用户选择操作，处理选择
    if (userChoice) {
      const context = { message, config, studentId };
      return this.userChoiceHandler.handleChoice(userChoice, context);
    }
    
    // 如果用户明确选择了角色，直接执行
    if (selectedRole) {
      return this.executeWithRole(selectedRole, message, config);
    }
    
    // 尝试从自然语言中解析用户选择
    if (message) {
      const naturalChoice = this.userChoiceHandler.parseNaturalChoice(message);
      if (naturalChoice && naturalChoice.confidence > 0.7) {
        const context = { message, config, studentId };
        return this.userChoiceHandler.handleChoice(naturalChoice, context);
      }
    }
    
    // 获取上下文信息
    const context = this.buildContext(message, config, studentId);
    
    // 使用教师团队模式分析
    const teamAnalysis = await this.teacherTeam.analyzeInParallel(message || '', context);
    
    // 智能识别用户意图（保留原有逻辑作为补充）
    const detectedIntent = this.detectIntent(intent, message);
    
    // 构建教师团队响应
    const teamResponse = this.buildTeacherTeamResponse(teamAnalysis, detectedIntent, context);
    
    // 添加用户友好的交互提示
    teamResponse.data.interactionHint = this.userChoiceHandler.generateUserPrompt(teamResponse);
    
    return teamResponse;
  },

  /**
   * 智能识别用户意图
   */
  detectIntent(explicitIntent, message) {
    // 如果有明确意图，直接使用
    if (explicitIntent) {
      return explicitIntent;
    }
    
    // 根据消息内容智能识别
    if (!message) {
      // 无参数调用，默认探索模式
      return 'explore';
    }
    
    const lowerMessage = message.toLowerCase();
    
    // 关键词匹配
    if (lowerMessage.includes('不知道') || lowerMessage.includes('选什么') || 
        lowerMessage.includes('了解') || lowerMessage.includes('介绍')) {
      return 'explore';
    }
    
    if (lowerMessage.includes('继续') || lowerMessage.includes('上次')) {
      return 'continue';
    }
    
    if (lowerMessage.includes('进度') || lowerMessage.includes('评估')) {
      return 'assess';
    }
    
    if (lowerMessage.includes('学') || lowerMessage.includes('开始')) {
      return 'start';
    }
    
    return 'help';
  },

  /**
   * 探索技术全景 - 集成教案系统
   */
  exploreTechLandscape(studentId = 'default') {
    // 创建新教案
    const lesson = this.lessonManager.createLesson(studentId, '探索技术全景');
    
    return {
      success: true,
      data: {
        message: "🗺️ 准备展示软件开发技术全景图",
        mode: "tech-exploration",
        sessionId: lesson.meta.sessionId,
        
        workflow: {
          step1: {
            description: "技术全景介绍阶段",
            action: "AI班主任将为你介绍完整的技术栈地图",
            content: {
              overview: "软件开发的各个方向和技术栈",
              comparison: "不同技术的优劣对比",
              suggestions: "基于背景的个性化建议"
            }
          },
          
          step2: {
            description: "互动探索阶段",
            questions: [
              "你对哪个方向最感兴趣？",
              "你的背景是什么（零基础/转行/提升）？",
              "你希望达到什么目标？",
              "你每天有多少学习时间？"
            ]
          },
          
          step3: {
            description: "OKR制定阶段",
            action: "基于你的选择和了解，制定个性化OKR"
          }
        },
        
        lessonPlan: {
          sessionId: lesson.meta.sessionId,
          currentState: lesson.cognitiveState,
          experienceChain: lesson.experienceChain
        },
        
        instructions: {
          forAI: {
            step1: {
              tool: "promptx_action",
              params: { role: "ai-class-advisor" },
              purpose: "激活增强版AI班主任（含技术全景知识）",
              onActivation: `读取教案: ${lesson.meta.sessionId}`
            },
            step2: {
              action: "PRESENT_TECH_LANDSCAPE",
              resource: "@knowledge://tech-landscape",
              approach: "渐进式介绍，从宏观到具体"
            },
            step3: {
              action: "INTERACTIVE_DIALOGUE",
              purpose: "了解用户背景和兴趣"
            },
            step4: {
              action: "OKR_PLANNING",
              based_on: "用户的理解和选择",
              saveToLesson: true
            },
            step5: {
              action: "RECORD_EXPERIENCE",
              description: "每次交互后更新教案的experienceChain"
            }
          }
        },
        
        userGuidance: {
          title: "🚀 开启你的编程学习之旅",
          tips: [
            "不用担心选择困难，我会帮你理解每个选项",
            "可以随时提问，没有愚蠢的问题",
            "选择可以调整，重要的是开始"
          ],
          expectation: "接下来15-20分钟，你将了解软件开发的全貌"
        }
      }
    };
  },

  /**
   * 开始学习 - 整合原有功能
   */
  startLearning(config) {
    const skipIntro = config.skipIntro || false;
    
    return {
      success: true,
      data: {
        message: "🎓 启动个性化学习系统",
        mode: "learning",
        
        workflow: skipIntro ? {
          // 快速模式：跳过介绍直接开始
          step1: {
            description: "快速启动学习",
            action: "基于默认配置或历史记录开始"
          }
        } : {
          // 完整模式：包含技术探索
          step1: {
            description: "技术全景了解",
            redirect: "explore"
          },
          step2: {
            description: "OKR制定",
            action: "基于理解制定目标"
          },
          step3: {
            description: "开始学习",
            action: "7角色协作教学"
          }
        },
        
        instructions: {
          forAI: {
            condition: skipIntro ? "QUICK_START" : "FULL_PROCESS",
            quickStart: {
              tool: "promptx_recall",
              params: { role: "ai-class-advisor", query: "OKR" },
              fallback: "如果没有OKR，转到explore模式"
            },
            fullProcess: {
              redirect: "exploreTechLandscape",
              then: "继续正常学习流程"
            }
          }
        }
      }
    };
  },

  /**
   * 继续学习 - 基于教案恢复
   */
  continueLearning(topic, studentId = 'default') {
    // 加载最近的教案
    const lesson = this.lessonManager.getLatestLesson(studentId);
    
    if (!lesson) {
      // 没有找到教案，转到探索模式
      return this.exploreTechLandscape(studentId);
    }
    
    // 基于教案状态决定下一个角色
    const nextRole = this.suggestNextRole(lesson);
    
    return {
      success: true,
      data: {
        message: "📚 继续上次的学习",
        mode: "continue",
        topic: topic || lesson.meta.objective,
        sessionId: lesson.meta.sessionId,
        
        lessonStatus: {
          objective: lesson.meta.objective,
          currentZPD: lesson.cognitiveState.currentZPD,
          masteredConcepts: lesson.cognitiveState.masteredConcepts,
          lastRole: lesson.meta.currentRole,
          experienceCount: lesson.experienceChain.length,
          suggestedNextRole: nextRole
        },
        
        instructions: {
          forAI: {
            step1: {
              action: "LOAD_LESSON",
              sessionId: lesson.meta.sessionId,
              description: "加载教案状态和经验链"
            },
            step2: {
              tool: "promptx_action",
              params: { role: nextRole },
              purpose: `激活${nextRole}继续教学`
            },
            step3: {
              action: "RESUME_WITH_CONTEXT",
              context: lesson.experienceChain.slice(-3),
              cognitiveState: lesson.cognitiveState
            }
          }
        }
      }
    };
  },

  /**
   * 评估进度
   */
  assessProgress() {
    return {
      success: true,
      data: {
        message: "📊 学习进度评估",
        mode: "assessment",
        
        instructions: {
          forAI: {
            step1: {
              tool: "promptx_recall",
              params: { role: "ai-class-advisor", query: "progress" }
            },
            step2: {
              action: "GENERATE_REPORT",
              include: ["完成度", "掌握程度", "下一步建议"]
            }
          }
        }
      }
    };
  },

  /**
   * 显示帮助
   */
  showHelp() {
    return {
      success: true,
      data: {
        message: "💡 教育AI系统使用指南",
        mode: "help",
        
        usage: {
          "探索技术": "不知道学什么？让我介绍技术全景",
          "开始学习": "已有目标？直接开始个性化学习",
          "继续学习": "继续上次的学习进度",
          "查看进度": "评估学习成果和掌握程度"
        },
        
        examples: [
          { 
            scenario: "完全新手",
            command: "@tool://edu-ai-system",
            effect: "展示技术全景 → 帮助选择 → 制定计划"
          },
          {
            scenario: "有明确目标",
            command: '@tool://edu-ai-system {"message": "我想学React"}',
            effect: "了解React → 评估基础 → 开始学习"
          },
          {
            scenario: "老用户",
            command: '@tool://edu-ai-system {"intent": "continue"}',
            effect: "检索进度 → 继续学习"
          }
        ],
        
        tips: [
          "第一次使用建议不带参数，让系统引导你",
          "系统会记住你的选择和进度",
          "可以随时切换学习方向"
        ]
      }
    };
  },
  
  /**
   * 基于教案状态智能选择下一个角色
   */
  suggestNextRole(lesson) {
    const state = lesson.cognitiveState;
    
    // 高困惑度
    if (state.confusionLevel > 0.7) {
      return 'confusion-detective';
    }
    
    // 准备实践
    if (state.readyForPractice) {
      return 'skill-coach';
    }
    
    // 每5次交互总结一次
    if (lesson.experienceChain.length > 0 && 
        lesson.experienceChain.length % 5 === 0) {
      return 'experience-accumulator';
    }
    
    // 检查最后的经验
    const lastExp = lesson.experienceChain.slice(-1)[0];
    if (lastExp) {
      if (lastExp.nextRole) {
        return lastExp.nextRole;
      }
      
      // 基于动作类型
      if (lastExp.action === '引入新概念') {
        return 'story-teller';
      }
      if (lastExp.action === '完成练习') {
        return 'achievement-designer';
      }
    }
    
    // 默认
    return 'ai-class-advisor';
  },

  /**
   * 构建上下文信息
   */
  buildContext(message, config, studentId) {
    const latestLesson = this.lessonManager.getLatestLesson(studentId);
    
    return {
      previousRole: latestLesson?.meta?.currentRole,
      learningPhase: this.detectLearningPhase(message, latestLesson),
      sessionExists: !!latestLesson,
      studentProfile: this.buildStudentProfile(latestLesson),
      timeOfDay: new Date().getHours(),
      ...config
    };
  },

  /**
   * 检测学习阶段
   */
  detectLearningPhase(message, lesson) {
    if (!lesson) return 'exploring';
    
    const messageLower = (message || '').toLowerCase();
    const experienceCount = lesson.experienceChain?.length || 0;
    
    if (experienceCount === 0) return 'exploring';
    if (experienceCount < 3) return 'learning';
    if (messageLower.includes('练习') || messageLower.includes('实践')) return 'practicing';
    if (experienceCount > 10) return 'mastering';
    
    return 'learning';
  },

  /**
   * 构建学生画像
   */
  buildStudentProfile(lesson) {
    if (!lesson) return { level: 'beginner', preferences: [] };
    
    return {
      level: lesson.cognitiveState?.currentZPD || 3,
      masteredConcepts: lesson.cognitiveState?.masteredConcepts || [],
      strugglingPoints: lesson.cognitiveState?.strugglingPoints || [],
      learningStyle: lesson.cognitiveState?.learningStyle || 'mixed'
    };
  },

  /**
   * 构建教师团队响应
   */
  buildTeacherTeamResponse(teamAnalysis, detectedIntent, context) {
    return {
      success: true,
      mode: 'teacher-team',
      data: {
        // 主要回答
        primaryTeacher: {
          role: teamAnalysis.primary.role,
          name: teamAnalysis.primary.roleName,
          confidence: teamAnalysis.primary.confidence,
          message: this.generateRoleResponse(teamAnalysis.primary.role, detectedIntent, context),
          reason: teamAnalysis.primary.reason
        },
        
        // 其他教师的建议
        otherTeachers: teamAnalysis.alternatives.map(alt => ({
          role: alt.role,
          name: alt.roleName,
          preview: alt.preview,
          confidence: alt.confidence,
          action: `switch_to_${alt.role}`
        })),
        
        // 团队分析元信息
        teamInsights: {
          consensusLevel: teamAnalysis.teamThinking.consensusLevel,
          diversityScore: teamAnalysis.teamThinking.diversityScore,
          totalAnalyzed: teamAnalysis.teamThinking.totalAnalyzed
        },

        // 用户选择提示
        userChoices: [
          {
            label: `继续听${teamAnalysis.primary.roleName}说`,
            action: 'continue_primary',
            default: true
          },
          ...teamAnalysis.alternatives.slice(0, 2).map(alt => ({
            label: `我想听${alt.roleName}的建议`,
            action: `switch_to_${alt.role}`,
            role: alt.role
          })),
          {
            label: '我想自己选择老师',
            action: 'show_all_teachers'
          }
        ],

        // 会话信息
        session: context.sessionExists ? {
          hasHistory: true,
          phase: context.learningPhase,
          previousRole: context.previousRole
        } : null
      }
    };
  },

  /**
   * 根据角色生成具体回答
   */
  generateRoleResponse(roleId, intent, context) {
    // 基础回答模板，实际使用时应该调用各角色的具体逻辑
    const responses = {
      'ai-class-advisor': this.generateAdvisorResponse(intent, context),
      'story-teller': this.generateStoryResponse(intent, context),
      'skill-coach': this.generateCoachResponse(intent, context),
      'confusion-detective': this.generateDetectiveResponse(intent, context),
      'task-decomposer': this.generateDecomposerResponse(intent, context),
      'achievement-designer': this.generateAchievementResponse(intent, context),
      'experience-accumulator': this.generateAccumulatorResponse(intent, context)
    };
    
    return responses[roleId] || '我来帮助你学习！';
  },

  /**
   * 班主任响应生成
   */
  generateAdvisorResponse(intent, context) {
    if (intent === 'explore') {
      return '你好！作为你的班主任，我来帮你规划整个学习路径。让我先了解一下你的背景和目标...';
    }
    if (intent === 'start') {
      return '很好！既然你有明确的学习目标，我来为你制定一个系统的学习计划...';
    }
    return '作为班主任，我负责整体协调你的学习进度。有什么需要规划的吗？';
  },

  /**
   * 故事讲述者响应生成  
   */
  generateStoryResponse(intent, context) {
    return '让我用一个生动的故事来解释这个概念，这样你就能更好地理解了...';
  },

  /**
   * 技能教练响应生成
   */
  generateCoachResponse(intent, context) {
    return '来，让我们通过实际的代码练习来掌握这个技能。我会手把手教你...';
  },

  /**
   * 困惑侦探响应生成
   */
  generateDetectiveResponse(intent, context) {
    return '我发现你可能在某个地方遇到了困惑。让我来帮你分析问题出在哪里...';
  },

  /**
   * 任务分解专家响应生成
   */
  generateDecomposerResponse(intent, context) {
    return '这个任务看起来很复杂，让我把它分解成几个小步骤，这样就容易多了...';
  },

  /**
   * 成就设计师响应生成
   */
  generateAchievementResponse(intent, context) {
    return '太棒了！你的进步很明显，让我来设计一些小目标激励你继续前进...';
  },

  /**
   * 经验积累官响应生成
   */
  generateAccumulatorResponse(intent, context) {
    return '让我们来总结一下你已经掌握的知识点，并规划后续的复习计划...';
  },

  /**
   * 直接执行指定角色
   */
  executeWithRole(roleId, message, config) {
    const context = this.buildContext(message, config);
    const intent = this.detectIntent(null, message);
    
    return {
      success: true,
      mode: 'single-teacher',
      data: {
        teacher: {
          role: roleId,
          name: this.teacherTeam.teachers[roleId]?.name || roleId,
          message: this.generateRoleResponse(roleId, intent, context)
        },
        switchBackOption: {
          label: '我想听听其他老师的建议',
          action: 'team_mode'
        }
      }
    };
  }
};