/**
 * 测试教师团队模式
 */

const TeacherTeamAnalyzer = require('./.promptx/resource/tools/teacher-team-analyzer');

async function testTeacherTeam() {
  const analyzer = new TeacherTeamAnalyzer();
  
  // 测试场景1：概念理解困难
  console.log('📚 测试场景1：学生不理解递归');
  console.log('学生："递归太难理解了，完全搞不懂"');
  console.log('-'.repeat(50));
  
  const result1 = await analyzer.analyzeInParallel(
    "递归太难理解了，完全搞不懂",
    { learningPhase: 'learning' }
  );
  
  console.log('🎯 主要回答者：', result1.primary.roleName);
  console.log('   置信度：', result1.primary.confidence.toFixed(2));
  console.log('   原因：', result1.primary.reason);
  console.log('   建议：', result1.primary.suggestion);
  console.log();
  
  console.log('👥 其他老师的建议：');
  result1.alternatives.forEach(alt => {
    console.log(`   ${alt.roleName} (置信度: ${alt.confidence.toFixed(2)})`);
    console.log(`   "${alt.preview}"`);
  });
  console.log();
  
  console.log('📊 团队分析：');
  console.log('   共识度：', result1.teamThinking.consensusLevel.toFixed(2));
  console.log('   多样性：', result1.teamThinking.diversityScore.toFixed(2));
  console.log();
  
  // 测试场景2：实践需求
  console.log('='.repeat(50));
  console.log('💻 测试场景2：学生想要练习代码');
  console.log('学生："给我一些代码练习"');
  console.log('-'.repeat(50));
  
  const result2 = await analyzer.analyzeInParallel(
    "给我一些代码练习",
    { learningPhase: 'practicing' }
  );
  
  console.log('🎯 主要回答者：', result2.primary.roleName);
  console.log('   置信度：', result2.primary.confidence.toFixed(2));
  console.log('   建议：', result2.primary.suggestion);
  console.log();
  
  console.log('👥 其他老师也准备好了：');
  result2.alternatives.forEach(alt => {
    console.log(`   ${alt.roleName}: "${alt.preview}"`);
  });
  
  // 测试场景3：错误调试
  console.log('='.repeat(50));
  console.log('🐛 测试场景3：学生遇到错误');
  console.log('学生："我的代码一直报错，不知道哪里出问题了"');
  console.log('-'.repeat(50));
  
  const result3 = await analyzer.analyzeInParallel(
    "我的代码一直报错，不知道哪里出问题了",
    { learningPhase: 'practicing', previousRole: 'skill-coach' }
  );
  
  console.log('🎯 主要回答者：', result3.primary.roleName);
  console.log('   建议：', result3.primary.suggestion);
  console.log();
  console.log('👥 团队支援：');
  result3.alternatives.forEach(alt => {
    console.log(`   ${alt.roleName}: "${alt.preview}"`);
  });
}

// 运行测试
testTeacherTeam().catch(console.error);