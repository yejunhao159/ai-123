/**
 * 教师团队分析器 - 实现多角色并行思考
 * @module TeacherTeamAnalyzer
 */

class TeacherTeamAnalyzer {
  constructor() {
    // 定义所有可用的"教师"角色
    this.teachers = {
      'ai-class-advisor': {
        name: '班主任',
        strengths: ['整体规划', '进度管理', '学习路径'],
        triggers: ['开始', '计划', '目标', '进度']
      },
      'story-teller': {
        name: '故事讲述者',
        strengths: ['概念解释', '类比', '直觉理解'],
        triggers: ['不懂', '解释', '什么是', '为什么']
      },
      'skill-coach': {
        name: '技能教练',
        strengths: ['实践指导', '代码示例', '动手练习'],
        triggers: ['怎么做', '代码', '实现', '练习']
      },
      'confusion-detective': {
        name: '困惑侦探',
        strengths: ['问题诊断', '错误分析', '概念澄清'],
        triggers: ['错误', '问题', '不对', '疑惑', '卡住']
      },
      'task-decomposer': {
        name: '任务分解专家',
        strengths: ['任务拆解', '步骤规划', '复杂度管理'],
        triggers: ['复杂', '大项目', '步骤', '分解']
      },
      'achievement-designer': {
        name: '成就设计师',
        strengths: ['激励设计', '目标设定', '进度可视化'],
        triggers: ['成就', '目标', '激励', '进展']
      },
      'experience-accumulator': {
        name: '经验积累官',
        strengths: ['知识总结', '复习规划', '长期记忆'],
        triggers: ['总结', '复习', '回顾', '记住']
      }
    };
  }

  /**
   * 并行分析 - 所有教师同时"观察"学生的问题
   * @param {string} studentMessage - 学生的消息
   * @param {object} context - 上下文信息
   * @returns {object} 多角色分析结果
   */
  async analyzeInParallel(studentMessage, context = {}) {
    const analysisResults = [];
    
    // 1. 所有教师同时分析（并行思考）
    const analyses = await Promise.all(
      Object.entries(this.teachers).map(async ([roleId, teacher]) => {
        const relevance = this.calculateRelevance(studentMessage, teacher, context);
        const suggestion = this.generateSuggestion(roleId, studentMessage, context);
        
        return {
          roleId,
          roleName: teacher.name,
          relevance,
          suggestion,
          confidence: relevance.score
        };
      })
    );

    // 2. 按相关性排序
    analyses.sort((a, b) => b.confidence - a.confidence);

    // 3. 选择主要回答者和备选者
    const primary = analyses[0];
    const alternatives = analyses.slice(1, 4); // 最多3个备选

    return {
      primary: {
        role: primary.roleId,
        roleName: primary.roleName,
        confidence: primary.confidence,
        suggestion: primary.suggestion,
        reason: primary.relevance.reason
      },
      alternatives: alternatives.map(alt => ({
        role: alt.roleId,
        roleName: alt.roleName,
        preview: this.generatePreview(alt.suggestion),
        confidence: alt.confidence
      })),
      teamThinking: {
        totalAnalyzed: analyses.length,
        consensusLevel: this.calculateConsensus(analyses),
        diversityScore: this.calculateDiversity(analyses)
      }
    };
  }

  /**
   * 计算角色与问题的相关性
   */
  calculateRelevance(message, teacher, context) {
    let score = 0;
    let reasons = [];
    
    // 1. 关键词匹配
    const messageLower = message.toLowerCase();
    const keywordMatches = teacher.triggers.filter(trigger => 
      messageLower.includes(trigger)
    );
    score += keywordMatches.length * 0.3;
    if (keywordMatches.length > 0) {
      reasons.push(`包含关键词: ${keywordMatches.join(', ')}`);
    }

    // 2. 上下文相关性
    if (context.previousRole === teacher.roleId) {
      score += 0.1; // 轻微倾向于保持连续性
      reasons.push('保持教学连续性');
    }

    // 3. 学习阶段匹配
    if (context.learningPhase) {
      const phaseMatch = this.matchPhase(context.learningPhase, teacher.strengths);
      score += phaseMatch * 0.2;
      if (phaseMatch > 0) {
        reasons.push(`适合当前学习阶段: ${context.learningPhase}`);
      }
    }

    // 4. 随机因素（模拟真实教师的主观判断）
    score += Math.random() * 0.1;

    return {
      score: Math.min(score, 1),
      reason: reasons.join('; ') || '一般相关'
    };
  }

  /**
   * 生成建议内容
   */
  generateSuggestion(roleId, message, context) {
    // 这里应该调用各角色的具体逻辑
    // 简化版本：返回角色特定的回答模板
    const templates = {
      'story-teller': `我来用一个生动的故事解释这个概念...`,
      'skill-coach': `让我们通过实际代码来练习...`,
      'confusion-detective': `我发现你可能在这里遇到了困惑，让我们一起分析...`,
      'ai-class-advisor': `基于你的学习进度，我建议下一步...`,
      'task-decomposer': `这个任务可以分解为以下几个步骤...`,
      'achievement-designer': `太棒了！你已经完成了...`,
      'experience-accumulator': `让我们总结一下你学到的知识...`
    };
    
    return templates[roleId] || '我来帮助你...';
  }

  /**
   * 生成预览文本
   */
  generatePreview(suggestion) {
    // 截取前30个字符作为预览
    return suggestion.substring(0, 30) + '...';
  }

  /**
   * 计算团队共识度
   */
  calculateConsensus(analyses) {
    if (analyses.length < 2) return 1;
    
    const topScore = analyses[0].confidence;
    const secondScore = analyses[1].confidence;
    
    // 如果第一名远超第二名，说明共识度高
    const gap = topScore - secondScore;
    return Math.min(gap * 2, 1);
  }

  /**
   * 计算观点多样性
   */
  calculateDiversity(analyses) {
    const highConfidenceRoles = analyses.filter(a => a.confidence > 0.5);
    return highConfidenceRoles.length / analyses.length;
  }

  /**
   * 匹配学习阶段
   */
  matchPhase(phase, strengths) {
    const phaseMapping = {
      'exploring': ['整体规划', '概念解释'],
      'learning': ['实践指导', '概念解释'],
      'practicing': ['实践指导', '错误分析'],
      'mastering': ['知识总结', '进度可视化']
    };
    
    const targetStrengths = phaseMapping[phase] || [];
    const matches = strengths.filter(s => targetStrengths.includes(s));
    
    return matches.length / Math.max(targetStrengths.length, 1);
  }

  /**
   * 处理用户选择
   */
  handleUserChoice(choice, alternatives) {
    // 记录用户偏好
    this.recordPreference(choice);
    
    // 返回用户选择的角色的完整回答
    const selected = alternatives.find(alt => alt.role === choice);
    return selected || alternatives[0];
  }

  /**
   * 记录用户偏好（用于未来的个性化）
   */
  recordPreference(roleId) {
    // TODO: 实现偏好记录逻辑
    console.log(`User prefers: ${roleId}`);
  }
}

module.exports = TeacherTeamAnalyzer;