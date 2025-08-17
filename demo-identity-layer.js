#!/usr/bin/env node

/**
 * 身份层三层架构演示脚本
 * 展示角色系统的解耦效果和核心功能
 */

const { IdentityLayer } = require('./src/layers/identity');

async function demo() {
  console.log('🎭 身份层三层架构演示');
  console.log('=' * 40);
  
  try {
    // 1. 初始化身份层
    console.log('\n🚀 1. 初始化身份层...');
    const identityLayer = new IdentityLayer({
      configPath: './config/roles',
      autoLoad: true,
      watchChanges: false
    });
    
    // 等待初始化完成
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 2. 展示所有已加载的角色
    console.log('\n📋 2. 已加载的角色:');
    const roles = await identityLayer.getAllRoles();
    roles.forEach(role => {
      console.log(`  ${role.emoji} ${role.name} (${role.id})`);
      console.log(`     主要能力: ${role.capabilities.primary.join(', ')}`);
      console.log(`     擅长主题: ${role.collaboration.leadTopics.join(', ')}`);
    });
    
    // 3. 智能角色查找演示
    console.log('\n🔍 3. 智能角色查找演示:');
    
    // 查找编程相关的角色
    const codingRoles = await identityLayer.findRolesByCapability('代码示例编写');
    console.log('  编程相关角色:', codingRoles.map(r => r.name).join(', '));
    
    // 查找概念解释相关的角色
    const conceptRoles = await identityLayer.findRolesByCapability('概念类比解释');
    console.log('  概念解释相关角色:', conceptRoles.map(r => r.name).join(', '));
    
    // 查找最适合的角色
    const bestForPlanning = await identityLayer.findBestRole({
      topic: 'planning',
      capability: '学习路径规划'
    });
    console.log('  最适合学习规划的角色:', bestForPlanning?.name || '未找到');
    
    // 4. 角色实例创建演示
    console.log('\n🎪 4. 角色实例创建演示:');
    
    const storytellerInstance = await identityLayer.createRoleInstance('storyteller', {
      context: { 
        learningStyle: 'visual',
        currentTopic: 'programming-concepts'
      },
      enableMemory: true
    });
    
    console.log(`  创建了故事讲述者实例: ${storytellerInstance.instanceId}`);
    console.log(`  实例角色: ${storytellerInstance.roleName}`);
    console.log(`  能力检查 - 概念类比: ${storytellerInstance.hasCapability('概念类比解释')}`);
    console.log(`  能力检查 - 代码编写: ${storytellerInstance.hasCapability('代码示例编写')}`);
    
    // 5. 角色组合演示
    console.log('\n👥 5. 角色组合演示:');
    
    const teachingTeam = await identityLayer.createRoleGroup([
      'ai-class-supervisor',
      'storyteller', 
      'skill-coach',
      'confusion-detective'
    ], {
      name: '编程教学团队',
      collaborationMode: 'collaborative'
    });
    
    console.log(`  创建了教学团队: ${teachingTeam.name}`);
    console.log(`  团队成员: ${teachingTeam.members.map(m => m.roleName).join(', ')}`);
    console.log(`  当前领导者: ${teachingTeam.members.find(m => m.instanceId === teachingTeam.state.currentLeader)?.roleName}`);
    
    // 演示组合功能
    const activeMembers = teachingTeam.getActiveMembers();
    console.log(`  活跃成员数: ${activeMembers.length}`);
    
    const bestMember = teachingTeam.selectBestMember({
      capability: '代码示例编写',
      topic: 'practice'
    });
    console.log(`  最适合代码实践的成员: ${bestMember?.roleName || '未找到'}`);
    
    // 6. 协作关系演示
    console.log('\n🤝 6. 协作关系演示:');
    
    const skillCoach = await identityLayer.getRole('skill-coach');
    const confusionDetective = await identityLayer.getRole('confusion-detective');
    
    console.log(`  技能教练可以与困惑侦探协作: ${skillCoach.canCollaborateWith('confusion-detective')}`);
    console.log(`  困惑侦探可以与技能教练协作: ${confusionDetective.canCollaborateWith('skill-coach')}`);
    
    // 7. 角色能力边界演示
    console.log('\n🎯 7. 角色能力边界演示:');
    
    const allRoles = await identityLayer.getAllRoles();
    const capabilityMatrix = {};
    
    const testCapabilities = ['代码示例编写', '概念类比解释', '错误诊断分析', '学习路径规划'];
    
    testCapabilities.forEach(capability => {
      capabilityMatrix[capability] = allRoles
        .filter(role => role.hasCapability(capability))
        .map(role => role.name);
    });
    
    Object.entries(capabilityMatrix).forEach(([capability, roleNames]) => {
      console.log(`  ${capability}: ${roleNames.join(', ')}`);
    });
    
    // 8. 统计信息
    console.log('\n📊 8. 系统统计信息:');
    const stats = await identityLayer.getStats();
    console.log(`  总角色数: ${stats.totalRoles}`);
    console.log(`  总能力数: ${stats.totalCapabilities}`);
    console.log(`  总主题数: ${stats.totalTopics}`);
    console.log(`  配置路径: ${stats.configPath}`);
    console.log(`  已初始化: ${stats.initialized}`);
    
    // 9. 解耦效果总结
    console.log('\n✨ 9. 三层架构解耦效果总结:');
    console.log('  ✅ 角色定义与实现完全分离');
    console.log('  ✅ 配置文件驱动的角色管理');
    console.log('  ✅ 动态角色加载和实例化');
    console.log('  ✅ 灵活的角色组合机制');
    console.log('  ✅ 清晰的能力边界和协作关系');
    console.log('  ✅ 智能的角色发现和匹配');
    
    // 清理
    await identityLayer.destroy();
    
    console.log('\n🎉 演示完成！身份层三层架构成功实现角色系统解耦！');
    
  } catch (error) {
    console.error('❌ 演示过程中发生错误:', error);
  }
}

// 运行演示
if (require.main === module) {
  demo().catch(console.error);
}

module.exports = demo;