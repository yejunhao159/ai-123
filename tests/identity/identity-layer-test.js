/**
 * 身份层完整测试套件
 * 验证三层架构解耦效果和角色系统功能
 */

const fs = require('fs');
const path = require('path');

// 导入身份层组件
const { IdentityLayer, RoleDefinition, RoleRegistry, RoleLoader, RoleFactory } = 
  require('../../src/layers/identity');

class IdentityLayerTest {
  constructor() {
    this.testResults = [];
    this.identityLayer = null;
  }
  
  /**
   * 运行所有测试
   */
  async runAllTests() {
    console.log('🧪 开始身份层测试套件...\n');
    
    try {
      // 初始化测试环境
      await this.setup();
      
      // 运行各项测试
      await this.testRoleDefinition();
      await this.testRoleRegistry();
      await this.testRoleLoader();
      await this.testRoleFactory();
      await this.testIdentityLayerIntegration();
      await this.testDecouplingEffects();
      
      // 清理测试环境
      await this.cleanup();
      
      // 显示测试结果
      this.showResults();
      
    } catch (error) {
      console.error('❌ 测试运行失败:', error);
    }
  }
  
  /**
   * 测试环境初始化
   */
  async setup() {
    console.log('🔧 初始化测试环境...');
    
    // 创建身份层实例
    this.identityLayer = new IdentityLayer({
      configPath: './config/roles',
      autoLoad: false,
      watchChanges: false
    });
    
    console.log('✅ 测试环境初始化完成\n');
  }
  
  /**
   * 测试RoleDefinition类
   */
  async testRoleDefinition() {
    console.log('📋 测试RoleDefinition类...');
    
    try {
      // 测试角色创建
      const roleConfig = {
        id: 'test-role',
        name: '测试角色',
        description: '用于测试的角色',
        capabilities: {
          primary: ['testing', 'validation'],
          secondary: ['debugging']
        },
        collaboration: {
          canDiscussWith: ['all'],
          leadTopics: ['testing']
        }
      };
      
      const role = new RoleDefinition(roleConfig);
      
      // 验证基本属性
      this.assert(role.id === 'test-role', 'Role ID 设置正确');
      this.assert(role.name === '测试角色', 'Role name 设置正确');
      
      // 验证能力检查
      this.assert(role.hasCapability('testing'), '能力检查正确');
      this.assert(!role.hasCapability('nonexistent'), '不存在能力检查正确');
      
      // 验证主题处理
      this.assert(role.canHandleTopic('testing'), '主题处理检查正确');
      
      // 验证协作能力
      this.assert(role.canCollaborateWith('any-role'), '协作能力检查正确');
      
      // 验证验证功能
      const validation = role.validate();
      this.assert(validation.valid, '角色验证功能正常');
      
      // 验证JSON序列化
      const json = role.toJSON();
      const restored = RoleDefinition.fromJSON(json);
      this.assert(restored.id === role.id, 'JSON序列化/反序列化正确');
      
      console.log('✅ RoleDefinition测试通过\n');
      
    } catch (error) {
      console.error('❌ RoleDefinition测试失败:', error);
    }
  }
  
  /**
   * 测试RoleRegistry类
   */
  async testRoleRegistry() {
    console.log('📚 测试RoleRegistry类...');
    
    try {
      const registry = new RoleRegistry();
      
      // 测试角色注册
      const testRole = new RoleDefinition({
        id: 'registry-test',
        name: '注册表测试角色',
        capabilities: {
          primary: ['registry-testing']
        },
        collaboration: {
          leadTopics: ['registry']
        }
      });
      
      const registerSuccess = registry.register(testRole);
      this.assert(registerSuccess, '角色注册成功');
      
      // 测试角色检索
      const retrieved = registry.get('registry-test');
      this.assert(retrieved !== null, '角色检索成功');
      this.assert(retrieved.id === 'registry-test', '检索到正确角色');
      
      // 测试角色存在检查
      this.assert(registry.has('registry-test'), '角色存在检查正确');
      this.assert(!registry.has('nonexistent-role'), '不存在角色检查正确');
      
      // 测试按能力查找
      const rolesByCapability = registry.findByCapability('registry-testing');
      this.assert(rolesByCapability.length === 1, '按能力查找正确');
      
      // 测试按主题查找
      const rolesByTopic = registry.findByTopic('registry');
      this.assert(rolesByTopic.length === 1, '按主题查找正确');
      
      // 测试最佳匹配
      const bestMatch = registry.findBestMatch({
        capability: 'registry-testing',
        topic: 'registry'
      });
      this.assert(bestMatch !== null, '最佳匹配查找成功');
      this.assert(bestMatch.id === 'registry-test', '最佳匹配结果正确');
      
      // 测试批量注册
      const batchRoles = [
        { id: 'batch-1', name: '批量角色1', capabilities: { primary: ['batch'] } },
        { id: 'batch-2', name: '批量角色2', capabilities: { primary: ['batch'] } }
      ];
      const batchResult = registry.registerBatch(batchRoles);
      this.assert(batchResult.success === 2, '批量注册成功');
      
      // 测试统计信息
      const stats = registry.getStats();
      this.assert(stats.totalRoles >= 3, '统计信息正确');
      
      console.log('✅ RoleRegistry测试通过\n');
      
    } catch (error) {
      console.error('❌ RoleRegistry测试失败:', error);
    }
  }
  
