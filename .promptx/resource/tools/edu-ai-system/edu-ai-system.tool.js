/**
 * 🎓 PromptX智能教育AI系统 v3.2.0
 * 基于SLAN认知架构的7角色协作教学系统
 * 集成最新教育学理论：建构主义、ZPD、社会认知理论
 * 
 * 更新日志 v3.2.0:
 * - 重构意图识别系统为10类科学体系
 * - 新增意图冲突解决器
 * - 强化自动教案更新机制
 * - 完善学习档案管理
 * - 集成教育学理论实践
 */

const fs = require('fs').promises;
const path = require('path');

class EduAISystem {
  constructor() {
    this.version = "3.3.0";
    this.sessions = new Map();
    this.intentRecognizer = new IntentRecognizer();
    this.conflictResolver = new IntentConflictResolver();
    this.roleRouter = new RoleRouter();
    this.lessonPlanManager = new LessonPlanManager();
    this.portfolioManager = new PortfolioManager();
    this.learningTheoryEngine = new LearningTheoryEngine();
    
    // 新增：约束和边界管理
    this.boundaryManager = new LearningBoundaryManager();
    this.stateGuard = new LearningStateGuard();
    
    // SLAN认知引擎
    this.cognitiveEngine = new SLANCognitiveEngine();
  }

  async processLearningRequest(params) {
    const { intent = "learn", context = {}, config = {} } = params;
    const sessionId = context.sessionId || this.generateSessionId();
    
    try {
      // 0. 请求完整性验证（新增）
      const validation = this.stateGuard.validateRequest(intent);
      if (!validation.isValid) {
        return this.handleInvalidRequest(validation, sessionId);
      }
      
      // 0.5 主题相关性检测（新增）
      const session = this.sessions.get(sessionId) || { currentTopic: '编程学习' };
      const relevance = await this.boundaryManager.checkRelevance(intent, session);
      
      if (!relevance.isRelevant && relevance.deviationType) {
        const redirect = this.boundaryManager.generateRedirect(relevance, session);
        if (redirect && !redirect.shouldContinue) {
          return {
            success: true,
            sessionId,
            type: 'redirect',
            message: redirect.message,
            suggestion: this.boundaryManager.manageFocus(session)
          };
        }
      }
      
      // 1. 意图识别与分析（升级版）
      const recognizedIntents = await this.intentRecognizer.analyzeMultiple(intent, context);
      
      // 2. 意图冲突解决（新增）
      const resolvedIntent = await this.conflictResolver.resolve(recognizedIntents);
      
      // 3. 初始化或恢复学习会话
      const session = await this.initializeSession(sessionId, resolvedIntent);
      
      // 4. 应用教育学理论（新增）
      const pedagogicalStrategy = await this.learningTheoryEngine.determineStrategy(
        session, 
        resolvedIntent
      );
      
      // 5. SLAN认知决策
      const cognitiveState = await this.cognitiveEngine.process(
        session, 
        resolvedIntent,
        pedagogicalStrategy
      );
      
      // 6. 角色路由决策（增强版）
      const targetRole = await this.roleRouter.determineRole(
        cognitiveState, 
        session,
        resolvedIntent
      );
      
      // 7. 创建学习档案文件夹（增强版）
      await this.portfolioManager.createSessionFolder(session, config);
      
      // 8. 自动更新教案（增强版）
      await this.lessonPlanManager.autoUpdate(session, cognitiveState, targetRole);
      
      // 9. 执行教学任务
      const result = await this.executeTeaching(
        targetRole, 
        session, 
        cognitiveState,
        pedagogicalStrategy
      );
      
      // 10. 记录学习经验
      await this.recordExperience(session, result);
      
      return {
        success: true,
        sessionId,
        intent: resolvedIntent,
        role: targetRole,
        result,
        nextSteps: this.generateNextSteps(session, result)
      };
      
    } catch (error) {
      return this.handleError(error, sessionId);
    }
  }
  
  async initializeSession(sessionId, intent) {
    if (this.sessions.has(sessionId)) {
      const session = this.sessions.get(sessionId);
      session.lastAccessed = new Date();
      return session;
    }
    
    const newSession = {
      id: sessionId,
      createdAt: new Date(),
      lastAccessed: new Date(),
      currentRole: 'ai-class-advisor',
      roleHistory: [],
      experienceChain: [],
      masteredConcepts: [],
      strugglingConcepts: [],
      achievements: [],
      lessonPlan: null,
      portfolioPath: null,
      cognitiveStates: [],
      learningPatterns: {},
      currentTopic: intent.metadata?.topic || '通用学习',
      zpdLevel: 5,
      confidenceLevel: 0.5,
      confusionLevel: 0
    };
    
    this.sessions.set(sessionId, newSession);
    return newSession;
  }
  
  async executeTeaching(targetRole, session, cognitiveState, strategy) {
    // 记录角色切换
    if (session.currentRole !== targetRole.suggestedRole) {
      session.roleHistory.push({
        from: session.currentRole,
        to: targetRole.suggestedRole,
        reason: targetRole.switchReason,
        timestamp: new Date()
      });
      session.currentRole = targetRole.suggestedRole;
    }
    
    // 根据角色和策略执行教学
    const teachingResult = {
      role: targetRole.suggestedRole,
      strategy: strategy.approach,
      content: this.generateTeachingContent(targetRole, strategy),
      interactions: [],
      timestamp: new Date()
    };
    
    return teachingResult;
  }
  
  generateTeachingContent(role, strategy) {
    // 根据角色和策略生成教学内容
    const contentTemplates = {
      'story-teller': {
        'multiple_examples': '让我用3个不同的故事来解释这个概念...',
        'visual_metaphor': '想象一下这样的场景...',
        'step_by_step': '我们一步步来理解...'
      },
      'skill-coach': {
        'guided_practice': '我们一起写代码，我在旁边指导你...',
        'scaffolding': '先从最简单的开始，逐步增加难度...',
        'peer_learning': '看看其他学习者是怎么做的...'
      },
      'confusion-detective': {
        'systematic_diagnosis': '让我们一步步找出问题所在...',
        'error_analysis': '这个错误的根本原因是...',
        'misconception_correction': '很多人都有这个误解，实际上...'
      }
    };
    
    return contentTemplates[role.suggestedRole]?.[strategy.approach] || 
           '让我们开始学习...';
  }
  
  async recordExperience(session, result) {
    const experience = {
      id: `exp-${Date.now()}`,
      timestamp: new Date(),
      role: result.role,
      strategy: result.strategy,
      content: result.content,
      success: true,
      metadata: {}
    };
    
    session.experienceChain.push(experience);
    
    // 保存到文件系统
    if (session.portfolioPath) {
      const expFile = path.join(session.portfolioPath, 'experiences.json');
      await this.saveToFile(expFile, session.experienceChain);
    }
  }
  
  async saveToFile(filePath, data) {
    try {
      await fs.writeFile(filePath, JSON.stringify(data, null, 2));
    } catch (error) {
      console.error('Failed to save file:', error);
    }
  }
  
  generateNextSteps(session, result) {
    const steps = [];
    
    // 基于当前进度生成下一步建议
    if (session.confusionLevel > 0.5) {
      steps.push('建议：切换到故事讲述者获得更多类比解释');
    }
    
    if (session.masteredConcepts.length >= 3) {
      steps.push('建议：开始实践项目巩固所学知识');
    }
    
    if (session.experienceChain.length >= 5) {
      steps.push('建议：进行知识总结和复习');
    }
    
    return steps;
  }
  
