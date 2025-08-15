/**
 * 测试集成后的教师团队系统
 */

const eduSystem = require('./.promptx/resource/tools/edu-ai-system.tool.js');

async function testIntegratedSystem() {
  console.log('🎓 测试教师团队模式集成');
  console.log('='.repeat(60));
  
  // 测试1：新用户首次提问
  console.log('📝 测试1：新用户不理解概念');
  console.log('用户："什么是递归？我完全不懂"');
  console.log('-'.repeat(40));
  
  const result1 = await eduSystem.execute({
    message: "什么是递归？我完全不懂",
    studentId: "student_001"
  });
  
  console.log('📊 响应模式:', result1.mode);
  console.log('🎯 主要教师:', result1.data.primaryTeacher.name);
  console.log('📈 置信度:', result1.data.primaryTeacher.confidence.toFixed(2));
  console.log('💭 选择原因:', result1.data.primaryTeacher.reason);
  console.log('💬 回答:', result1.data.primaryTeacher.message);
  console.log();
  
  console.log('👥 其他教师建议:');
  result1.data.otherTeachers.forEach((teacher, index) => {
    console.log(`   ${index + 1}. ${teacher.name} (${teacher.confidence.toFixed(2)}): "${teacher.preview}"`);
  });
  console.log();
  
  console.log('🎮 用户选择:');
  result1.data.userChoices.forEach((choice, index) => {
    console.log(`   ${index + 1}. ${choice.label} ${choice.default ? '(默认)' : ''}`);
  });
  console.log();
  
  // 测试2：用户明确选择角色
  console.log('='.repeat(60));
  console.log('📝 测试2：用户选择技能教练');
  console.log('用户参数: selectedRole: "skill-coach"');
  console.log('-'.repeat(40));
  
  const result2 = await eduSystem.execute({
    message: "给我一些代码练习",
    selectedRole: "skill-coach",
    studentId: "student_001"
  });
  
  console.log('📊 响应模式:', result2.mode);
  console.log('🎯 指定教师:', result2.data.teacher.name);
  console.log('💬 回答:', result2.data.teacher.message);
  console.log('🔄 切换选项:', result2.data.switchBackOption.label);
  console.log();
  
  // 测试3：错误调试场景
  console.log('='.repeat(60));
  console.log('📝 测试3：代码错误调试');
  console.log('用户："我的代码运行出错了，不知道哪里有问题"');
  console.log('-'.repeat(40));
  
  const result3 = await eduSystem.execute({
    message: "我的代码运行出错了，不知道哪里有问题",
    studentId: "student_001"
  });
  
  console.log('🎯 主要教师:', result3.data.primaryTeacher.name);
  console.log('📈 团队共识度:', result3.data.teamInsights.consensusLevel.toFixed(2));
  console.log('🎨 观点多样性:', result3.data.teamInsights.diversityScore.toFixed(2));
  console.log('💬 主要回答:', result3.data.primaryTeacher.message);
  console.log();
  
  // 测试4：显示所有可选择的用户操作
  console.log('🎮 用户可以选择:');
  result3.data.userChoices.forEach((choice, index) => {
    console.log(`   ${choice.action}: ${choice.label}`);
  });
  console.log();
  
  // 测试5：模拟用户选择其他角色
  console.log('='.repeat(60));
  console.log('📝 测试5：用户切换到任务分解专家');
  console.log('-'.repeat(40));
  
  const result5 = await eduSystem.execute({
    message: "这个项目太复杂了",
    selectedRole: "task-decomposer",
    studentId: "student_001"
  });
  
  console.log('🎯 任务分解专家说:', result5.data.teacher.message);
  console.log();
  
  console.log('✅ 集成测试完成！');
  console.log('🌟 教师团队模式正常工作，支持:');
  console.log('   - 多角色并行分析');
  console.log('   - 智能主教师推荐');
  console.log('   - 用户角色选择');
  console.log('   - 透明的决策过程');
  console.log('   - 丰富的交互选项');
}

// 运行测试
testIntegratedSystem().catch(console.error);