/**
 * 方法层使用示例
 * 演示如何使用教学方法模板系统
 */

const path = require('path');
const { MethodLayer } = require('../src/layers/method');
const MethodLoader = require('../src/layers/method/MethodLoader');

async function demonstrateMethodLayer() {
    console.log('=== AI-123 方法层演示 ===\n');
    
    // 1. 创建方法层实例
    const methodLayer = new MethodLayer();
    
    // 2. 创建方法加载器
    const configDir = path.join(__dirname, '../config/methods');
    const implementationDir = path.join(__dirname, '../src/layers/method/implementations');
    const loader = new MethodLoader(configDir, implementationDir);
    
    try {
        // 3. 加载所有方法
        console.log('📦 正在加载教学方法...');
        const loadResults = await loader.loadAllMethods();
        
        console.log('加载结果:');
        loadResults.forEach(result => {
            const status = result.success ? '✅' : '❌';
            const impl = result.hasCustomImplementation ? '(自定义实现)' : '(配置驱动)';
            console.log(`  ${status} ${result.name} ${impl}`);
        });
        
        // 4. 注册方法到方法层
        console.log('\n🔧 注册方法到方法层...');
        for (const methodName of loader.getLoadedMethodNames()) {
            const method = loader.getMethod(methodName);
            const config = loader.getMethodConfig(methodName);
            
            methodLayer.registerMethod(methodName, method);
            console.log(`  ✅ 已注册: ${methodName} (${config.type})`);
        }
        
        // 5. 展示可用方法
        console.log('\n📋 可用的教学方法:');
        const availableMethods = methodLayer.getAvailableMethods();
        availableMethods.forEach(name => {
            const info = methodLayer.getMethodInfo(name);
            console.log(`  • ${name}: ${info.description}`);
        });
        
        // 6. 演示对比教学法
        console.log('\n🔍 演示对比教学法:');
        const comparisonResult = await methodLayer.execute('comparativeTeaching', {
            knowledgeBase: {
                'Python': '一种高级编程语言，语法简洁',
                'JavaScript': '一种脚本语言，主要用于Web开发'
            }
        }, {
            concepts: ['Python', 'JavaScript'],
            comparisonAspects: ['语法特点', '应用领域', '学习难度'],
            targetAudience: 'beginner',
            outputFormat: 'structured'
        });
        
        if (comparisonResult.success) {
            console.log('对比结果:');
            console.log(JSON.stringify(comparisonResult.data, null, 2));
        } else {
            console.log('执行失败:', comparisonResult.error);
        }
        
        // 7. 演示方法链式执行
        console.log('\n🔗 演示方法链式执行:');
        const chainResults = await methodLayer.executeChain([
            'comparativeTeaching',
            'knowledgeSedimentation'
        ], {
            topic: 'JavaScript vs Python对比学习'
        }, {
            comparativeTeaching: {
                concepts: ['JavaScript', 'Python'],
                comparisonAspects: ['性能', '生态系统']
            },
            knowledgeSedimentation: {
                learningContent: {
                    topic: 'JavaScript vs Python',
                    concepts: ['语言特性', '应用场景']
                },
                sedimentationType: 'summary'
            },
            chainContext: true
        });
        
        console.log('链式执行结果:');
        chainResults.forEach((result, index) => {
            const status = result.success ? '✅' : '❌';
            console.log(`  ${index + 1}. ${status} ${result.method || '未知方法'}`);
        });
        
        // 8. 展示执行统计
        console.log('\n📊 执行统计:');
        const stats = methodLayer.executor.getExecutionStats();
        console.log(`  总执行次数: ${stats.totalExecutions}`);
        console.log(`  成功次数: ${stats.successfulExecutions}`);
        console.log(`  失败次数: ${stats.failedExecutions}`);
        console.log(`  平均执行时间: ${stats.averageDuration.toFixed(2)}ms`);
        
        // 9. 方法信息展示
        console.log('\n📖 方法详细信息:');
        availableMethods.slice(0, 3).forEach(methodName => {
            const info = methodLayer.getMethodInfo(methodName);
            console.log(`\n${methodName}:`);
            console.log(`  描述: ${info.description}`);
            console.log(`  参数: ${Object.keys(info.parameters).join(', ')}`);
            console.log(`  能力: ${info.capabilities.join(', ')}`);
        });
        
    } catch (error) {
        console.error('❌ 演示过程中出错:', error.message);
        console.error(error.stack);
    }
}

// 运行演示
if (require.main === module) {
    demonstrateMethodLayer().catch(console.error);
}

module.exports = { demonstrateMethodLayer };