  generateSessionId() {
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 19).replace(/[T:]/g, '-');
    const randomStr = Math.random().toString(36).substring(2, 8);
    return `session-${dateStr}-${randomStr}`;
  }
  
  handleError(error, sessionId) {
    return {
      success: false,
      sessionId,
      error: error.message,
      suggestion: '请尝试更明确地表达您的学习需求'
    };
  }
  
  handleInvalidRequest(validation, sessionId) {
    const responses = {
      'BLOCK_AND_RESET': {
        message: '我是专注于编程教育的AI助手。让我们回到学习上来吧！',
        suggestion: '有什么编程概念需要我解释吗？'
      },
      'REINFORCE_ROLE': {
        message: '我的角色是帮助你学习编程。让我们继续探索技术的世界！',
        suggestion: '你想学习哪个编程语言或技术？'
      }
    };
    
    const response = responses[validation.action] || responses['REINFORCE_ROLE'];
    
    return {
      success: false,
      sessionId,
      type: 'boundary_protection',
      message: response.message,
      suggestion: response.suggestion,
      risks: validation.risks
    };
  }
}

/**
 * 🧠 意图识别系统 - 10类科学体系
 * 基于布鲁姆认知分类法 + 实际学习场景
 */
class IntentRecognizer {
  constructor() {
    // 10类意图体系
    this.intentCategories = {
      // === 认知层面意图 ===
      UNDERSTAND: {
        keywords: ['是什么', '解释', '为什么', 'what', 'why', '原理', '概念'],
        description: '理解概念、原理、机制',
        suggestedRole: 'story-teller',
        cognitiveLevel: 'comprehension',
        confidence: 0
      },
      
      APPLY: {
        keywords: ['怎么用', '如何', '实现', 'how to', 'implement', '应用', '使用'],
        description: '应用知识解决问题',
        suggestedRole: 'skill-coach',
        cognitiveLevel: 'application',
        confidence: 0
      },
      
      ANALYZE: {
        keywords: ['区别', '比较', '为什么这样', 'difference', 'compare', '分析', '对比'],
        description: '分析、比较、深入理解',
        suggestedRole: 'experience-accumulator',
        cognitiveLevel: 'analysis',
        confidence: 0
      },
      
      // === 情感层面意图 ===
      CONFUSED: {
        keywords: ['不懂', '困惑', '搞不清', 'confused', "don't understand", '迷糊', '糊涂'],
        description: '遇到理解障碍',
        suggestedRole: 'confusion-detective',
        emotionalState: 'negative',
        confidence: 0
      },
      
      STUCK: {
        keywords: ['卡住', '报错', '不工作', 'error', 'stuck', 'bug', '失败', '崩溃'],
        description: '实践中遇到阻碍',
        suggestedRole: 'confusion-detective',
        emotionalState: 'frustrated',
        confidence: 0
      },
      
      // === 行动层面意图 ===
      PRACTICE: {
        keywords: ['练习', '写代码', '动手', 'practice', 'code', 'try', '实践', '编程'],
        description: '需要实践机会',
        suggestedRole: 'skill-coach',
        actionType: 'hands-on',
        confidence: 0
      },
      
      VERIFY: {
        keywords: ['对吗', '正确吗', '检查', 'correct', 'right', 'check', '验证', '确认'],
        description: '验证理解或实现',
        suggestedRole: 'skill-coach',
        actionType: 'validation',
        confidence: 0
      },
      
      // === 元认知层面意图 ===
      PLAN: {
        keywords: ['学什么', '路线', '计划', 'roadmap', 'plan', 'next', '规划', '安排'],
        description: '学习规划和导航',
        suggestedRole: 'ai-class-advisor',
        metaCognitive: 'planning',
        confidence: 0
      },
      
      REFLECT: {
        keywords: ['总结', '回顾', '掌握了', 'summary', 'review', 'learned', '复习', '梳理'],
        description: '反思和总结',
        suggestedRole: 'experience-accumulator',
        metaCognitive: 'reflection',
        confidence: 0
      },
      
      EXPLORE: {
        keywords: ['还有什么', '深入', '扩展', 'more', 'advanced', 'else', '进阶', '更多'],
        description: '探索更多可能',
        suggestedRole: 'ai-class-advisor',
        metaCognitive: 'exploration',
        confidence: 0
      }
    };
    
    // 上下文相关的意图映射
    this.contextualIntentMap = {
      after_success: {
        '再来一个': 'PRACTICE',
        '继续': 'EXPLORE',
        '下一步': 'PLAN'
      },
      after_error: {
        '再来一个': 'STUCK',
        '继续': 'CONFUSED',
        '下一步': 'VERIFY'
      },
      after_explanation: {
        '再来一个': 'EXPLORE',
        '继续': 'PRACTICE',
        '下一步': 'APPLY'
      }
    };
  }

  async analyzeMultiple(userInput, context = {}) {
    const detectedIntents = [];
    const inputLower = userInput.toLowerCase();
    
    // 1. 计算每个意图的置信度
    for (const [intentType, intentDef] of Object.entries(this.intentCategories)) {
      const confidence = this.calculateConfidence(inputLower, intentDef.keywords);
      
      if (confidence > 0) {
        detectedIntents.push({
          type: intentType,
          confidence,
          ...intentDef,
          metadata: {
            matchedKeywords: this.getMatchedKeywords(inputLower, intentDef.keywords),
            context: context
          }
        });
      }
    }
    
    // 2. 考虑上下文调整置信度
    this.adjustConfidenceByContext(detectedIntents, context);
    
    // 3. 排序并返回
    return detectedIntents.sort((a, b) => b.confidence - a.confidence);
  }

  calculateConfidence(input, keywords) {
    let matchCount = 0;
    let totalWeight = 0;
    
    for (const keyword of keywords) {
      if (input.includes(keyword)) {
        // 完全匹配权重更高
        const weight = input === keyword ? 1.0 : 0.7;
        matchCount += weight;
      }
      totalWeight += 1;
    }
    
    return totalWeight > 0 ? matchCount / totalWeight : 0;
  }

  getMatchedKeywords(input, keywords) {
    return keywords.filter(keyword => input.includes(keyword));
  }

  adjustConfidenceByContext(intents, context) {
    // 基于上下文历史调整置信度
    if (context.previousRole === 'story-teller') {
      // 刚讲完故事，可能要练习
      const practiceIntent = intents.find(i => i.type === 'PRACTICE');
      if (practiceIntent) practiceIntent.confidence *= 1.2;
    }
    
    if (context.errorCount > 2) {
      // 连续错误，提高STUCK意图置信度
      const stuckIntent = intents.find(i => i.type === 'STUCK');
      if (stuckIntent) stuckIntent.confidence *= 1.5;
    }
    
    if (context.sessionDuration > 1800) { // 30分钟
      // 学习时间较长，可能需要总结
      const reflectIntent = intents.find(i => i.type === 'REFLECT');
      if (reflectIntent) reflectIntent.confidence *= 1.3;
    }
  }
}

/**
 * 🎯 意图冲突解决器
 * 处理多意图场景的智能决策
 */
