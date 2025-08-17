/**
 * 角色工厂
 * 负责创建角色实例和角色组合，提供高级角色管理功能
 * 
 * @module RoleFactory
 * @version 1.0.0
 */

const RoleDefinition = require('./RoleDefinition');

class RoleFactory {
  constructor(registry) {
    this.registry = registry;
    this.instanceCounter = 0;
    this.activeInstances = new Map();
    this.groups = new Map();
  }
  
  /**
   * 创建角色实例
   * @param {string} roleId - 角色ID
   * @param {Object} instanceConfig - 实例配置
   * @returns {Object} 角色实例
   */
  createInstance(roleId, instanceConfig = {}) {
    try {
      const roleDefinition = this.registry.get(roleId);
      if (!roleDefinition) {
        throw new Error(`角色不存在: ${roleId}`);
      }
      
      const instanceId = instanceConfig.instanceId || this.generateInstanceId(roleId);
      
      const instance = {
        // 基本信息
        instanceId,
        roleId: roleDefinition.id,
        roleName: roleDefinition.name,
        emoji: roleDefinition.emoji,
        
        // 角色定义
        definition: roleDefinition.clone(),
        
        // 实例状态
        state: {
          active: true,
          created: new Date().toISOString(),
          lastActivity: new Date().toISOString(),
          context: instanceConfig.context || {},
          memory: instanceConfig.memory || {},
          preferences: instanceConfig.preferences || {}
        },
        
        // 实例配置
        config: {
          enableMemory: instanceConfig.enableMemory !== false,
          enableLearning: instanceConfig.enableLearning === true,
          maxMemorySize: instanceConfig.maxMemorySize || 1000,
          ...instanceConfig
        },
        
        // 方法
        ...this.createInstanceMethods(roleDefinition, instanceId)
      };
      
      // 注册实例
      this.activeInstances.set(instanceId, instance);
      
      console.log(`🎭 角色实例创建成功: ${roleDefinition.name} (${instanceId})`);
      return instance;
      
    } catch (error) {
      console.error(`❌ 创建角色实例失败: ${roleId}`, error);
      throw error;
    }
  }
  
  /**
   * 创建角色组合
   * @param {Array<string>} roleIds - 角色ID数组
   * @param {Object} groupConfig - 组合配置
   * @returns {Object} 角色组合
   */
  createGroup(roleIds, groupConfig = {}) {
    try {
      const groupId = groupConfig.groupId || this.generateGroupId();
      
      // 创建组合中的角色实例
      const members = [];
      for (const roleId of roleIds) {
        const instanceConfig = {
          ...groupConfig.memberConfig,
          groupId,
          groupRole: this.determineGroupRole(roleId, roleIds)
        };
        
        const instance = this.createInstance(roleId, instanceConfig);
        members.push(instance);
      }
      
      const group = {
        // 基本信息
        groupId,
        name: groupConfig.name || `角色组合-${groupId}`,
        description: groupConfig.description || '',
        
        // 成员
        members,
        memberIds: roleIds,
        
        // 组合状态
        state: {
          active: true,
          created: new Date().toISOString(),
          lastActivity: new Date().toISOString(),
          currentLeader: this.selectGroupLeader(members),
          collaborationMode: groupConfig.collaborationMode || 'sequential'
        },
        
        // 组合配置
        config: {
          enableGroupMemory: groupConfig.enableGroupMemory !== false,
          conflictResolution: groupConfig.conflictResolution || 'majority',
          leadershipStyle: groupConfig.leadershipStyle || 'rotating',
          ...groupConfig
        },
        
        // 方法
        ...this.createGroupMethods(groupId)
      };
      
      // 注册组合
      this.groups.set(groupId, group);
      
      console.log(`👥 角色组合创建成功: ${group.name} (${groupId})`);
      return group;
      
    } catch (error) {
      console.error(`❌ 创建角色组合失败:`, error);
      throw error;
    }
  }
  
