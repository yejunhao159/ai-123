/**
 * 角色加载器
 * 支持从配置文件动态加载角色定义，包含热加载和缓存机制
 * 
 * @module RoleLoader
 * @version 1.0.0
 */

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const RoleDefinition = require('./RoleDefinition');

// 异步文件操作
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);

class RoleLoader {
  constructor(options = {}) {
    this.configPath = options.configPath || 'config/roles';
    this.registry = options.registry || null;
    this.supportedFormats = options.supportedFormats || ['json', 'yaml', 'yml'];
    this.enableCaching = options.enableCaching !== false;
    this.watchFiles = options.watchFiles === true;
    
    // 缓存
    this.cache = new Map();
    this.fileStats = new Map();
    
    // 文件监控
    this.watchers = new Map();
    this.watcherEnabled = false;
    
    // 验证器
    this.validator = options.validator || null;
    
    console.log(`🔧 角色加载器初始化: ${this.configPath}`);
  }
  
  /**
   * 加载所有角色配置
   * @returns {Promise<Object>} 加载结果统计
   */
  async loadAll() {
    try {
      console.log('📂 开始加载角色配置...');
      
      const configDir = this.configPath;
      if (!fs.existsSync(configDir)) {
        console.warn(`配置目录不存在: ${configDir}`);
        return { success: 0, failed: 0, total: 0 };
      }
      
      const files = await this.findConfigFiles();
      const results = {
        success: 0,
        failed: 0,
        total: files.length,
        roles: []
      };
      
      for (const file of files) {
        try {
          const role = await this.loadSingle(file);
          if (role && this.registry) {
            if (this.registry.register(role)) {
              results.success++;
              results.roles.push(role.id);
            } else {
              results.failed++;
            }
          } else if (role) {
            results.success++;
            results.roles.push(role.id);
          } else {
            results.failed++;
          }
        } catch (error) {
          console.error(`加载角色配置失败: ${file}`, error.message);
          results.failed++;
        }
      }
      
      console.log(`✅ 角色配置加载完成: ${results.success}/${results.total} 成功`);
      return results;
      
    } catch (error) {
      console.error('❌ 批量加载角色配置失败:', error);
      throw error;
    }
  }
  
  /**
   * 加载单个角色配置
   * @param {string} filePath - 配置文件路径
   * @param {boolean} useCache - 是否使用缓存
   * @returns {Promise<RoleDefinition|null>}
   */
  async loadSingle(filePath, useCache = true) {
    try {
      const absolutePath = path.resolve(filePath);
      
      // 检查缓存
      if (useCache && this.enableCaching && this.isCacheValid(absolutePath)) {
        return this.cache.get(absolutePath);
      }
      
      // 读取文件
      const content = await readFile(absolutePath, 'utf-8');
      const fileExt = path.extname(absolutePath).toLowerCase().slice(1);
      
      // 解析配置
      let config;
      switch (fileExt) {
        case 'json':
          config = JSON.parse(content);
          break;
        case 'yaml':
        case 'yml':
          config = this.parseYAML(content);
          break;
        default:
          throw new Error(`不支持的配置文件格式: ${fileExt}`);
      }
      
      // 验证配置
      if (this.validator) {
        const validation = this.validator.validate(config);
        if (!validation.valid) {
          throw new Error(`配置验证失败: ${validation.errors.join(', ')}`);
        }
      }
      
      // 创建角色定义
      const role = new RoleDefinition(config);
      
      // 验证角色定义
      const roleValidation = role.validate();
      if (!roleValidation.valid) {
        throw new Error(`角色定义验证失败: ${roleValidation.errors.join(', ')}`);
      }
      
      // 更新缓存
      if (this.enableCaching) {
        this.updateCache(absolutePath, role);
      }
      
      console.log(`📥 角色配置加载成功: ${role.name} (${role.id})`);
      return role;
      
    } catch (error) {
      console.error(`❌ 加载角色配置失败: ${filePath}`, error.message);
      return null;
    }
  }
  
  /**
   * 根据角色ID加载配置
   * @param {string} roleId - 角色ID
   * @returns {Promise<RoleDefinition|null>}
   */
  async loadById(roleId) {
    const files = await this.findConfigFiles();
    
    for (const file of files) {
      try {
        const role = await this.loadSingle(file);
        if (role && role.id === roleId) {
          return role;
        }
      } catch (error) {
        // 继续尝试其他文件
        continue;
      }
    }
    
    console.warn(`未找到角色配置: ${roleId}`);
    return null;
  }
  
  /**
   * 保存角色配置
   * @param {RoleDefinition} role - 角色定义
   * @param {string} format - 保存格式 (json/yaml)
   * @returns {Promise<boolean>}
   */
  async saveRole(role, format = 'json') {
    try {
      if (!(role instanceof RoleDefinition)) {
        throw new Error('参数必须是RoleDefinition实例');
      }
      
      // 验证角色
      const validation = role.validate();
      if (!validation.valid) {
        throw new Error(`角色验证失败: ${validation.errors.join(', ')}`);
      }
      
      // 确定文件路径
      const fileName = `${role.id}.${format}`;
      const filePath = path.join(this.configPath, fileName);
      
      // 确保目录存在
      await this.ensureDirectory(path.dirname(filePath));
      
      // 序列化配置
      let content;
      switch (format) {
        case 'json':
          content = JSON.stringify(role.toJSON(), null, 2);
          break;
        case 'yaml':
        case 'yml':
          content = this.stringifyYAML(role.toJSON());
          break;
        default:
          throw new Error(`不支持的保存格式: ${format}`);
      }
      
      // 写入文件
      await writeFile(filePath, content, 'utf-8');
      
      // 更新缓存
      if (this.enableCaching) {
        this.updateCache(path.resolve(filePath), role);
      }
      
      console.log(`💾 角色配置保存成功: ${role.name} -> ${filePath}`);
      return true;
      
    } catch (error) {
      console.error(`❌ 保存角色配置失败:`, error);
      return false;
    }
  }
  
