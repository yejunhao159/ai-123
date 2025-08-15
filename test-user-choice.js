/**
 * 测试用户选择机制
 */

const eduSystem = require('./.promptx/resource/tools/edu-ai-system.tool.js');

async function testUserChoice() {
  console.log('🎮 测试用户选择机制');
  console.log('='.repeat(60));
  
  // 测试1：基础团队响应
  console.log('📝 步骤1：学生提问，系统给出团队建议');
  console.log('学生："我想学习JavaScript，但不知道从哪开始"');
  console.log('-'.repeat(40));
  
  const step1 = await eduSystem.execute({
    message: "我想学习JavaScript，但不知道从哪开始",
    studentId: "test_student"
  });
  
  console.log('🎯 主要教师:', step1.data.primaryTeacher.name);
  console.log('💬 主要建议:', step1.data.primaryTeacher.message);
  console.log();
  
  console.log('👥 其他教师:');
  step1.data.otherTeachers.forEach(teacher => {
    console.log(`   ${teacher.name}: "${teacher.preview}"`);
  });
  console.log();
  
  console.log('🎮 交互提示:');
  console.log(step1.data.interactionHint.prompt);
  step1.data.interactionHint.options.forEach((option, index) => {
    console.log(`   ${index + 1}. ${option}`);
  });
  console.log();
  
  // 测试2：用户选择其他教师
  console.log('='.repeat(60));
  console.log('📝 步骤2：学生选择故事讲述者');
  console.log('学生选择："我想听故事讲述者的想法"');
  console.log('-'.repeat(40));
  
  const step2 = await eduSystem.execute({
    message: "我想听故事",
    studentId: "test_student"
  });
  
  console.log('🔄 响应模式:', step2.mode);
  if (step2.data.switchMessage) {
    console.log('✅', step2.data.switchMessage);
  }
  if (step2.data.teacher) {
    console.log('💬 故事讲述者说:', step2.data.teacher.message);
  }
  console.log();
  
  // 测试3：显示所有教师
  console.log('='.repeat(60));
  console.log('📝 步骤3：学生想查看所有教师');
  console.log('-'.repeat(40));
  
  const step3 = await eduSystem.execute({
    userChoice: { action: 'show_all_teachers' },
    studentId: "test_student"
  });
  
  console.log('📋 教师选择界面:');
  console.log('标题:', step3.data.title);
  console.log('副标题:', step3.data.subtitle);
  console.log();
  console.log('可选教师:');
  step3.data.teachers.forEach(teacher => {
    console.log(`   ${teacher.emoji} ${teacher.name} - ${teacher.description}`);
  });
  console.log();
  
  // 测试4：明确指定角色
  console.log('='.repeat(60));
  console.log('📝 步骤4：学生明确选择困惑侦探');
  console.log('-'.repeat(40));
  
  const step4 = await eduSystem.execute({
    selectedRole: "confusion-detective",
    message: "我总是搞混作用域的概念",
    studentId: "test_student"
  });
  
  console.log('🔍 困惑侦探模式:');
  console.log('回答:', step4.data.teacher.message);
  console.log('切换选项:', step4.data.switchBackOption.label);
  console.log();
  
  // 测试5：自然语言解析
  console.log('='.repeat(60));
  console.log('📝 步骤5：测试自然语言选择解析');
  console.log('-'.repeat(40));
  
  const testPhrases = [
    "我想找班主任",
    "继续听当前老师说",
    "看看所有老师", 
    "找技能教练帮我练习",
    "让团队一起讨论"
  ];
  
  const UserChoiceHandler = require('./.promptx/resource/tools/user-choice-handler');
  const choiceHandler = new UserChoiceHandler(eduSystem);
  
  testPhrases.forEach(phrase => {
    const parsed = choiceHandler.parseNaturalChoice(phrase);
    if (parsed) {
      console.log(`"${phrase}" → ${parsed.action} (置信度: ${parsed.confidence})`);
    } else {
      console.log(`"${phrase}" → 无法识别`);
    }
  });
  console.log();
  
  console.log('✅ 用户选择机制测试完成！');
  console.log('🌟 支持的交互方式:');
  console.log('   - 结构化选择 (userChoice参数)');
  console.log('   - 明确指定角色 (selectedRole参数)');
  console.log('   - 自然语言选择 (智能解析message)');
  console.log('   - 显示所有教师选择界面');
  console.log('   - 快速切换和回退机制');
}

testUserChoice().catch(console.error);