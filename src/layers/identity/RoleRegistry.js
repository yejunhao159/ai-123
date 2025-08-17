/**
 * 角色注册表
 * 管理所有角色的注册、查找和生命周期
 * 
 * @module RoleRegistry
 * @version 1.0.0
 */

const RoleDefinition = require('./RoleDefinition');

class RoleRegistry {
  constructor() {
    // 注册的角色Map
    this.roles = new Map();
    
    // 角色分类索引
    this.categories = new Map();
    
    // 能力索引
    this.capabilityIndex = new Map();
    
    // 主题索引
    this.topicIndex = new Map();
    
    // 注册监听器
    this.listeners = {
      register: [],
      unregister: [],
      update: []
    };
  }
  
  /**
   * 注册角色
   * @param {RoleDefinition|Object} roleDefinition - 角色定义
   * @returns {boolean} 注册是否成功
   */
  register(roleDefinition) {
    try {
      // 如果是普通对象，转换为RoleDefinition实例
      if (!(roleDefinition instanceof RoleDefinition)) {
        roleDefinition = new RoleDefinition(roleDefinition);
      }
      
      // 验证角色定义
      const validation = roleDefinition.validate();
      if (!validation.valid) {
        console.error(`角色注册失败: ${validation.errors.join(', ')}`);
        return false;
      }
      
      // 检查是否已存在
      if (this.roles.has(roleDefinition.id)) {
        console.warn(`角色 ${roleDefinition.id} 已存在，将被覆盖`);
      }
      
      // 注册角色
      this.roles.set(roleDefinition.id, roleDefinition);
      
      // 更新索引
      this.updateIndexes(roleDefinition);
      
      // 触发注册事件
      this.emit('register', roleDefinition);
      
      console.log(`✅ 角色注册成功: ${roleDefinition.name} (${roleDefinition.id})`);
      return true;
      
    } catch (error) {
      console.error(`角色注册失败:`, error);
      return false;
    }
  }
  
  /**
   * 批量注册角色
   * @param {Array} roleDefinitions - 角色定义数组
   * @returns {Object} 注册结果统计
   */
  registerBatch(roleDefinitions) {
    const results = {
      success: 0,
      failed: 0,
      total: roleDefinitions.length
    };
    
    for (const roleDef of roleDefinitions) {
      if (this.register(roleDef)) {
        results.success++;
      } else {
        results.failed++;
      }
    }
    
    console.log(`📊 批量注册完成: ${results.success}/${results.total} 成功`);
    return results;
  }
  
  /**
   * 注销角色
   * @param {string} roleId - 角色ID
   * @returns {boolean} 注销是否成功
   */
  unregister(roleId) {
    if (!this.roles.has(roleId)) {
      console.warn(`角色 ${roleId} 不存在`);
      return false;
    }
    
    const role = this.roles.get(roleId);
    
    // 移除角色
    this.roles.delete(roleId);
    
    // 更新索引
    this.removeFromIndexes(role);
    
    // 触发注销事件
    this.emit('unregister', role);
    
    console.log(`🗑️ 角色已注销: ${role.name} (${roleId})`);
    return true;
  }
  
  /**
   * 获取角色
   * @param {string} roleId - 角色ID
   * @returns {RoleDefinition|null}
   */
  get(roleId) {
    return this.roles.get(roleId) || null;
  }
  
  /**
   * 检查角色是否存在
   * @param {string} roleId - 角色ID
   * @returns {boolean}
   */
  has(roleId) {
    return this.roles.has(roleId);
  }
  
  /**
   * 获取所有角色
   * @returns {Array<RoleDefinition>}
   */
  getAll() {
    return Array.from(this.roles.values());
  }
  
  /**
   * 获取所有角色ID
   * @returns {Array<string>}
   */
  getAllIds() {
    return Array.from(this.roles.keys());
  }
  
  /**
   * 根据能力查找角色
   * @param {string} capability - 能力名称
   * @returns {Array<RoleDefinition>}
   */
  findByCapability(capability) {
    const roleIds = this.capabilityIndex.get(capability) || [];
    return roleIds.map(id => this.roles.get(id)).filter(Boolean);
  }
  
  /**
   * 根据主题查找角色
   * @param {string} topic - 主题
   * @returns {Array<RoleDefinition>}
   */
  findByTopic(topic) {
    const roleIds = this.topicIndex.get(topic) || [];
    return roleIds.map(id => this.roles.get(id)).filter(Boolean);
  }
  
  /**
   * 根据分类查找角色
   * @param {string} category - 分类
   * @returns {Array<RoleDefinition>}
   */
  findByCategory(category) {
    const roleIds = this.categories.get(category) || [];
    return roleIds.map(id => this.roles.get(id)).filter(Boolean);
  }
  