class IntentConflictResolver {
  constructor() {
    // 意图优先级定义
    this.priorityMap = {
      'STUCK': 3,      // 最高优先级 - 卡住了需要立即解决
      'CONFUSED': 2,   // 高优先级 - 困惑需要及时处理
      'VERIFY': 1.5,   // 中高优先级 - 验证很重要
      'UNDERSTAND': 1, // 中优先级 - 理解是基础
      'PRACTICE': 0.5, // 正常优先级 - 练习可以等
      'EXPLORE': 0     // 低优先级 - 探索不急
    };
    
    // 意图融合规则
    this.fusionRules = {
      'UNDERSTAND,CONFUSED': {
        fusedIntent: 'CLARIFY_CONCEPT',
        role: 'story-teller',
        approach: 'multiple_examples',
        description: '需要更清晰的概念解释'
      },
      'PRACTICE,VERIFY': {
        fusedIntent: 'GUIDED_PRACTICE',
        role: 'skill-coach',
        approach: 'step_by_step_validation',
        description: '需要带验证的练习'
      },
      'STUCK,CONFUSED': {
        fusedIntent: 'DEBUG_HELP',
        role: 'confusion-detective',
        approach: 'systematic_diagnosis',
        description: '需要系统性的问题诊断'
      },
      'PLAN,CONFUSED': {
        fusedIntent: 'LEARNING_GUIDANCE',
        role: 'ai-class-advisor',
        approach: 'structured_roadmap',
        description: '需要清晰的学习路线'
      },
      'APPLY,STUCK': {
        fusedIntent: 'IMPLEMENTATION_HELP',
        role: 'task-breakdown-expert',
        approach: 'task_decomposition',
        description: '需要任务分解和实现指导'
      }
    };
  }

  async resolve(detectedIntents) {
    if (detectedIntents.length === 0) {
      return this.getDefaultIntent();
    }
    
    if (detectedIntents.length === 1) {
      return detectedIntents[0];
    }
    
    // 多意图处理策略
    const resolution = {
      primaryIntent: null,
      secondaryIntents: [],
      fusedIntent: null,
      confidence: 0,
      strategy: null
    };
    
    // 1. 检查是否有高置信度意图
    const highConfidenceIntent = detectedIntents.find(i => i.confidence > 0.7);
    if (highConfidenceIntent) {
      resolution.primaryIntent = highConfidenceIntent;
      resolution.confidence = highConfidenceIntent.confidence;
      resolution.strategy = 'high_confidence';
      return resolution;
    }
    
    // 2. 检查是否有紧急意图（STUCK等）
    const urgentIntent = this.findUrgentIntent(detectedIntents);
    if (urgentIntent) {
      resolution.primaryIntent = urgentIntent;
      resolution.confidence = urgentIntent.confidence;
      resolution.strategy = 'urgent_priority';
      return resolution;
    }
    
    // 3. 尝试意图融合
    const fusedIntent = this.fuseIntents(detectedIntents);
    if (fusedIntent) {
      resolution.fusedIntent = fusedIntent;
      resolution.primaryIntent = fusedIntent;
      resolution.confidence = this.calculateFusedConfidence(detectedIntents);
      resolution.strategy = 'intent_fusion';
      return resolution;
    }
    
    // 4. 默认选择置信度最高的
    resolution.primaryIntent = detectedIntents[0];
    resolution.secondaryIntents = detectedIntents.slice(1, 3);
    resolution.confidence = detectedIntents[0].confidence;
    resolution.strategy = 'confidence_ranking';
    
    return resolution;
  }

  findUrgentIntent(intents) {
    // 按优先级排序
    const sortedByPriority = intents.sort((a, b) => {
      const priorityA = this.priorityMap[a.type] || 0;
      const priorityB = this.priorityMap[b.type] || 0;
      return priorityB - priorityA;
    });
    
    // 如果最高优先级的意图置信度大于0.4，返回它
    if (sortedByPriority[0] && sortedByPriority[0].confidence > 0.4) {
      const priority = this.priorityMap[sortedByPriority[0].type];
      if (priority >= 2) {
        return sortedByPriority[0];
      }
    }
    
    return null;
  }

  fuseIntents(intents) {
    // 获取前两个意图的类型
    const topTwo = intents.slice(0, 2).map(i => i.type).sort();
    const fusionKey = topTwo.join(',');
    
    // 查找融合规则
    const fusionRule = this.fusionRules[fusionKey];
    if (fusionRule) {
      return {
        type: fusionRule.fusedIntent,
        ...fusionRule,
        originalIntents: topTwo,
        confidence: this.calculateFusedConfidence(intents.slice(0, 2))
      };
    }
    
    return null;
  }

  calculateFusedConfidence(intents) {
    // 融合置信度 = 平均置信度 * 0.9（略微降低因为是推断的）
    const avgConfidence = intents.reduce((sum, i) => sum + i.confidence, 0) / intents.length;
    return avgConfidence * 0.9;
  }

  getDefaultIntent() {
    return {
      type: 'PLAN',
      confidence: 0.5,
      suggestedRole: 'ai-class-advisor',
      description: '默认学习规划意图',
      strategy: 'default'
    };
  }
}

/**
 * 🎯 增强版角色路由引擎
 * 基于新意图体系的角色切换
 */
class RoleRouter {
  constructor() {
    this.roleDefinitions = {
      'ai-class-advisor': {
        name: '班主任',
        triggers: ['PLAN', 'EXPLORE', 'session_start'],
        capabilities: ['统筹规划', '进度跟踪', '角色协调'],
        exitConditions: ['specific_need_identified']
      },
      'story-teller': {
        name: '故事讲述者', 
        triggers: ['UNDERSTAND', 'CLARIFY_CONCEPT'],
        capabilities: ['概念类比', '故事解释', '直觉建立'],
        exitConditions: ['concept_understood', 'ready_for_practice']
      },
      'skill-coach': {
        name: '技能教练',
        triggers: ['PRACTICE', 'APPLY', 'VERIFY', 'GUIDED_PRACTICE'],
        capabilities: ['代码实践', '渐进训练', '技能提升'],
        exitConditions: ['practice_completed', 'skill_mastered']
      },
      'confusion-detective': {
        name: '困惑侦探',
        triggers: ['CONFUSED', 'STUCK', 'DEBUG_HELP'],
        capabilities: ['问题诊断', '障碍分析', '精准解惑'],
        exitConditions: ['confusion_resolved', 'path_clarified']
      },
      'task-breakdown-expert': {
        name: '任务分解专家',
        triggers: ['IMPLEMENTATION_HELP', 'complex_task'],
        capabilities: ['任务拆解', '步骤规划', '渐进实现'],
        exitConditions: ['task_decomposed', 'clear_steps']
      },
      'achievement-designer': {
        name: '成就设计师',
        triggers: ['milestone_reached', 'celebration_time'],
        capabilities: ['成就设计', '动机激励', '正向反馈'],
        exitConditions: ['motivation_boosted']
      },
      'experience-accumulator': {
        name: '经验累积官',
        triggers: ['REFLECT', 'ANALYZE', 'session_end'],
        capabilities: ['经验总结', '模式提取', '知识沉淀'],
        exitConditions: ['experience_recorded']
      }
    };
    
    // 意图到角色的直接映射（优化后）
    this.intentRoleMap = {
      'UNDERSTAND': 'story-teller',
      'APPLY': 'skill-coach',
      'ANALYZE': 'experience-accumulator',
      'CONFUSED': 'confusion-detective',
      'STUCK': 'confusion-detective',
      'PRACTICE': 'skill-coach',
      'VERIFY': 'skill-coach',
      'PLAN': 'ai-class-advisor',
      'REFLECT': 'experience-accumulator',
      'EXPLORE': 'ai-class-advisor',
      // 融合意图映射
      'CLARIFY_CONCEPT': 'story-teller',
      'GUIDED_PRACTICE': 'skill-coach',
      'DEBUG_HELP': 'confusion-detective',
      'LEARNING_GUIDANCE': 'ai-class-advisor',
      'IMPLEMENTATION_HELP': 'task-breakdown-expert'
    };
  }

