/**
 * 对比教学方法实现
 */

const MethodTemplate = require('../MethodTemplate');

class ComparativeTeachingMethod extends MethodTemplate {
    constructor() {
        super({
            name: 'comparativeTeaching',
            description: '对比教学法：通过对比不同概念、方法或解决方案来加深理解',
            version: '1.0.0',
            parameters: {
                concepts: {
                    type: 'object',
                    required: true,
                    description: '需要对比的概念或方法列表',
                    validate: (value) => {
                        if (!Array.isArray(value) || value.length < 2) {
                            return '至少需要2个概念进行对比';
                        }
                        return true;
                    }
                },
                comparisonAspects: {
                    type: 'object',
                    required: false,
                    default: ['功能', '优缺点', '适用场景', '复杂度'],
                    description: '对比的维度'
                },
                targetAudience: {
                    type: 'string',
                    required: false,
                    default: 'general',
                    description: '目标受众'
                },
                outputFormat: {
                    type: 'string',
                    required: false,
                    default: 'table',
                    description: '输出格式'
                },
                detailLevel: {
                    type: 'string',
                    required: false,
                    default: 'medium',
                    description: '详细程度'
                }
            },
            capabilities: ['chainable', 'adaptive']
        });
    }

    async execute(context, params) {
        const { concepts, comparisonAspects, targetAudience, outputFormat, detailLevel } = params;
        
        // 1. 分析输入概念
        const analyzedConcepts = await this.analyzeInputConcepts(concepts, context);
        
        // 2. 构建对比框架
        const comparisonMatrix = await this.buildComparisonMatrix(
            analyzedConcepts, 
            comparisonAspects, 
            targetAudience
        );
        
        // 3. 执行详细对比
        const detailedComparison = await this.performDetailedComparison(
            comparisonMatrix, 
            detailLevel
        );
        
        // 4. 生成洞察和建议
        const insights = await this.generateInsights(detailedComparison, concepts);
        
        // 5. 格式化输出
        const formattedOutput = await this.formatOutput(
            detailedComparison, 
            insights, 
            outputFormat
        );
        
        return {
            comparison: formattedOutput.comparison,
            insights: insights,
            recommendations: formattedOutput.recommendations,
            summary: this.generateSummary(concepts, insights)
        };
    }

    async analyzeInputConcepts(concepts, context) {
        return concepts.map(concept => {
            if (typeof concept === 'string') {
                return {
                    name: concept,
                    description: context.knowledgeBase?.[concept] || `概念: ${concept}`,
                    category: this.inferCategory(concept, context)
                };
            }
            return concept;
        });
    }

    async buildComparisonMatrix(concepts, aspects, targetAudience) {
        const matrix = {};
        
        for (const concept of concepts) {
            matrix[concept.name] = {};
            for (const aspect of aspects) {
                matrix[concept.name][aspect] = await this.analyzeConceptAspect(
                    concept, 
                    aspect, 
                    targetAudience
                );
            }
        }
        
        return matrix;
    }

    async performDetailedComparison(matrix, detailLevel) {
        const comparison = { ...matrix };
        const conceptNames = Object.keys(matrix);
        const aspects = Object.keys(matrix[conceptNames[0]] || {});
        
        // 添加对比分析
        comparison._analysis = {};
        
        for (const aspect of aspects) {
            comparison._analysis[aspect] = {
                similarities: this.findSimilarities(conceptNames, matrix, aspect),
                differences: this.findDifferences(conceptNames, matrix, aspect),
                ranking: this.rankConcepts(conceptNames, matrix, aspect)
            };
        }
        
        return comparison;
    }

    async generateInsights(detailedComparison, originalConcepts) {
        const insights = [];
        const analysis = detailedComparison._analysis;
        
        // 生成关键洞察
        if (analysis) {
            for (const [aspect, data] of Object.entries(analysis)) {
                if (data.differences.length > 0) {
                    insights.push({
                        type: 'difference',
                        aspect: aspect,
                        description: `在${aspect}方面，主要差异是: ${data.differences.join(', ')}`
                    });
                }
                
                if (data.similarities.length > 0) {
                    insights.push({
                        type: 'similarity',
                        aspect: aspect,
                        description: `在${aspect}方面，相似之处包括: ${data.similarities.join(', ')}`
                    });
                }
            }
        }
        
        // 添加选择建议
        insights.push({
            type: 'recommendation',
            description: this.generateSelectionAdvice(detailedComparison, originalConcepts)
        });
        
        return insights;
    }

    async formatOutput(comparison, insights, format) {
        const { _analysis, ...comparisonData } = comparison;
        
        switch (format) {
            case 'table':
                return {
                    comparison: this.formatAsTable(comparisonData),
                    recommendations: insights.filter(i => i.type === 'recommendation')
                };
            
            case 'narrative':
                return {
                    comparison: this.formatAsNarrative(comparisonData, _analysis),
                    recommendations: insights.filter(i => i.type === 'recommendation')
                };
            
            case 'structured':
                return {
                    comparison: comparisonData,
                    analysis: _analysis,
                    recommendations: insights.filter(i => i.type === 'recommendation')
                };
            
            default:
                return {
                    comparison: comparisonData,
                    recommendations: insights.filter(i => i.type === 'recommendation')
                };
        }
    }

    analyzeConceptAspect(concept, aspect, audience) {
        // 这里可以集成AI分析或知识库查询
        // 简化实现，返回基本分析
        return `${concept.name}在${aspect}方面的特征`;
    }

    inferCategory(conceptName, context) {
        // 基于上下文推断概念类别
        if (context.domain) {
            return context.domain;
        }
        return 'general';
    }

    findSimilarities(concepts, matrix, aspect) {
        // 查找相似之处的逻辑
        return ['共同特征1', '共同特征2'];
    }

    findDifferences(concepts, matrix, aspect) {
        // 查找差异的逻辑
        return ['差异点1', '差异点2'];
    }

    rankConcepts(concepts, matrix, aspect) {
        // 排序逻辑
        return concepts.map((concept, index) => ({
            concept,
            rank: index + 1,
            score: Math.random() * 100 // 示例评分
        }));
    }

    generateSelectionAdvice(comparison, concepts) {
        return `基于对比分析，建议根据具体需求选择最适合的方案。`;
    }

    formatAsTable(data) {
        // 转换为表格格式
        const concepts = Object.keys(data);
        const aspects = Object.keys(data[concepts[0]] || {});
        
        return {
            headers: ['对比维度', ...concepts],
            rows: aspects.map(aspect => [
                aspect,
                ...concepts.map(concept => data[concept][aspect])
            ])
        };
    }

    formatAsNarrative(data, analysis) {
        // 转换为叙述格式
        const concepts = Object.keys(data);
        let narrative = `本次对比分析了${concepts.join('、')}等${concepts.length}个概念。\n\n`;
        
        for (const [aspect, details] of Object.entries(analysis || {})) {
            narrative += `**${aspect}方面**：\n`;
            if (details.differences.length > 0) {
                narrative += `主要差异：${details.differences.join('、')}\n`;
            }
            if (details.similarities.length > 0) {
                narrative += `相似之处：${details.similarities.join('、')}\n`;
            }
            narrative += '\n';
        }
        
        return narrative;
    }

    generateSummary(concepts, insights) {
        const conceptNames = concepts.map(c => typeof c === 'string' ? c : c.name);
        return `完成了${conceptNames.join('与')}的对比分析，生成了${insights.length}条关键洞察。`;
    }
}

module.exports = ComparativeTeachingMethod;