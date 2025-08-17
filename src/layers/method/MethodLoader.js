/**
 * 方法加载器
 * 负责从配置文件加载方法模板并创建实例
 */

const fs = require('fs');
const path = require('path');
const MethodTemplate = require('./MethodTemplate');

class MethodLoader {
    constructor(configDir = 'config/methods', implementationDir = 'src/layers/method/implementations') {
        this.configDir = configDir;
        this.implementationDir = implementationDir;
        this.loadedMethods = new Map();
        this.methodConfigs = new Map();
    }

    /**
     * 加载所有方法配置
     * @returns {Promise<Array>} 加载结果
     */
    async loadAllMethods() {
        const results = [];
        
        try {
            const configFiles = this.getConfigFiles();
            
            for (const configFile of configFiles) {
                try {
                    const result = await this.loadMethodFromConfig(configFile);
                    results.push(result);
                } catch (error) {
                    results.push({
                        file: configFile,
                        success: false,
                        error: error.message
                    });
                }
            }
            
        } catch (error) {
            throw new Error(`无法加载方法配置: ${error.message}`);
        }
        
        return results;
    }

    /**
     * 从配置文件加载单个方法
     * @param {string} configFile - 配置文件名
     * @returns {Promise<Object>} 加载结果
     */
    async loadMethodFromConfig(configFile) {
        const configPath = path.join(this.configDir, configFile);
        
        // 读取配置文件
        const configContent = fs.readFileSync(configPath, 'utf8');
        const config = JSON.parse(configContent);
        
        // 验证配置
        this.validateMethodConfig(config);
        
        // 尝试加载对应的实现类
        let MethodClass = null;
        const implementationPath = this.getImplementationPath(config.name);
        
        if (fs.existsSync(implementationPath)) {
            MethodClass = require(implementationPath);
        } else {
            // 如果没有专门的实现类，使用通用的配置驱动实现
            MethodClass = this.createConfigDrivenMethod(config);
        }
        
        // 创建方法实例
        const methodInstance = new MethodClass();
        
        // 存储配置和实例
        this.methodConfigs.set(config.name, config);
        this.loadedMethods.set(config.name, methodInstance);
        
        return {
            name: config.name,
            success: true,
            type: config.type,
            version: config.version,
            hasCustomImplementation: fs.existsSync(implementationPath)
        };
    }

    /**
     * 获取配置文件列表
     * @returns {Array<string>} 配置文件名列表
     */
    getConfigFiles() {
        if (!fs.existsSync(this.configDir)) {
            throw new Error(`配置目录不存在: ${this.configDir}`);
        }
        
        return fs.readdirSync(this.configDir)
            .filter(file => file.endsWith('.json'))
            .sort();
    }

    /**
     * 获取实现类路径
     * @param {string} methodName - 方法名称
     * @returns {string} 实现类路径
     */
    getImplementationPath(methodName) {
        // 转换为类名格式 (camelCase -> PascalCase)
        const className = this.toPascalCase(methodName) + 'Method';
        return path.join(this.implementationDir, `${className}.js`);
    }

    /**
     * 验证方法配置
     * @param {Object} config - 方法配置
     */
    validateMethodConfig(config) {
        const required = ['name', 'type', 'description', 'parameters', 'implementation'];
        
        for (const field of required) {
            if (!config[field]) {
                throw new Error(`方法配置缺少必填字段: ${field}`);
            }
        }
        
        // 验证参数配置
        if (typeof config.parameters !== 'object') {
            throw new Error('参数配置必须是对象');
        }
        
        // 验证实现配置
        if (!config.implementation.steps || !Array.isArray(config.implementation.steps)) {
            throw new Error('实现配置必须包含steps数组');
        }
    }