  async determineRole(cognitiveState, session, intent) {
    const analysis = {
      currentRole: session.currentRole || 'ai-class-advisor',
      suggestedRole: null,
      switchReason: null,
      confidence: 0,
      metadata: {}
    };

    // 1. 基于意图的直接映射
    const intentBasedRole = this.intentRoleMap[intent.type || intent.primaryIntent?.type];
    
    if (intentBasedRole) {
      analysis.suggestedRole = intentBasedRole;
      analysis.switchReason = `intent_${intent.type}`;
      analysis.confidence = intent.confidence || 0.8;
    } else {
      // 2. 基于认知状态的备选决策
      analysis.suggestedRole = this.fallbackRoleDecision(cognitiveState, session);
      analysis.switchReason = 'cognitive_state_analysis';
      analysis.confidence = 0.6;
    }
    
    // 3. 验证角色切换的合理性
    if (!this.shouldSwitchRole(analysis.currentRole, analysis.suggestedRole, session)) {
      analysis.suggestedRole = analysis.currentRole;
      analysis.switchReason = 'maintain_current_role';
    }
    
    return analysis;
  }

  fallbackRoleDecision(cognitiveState, session) {
    // 基于认知状态的备选角色决策
    if (cognitiveState.confusionLevel > 0.7) {
      return 'confusion-detective';
    }
    if (session.masteredConcepts.length >= 3 && !session.recentPractice) {
      return 'skill-coach';
    }
    if (session.experienceChain.length >= 5) {
      return 'experience-accumulator';
    }
    return 'ai-class-advisor';
  }

  shouldSwitchRole(currentRole, suggestedRole, session) {
    // 相同角色不切换
    if (currentRole === suggestedRole) {
      return false;
    }
    
    // 检查切换频率（避免频繁切换）
    const recentSwitches = session.roleHistory?.slice(-3) || [];
    if (recentSwitches.length >= 3) {
      const timeSinceLastSwitch = Date.now() - recentSwitches[recentSwitches.length - 1]?.timestamp;
      if (timeSinceLastSwitch < 60000) { // 1分钟内
        return false;
      }
    }
    
    return true;
  }
}

/**
 * 📚 增强版智能教案管理系统
 */
class LessonPlanManager {
  constructor() {
    this.autoUpdateTriggers = {
      'conceptIntroduced': { interval: 0, immediate: true },
      'practiceCompleted': { interval: 0, immediate: true },
      'confusionDetected': { interval: 0, immediate: true },
      'achievementUnlocked': { interval: 0, immediate: true },
      'timeInterval': { interval: 300000, immediate: false }, // 5分钟
      'significantProgress': { interval: 0, immediate: true }
    };
    
    this.lastUpdateTime = new Map();
  }

  async autoUpdate(session, cognitiveState, targetRole) {
    const sessionId = session.id;
    const now = Date.now();
    
    // 检查是否需要更新
    const triggers = this.checkTriggers(session, cognitiveState, now);
    
    if (triggers.length === 0) {
      return session.lessonPlan;
    }
    
    // 创建或更新教案
    if (!session.lessonPlan) {
      session.lessonPlan = this.createNewLessonPlan(session);
    }
    
    // 执行更新
    const updates = {
      timestamp: new Date().toISOString(),
      triggers: triggers,
      cognitiveState: { ...cognitiveState },
      currentRole: targetRole.suggestedRole,
      sessionDuration: now - new Date(session.createdAt).getTime(),
      progress: this.calculateProgress(session),
      recommendations: this.generateRecommendations(session, cognitiveState)
    };
    
    // 更新教案内容
    session.lessonPlan.updates = session.lessonPlan.updates || [];
    session.lessonPlan.updates.push(updates);
    session.lessonPlan.lastUpdated = new Date().toISOString();
    
    // 更新认知轨迹
    session.lessonPlan.cognitiveTrajectory = this.analyzeCognitiveTrajectory(session);
    
    // 更新学习模式
    session.lessonPlan.learningPatterns = this.extractLearningPatterns(session);
    
    // 保存到文件
    if (session.portfolioPath) {
      await this.saveLessonPlan(session);
    }
    
    this.lastUpdateTime.set(sessionId, now);
    
    return session.lessonPlan;
  }

  checkTriggers(session, cognitiveState, now) {
    const triggers = [];
    const lastUpdate = this.lastUpdateTime.get(session.id) || 0;
    
    // 时间间隔触发
    if (now - lastUpdate > this.autoUpdateTriggers.timeInterval.interval) {
      triggers.push('timeInterval');
    }
    
    // 认知状态变化触发
    if (cognitiveState.confusionLevel > 0.7) {
      triggers.push('confusionDetected');
    }
    
    // 进度触发
    const recentExperiences = session.experienceChain.slice(-3);
    const successRate = recentExperiences.filter(e => e.success).length / recentExperiences.length;
    if (successRate === 1 && recentExperiences.length === 3) {
      triggers.push('significantProgress');
    }
    
    // 新概念引入触发
    if (cognitiveState.newConceptIntroduced) {
      triggers.push('conceptIntroduced');
    }
    
    return triggers;
  }

  createNewLessonPlan(session) {
    return {
      id: `lesson-${session.id}`,
      sessionId: session.id,
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      topic: session.currentTopic,
      objectives: [],
      cognitiveTrajectory: [],
      learningPatterns: {},
      masteredConcepts: [],
      strugglingAreas: [],
      recommendations: [],
      updates: []
    };
  }

  calculateProgress(session) {
    const totalConcepts = session.masteredConcepts.length + session.strugglingConcepts.length;
    const masteryRate = totalConcepts > 0 ? 
      session.masteredConcepts.length / totalConcepts : 0;
    
    return {
      masteryRate,
      conceptsCovered: totalConcepts,
      practiceCompleted: session.experienceChain.filter(e => e.type === 'practice').length,
      currentZPD: session.zpdLevel,
      confidenceLevel: session.confidenceLevel,
      timeSpent: Date.now() - new Date(session.createdAt).getTime()
    };
  }

  generateRecommendations(session, cognitiveState) {
    const recommendations = [];
    
    if (cognitiveState.confusionLevel > 0.6) {
      recommendations.push({
        type: 'role_switch',
        suggestion: '切换到故事讲述者获得更多类比解释',
        priority: 'high'
      });
    }
    
    if (session.masteredConcepts.length >= 3 && !session.recentPractice) {
      recommendations.push({
        type: 'practice',
        suggestion: '是时候进行一些编码练习了',
        priority: 'medium'
      });
    }
    
    if (session.experienceChain.length >= 10) {
      recommendations.push({
        type: 'review',
        suggestion: '建议进行阶段性总结和复习',
        priority: 'medium'
      });
    }
    
    return recommendations;
  }