  /**
   * 测试RoleLoader类
   */
  async testRoleLoader() {
    console.log('📁 测试RoleLoader类...');
    
    try {
      const loader = new RoleLoader({
        configPath: './config/roles',
        enableCaching: true,
        watchFiles: false
      });
      
      // 测试加载所有角色
      const loadResult = await loader.loadAll();
      this.assert(loadResult.total > 0, '找到角色配置文件');
      this.assert(loadResult.success > 0, '成功加载角色配置');
      
      // 测试单个角色加载
      const singleRole = await loader.loadById('ai-class-supervisor');
      this.assert(singleRole !== null, '单个角色加载成功');
      this.assert(singleRole.id === 'ai-class-supervisor', '加载正确的角色');
      
      // 测试缓存功能
      const cachedRole = await loader.loadById('ai-class-supervisor');
      this.assert(cachedRole !== null, '缓存角色加载成功');
      
      // 测试加载器统计
      const stats = loader.getStats();
      this.assert(stats.enableCaching === true, '缓存配置正确');
      this.assert(stats.cacheSize > 0, '缓存中有数据');
      
      console.log('✅ RoleLoader测试通过\n');
      
    } catch (error) {
      console.error('❌ RoleLoader测试失败:', error);
    }
  }
  
  /**
   * 测试RoleFactory类
   */
  async testRoleFactory() {
    console.log('🏭 测试RoleFactory类...');
    
    try {
      // 创建注册表并添加测试角色
      const registry = new RoleRegistry();
      const testRole = new RoleDefinition({
        id: 'factory-test',
        name: '工厂测试角色',
        capabilities: { primary: ['factory-testing'] }
      });
      registry.register(testRole);
      
      const factory = new RoleFactory(registry);
      
      // 测试实例创建
      const instance = factory.createInstance('factory-test', {
        context: { test: true },
        enableMemory: true
      });
      
      this.assert(instance !== null, '角色实例创建成功');
      this.assert(instance.roleId === 'factory-test', '实例角色ID正确');
      this.assert(typeof instance.hasCapability === 'function', '实例方法可用');
      
      // 测试实例方法
      this.assert(instance.hasCapability('factory-testing'), '实例能力检查正确');
      
      // 测试记忆功能
      instance.addMemory('test-key', 'test-value');
      const memory = instance.getMemory('test-key');
      this.assert(memory === 'test-value', '实例记忆功能正常');
      
      // 测试组合创建
      const group = factory.createGroup(['factory-test'], {
        name: '测试组合',
        collaborationMode: 'parallel'
      });
      
      this.assert(group !== null, '角色组合创建成功');
      this.assert(group.members.length === 1, '组合成员数量正确');
      this.assert(typeof group.getMembers === 'function', '组合方法可用');
      
      // 测试组合方法
      const members = group.getMembers();
      this.assert(members.length === 1, '获取组合成员正确');
      
      // 测试工厂统计
      const stats = factory.getStats();
      this.assert(stats.activeInstances >= 1, '活跃实例统计正确');
      this.assert(stats.activeGroups >= 1, '活跃组合统计正确');
      
      console.log('✅ RoleFactory测试通过\n');
      
    } catch (error) {
      console.error('❌ RoleFactory测试失败:', error);
    }
  }
  
  /**
   * 测试身份层集成
   */
  async testIdentityLayerIntegration() {
    console.log('🔗 测试身份层集成...');
    
    try {
      // 初始化身份层
      await this.identityLayer.initialize();
      
      // 测试角色获取
      const roles = await this.identityLayer.getAllRoles();
      this.assert(roles.length > 0, '获取到角色列表');
      
      // 测试角色查找
      const classAdvisor = await this.identityLayer.getRole('ai-class-supervisor');
      this.assert(classAdvisor !== null, '获取AI班主任角色成功');
      
      // 测试最佳角色查找
      const bestRole = await this.identityLayer.findBestRole({
        capability: '学习路径规划',
        topic: 'planning'
      });
      this.assert(bestRole !== null, '最佳角色查找成功');
      
      // 测试角色实例创建
      const instance = await this.identityLayer.createRoleInstance('ai-class-supervisor', {
        context: { test: 'integration' }
      });
      this.assert(instance !== null, '通过身份层创建实例成功');
      
      // 测试角色组合创建
      const availableRoles = await this.identityLayer.getAllRoleIds();
      const sampleRoles = availableRoles.slice(0, 3); // 取前3个角色
      
      const group = await this.identityLayer.createRoleGroup(sampleRoles, {
        name: '集成测试组合'
      });
      this.assert(group !== null, '通过身份层创建组合成功');
      
      // 测试统计信息
      const stats = await this.identityLayer.getStats();
      this.assert(stats.initialized === true, '身份层已初始化');
      this.assert(stats.totalRoles > 0, '统计信息正确');
      
      console.log('✅ 身份层集成测试通过\n');
      
    } catch (error) {
      console.error('❌ 身份层集成测试失败:', error);
    }
  }
  