    /**
     * 创建配置驱动的方法类
     * @param {Object} config - 方法配置
     * @returns {Class} 方法类
     */
    createConfigDrivenMethod(config) {
        return class ConfigDrivenMethod extends MethodTemplate {
            constructor() {
                super({
                    name: config.name,
                    description: config.description,
                    version: config.version,
                    parameters: config.parameters,
                    capabilities: config.capabilities || []
                });
                
                this.config = config;
            }
            
            async execute(context, params) {
                const results = {};
                const stepResults = [];
                
                for (const step of this.config.implementation.steps) {
                    try {
                        // 检查执行条件
                        if (step.conditions && !this.evaluateConditions(step.conditions, params)) {
                            stepResults.push({
                                step: step.name,
                                skipped: true,
                                reason: 'Conditions not met'
                            });
                            continue;
                        }
                        
                        // 执行步骤
                        const stepResult = await this.executeStep(step, context, params, results);
                        stepResults.push({
                            step: step.name,
                            success: true,
                            result: stepResult
                        });
                        
                        // 合并结果
                        if (stepResult && typeof stepResult === 'object') {
                            Object.assign(results, stepResult);
                        }
                        
                    } catch (error) {
                        stepResults.push({
                            step: step.name,
                            success: false,
                            error: error.message
                        });
                        
                        // 决定是否继续执行后续步骤
                        if (this.config.implementation.stopOnError !== false) {
                            break;
                        }
                    }
                }
                
                return {
                    ...results,
                    _stepResults: stepResults,
                    _methodName: this.config.name
                };
            }
            
            async executeStep(step, context, params, previousResults) {
                // 基于步骤的action类型执行不同的逻辑
                switch (step.action) {
                    case 'analyze':
                        return this.performAnalysis(step, context, params);
                    
                    case 'generate':
                        return this.performGeneration(step, context, params, previousResults);
                    
                    case 'transform':
                        return this.performTransformation(step, context, params, previousResults);
                    
                    case 'evaluate':
                        return this.performEvaluation(step, context, params, previousResults);
                    
                    case 'validate':
                        return this.performValidation(step, context, params, previousResults);
                    
                    default:
                        return this.performCustomAction(step, context, params, previousResults);
                }
            }
            
            evaluateConditions(conditions, params) {
                for (const [key, expectedValue] of Object.entries(conditions)) {
                    if (params[key] !== expectedValue) {
                        return false;
                    }
                }
                return true;
            }
            
            async performAnalysis(step, context, params) {
                // 基础分析逻辑
                return {
                    analysis: `分析完成: ${step.name}`,
                    timestamp: new Date().toISOString()
                };
            }
            
            async performGeneration(step, context, params, previousResults) {
                // 基础生成逻辑
                return {
                    generated: `生成内容: ${step.name}`,
                    timestamp: new Date().toISOString()
                };
            }
            
            async performTransformation(step, context, params, previousResults) {
                // 基础转换逻辑
                return {
                    transformed: previousResults,
                    format: step.output?.format || 'default',
                    timestamp: new Date().toISOString()
                };
            }
            
            async performEvaluation(step, context, params, previousResults) {
                // 基础评估逻辑
                return {
                    evaluation: `评估完成: ${step.name}`,
                    score: Math.random() * 100,
                    timestamp: new Date().toISOString()
                };
            }
            
            async performValidation(step, context, params, previousResults) {
                // 基础验证逻辑
                return {
                    valid: true,
                    validationResult: `验证通过: ${step.name}`,
                    timestamp: new Date().toISOString()
                };
            }
            
            async performCustomAction(step, context, params, previousResults) {
                // 自定义动作的默认实现
                return {
                    action: step.action,
                    result: `执行自定义动作: ${step.name}`,
                    timestamp: new Date().toISOString()
                };
            }
        };
    }

    /**
     * 转换为PascalCase
     * @param {string} str - 输入字符串
     * @returns {string} PascalCase字符串
     */
    toPascalCase(str) {
        return str
            .replace(/([a-z])([A-Z])/g, '$1 $2')
            .replace(/[_-]+/g, ' ')
            .replace(/\b\w/g, char => char.toUpperCase())
            .replace(/\s+/g, '');
    }

    /**
     * 获取已加载的方法实例
     * @param {string} methodName - 方法名称
     * @returns {MethodTemplate|null} 方法实例
     */
    getMethod(methodName) {
        return this.loadedMethods.get(methodName) || null;
    }

    /**
     * 获取方法配置
     * @param {string} methodName - 方法名称
     * @returns {Object|null} 方法配置
     */
    getMethodConfig(methodName) {
        return this.methodConfigs.get(methodName) || null;
    }

    /**
     * 获取所有已加载的方法名称
     * @returns {Array<string>} 方法名称列表
     */
    getLoadedMethodNames() {
        return Array.from(this.loadedMethods.keys());
    }

    /**
     * 重新加载特定方法
     * @param {string} methodName - 方法名称
     * @returns {Promise<Object>} 加载结果
     */
    async reloadMethod(methodName) {
        const configFile = `${methodName}.json`;
        
        // 清除缓存
        this.loadedMethods.delete(methodName);
        this.methodConfigs.delete(methodName);
        
        // 重新加载
        return await this.loadMethodFromConfig(configFile);
    }

    /**
     * 获取加载统计信息
     * @returns {Object} 统计信息
     */
    getLoadStats() {
        const configFiles = this.getConfigFiles();
        const loadedCount = this.loadedMethods.size;
        
        return {
            totalConfigs: configFiles.length,
            loadedMethods: loadedCount,
            loadRate: configFiles.length > 0 ? (loadedCount / configFiles.length) * 100 : 0,
            methodNames: this.getLoadedMethodNames()
        };
    }
}

module.exports = MethodLoader;