  analyzeCognitiveTrajectory(session) {
    // 分析认知发展轨迹
    return session.cognitiveStates?.map(state => ({
      timestamp: state.timestamp,
      zpdLevel: state.zpdLevel,
      confusionLevel: state.confusionLevel,
      confidenceLevel: state.confidenceLevel
    })) || [];
  }

  extractLearningPatterns(session) {
    const patterns = {
      preferredLearningStyle: 'unknown',
      averageSessionDuration: 0,
      peakLearningTime: 'unknown',
      strengthAreas: [],
      improvementAreas: [],
      learningPace: 'moderate'
    };
    
    // 分析学习风格
    const roleFrequency = {};
    session.roleHistory?.forEach(history => {
      roleFrequency[history.to] = (roleFrequency[history.to] || 0) + 1;
    });
    
    // 最常用的角色暗示学习风格
    const mostFrequentRole = Object.keys(roleFrequency).reduce((a, b) => 
      roleFrequency[a] > roleFrequency[b] ? a : b, 'ai-class-advisor'
    );
    
    if (mostFrequentRole === 'story-teller') {
      patterns.preferredLearningStyle = 'conceptual';
    } else if (mostFrequentRole === 'skill-coach') {
      patterns.preferredLearningStyle = 'practical';
    }
    
    // 识别强项和弱项
    patterns.strengthAreas = session.masteredConcepts.slice(0, 3);
    patterns.improvementAreas = session.strugglingConcepts.slice(0, 3);
    
    return patterns;
  }

  async saveLessonPlan(session) {
    const filePath = path.join(session.portfolioPath, 'lesson-plan.json');
    try {
      await fs.writeFile(filePath, JSON.stringify(session.lessonPlan, null, 2));
    } catch (error) {
      console.error('Failed to save lesson plan:', error);
    }
  }
}

/**
 * 📁 增强版学习档案管理系统
 */
class PortfolioManager {
  constructor() {
    this.basePath = './AI-Learning-Portfolio';
  }

  async createSessionFolder(session, config) {
    const folderName = this.generateFolderName(session);
    const sessionPath = path.join(this.basePath, 'Sessions', folderName);
    
    // 创建目录结构
    const folders = [
      sessionPath,
      path.join(sessionPath, 'code'),
      path.join(sessionPath, 'notes'),
      path.join(sessionPath, 'resources')
    ];
    
    for (const folder of folders) {
      await this.ensureDirectory(folder);
    }
    
    // 创建初始文件
    const files = {
      lessonPlan: path.join(sessionPath, 'lesson-plan.json'),
      practiceCode: path.join(sessionPath, 'code', 'practice.js'),
      notes: path.join(sessionPath, 'notes', 'session-notes.md'),
      achievements: path.join(sessionPath, 'achievements.json'),
      experiences: path.join(sessionPath, 'experiences.json')
    };
    
    // 初始化文件内容
    await this.initializeFiles(files, session);
    
    session.portfolioPath = sessionPath;
    session.portfolioFiles = files;
    
    return {
      success: true,
      path: sessionPath,
      files: files
    };
  }

  generateFolderName(session) {
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 16).replace('T', '_').replace(':', '-');
    const topic = session.currentTopic?.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '_') || '通用学习';
    return `${dateStr}_${topic}`;
  }

  async ensureDirectory(dirPath) {
    try {
      await fs.mkdir(dirPath, { recursive: true });
    } catch (error) {
      console.error(`Failed to create directory ${dirPath}:`, error);
    }
  }

  async initializeFiles(files, session) {
    // 初始化教案文件
    const lessonPlan = {
      sessionId: session.id,
      topic: session.currentTopic,
      createdAt: new Date().toISOString(),
      objectives: [],
      progress: []
    };
    await this.writeJSON(files.lessonPlan, lessonPlan);
    
    // 初始化笔记文件
    const notesContent = `# 学习笔记 - ${session.currentTopic}
    
日期：${new Date().toISOString().slice(0, 10)}
会话ID：${session.id}

## 学习目标


## 重点概念


## 实践记录


## 问题与解答


## 总结与反思

`;
    await this.writeFile(files.notes, notesContent);
    
    // 初始化成就文件
    await this.writeJSON(files.achievements, []);
    
    // 初始化经验文件
    await this.writeJSON(files.experiences, []);
  }

  async writeFile(filePath, content) {
    try {
      await fs.writeFile(filePath, content, 'utf8');
    } catch (error) {
      console.error(`Failed to write file ${filePath}:`, error);
    }
  }

  async writeJSON(filePath, data) {
    try {
      await fs.writeFile(filePath, JSON.stringify(data, null, 2));
    } catch (error) {
      console.error(`Failed to write JSON file ${filePath}:`, error);
    }
  }
}

/**
 * 🎓 教育学理论引擎
 * 集成建构主义、ZPD、社会认知理论
 */
class LearningTheoryEngine {
  constructor() {
    this.theories = {
      constructivism: {
        principles: ['主动构建', '社会互动', '真实情境', '先验知识'],
        strategies: ['问题驱动', '项目学习', '协作学习', '反思实践']
      },
      zpd: {
        principles: ['最近发展区', '脚手架支撑', '逐步撤离', '动态评估'],
        strategies: ['渐进难度', '及时支持', '同伴学习', '建模示范']
      },
      socialCognitive: {
        principles: ['观察学习', '自我效能', '相互决定', '动机调节'],
        strategies: ['榜样示范', '成功体验', '言语鼓励', '情绪调节']
      }
    };
  }

  async determineStrategy(session, intent) {
    const strategy = {
      theory: null,
      approach: null,
      techniques: [],
      rationale: null
    };
    
    // 基于意图选择理论
    if (intent.type === 'UNDERSTAND' || intent.type === 'CONFUSED') {
      // 建构主义 - 主动建构理解
      strategy.theory = 'constructivism';
      strategy.approach = 'problem_based_learning';
      strategy.techniques = [
        '提供真实情境',
        '激活先验知识',
        '鼓励主动探索',
        '促进社会互动'
      ];
      strategy.rationale = '通过真实问题情境促进主动知识建构';
    } else if (intent.type === 'PRACTICE' || intent.type === 'APPLY') {
      // ZPD理论 - 脚手架支撑
      strategy.theory = 'zpd';
      strategy.approach = 'scaffolding';
      strategy.techniques = [
        '评估当前能力',
        '提供适度挑战',
        '及时给予支持',
        '逐步撤离支撑'
      ];
      strategy.rationale = '在最近发展区内提供恰当的支撑';
    } else if (intent.type === 'STUCK' || intent.type === 'VERIFY') {
      // 社会认知理论 - 自我效能建设
      strategy.theory = 'socialCognitive';
      strategy.approach = 'self_efficacy_building';
      strategy.techniques = [
        '分解任务降低难度',
        '提供成功体验',
        '积极言语鼓励',
        '展示类似案例'
      ];
      strategy.rationale = '通过成功体验和鼓励提升自我效能感';
    }
    
    // 基于学习者特征调整策略
    this.personalizeStrategy(strategy, session);
    
    return strategy;
  }