  /**
   * 启用文件监控
   * @returns {Promise<void>}
   */
  async enableWatcher() {
    if (this.watcherEnabled || !this.watchFiles) {
      return;
    }
    
    try {
      const files = await this.findConfigFiles();
      
      for (const file of files) {
        const absolutePath = path.resolve(file);
        
        if (fs.existsSync(absolutePath)) {
          const watcher = fs.watch(absolutePath, (eventType) => {
            if (eventType === 'change') {
              this.handleFileChange(absolutePath);
            }
          });
          
          this.watchers.set(absolutePath, watcher);
        }
      }
      
      this.watcherEnabled = true;
      console.log(`👁️ 文件监控已启用，监控 ${this.watchers.size} 个配置文件`);
      
    } catch (error) {
      console.error('❌ 启用文件监控失败:', error);
    }
  }
  
  /**
   * 禁用文件监控
   */
  disableWatcher() {
    for (const [filePath, watcher] of this.watchers) {
      watcher.close();
    }
    
    this.watchers.clear();
    this.watcherEnabled = false;
    console.log('🚫 文件监控已禁用');
  }
  
  /**
   * 处理文件变更
   * @private
   */
  async handleFileChange(filePath) {
    try {
      console.log(`📝 检测到文件变更: ${filePath}`);
      
      // 使文件缓存失效
      this.invalidateCache(filePath);
      
      // 重新加载角色
      const role = await this.loadSingle(filePath, false);
      
      if (role && this.registry) {
        // 重新注册角色
        this.registry.register(role);
        console.log(`🔄 角色已热重载: ${role.name}`);
      }
      
    } catch (error) {
      console.error(`❌ 处理文件变更失败: ${filePath}`, error);
    }
  }
  
  /**
   * 查找所有配置文件
   * @private
   * @returns {Promise<Array<string>>}
   */
  async findConfigFiles() {
    const files = [];
    const configDir = this.configPath;
    
    if (!fs.existsSync(configDir)) {
      return files;
    }
    
    const entries = await readdir(configDir);
    
    for (const entry of entries) {
      const filePath = path.join(configDir, entry);
      const stats = await stat(filePath);
      
      if (stats.isFile()) {
        const ext = path.extname(entry).toLowerCase().slice(1);
        if (this.supportedFormats.includes(ext)) {
          files.push(filePath);
        }
      }
    }
    
    return files;
  }
  
  /**
   * 检查缓存是否有效
   * @private
   */
  isCacheValid(filePath) {
    if (!this.cache.has(filePath)) {
      return false;
    }
    
    try {
      const currentStats = fs.statSync(filePath);
      const cachedStats = this.fileStats.get(filePath);
      
      if (!cachedStats) {
        return false;
      }
      
      // 比较文件修改时间
      return currentStats.mtime.getTime() === cachedStats.mtime.getTime();
      
    } catch (error) {
      return false;
    }
  }
  
  /**
   * 更新缓存
   * @private
   */
  updateCache(filePath, role) {
    try {
      const stats = fs.statSync(filePath);
      this.cache.set(filePath, role);
      this.fileStats.set(filePath, stats);
    } catch (error) {
      console.warn(`更新缓存失败: ${filePath}`, error.message);
    }
  }
  
  /**
   * 使缓存失效
   * @private
   */
  invalidateCache(filePath) {
    this.cache.delete(filePath);
    this.fileStats.delete(filePath);
  }
  
  /**
   * 清空缓存
   */
  clearCache() {
    this.cache.clear();
    this.fileStats.clear();
    console.log('🧹 角色加载器缓存已清空');
  }
  
  /**
   * 确保目录存在
   * @private
   */
  async ensureDirectory(dirPath) {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  }
  
  /**
   * 解析YAML（简单实现，建议使用yaml库）
   * @private
   */
  parseYAML(content) {
    // 这里应该使用专门的YAML解析库，如 'yaml' 或 'js-yaml'
    // 为了避免额外依赖，这里提供一个简单的实现提示
    throw new Error('YAML解析需要安装yaml解析库，如: npm install yaml');
  }
  
  /**
   * 序列化为YAML
   * @private
   */
  stringifyYAML(object) {
    // 这里应该使用专门的YAML序列化库
    throw new Error('YAML序列化需要安装yaml序列化库，如: npm install yaml');
  }
  
  /**
   * 获取加载器统计信息
   * @returns {Object}
   */
  getStats() {
    return {
      configPath: this.configPath,
      supportedFormats: this.supportedFormats,
      enableCaching: this.enableCaching,
      cacheSize: this.cache.size,
      watcherEnabled: this.watcherEnabled,
      watchedFiles: this.watchers.size
    };
  }
  
  /**
   * 销毁加载器
   * @returns {Promise<void>}
   */
  async destroy() {
    console.log('🛑 正在销毁角色加载器...');
    
    // 禁用文件监控
    this.disableWatcher();
    
    // 清空缓存
    this.clearCache();
    
    console.log('✅ 角色加载器已销毁');
  }
}

module.exports = RoleLoader;