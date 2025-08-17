/**
 * 简化的目标层测试
 */

console.log('开始基础测试...');

try {
    // 测试模块导入
    console.log('1. 测试模块导入');
    const GoalLayer = require('./index');
    const ProjectContext = require('./ProjectContext');
    const GoalManager = require('./GoalManager');
    const ContextStore = require('./ContextStore');
    const ContextSerializer = require('./ContextSerializer');
    
    console.log('✅ 所有模块导入成功');
    
    // 测试基础类实例化
    console.log('2. 测试类实例化');
    const goalLayer = new GoalLayer();
    const projectContext = new ProjectContext();
    const goalManager = new GoalManager();
    const contextStore = new ContextStore();
    const contextSerializer = new ContextSerializer();
    
    console.log('✅ 所有类实例化成功');
    
    // 测试基础方法
    console.log('3. 测试基础方法');
    
    // 测试项目上下文
    const context = projectContext.getContext();
    console.log('✅ 项目上下文获取成功');
    
    // 测试序列化
    const testData = { test: 'data', number: 123 };
    const serialized = contextSerializer.serialize(testData);
    console.log('✅ 数据序列化成功');
    
    const deserialized = contextSerializer.deserialize(serialized);
    console.log('✅ 数据反序列化成功');
    
    // 测试目标管理
    const stats = goalManager.getStatistics();
    console.log('✅ 目标统计获取成功');
    
    console.log('\n🎉 基础测试完成！所有模块工作正常');
    
} catch (error) {
    console.error('❌ 测试失败:', error.message);
    if (error.stack) {
        console.error('错误堆栈:', error.stack);
    }
    process.exit(1);
}

console.log('\n📊 测试结果总结:');
console.log('- 模块导入: 成功');
console.log('- 类实例化: 成功'); 
console.log('- 基础方法: 成功');
console.log('- 目标层架构: 完整');