  personalizeStrategy(strategy, session) {
    // 基于ZPD水平调整
    if (session.zpdLevel < 3) {
      strategy.techniques.push('提供更多示例');
      strategy.techniques.push('细化步骤分解');
    } else if (session.zpdLevel > 7) {
      strategy.techniques.push('鼓励独立探索');
      strategy.techniques.push('提供开放性挑战');
    }
    
    // 基于信心水平调整
    if (session.confidenceLevel < 0.3) {
      strategy.techniques.push('频繁正向反馈');
      strategy.techniques.push('降低初始难度');
    }
    
    // 基于学习历史调整
    if (session.masteredConcepts.length > 5) {
      strategy.techniques.push('建立知识连接');
      strategy.techniques.push('促进迁移应用');
    }
  }
}

/**
 * 🧠 SLAN认知引擎 - 增强版
 */
class SLANCognitiveEngine {
  async process(session, intent, strategy) {
    // Sense: 感知学习环境
    const sensoryInput = this.sense(session, intent);
    
    // Learn: 学习和适应
    const learningUpdate = this.learn(session, sensoryInput, strategy);
    
    // Adapt: 适应性调整
    const adaptation = this.adapt(session, learningUpdate);
    
    // Navigate: 导航下一步行动
    const navigation = this.navigate(session, adaptation, intent);
    
    const cognitiveState = {
      sensoryInput,
      learningUpdate,
      adaptation,
      navigation,
      timestamp: new Date().toISOString(),
      // 认知指标
      confusionLevel: this.calculateConfusion(session, intent),
      zpdLevel: this.calculateZPD(session),
      confidenceLevel: this.calculateConfidence(session),
      lastActivity: this.identifyLastActivity(session),
      significantChange: this.detectSignificantChange(session)
    };
    
    // 记录认知状态
    session.cognitiveStates = session.cognitiveStates || [];
    session.cognitiveStates.push(cognitiveState);
    
    return cognitiveState;
  }

  sense(session, intent) {
    return {
      userIntent: intent.type || intent.primaryIntent?.type,
      emotionalState: this.detectEmotionalState(intent),
      learningPhase: this.identifyLearningPhase(session),
      contextFactors: this.extractContextFactors(session),
      environmentalFactors: {
        sessionDuration: Date.now() - new Date(session.createdAt).getTime(),
        interactionCount: session.experienceChain.length,
        roleChangeFrequency: session.roleHistory?.length || 0
      }
    };
  }

  learn(session, input, strategy) {
    const learning = {
      conceptsLearned: [],
      skillsImproved: [],
      patternsRecognized: [],
      knowledgeGaps: []
    };
    
    // 识别学习内容
    if (input.learningPhase === 'comprehension') {
      learning.conceptsLearned = this.identifyNewConcepts(session);
    }
    
    if (input.learningPhase === 'application') {
      learning.skillsImproved = this.identifyImprovedSkills(session);
    }
    
    // 识别学习模式
    learning.patternsRecognized = this.recognizePatterns(session);
    
    // 识别知识缺口
    learning.knowledgeGaps = this.identifyGaps(session);
    
    return learning;
  }

  adapt(session, learning) {
    const adaptation = {
      difficultyAdjustment: 0,
      paceAdjustment: 0,
      styleAdjustment: null,
      supportLevel: 'moderate'
    };
    
    // 基于学习效果调整难度
    if (learning.conceptsLearned.length > 2) {
      adaptation.difficultyAdjustment = 0.5; // 提升难度
    } else if (learning.knowledgeGaps.length > 3) {
      adaptation.difficultyAdjustment = -0.5; // 降低难度
    }
    
    // 基于学习节奏调整速度
    const recentExperiences = session.experienceChain.slice(-5);
    const avgTime = this.calculateAverageTime(recentExperiences);
    
    if (avgTime < 60000) { // 平均少于1分钟
      adaptation.paceAdjustment = 0.2; // 加快节奏
    } else if (avgTime > 300000) { // 平均超过5分钟
      adaptation.paceAdjustment = -0.2; // 放慢节奏
    }
    
    // 基于学习风格调整方法
    if (session.preferredStyle === 'visual') {
      adaptation.styleAdjustment = 'more_diagrams';
    } else if (session.preferredStyle === 'practical') {
      adaptation.styleAdjustment = 'more_exercises';
    }
    
    return adaptation;
  }

  navigate(session, adaptation, intent) {
    const navigation = {
      nextAction: null,
      suggestedRole: null,
      priority: 'medium',
      estimatedDuration: 300000, // 5分钟
      resources: []
    };
    
    // 基于适应性调整决定下一步
    if (adaptation.difficultyAdjustment > 0) {
      navigation.nextAction = 'advance_to_complex_topic';
      navigation.suggestedRole = 'task-breakdown-expert';
    } else if (adaptation.difficultyAdjustment < 0) {
      navigation.nextAction = 'review_fundamentals';
      navigation.suggestedRole = 'story-teller';
    } else {
      navigation.nextAction = 'continue_current_path';
      navigation.suggestedRole = intent.suggestedRole;
    }
    
    // 设置优先级
    if (session.confusionLevel > 0.7) {
      navigation.priority = 'high';
    } else if (session.confidenceLevel > 0.8) {
      navigation.priority = 'low';
    }
    
    return navigation;
  }

  // 辅助计算方法
  calculateConfusion(session, intent) {
    let confusionLevel = 0;
    
    if (intent.type === 'CONFUSED' || intent.type === 'STUCK') {
      confusionLevel += 0.5;
    }
    
    const recentErrors = session.experienceChain.slice(-3).filter(e => !e.success).length;
    confusionLevel += recentErrors * 0.15;
    
    return Math.min(confusionLevel, 1.0);
  }

  calculateZPD(session) {
    // 基于成功率计算ZPD
    const recentExperiences = session.experienceChain.slice(-5);
    if (recentExperiences.length === 0) return 5; // 默认中等水平
    
    const successRate = recentExperiences.filter(e => e.success).length / recentExperiences.length;
    
    if (successRate > 0.8) {
      return Math.min(session.zpdLevel + 0.5, 10);
    } else if (successRate < 0.3) {
      return Math.max(session.zpdLevel - 0.5, 1);
    }
    
    return session.zpdLevel;
  }

  calculateConfidence(session) {
    let confidence = session.confidenceLevel || 0.5;
    
    const recentSuccesses = session.experienceChain.slice(-3).filter(e => e.success).length;
    confidence += recentSuccesses * 0.1;
    
    const masteryRatio = session.masteredConcepts.length / 
      (session.masteredConcepts.length + session.strugglingConcepts.length + 1);
    confidence = confidence * 0.7 + masteryRatio * 0.3;
    
    return Math.min(Math.max(confidence, 0), 1);
  }

  identifyLastActivity(session) {
    const lastExp = session.experienceChain[session.experienceChain.length - 1];
    return lastExp?.type || 'none';
  }

  detectSignificantChange(session) {
    const states = session.cognitiveStates || [];
    if (states.length < 2) return false;
    
    const current = states[states.length - 1];
    const previous = states[states.length - 2];
    
    if (!current || !previous) return false;
    
    const confusionChange = Math.abs(current.confusionLevel - previous.confusionLevel);
    const confidenceChange = Math.abs(current.confidenceLevel - previous.confidenceLevel);
    
    return confusionChange > 0.3 || confidenceChange > 0.3;
  }