  /**
   * 创建实例方法
   * @private
   */
  createInstanceMethods(roleDefinition, instanceId) {
    return {
      // 获取能力信息
      getCapabilities: () => roleDefinition.capabilities,
      
      // 检查能力
      hasCapability: (capability) => roleDefinition.hasCapability(capability),
      
      // 检查主题
      canHandleTopic: (topic) => roleDefinition.canHandleTopic(topic),
      
      // 检查协作
      canCollaborateWith: (otherRoleId) => roleDefinition.canCollaborateWith(otherRoleId),
      
      // 获取响应
      getResponse: (trigger) => roleDefinition.getResponse(trigger),
      
      // 获取策略
      getStrategy: (situation) => roleDefinition.getStrategy(situation),
      
      // 更新状态
      updateState: (updates) => {
        const instance = this.activeInstances.get(instanceId);
        if (instance) {
          Object.assign(instance.state, updates);
          instance.state.lastActivity = new Date().toISOString();
        }
      },
      
      // 添加记忆
      addMemory: (key, value) => {
        const instance = this.activeInstances.get(instanceId);
        if (instance && instance.config.enableMemory) {
          instance.state.memory[key] = {
            value,
            timestamp: new Date().toISOString()
          };
          
          // 限制记忆大小
          const memoryKeys = Object.keys(instance.state.memory);
          if (memoryKeys.length > instance.config.maxMemorySize) {
            const oldestKey = memoryKeys[0];
            delete instance.state.memory[oldestKey];
          }
        }
      },
      
      // 获取记忆
      getMemory: (key) => {
        const instance = this.activeInstances.get(instanceId);
        if (instance && instance.state.memory[key]) {
          return instance.state.memory[key].value;
        }
        return null;
      },
      
      // 设置偏好
      setPreference: (key, value) => {
        const instance = this.activeInstances.get(instanceId);
        if (instance) {
          instance.state.preferences[key] = value;
        }
      },
      
      // 获取实例信息
      getInstanceInfo: () => {
        const instance = this.activeInstances.get(instanceId);
        return instance ? {
          instanceId: instance.instanceId,
          roleId: instance.roleId,
          roleName: instance.roleName,
          state: instance.state,
          config: instance.config
        } : null;
      }
    };
  }
  
  /**
   * 创建组合方法
   * @private
   */
  createGroupMethods(groupId) {
    return {
      // 获取成员
      getMembers: () => {
        const group = this.groups.get(groupId);
        return group ? group.members : [];
      },
      
      // 获取活跃成员
      getActiveMembers: () => {
        const group = this.groups.get(groupId);
        return group ? group.members.filter(member => member.state.active) : [];
      },
      
      // 按能力查找成员
      findMembersByCapability: (capability) => {
        const group = this.groups.get(groupId);
        if (!group) return [];
        
        return group.members.filter(member => 
          member.hasCapability(capability)
        );
      },
      
      // 选择最佳成员
      selectBestMember: (criteria) => {
        const group = this.groups.get(groupId);
        if (!group) return null;
        
        let bestMember = null;
        let bestScore = -1;
        
        for (const member of group.members) {
          let score = 0;
          
          // 能力匹配分数
          if (criteria.capability && member.hasCapability(criteria.capability)) {
            score += 3;
          }
          
          // 主题匹配分数
          if (criteria.topic && member.canHandleTopic(criteria.topic)) {
            score += 2;
          }
          
          // 活跃度分数
          if (member.state.active) {
            score += 1;
          }
          
          if (score > bestScore) {
            bestScore = score;
            bestMember = member;
          }
        }
        
        return bestMember;
      },
      
      // 轮换领导者
      rotateLeader: () => {
        const group = this.groups.get(groupId);
        if (!group) return null;
        
        const activeMembers = group.members.filter(m => m.state.active);
        if (activeMembers.length === 0) return null;
        
        const currentLeaderIndex = activeMembers.findIndex(
          m => m.instanceId === group.state.currentLeader
        );
        
        const nextIndex = (currentLeaderIndex + 1) % activeMembers.length;
        const newLeader = activeMembers[nextIndex];
        
        group.state.currentLeader = newLeader.instanceId;
        group.state.lastActivity = new Date().toISOString();
        
        return newLeader;
      },
      
      // 组合决策
      makeGroupDecision: (question, options) => {
        const group = this.groups.get(groupId);
        if (!group) return null;
        
        const votes = {};
        const activeMembers = group.members.filter(m => m.state.active);
        
        // 收集投票（模拟）
        for (const member of activeMembers) {
          const vote = this.simulateVote(member, question, options);
          votes[member.instanceId] = vote;
        }
        
        // 统计结果
        const tally = {};
        Object.values(votes).forEach(vote => {
          tally[vote] = (tally[vote] || 0) + 1;
        });
        
        // 根据冲突解决策略决定
        const strategy = group.config.conflictResolution;
        let decision;
        
        switch (strategy) {
          case 'majority':
            decision = Object.keys(tally).reduce((a, b) => 
              tally[a] > tally[b] ? a : b
            );
            break;
          case 'unanimous':
            const uniqueVotes = Object.keys(tally);
            decision = uniqueVotes.length === 1 ? uniqueVotes[0] : null;
            break;
          case 'leader':
            const leader = activeMembers.find(m => 
              m.instanceId === group.state.currentLeader
            );
            decision = leader ? votes[leader.instanceId] : null;
            break;
          default:
            decision = null;
        }
        
        return {
          question,
          options,
          votes,
          tally,
          decision,
          strategy
        };
      },
      
      // 更新组合状态
      updateGroupState: (updates) => {
        const group = this.groups.get(groupId);
        if (group) {
          Object.assign(group.state, updates);
          group.state.lastActivity = new Date().toISOString();
        }
      }
    };
  }
  
  /**
   * 生成实例ID
   * @private
   */
  generateInstanceId(roleId) {
    return `${roleId}-${++this.instanceCounter}-${Date.now()}`;
  }
  
