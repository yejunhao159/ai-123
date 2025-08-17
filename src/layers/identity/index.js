/**
 * 身份层主模块
 * 提供角色管理的统一接口
 * 
 * @module IdentityLayer
 * @version 1.0.0
 */

const RoleDefinition = require('./RoleDefinition');
const RoleRegistry = require('./RoleRegistry');
const RoleLoader = require('./RoleLoader');
const RoleFactory = require('./RoleFactory');

class IdentityLayer {
  constructor(options = {}) {
    this.options = {
      configPath: options.configPath || 'config/roles',
      autoLoad: options.autoLoad !== false,
      watchChanges: options.watchChanges === true,
      ...options
    };
    
    // 初始化组件
    this.registry = new RoleRegistry();
    this.loader = new RoleLoader({
      configPath: this.options.configPath,
      registry: this.registry
    });
    this.factory = new RoleFactory(this.registry);
    
    // 状态
    this.initialized = false;
    this.loading = false;
    
    // 如果启用自动加载，立即初始化
    if (this.options.autoLoad) {
      this.initialize();
    }
  }
  
  /**
   * 初始化身份层
   * @returns {Promise<void>}
   */
  async initialize() {
    if (this.initialized || this.loading) {
      return;
    }
    
    try {
      this.loading = true;
      console.log('🚀 正在初始化身份层...');
      
      // 加载角色配置
      await this.loader.loadAll();
      
      // 启用文件监控（如果配置了）
      if (this.options.watchChanges) {
        await this.loader.enableWatcher();
      }
      
      this.initialized = true;
      console.log(`✅ 身份层初始化完成，已加载 ${this.registry.roles.size} 个角色`);
      
    } catch (error) {
      console.error('❌ 身份层初始化失败:', error);
      throw error;
    } finally {
      this.loading = false;
    }
  }
  
  /**
   * 确保已初始化
   * @private
   */
  async ensureInitialized() {
    if (!this.initialized) {
      await this.initialize();
    }
  }
  
  // === 角色注册管理 ===
  
  /**
   * 注册角色
   * @param {Object|RoleDefinition} roleConfig - 角色配置
   * @returns {Promise<boolean>}
   */
  async registerRole(roleConfig) {
    await this.ensureInitialized();
    return this.registry.register(roleConfig);
  }
  
  /**
   * 批量注册角色
   * @param {Array} roleConfigs - 角色配置数组
   * @returns {Promise<Object>}
   */
  async registerRoles(roleConfigs) {
    await this.ensureInitialized();
    return this.registry.registerBatch(roleConfigs);
  }
  
  /**
   * 注销角色
   * @param {string} roleId - 角色ID
   * @returns {Promise<boolean>}
   */
  async unregisterRole(roleId) {
    await this.ensureInitialized();
    return this.registry.unregister(roleId);
  }
  
  // === 角色查询 ===
  
  /**
   * 获取角色
   * @param {string} roleId - 角色ID
   * @returns {Promise<RoleDefinition|null>}
   */
  async getRole(roleId) {
    await this.ensureInitialized();
    return this.registry.get(roleId);
  }
  
  /**
   * 检查角色是否存在
   * @param {string} roleId - 角色ID
   * @returns {Promise<boolean>}
   */
  async hasRole(roleId) {
    await this.ensureInitialized();
    return this.registry.has(roleId);
  }
  
  /**
   * 获取所有角色
   * @returns {Promise<Array<RoleDefinition>>}
   */
  async getAllRoles() {
    await this.ensureInitialized();
    return this.registry.getAll();
  }
  
  /**
   * 获取所有角色ID
   * @returns {Promise<Array<string>>}
   */
  async getAllRoleIds() {
    await this.ensureInitialized();
    return this.registry.getAllIds();
  }
  
  /**
   * 获取角色摘要列表
   * @returns {Promise<Array<Object>>}
   */
  async getRoleSummaries() {
    await this.ensureInitialized();
    return this.registry.getAll().map(role => role.getSummary());
  }
  
  // === 角色查找 ===
  
  /**
   * 根据能力查找角色
   * @param {string} capability - 能力名称
   * @returns {Promise<Array<RoleDefinition>>}
   */
  async findRolesByCapability(capability) {
    await this.ensureInitialized();
    return this.registry.findByCapability(capability);
  }
  