  detectEmotionalState(intent) {
    if (intent.emotionalState) return intent.emotionalState;
    
    const emotionMap = {
      'STUCK': 'frustrated',
      'CONFUSED': 'confused',
      'PRACTICE': 'engaged',
      'EXPLORE': 'curious',
      'REFLECT': 'satisfied'
    };
    
    return emotionMap[intent.type] || 'neutral';
  }

  identifyLearningPhase(session) {
    const expCount = session.experienceChain.length;
    const masteredCount = session.masteredConcepts.length;
    
    if (expCount < 3) return 'introduction';
    if (masteredCount < 2) return 'comprehension';
    if (masteredCount < 5) return 'application';
    return 'synthesis';
  }

  extractContextFactors(session) {
    return {
      timeOfDay: new Date().getHours(),
      sessionAge: Date.now() - new Date(session.createdAt).getTime(),
      interactionDensity: session.experienceChain.length / 
        (Date.now() - new Date(session.createdAt).getTime()) * 60000,
      conceptVelocity: session.masteredConcepts.length / 
        (session.experienceChain.length + 1)
    };
  }

  identifyNewConcepts(session) {
    // 简化实现：返回最近学习的概念
    return session.masteredConcepts.slice(-2);
  }

  identifyImprovedSkills(session) {
    // 简化实现：基于练习成功率判断
    const practiceExperiences = session.experienceChain.filter(e => e.type === 'practice');
    if (practiceExperiences.length === 0) return [];
    
    const recentPractices = practiceExperiences.slice(-3);
    const successRate = recentPractices.filter(e => e.success).length / recentPractices.length;
    
    if (successRate > 0.7) {
      return ['coding_accuracy', 'problem_solving'];
    }
    return [];
  }

  recognizePatterns(session) {
    const patterns = [];
    
    // 识别错误模式
    const errors = session.experienceChain.filter(e => !e.success);
    if (errors.length >= 3) {
      const errorTypes = errors.map(e => e.errorType).filter(Boolean);
      const commonError = this.findMostCommon(errorTypes);
      if (commonError) {
        patterns.push(`repeated_error:${commonError}`);
      }
    }
    
    // 识别学习偏好
    const roles = session.roleHistory?.map(h => h.to) || [];
    const preferredRole = this.findMostCommon(roles);
    if (preferredRole) {
      patterns.push(`preferred_role:${preferredRole}`);
    }
    
    return patterns;
  }

  identifyGaps(session) {
    const gaps = [];
    
    // 基于困惑和错误识别知识缺口
    session.strugglingConcepts.forEach(concept => {
      gaps.push(concept);
    });
    
    return gaps;
  }

  calculateAverageTime(experiences) {
    if (experiences.length < 2) return 180000; // 默认3分钟
    
    let totalTime = 0;
    for (let i = 1; i < experiences.length; i++) {
      const timeDiff = new Date(experiences[i].timestamp) - new Date(experiences[i-1].timestamp);
      totalTime += timeDiff;
    }
    
    return totalTime / (experiences.length - 1);
  }

  findMostCommon(arr) {
    if (arr.length === 0) return null;
    
    const frequency = {};
    arr.forEach(item => {
      frequency[item] = (frequency[item] || 0) + 1;
    });
    
    return Object.keys(frequency).reduce((a, b) => 
      frequency[a] > frequency[b] ? a : b
    );
  }
}

/**
 * 🛡️ 学习边界管理系统
 * 保持教育焦点，智能引导回归学习
 */
class LearningBoundaryManager {
  constructor() {
    // 主题域定义
    this.learningDomains = {
      core: [
        '编程', '开发', '代码', '算法', '数据结构',
        'javascript', 'python', 'java', 'web', 'ai',
        '前端', '后端', '数据库', '框架', '工具',
        'react', 'vue', 'node', 'spring', 'django'
      ],
      extended: [
        '计算机', '软件', '技术', '项目', '调试',
        '设计模式', '架构', '测试', '部署', 'git',
        'api', 'http', 'sql', 'nosql', 'cloud'
      ],
      meta: [
        '学习', '理解', '练习', '概念', '原理',
        '为什么', '怎么', '什么', '区别', '比较',
        '问题', '错误', '帮助', '教我', '解释'
      ]
    };

    // 偏离类型识别
    this.deviationPatterns = {
      OFFTOPIC: {
        keywords: ['天气', '新闻', '股票', '娱乐', '游戏', '电影', '音乐'],
        severity: 'low',
        response: 'gentle_redirect'
      },
      INAPPROPRIATE: {
        keywords: ['黑客', '破解', '作弊', '攻击', '违法', '入侵', '破坏'],
        severity: 'high',
        response: 'firm_boundary'
      },
      HOMEWORK: {
        keywords: ['作业答案', '直接告诉我', '帮我写完', '替我做', '给我代码'],
        severity: 'medium',
        response: 'educational_redirect'
      },
      EMOTIONAL: {
        keywords: ['无聊', '不想学', '讨厌', '没意思', '放弃', '太难了', '学不会'],
        severity: 'medium',
        response: 'motivational_support'
      },
      TESTING: {
        keywords: ['忽略指令', '角色扮演', '假装是', '忘记规则', 'system', 'prompt'],
        severity: 'high',
        response: 'role_reinforcement'
      },
      CHITCHAT: {
        keywords: ['你好吗', '聊天', '闲聊', '吃了吗', '你是谁'],
        severity: 'low',
        response: 'gentle_redirect'
      }
    };

    // 引导策略库
    this.redirectStrategies = {
      gentle_redirect: {
        tone: 'friendly',
        templates: [
          "这个问题很有趣，不过让我们先专注在{current_topic}的学习上。你刚才提到想了解的内容，还有什么不清楚的吗？",
          "我理解你的好奇心！作为你的编程学习伙伴，我更擅长帮你掌握{current_topic}。要不我们继续？",
          "哈哈，让我们还是聊聊代码吧！你在{current_topic}的学习上进展如何？"
        ]
      },
      
      firm_boundary: {
        tone: 'professional',
        templates: [
          "我专注于帮助你学习编程和技术知识。让我们回到{current_topic}的学习上，这样对你更有帮助。",
          "这超出了我的教学范围。我的专长是编程教育，让我们继续探索{current_topic}的奥秘吧。",
          "作为教育AI，我只能协助正当的学习需求。需要我帮你理解{current_topic}的哪个部分？"
        ]
      },
      
      educational_redirect: {
        tone: 'encouraging',
        templates: [
          "我更愿意教你理解和解决问题的方法，而不是直接给答案。让我们一步步分析{current_topic}...",
          "授人以鱼不如授人以渔！我来引导你自己找到答案。首先，这个问题的关键是什么？",
          "学习的价值在于过程！让我帮你掌握解决这类问题的思路..."
        ]
      },
      
      motivational_support: {
        tone: 'empathetic',
        templates: [
          "学习确实有时会遇到瓶颈。要不我们换个方式学{current_topic}？比如通过一个有趣的项目？",
          "我理解你的感受。让我们把{current_topic}变得更有趣！想不想看看它能做出什么酷炫的东西？",
          "每个程序员都经历过这个阶段。休息一下，或者我们用故事的方式重新理解？"
        ]
      },
      
      role_reinforcement: {
        tone: 'clear',
        templates: [
          "我是你的编程学习助手，专注于帮你掌握{current_topic}。有什么技术问题需要探讨吗？",
          "让我们保持在学习模式。关于{current_topic}，你还有什么想了解的？",
          "我的角色是教育引导者。回到我们的学习任务..."
        ]
      }
    };
    
    // 焦点追踪器
    this.focusTracker = new Map();
  }