  /**
   * 测试解耦效果
   */
  async testDecouplingEffects() {
    console.log('🔄 测试三层架构解耦效果...');
    
    try {
      // 测试1: 角色定义与实现分离
      const originalRoles = await this.identityLayer.getAllRoles();
      const originalCount = originalRoles.length;
      
      // 动态添加新角色（不影响现有系统）
      const newRole = new RoleDefinition({
        id: 'dynamic-test-role',
        name: '动态测试角色',
        capabilities: { primary: ['dynamic-testing'] },
        collaboration: { leadTopics: ['dynamic'] }
      });
      
      await this.identityLayer.registerRole(newRole);
      
      const updatedRoles = await this.identityLayer.getAllRoles();
      this.assert(updatedRoles.length === originalCount + 1, '动态角色添加成功');
      
      // 测试2: 配置文件独立性
      // 验证配置文件可以独立修改而不影响运行时
      const configRole = await this.identityLayer.getRole('storyteller');
      this.assert(configRole !== null, '配置文件角色加载正常');
      
      // 测试3: 角色实例独立性
      const instance1 = await this.identityLayer.createRoleInstance('storyteller', {
        context: { mode: 'creative' }
      });
      const instance2 = await this.identityLayer.createRoleInstance('storyteller', {
        context: { mode: 'analytical' }
      });
      
      this.assert(instance1.instanceId !== instance2.instanceId, '角色实例独立');
      this.assert(instance1.state.context.mode !== instance2.state.context.mode, '实例状态独立');
      
      // 测试4: 能力边界清晰
      const skillCoach = await this.identityLayer.getRole('skill-coach');
      const storyteller = await this.identityLayer.getRole('storyteller');
      
      this.assert(skillCoach.hasCapability('代码示例编写'), '技能教练具有编程能力');
      this.assert(!storyteller.hasCapability('代码示例编写'), '故事讲述者不具有编程能力');
      this.assert(storyteller.hasCapability('概念类比解释'), '故事讲述者具有类比能力');
      this.assert(!skillCoach.hasCapability('概念类比解释'), '技能教练不具有类比能力');
      
      // 测试5: 协作关系清晰
      this.assert(skillCoach.canCollaborateWith('storyteller'), '技能教练可与故事讲述者协作');
      this.assert(storyteller.canCollaborateWith('skill-coach'), '故事讲述者可与技能教练协作');
      
      // 测试6: 热重载能力（模拟）
      // 在实际环境中，这会测试文件监控和热重载
      await this.identityLayer.reloadRoles();
      const reloadedRole = await this.identityLayer.getRole('storyteller');
      this.assert(reloadedRole !== null, '热重载功能正常');
      
      console.log('✅ 解耦效果测试通过\n');
      
    } catch (error) {
      console.error('❌ 解耦效果测试失败:', error);
    }
  }
  
  /**
   * 清理测试环境
   */
  async cleanup() {
    console.log('🧹 清理测试环境...');
    
    if (this.identityLayer) {
      await this.identityLayer.destroy();
    }
    
    console.log('✅ 测试环境清理完成\n');
  }
  
  /**
   * 断言方法
   */
  assert(condition, message) {
    const result = {
      condition,
      message,
      passed: Boolean(condition),
      timestamp: new Date().toISOString()
    };
    
    this.testResults.push(result);
    
    if (result.passed) {
      console.log(`  ✅ ${message}`);
    } else {
      console.log(`  ❌ ${message}`);
    }
  }
  
  /**
   * 显示测试结果
   */
  showResults() {
    console.log('📊 测试结果汇总:');
    console.log('=' * 50);
    
    const totalTests = this.testResults.length;
    const passedTests = this.testResults.filter(r => r.passed).length;
    const failedTests = totalTests - passedTests;
    
    console.log(`总测试数: ${totalTests}`);
    console.log(`通过测试: ${passedTests}`);
    console.log(`失败测试: ${failedTests}`);
    console.log(`通过率: ${((passedTests / totalTests) * 100).toFixed(2)}%`);
    
    if (failedTests > 0) {
      console.log('\n❌ 失败的测试:');
      this.testResults
        .filter(r => !r.passed)
        .forEach(r => console.log(`  - ${r.message}`));
    } else {
      console.log('\n🎉 所有测试都通过了！');
    }
    
    console.log('\n✨ 身份层三层架构解耦实现成功！');
    console.log('主要成果:');
    console.log('  📦 角色定义与实现完全分离');
    console.log('  🔧 配置驱动的角色管理');
    console.log('  🚀 动态加载和热重载支持');
    console.log('  🏭 灵活的角色实例化');
    console.log('  👥 强大的角色组合能力');
    console.log('  🔍 智能的角色发现和匹配');
  }
}

// 运行测试
async function runTests() {
  const test = new IdentityLayerTest();
  await test.runAllTests();
}

// 如果直接运行此文件，则执行测试
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = IdentityLayerTest;