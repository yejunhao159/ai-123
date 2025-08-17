/**
 * 角色定义基类
 * 定义角色的核心属性和能力边界
 * 
 * @module RoleDefinition
 * @version 1.0.0
 */

class RoleDefinition {
  constructor(config = {}) {
    // 角色基本信息
    this.id = config.id || '';
    this.name = config.name || '';
    this.description = config.description || '';
    this.emoji = config.emoji || '🤖';
    this.version = config.version || '1.0.0';
    
    // 角色能力定义
    this.capabilities = {
      primary: config.capabilities?.primary || [],      // 主要能力
      secondary: config.capabilities?.secondary || [],  // 次要能力
      limitations: config.capabilities?.limitations || [] // 能力限制
    };
    
    // 角色特性
    this.characteristics = {
      personality: config.characteristics?.personality || {}, // 个性特征
      communicationStyle: config.characteristics?.communicationStyle || {}, // 沟通风格
      expertise: config.characteristics?.expertise || [] // 专业领域
    };
    
    // 协作关系
    this.collaboration = {
      canDiscussWith: config.collaboration?.canDiscussWith || [],
      leadTopics: config.collaboration?.leadTopics || [],
      supportRole: config.collaboration?.supportRole || []
    };
    
    // 行为模式
    this.behaviors = {
      triggers: config.behaviors?.triggers || {},     // 触发条件
      responses: config.behaviors?.responses || {},   // 响应模式
      strategies: config.behaviors?.strategies || {}   // 策略模式
    };
    
    // 元数据
    this.metadata = {
      createdAt: config.metadata?.createdAt || new Date().toISOString(),
      updatedAt: config.metadata?.updatedAt || new Date().toISOString(),
      author: config.metadata?.author || 'system',
      tags: config.metadata?.tags || []
    };
  }
  
  /**
   * 验证角色定义的完整性
   * @returns {Object} 验证结果
   */
  validate() {
    const errors = [];
    const warnings = [];
    
    // 必填字段验证
    if (!this.id) errors.push('角色ID不能为空');
    if (!this.name) errors.push('角色名称不能为空');
    if (this.capabilities.primary.length === 0) {
      warnings.push('未定义主要能力');
    }
    
    // ID格式验证
    if (this.id && !/^[a-z-]+$/.test(this.id)) {
      errors.push('角色ID只能包含小写字母和连字符');
    }
    
    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }
  
  /**
   * 检查角色是否具有特定能力
   * @param {string} capability - 能力名称
   * @returns {boolean}
   */
  hasCapability(capability) {
    return this.capabilities.primary.includes(capability) ||
           this.capabilities.secondary.includes(capability);
  }
  
  /**
   * 检查角色是否可以处理特定主题
   * @param {string} topic - 主题
   * @returns {boolean}
   */
  canHandleTopic(topic) {
    return this.collaboration.leadTopics.includes(topic);
  }
  
  /**
   * 检查是否可以与另一个角色协作
   * @param {string} roleId - 另一个角色的ID
   * @returns {boolean}
   */
  canCollaborateWith(roleId) {
    return this.collaboration.canDiscussWith.includes('all') ||
           this.collaboration.canDiscussWith.includes(roleId);
  }
  
  /**
   * 获取角色对特定触发条件的响应
   * @param {string} trigger - 触发条件
   * @returns {*} 响应内容
   */
  getResponse(trigger) {
    if (this.behaviors.triggers[trigger]) {
      const responseKey = this.behaviors.triggers[trigger];
      return this.behaviors.responses[responseKey];
    }
    return null;
  }
  
  /**
   * 获取角色策略
   * @param {string} situation - 情境
   * @returns {*} 策略内容
   */
  getStrategy(situation) {
    return this.behaviors.strategies[situation] || null;
  }
  
  /**
   * 更新角色配置
   * @param {Object} updates - 更新内容
   */
  update(updates) {
    // 深度合并更新
    this.mergeDeep(this, updates);
    this.metadata.updatedAt = new Date().toISOString();
  }
  
  /**
   * 深度合并对象
   * @private
   */
  mergeDeep(target, source) {
    for (const key in source) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        if (!target[key]) target[key] = {};
        this.mergeDeep(target[key], source[key]);
      } else {
        target[key] = source[key];
      }
    }
  }
  
  /**
   * 导出为JSON配置
   * @returns {Object} JSON配置对象
   */
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      emoji: this.emoji,
      version: this.version,
      capabilities: this.capabilities,
      characteristics: this.characteristics,
      collaboration: this.collaboration,
      behaviors: this.behaviors,
      metadata: this.metadata
    };
  }
  
  /**
   * 从JSON配置创建实例
   * @static
   * @param {Object} json - JSON配置
   * @returns {RoleDefinition}
   */
  static fromJSON(json) {
    return new RoleDefinition(json);
  }
  
  /**
   * 克隆角色定义
   * @returns {RoleDefinition} 新的角色实例
   */
  clone() {
    return new RoleDefinition(this.toJSON());
  }
  
  /**
   * 获取角色摘要信息
   * @returns {Object} 摘要信息
   */
  getSummary() {
    return {
      id: this.id,
      name: this.name,
      emoji: this.emoji,
      description: this.description,
      primaryCapabilities: this.capabilities.primary,
      leadTopics: this.collaboration.leadTopics
    };
  }
}

module.exports = RoleDefinition;