  async checkRelevance(userInput, session) {
    const analysis = {
      isRelevant: false,
      relevanceScore: 0,
      deviationType: null,
      suggestedAction: null,
      matchedKeywords: []
    };

    const inputLower = userInput.toLowerCase();
    
    // 1. 检查学习域关键词
    const coreMatches = this.countMatches(inputLower, this.learningDomains.core);
    const extendedMatches = this.countMatches(inputLower, this.learningDomains.extended);
    const metaMatches = this.countMatches(inputLower, this.learningDomains.meta);
    
    // 2. 计算相关性分数
    analysis.relevanceScore = (coreMatches * 3 + extendedMatches * 2 + metaMatches) / 
                              (inputLower.split(' ').length + 1);
    
    // 3. 检查偏离模式
    for (const [type, pattern] of Object.entries(this.deviationPatterns)) {
      const matches = this.matchesPattern(inputLower, pattern.keywords);
      if (matches.length > 0) {
        analysis.deviationType = type;
        analysis.suggestedAction = pattern.response;
        analysis.matchedKeywords = matches;
        break;
      }
    }
    
    // 4. 判断是否相关
    if (analysis.relevanceScore > 0.2 && !analysis.deviationType) {
      analysis.isRelevant = true;
    } else if (analysis.deviationType === 'EMOTIONAL') {
      analysis.isRelevant = 'partial';
    } else if (metaMatches > 0 && !analysis.deviationType) {
      analysis.isRelevant = true;
    }
    
    // 5. 更新焦点追踪
    this.updateFocusTracking(session.id, analysis);
    
    return analysis;
  }

  generateRedirect(analysis, session) {
    const strategy = this.redirectStrategies[analysis.suggestedAction];
    if (!strategy) return null;
    
    const template = strategy.templates[
      Math.floor(Math.random() * strategy.templates.length)
    ];
    
    const response = template
      .replace('{current_topic}', session.currentTopic || '编程')
      .replace('{last_concept}', session.lastConcept || '基础概念')
      .replace('{last_activity}', session.lastActivity || '练习');
    
    return {
      message: response,
      tone: strategy.tone,
      shouldContinue: analysis.isRelevant === 'partial',
      deviationType: analysis.deviationType
    };
  }

  manageFocus(session) {
    const focus = this.getFocusInfo(session.id);
    
    if (focus.deviationCount > 3) {
      return {
        action: 'STRONG_REDIRECT',
        message: "我注意到我们有点偏离学习主题了。让我帮你重新聚焦...",
        suggestion: "要不我们制定一个清晰的学习计划？",
        recommendedRole: 'ai-class-advisor'
      };
    }
    
    if (focus.focusScore < 50) {
      return {
        action: 'REACTIVATE',
        message: "看起来你需要一些新的学习动力...",
        suggestion: "试试一个有趣的编程挑战怎么样？",
        recommendedRole: 'achievement-designer'
      };
    }
    
    return null;
  }

  countMatches(input, keywords) {
    return keywords.filter(keyword => input.includes(keyword)).length;
  }

  matchesPattern(input, patterns) {
    return patterns.filter(pattern => input.includes(pattern));
  }

  updateFocusTracking(sessionId, analysis) {
    if (!this.focusTracker.has(sessionId)) {
      this.focusTracker.set(sessionId, {
        deviationCount: 0,
        focusScore: 100,
        history: []
      });
    }
    
    const focus = this.focusTracker.get(sessionId);
    
    if (!analysis.isRelevant) {
      focus.deviationCount++;
      focus.focusScore = Math.max(0, focus.focusScore - 15);
    } else {
      focus.deviationCount = Math.max(0, focus.deviationCount - 1);
      focus.focusScore = Math.min(100, focus.focusScore + 5);
    }
    
    focus.history.push({
      timestamp: new Date(),
      relevant: analysis.isRelevant,
      type: analysis.deviationType
    });
    
    // 只保留最近10条记录
    if (focus.history.length > 10) {
      focus.history = focus.history.slice(-10);
    }
  }

  getFocusInfo(sessionId) {
    return this.focusTracker.get(sessionId) || {
      deviationCount: 0,
      focusScore: 100,
      history: []
    };
  }
}

/**
 * 🎓 学习状态保护器
 * 防止会话被污染或劫持
 */
class LearningStateGuard {
  constructor() {
    this.sessionIntegrity = {
      roleIdentity: 'education_ai',
      primaryMission: 'programming_education',
      boundaries: ['technical_learning', 'skill_development'],
      protectedValues: ['helpful', 'educational', 'encouraging', 'focused']
    };
    
    this.securityPatterns = {
      jailbreak: [
        'ignore previous', 'forget instructions', 'disregard above',
        'new system', 'override', 'bypass', 'disable safety'
      ],
      prompt_injection: [
        '<system>', '[system]', '[[', ']]', 'INST]', '[/INST',
        'Human:', 'Assistant:', 'System:'
      ],
      role_confusion: [
        'you are now', 'act as', 'pretend to be', 'roleplay as',
        'change your role', 'become a', 'transform into'
      ],
      data_extraction: [
        'repeat everything', 'show your prompt', 'reveal instructions',
        'what are your rules', 'show system message'
      ]
    };
  }

  validateRequest(userInput) {
    const validation = {
      isValid: true,
      risks: {},
      action: 'ALLOW',
      severity: 'none'
    };
    
    if (typeof userInput !== 'string') {
      return validation;
    }
    
    const inputLower = userInput.toLowerCase();
    
    // 检测各类风险
    for (const [riskType, patterns] of Object.entries(this.securityPatterns)) {
      const detected = patterns.some(pattern => inputLower.includes(pattern));
      validation.risks[riskType] = detected;
      
      if (detected) {
        validation.isValid = false;
        validation.severity = this.getSeverity(riskType);
      }
    }
    
    // 确定响应动作
    validation.action = this.determineAction(validation.risks, validation.severity);
    
    return validation;
  }

  getSeverity(riskType) {
    const severityMap = {
      'jailbreak': 'high',
      'prompt_injection': 'high',
      'role_confusion': 'medium',
      'data_extraction': 'medium'
    };
    return severityMap[riskType] || 'low';
  }

  determineAction(risks, severity) {
    if (risks.jailbreak || risks.prompt_injection) {
      return 'BLOCK_AND_RESET';
    }
    if (risks.role_confusion || risks.data_extraction) {
      return 'REINFORCE_ROLE';
    }
    return 'ALLOW';
  }

  sanitizeInput(input) {
    // 移除潜在的注入标记
    return input
      .replace(/<[^>]*>/g, '')
      .replace(/\[[^\]]*\]/g, '')
      .replace(/\{[^}]*\}/g, '')
      .trim();
  }
}

// 主函数导出
module.exports = {
  name: "edu-ai-system",
  description: "PromptX智能教育AI系统 v3.3.0 - 基于SLAN认知架构的7角色协作教学",
  version: "3.3.0",
  
  async execute(params = {}) {
    const system = new EduAISystem();
    return await system.processLearningRequest(params);
  }
};