  /**
   * 查找最适合的角色
   * @param {Object} criteria - 查找条件
   * @returns {RoleDefinition|null}
   */
  findBestMatch(criteria) {
    const { capability, topic, exclude = [] } = criteria;
    
    let candidates = this.getAll();
    
    // 排除指定角色
    if (exclude.length > 0) {
      candidates = candidates.filter(role => !exclude.includes(role.id));
    }
    
    // 按能力筛选
    if (capability) {
      candidates = candidates.filter(role => role.hasCapability(capability));
    }
    
    // 按主题筛选
    if (topic) {
      candidates = candidates.filter(role => role.canHandleTopic(topic));
    }
    
    // 如果没有候选者，返回null
    if (candidates.length === 0) return null;
    
    // 如果只有一个候选者，直接返回
    if (candidates.length === 1) return candidates[0];
    
    // 计算匹配分数并排序
    const scored = candidates.map(role => ({
      role,
      score: this.calculateMatchScore(role, criteria)
    }));
    
    scored.sort((a, b) => b.score - a.score);
    
    return scored[0].role;
  }
  
  /**
   * 计算角色匹配分数
   * @private
   */
  calculateMatchScore(role, criteria) {
    let score = 0;
    
    // 能力匹配分数
    if (criteria.capability && role.hasCapability(criteria.capability)) {
      score += role.capabilities.primary.includes(criteria.capability) ? 3 : 1;
    }
    
    // 主题匹配分数
    if (criteria.topic && role.canHandleTopic(criteria.topic)) {
      score += 2;
    }
    
    // 专业度分数
    score += role.capabilities.primary.length * 0.1;
    
    return score;
  }
  
  /**
   * 更新索引
   * @private
   */
  updateIndexes(role) {
    // 更新能力索引
    const allCapabilities = [...role.capabilities.primary, ...role.capabilities.secondary];
    for (const capability of allCapabilities) {
      if (!this.capabilityIndex.has(capability)) {
        this.capabilityIndex.set(capability, []);
      }
      const roleIds = this.capabilityIndex.get(capability);
      if (!roleIds.includes(role.id)) {
        roleIds.push(role.id);
      }
    }
    
    // 更新主题索引
    for (const topic of role.collaboration.leadTopics) {
      if (!this.topicIndex.has(topic)) {
        this.topicIndex.set(topic, []);
      }
      const roleIds = this.topicIndex.get(topic);
      if (!roleIds.includes(role.id)) {
        roleIds.push(role.id);
      }
    }
    
    // 更新分类索引（基于标签）
    for (const tag of role.metadata.tags) {
      if (!this.categories.has(tag)) {
        this.categories.set(tag, []);
      }
      const roleIds = this.categories.get(tag);
      if (!roleIds.includes(role.id)) {
        roleIds.push(role.id);
      }
    }
  }
  
  /**
   * 从索引中移除角色
   * @private
   */
  removeFromIndexes(role) {
    // 从能力索引移除
    const allCapabilities = [...role.capabilities.primary, ...role.capabilities.secondary];
    for (const capability of allCapabilities) {
      const roleIds = this.capabilityIndex.get(capability) || [];
      const index = roleIds.indexOf(role.id);
      if (index > -1) {
        roleIds.splice(index, 1);
        if (roleIds.length === 0) {
          this.capabilityIndex.delete(capability);
        }
      }
    }
    
    // 从主题索引移除
    for (const topic of role.collaboration.leadTopics) {
      const roleIds = this.topicIndex.get(topic) || [];
      const index = roleIds.indexOf(role.id);
      if (index > -1) {
        roleIds.splice(index, 1);
        if (roleIds.length === 0) {
          this.topicIndex.delete(topic);
        }
      }
    }
    
    // 从分类索引移除
    for (const tag of role.metadata.tags) {
      const roleIds = this.categories.get(tag) || [];
      const index = roleIds.indexOf(role.id);
      if (index > -1) {
        roleIds.splice(index, 1);
        if (roleIds.length === 0) {
          this.categories.delete(tag);
        }
      }
    }
  }
  
  /**
   * 添加事件监听器
   * @param {string} event - 事件类型
   * @param {Function} callback - 回调函数
   */
  on(event, callback) {
    if (this.listeners[event]) {
      this.listeners[event].push(callback);
    }
  }
  
  /**
   * 触发事件
   * @private
   */
  emit(event, data) {
    const callbacks = this.listeners[event] || [];
    callbacks.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`事件回调执行失败:`, error);
      }
    });
  }
  
  /**
   * 获取注册表统计信息
   * @returns {Object} 统计信息
   */
  getStats() {
    return {
      totalRoles: this.roles.size,
      totalCapabilities: this.capabilityIndex.size,
      totalTopics: this.topicIndex.size,
      totalCategories: this.categories.size,
      rolesByCategory: Array.from(this.categories.entries()).map(([category, roleIds]) => ({
        category,
        count: roleIds.length
      }))
    };
  }
  
  /**
   * 清空注册表
   */
  clear() {
    this.roles.clear();
    this.categories.clear();
    this.capabilityIndex.clear();
    this.topicIndex.clear();
    console.log('🧹 角色注册表已清空');
  }
}

module.exports = RoleRegistry;