  /**
   * 生成组合ID
   * @private
   */
  generateGroupId() {
    return `group-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
  
  /**
   * 确定组合中的角色
   * @private
   */
  determineGroupRole(roleId, allRoleIds) {
    // 简单的角色分配逻辑
    if (roleId === 'ai-class-supervisor') return 'coordinator';
    if (roleId === 'storyteller') return 'conceptual';
    if (roleId === 'skill-coach') return 'practical';
    if (roleId === 'confusion-detective') return 'diagnostic';
    if (roleId === 'task-decomposer') return 'planner';
    if (roleId === 'achievement-designer') return 'motivator';
    if (roleId === 'experience-accumulator') return 'synthesizer';
    
    return 'member';
  }
  
  /**
   * 选择组合领导者
   * @private
   */
  selectGroupLeader(members) {
    // 优先选择AI班主任作为领导者
    const supervisor = members.find(m => m.roleId === 'ai-class-supervisor');
    if (supervisor) return supervisor.instanceId;
    
    // 否则选择第一个成员
    return members.length > 0 ? members[0].instanceId : null;
  }
  
  /**
   * 模拟投票
   * @private
   */
  simulateVote(member, question, options) {
    // 简单的投票模拟逻辑
    // 实际实现中应该基于角色特性和偏好
    return options[Math.floor(Math.random() * options.length)];
  }
  
  /**
   * 获取实例
   * @param {string} instanceId - 实例ID
   * @returns {Object|null}
   */
  getInstance(instanceId) {
    return this.activeInstances.get(instanceId) || null;
  }
  
  /**
   * 获取组合
   * @param {string} groupId - 组合ID
   * @returns {Object|null}
   */
  getGroup(groupId) {
    return this.groups.get(groupId) || null;
  }
  
  /**
   * 获取所有实例
   * @returns {Array<Object>}
   */
  getAllInstances() {
    return Array.from(this.activeInstances.values());
  }
  
  /**
   * 获取所有组合
   * @returns {Array<Object>}
   */
  getAllGroups() {
    return Array.from(this.groups.values());
  }
  
  /**
   * 销毁实例
   * @param {string} instanceId - 实例ID
   * @returns {boolean}
   */
  destroyInstance(instanceId) {
    const instance = this.activeInstances.get(instanceId);
    if (instance) {
      instance.state.active = false;
      this.activeInstances.delete(instanceId);
      console.log(`🗑️ 角色实例已销毁: ${instance.roleName} (${instanceId})`);
      return true;
    }
    return false;
  }
  
  /**
   * 销毁组合
   * @param {string} groupId - 组合ID
   * @returns {boolean}
   */
  destroyGroup(groupId) {
    const group = this.groups.get(groupId);
    if (group) {
      // 销毁组合中的所有实例
      for (const member of group.members) {
        this.destroyInstance(member.instanceId);
      }
      
      group.state.active = false;
      this.groups.delete(groupId);
      console.log(`🗑️ 角色组合已销毁: ${group.name} (${groupId})`);
      return true;
    }
    return false;
  }
  
  /**
   * 获取工厂统计信息
   * @returns {Object}
   */
  getStats() {
    return {
      activeInstances: this.activeInstances.size,
      activeGroups: this.groups.size,
      totalInstancesCreated: this.instanceCounter,
      instancesByRole: this.getInstancesByRole(),
      groupsBySize: this.getGroupsBySize()
    };
  }
  
  /**
   * 按角色统计实例
   * @private
   */
  getInstancesByRole() {
    const stats = {};
    for (const instance of this.activeInstances.values()) {
      const roleId = instance.roleId;
      stats[roleId] = (stats[roleId] || 0) + 1;
    }
    return stats;
  }
  
  /**
   * 按大小统计组合
   * @private
   */
  getGroupsBySize() {
    const stats = {};
    for (const group of this.groups.values()) {
      const size = group.members.length;
      stats[size] = (stats[size] || 0) + 1;
    }
    return stats;
  }
  
  /**
   * 清理非活跃实例
   * @param {number} maxAge - 最大年龄（毫秒）
   */
  cleanupInactiveInstances(maxAge = 24 * 60 * 60 * 1000) { // 默认24小时
    const now = Date.now();
    const toDelete = [];
    
    for (const [instanceId, instance] of this.activeInstances) {
      const lastActivity = new Date(instance.state.lastActivity).getTime();
      if (now - lastActivity > maxAge) {
        toDelete.push(instanceId);
      }
    }
    
    for (const instanceId of toDelete) {
      this.destroyInstance(instanceId);
    }
    
    console.log(`🧹 清理了 ${toDelete.length} 个非活跃实例`);
  }
  
  /**
   * 销毁工厂
   */
  destroy() {
    console.log('🛑 正在销毁角色工厂...');
    
    // 销毁所有组合
    for (const groupId of this.groups.keys()) {
      this.destroyGroup(groupId);
    }
    
    // 销毁所有实例
    for (const instanceId of this.activeInstances.keys()) {
      this.destroyInstance(instanceId);
    }
    
    console.log('✅ 角色工厂已销毁');
  }
}

module.exports = RoleFactory;