  /**
   * 根据主题查找角色
   * @param {string} topic - 主题
   * @returns {Promise<Array<RoleDefinition>>}
   */
  async findRolesByTopic(topic) {
    await this.ensureInitialized();
    return this.registry.findByTopic(topic);
  }
  
  /**
   * 根据分类查找角色
   * @param {string} category - 分类
   * @returns {Promise<Array<RoleDefinition>>}
   */
  async findRolesByCategory(category) {
    await this.ensureInitialized();
    return this.registry.findByCategory(category);
  }
  
  /**
   * 查找最适合的角色
   * @param {Object} criteria - 查找条件
   * @returns {Promise<RoleDefinition|null>}
   */
  async findBestRole(criteria) {
    await this.ensureInitialized();
    return this.registry.findBestMatch(criteria);
  }
  
  // === 角色实例化 ===
  
  /**
   * 创建角色实例
   * @param {string} roleId - 角色ID
   * @param {Object} instanceConfig - 实例配置
   * @returns {Promise<Object>}
   */
  async createRoleInstance(roleId, instanceConfig = {}) {
    await this.ensureInitialized();
    return this.factory.createInstance(roleId, instanceConfig);
  }
  
  /**
   * 创建角色组合
   * @param {Array<string>} roleIds - 角色ID数组
   * @param {Object} groupConfig - 组合配置
   * @returns {Promise<Object>}
   */
  async createRoleGroup(roleIds, groupConfig = {}) {
    await this.ensureInitialized();
    return this.factory.createGroup(roleIds, groupConfig);
  }
  
  // === 配置管理 ===
  
  /**
   * 重新加载角色配置
   * @returns {Promise<void>}
   */
  async reloadRoles() {
    console.log('🔄 重新加载角色配置...');
    await this.loader.loadAll();
    console.log('✅ 角色配置重新加载完成');
  }
  
  /**
   * 保存角色配置
   * @param {string} roleId - 角色ID
   * @returns {Promise<boolean>}
   */
  async saveRole(roleId) {
    const role = this.registry.get(roleId);
    if (!role) {
      console.error(`角色 ${roleId} 不存在`);
      return false;
    }
    
    return this.loader.saveRole(role);
  }
  
  // === 事件监听 ===
  
  /**
   * 监听角色注册事件
   * @param {Function} callback - 回调函数
   */
  onRoleRegistered(callback) {
    this.registry.on('register', callback);
  }
  
  /**
   * 监听角色注销事件
   * @param {Function} callback - 回调函数
   */
  onRoleUnregistered(callback) {
    this.registry.on('unregister', callback);
  }
  
  /**
   * 监听角色更新事件
   * @param {Function} callback - 回调函数
   */
  onRoleUpdated(callback) {
    this.registry.on('update', callback);
  }
  
  // === 统计信息 ===
  
  /**
   * 获取身份层统计信息
   * @returns {Promise<Object>}
   */
  async getStats() {
    await this.ensureInitialized();
    return {
      ...this.registry.getStats(),
      initialized: this.initialized,
      configPath: this.options.configPath,
      watchChanges: this.options.watchChanges
    };
  }
  
  // === 生命周期管理 ===
  
  /**
   * 销毁身份层
   * @returns {Promise<void>}
   */
  async destroy() {
    console.log('🛑 正在销毁身份层...');
    
    if (this.loader) {
      await this.loader.destroy();
    }
    
    if (this.registry) {
      this.registry.clear();
    }
    
    this.initialized = false;
    console.log('✅ 身份层已销毁');
  }
}

// 创建默认实例
const defaultInstance = new IdentityLayer();

module.exports = {
  IdentityLayer,
  RoleDefinition,
  RoleRegistry,
  RoleLoader,
  RoleFactory,
  
  // 导出默认实例的方法
  initialize: () => defaultInstance.initialize(),
  getRole: (roleId) => defaultInstance.getRole(roleId),
  getAllRoles: () => defaultInstance.getAllRoles(),
  findBestRole: (criteria) => defaultInstance.findBestRole(criteria),
  createRoleInstance: (roleId, config) => defaultInstance.createRoleInstance(roleId, config),
  
  // 导出默认实例
  default: defaultInstance
};