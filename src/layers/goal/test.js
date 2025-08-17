/**
 * 目标层测试文件
 * 验证目标层各模块的基本功能
 */

const GoalLayer = require('./index');

async function runTests() {
    console.log('🚀 开始测试目标层功能...\n');
    
    try {
        // 初始化目标层
        console.log('1. 初始化目标层');
        const goalLayer = new GoalLayer();
        const initResult = await goalLayer.initialize({
            context: {
                learningTopic: 'JavaScript 进阶学习',
                learningObjectives: [
                    {
                        id: 'obj1',
                        title: '掌握异步编程',
                        description: '学习Promise、async/await等异步编程概念'
                    }
                ],
                userLevel: {
                    current: 'intermediate'
                },
                projectInfo: {
                    name: 'JS学习项目',
                    domain: 'frontend'
                }
            },
            loadPreviousContext: false
        });
        console.log('✅ 初始化结果:', initResult.message);
        
        // 设置新目标
        console.log('\n2. 设置学习目标');
        const goalResult = await goalLayer.setGoal({
            title: '掌握ES6+语法',
            description: '学习现代JavaScript语法特性',
            type: 'learning',
            priority: 'high',
            difficulty: 'medium',
            estimatedDuration: 10, // 10小时
            assessmentCriteria: [
                {
                    name: '理论掌握',
                    type: 'progress',
                    weight: 0.4,
                    passingScore: 70
                },
                {
                    name: '实践应用',
                    type: 'quality',
                    weight: 0.6,
                    passingScore: 80
                }
            ],
            resources: [
                { type: 'documentation', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript' },
                { type: 'tutorial', title: 'ES6 特性详解' }
            ]
        });
        console.log('✅ 目标设置结果:', goalResult.message);
        
        // 获取当前目标
        console.log('\n3. 获取当前目标');
        const currentGoal = goalLayer.getCurrentGoal();
        console.log('✅ 当前目标:', currentGoal ? currentGoal.title : '无');
        
        // 更新进度
        console.log('\n4. 更新学习进度');
        const progressResult = await goalLayer.updateProgress(goalResult.goalId, {
            percentage: 30,
            details: '完成了let/const、箭头函数学习',
            milestones: ['变量声明', '箭头函数'],
            challenges: ['理解this绑定']
        });
        console.log('✅ 进度更新:', `${progressResult.progress}% - ${progressResult.status}`);
        
        // 继续更新进度到50%
        await goalLayer.updateProgress(goalResult.goalId, {
            percentage: 50,
            details: '完成了解构赋值、模板字符串学习',
            milestones: ['解构赋值', '模板字符串']
        });
        
        // 评估目标
        console.log('\n5. 评估目标达成情况');
        const assessment = await goalLayer.assessGoal(goalResult.goalId);
        console.log('✅ 评估结果:', assessment.overall, `(${assessment.score?.toFixed(1)}%)`);
        console.log('   建议:', assessment.recommendations.slice(0, 2));
        
        // 动态调整目标
        console.log('\n6. 动态调整目标');
        const adjustResult = await goalLayer.adjustGoal(goalResult.goalId, {
            difficulty: 'hard',
            estimatedDuration: 15,
            reason: '发现内容比预期复杂，需要更多时间',
            resources: [
                { type: 'video', title: '深入理解ES6' }
            ]
        });
        console.log('✅ 调整结果:', adjustResult.message);
        
        // 保存上下文
        console.log('\n7. 保存当前上下文');
        const saveResult = await goalLayer.saveContext();
        console.log('✅ 上下文保存成功');
        
        // 获取目标层状态
        console.log('\n8. 获取目标层状态');
        const status = goalLayer.getStatus();
        console.log('✅ 状态概览:');
        console.log(`   - 初始化: ${status.initialized}`);
        console.log(`   - 学习主题: ${status.context.learningTopic}`);
        console.log(`   - 当前目标: ${status.currentGoal?.title || '无'}`);
        console.log(`   - 总目标数: ${status.allGoals.length}`);
        console.log(`   - 完成率: ${status.statistics.completionRate.toFixed(1)}%`);
        console.log(`   - 平均进度: ${status.statistics.avgProgress.toFixed(1)}%`);
        
        // 测试上下文切换
        console.log('\n9. 测试上下文管理');
        const historyResult = await goalLayer.getContextHistory();
        console.log(`✅ 上下文历史: ${historyResult.length} 个记录`);
        
        console.log('\n🎉 所有测试完成！目标层功能正常');
        
    } catch (error) {
        console.error('❌ 测试失败:', error.message);
        console.error(error.stack);
    }
}

// 运行测试
if (require.main === module) {
    runTests();
}

module.exports = { runTests };