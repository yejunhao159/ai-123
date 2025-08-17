/**
 * 方法执行器
 * 负责执行和编排教学方法
 */

class MethodExecutor {
    constructor(registry) {
        this.registry = registry;
        this.middleware = [];
        this.executionHistory = [];
        this.maxHistorySize = 1000;
    }

    /**
     * 添加中间件
     * @param {Function} middleware - 中间件函数
     */
    use(middleware) {
        if (typeof middleware === 'function') {
            this.middleware.push(middleware);
        }
    }

    /**
     * 执行单个方法
     * @param {string} methodName - 方法名称
     * @param {Object} context - 执行上下文
     * @param {Object} params - 方法参数
     * @returns {Promise<Object>} 执行结果
     */
    async execute(methodName, context, params = {}) {
        const startTime = Date.now();
        let result;

        try {
            // 检查方法是否存在
            if (!this.registry.has(methodName)) {
                throw new Error(`方法 ${methodName} 不存在`);
            }

            const method = this.registry.get(methodName);
            
            // 执行中间件
            const enhancedContext = await this.runMiddleware(context, params, methodName);

            // 执行方法
            result = await method.run(enhancedContext, params);

            // 记录执行历史
            this.recordExecution({
                methodName,
                context: this.sanitizeContext(enhancedContext),
                params,
                result,
                duration: Date.now() - startTime,
                timestamp: new Date().toISOString(),
                success: result.success
            });

            return result;

        } catch (error) {
            const errorResult = {
                success: false,
                error: error.message,
                method: methodName,
                timestamp: new Date().toISOString()
            };

            // 记录失败的执行
            this.recordExecution({
                methodName,
                context: this.sanitizeContext(context),
                params,
                result: errorResult,
                duration: Date.now() - startTime,
                timestamp: new Date().toISOString(),
                success: false,
                error: error.message
            });

            return errorResult;
        }
    }

    /**
     * 链式执行多个方法
     * @param {Array<string>} methodNames - 方法名称列表
     * @param {Object} context - 初始执行上下文
     * @param {Object} params - 参数配置
     * @returns {Promise<Array>} 执行结果数组
     */
    async executeChain(methodNames, context, params = {}) {
        const results = [];
        let currentContext = { ...context };

        for (const methodName of methodNames) {
            try {
                // 获取当前方法的参数
                const methodParams = params[methodName] || params.global || {};
                
                // 执行方法
                const result = await this.execute(methodName, currentContext, methodParams);
                results.push(result);

                // 如果方法执行失败且设置了严格模式，停止执行
                if (!result.success && params.strict) {
                    break;
                }

                // 更新上下文（将前一个方法的结果作为下一个方法的输入）
                if (result.success && params.chainContext) {
                    currentContext = {
                        ...currentContext,
                        previousResult: result.data,
                        chainResults: results
                    };
                }

            } catch (error) {
                const errorResult = {
                    success: false,
                    error: error.message,
                    method: methodName,
                    timestamp: new Date().toISOString()
                };
                results.push(errorResult);

                if (params.strict) {
                    break;
                }
            }
        }

        return results;
    }

    /**
     * 并行执行多个方法
     * @param {Array<string>} methodNames - 方法名称列表
     * @param {Object} context - 执行上下文
     * @param {Object} params - 参数配置
     * @returns {Promise<Array>} 执行结果数组
     */
    async executeParallel(methodNames, context, params = {}) {
        const promises = methodNames.map(methodName => {
            const methodParams = params[methodName] || params.global || {};
            return this.execute(methodName, context, methodParams);
        });

        try {
            return await Promise.all(promises);
        } catch (error) {
            // 如果需要等待所有方法完成（即使有错误）
            return await Promise.allSettled(promises).then(results =>
                results.map(result => 
                    result.status === 'fulfilled' 
                        ? result.value 
                        : {
                            success: false,
                            error: result.reason.message,
                            timestamp: new Date().toISOString()
                        }
                )
            );
        }
    }

    /**
     * 条件执行方法
     * @param {Object} conditions - 执行条件
     * @param {Object} context - 执行上下文
     * @param {Object} params - 参数配置
     * @returns {Promise<Array>} 执行结果数组
     */
    async executeConditional(conditions, context, params = {}) {
        const results = [];

        for (const condition of conditions) {
            // 评估条件
            let shouldExecute = true;
            
            if (condition.if && typeof condition.if === 'function') {
                shouldExecute = await condition.if(context, params);
            } else if (condition.if && typeof condition.if === 'object') {
                shouldExecute = this.evaluateCondition(condition.if, context);
            }

            if (shouldExecute) {
                const result = await this.execute(
                    condition.method, 
                    context, 
                    condition.params || {}
                );
                results.push(result);

                // 更新上下文
                if (result.success && condition.updateContext) {
                    Object.assign(context, result.data);
                }
            } else {
                results.push({
                    success: true,
                    skipped: true,
                    method: condition.method,
                    reason: 'Condition not met',
                    timestamp: new Date().toISOString()
                });
            }
        }

        return results;
    }

    /**
     * 运行中间件
     * @param {Object} context - 执行上下文
     * @param {Object} params - 方法参数
     * @param {string} methodName - 方法名称
     * @returns {Promise<Object>} 增强的上下文
     */
    async runMiddleware(context, params, methodName) {
        let enhancedContext = { ...context };

        for (const middleware of this.middleware) {
            try {
                const result = await middleware(enhancedContext, params, methodName);
                if (result && typeof result === 'object') {
                    enhancedContext = { ...enhancedContext, ...result };
                }
            } catch (error) {
                console.warn(`中间件执行失败: ${error.message}`);
            }
        }

        return enhancedContext;
    }

    /**
     * 评估条件表达式
     * @param {Object} condition - 条件对象
     * @param {Object} context - 执行上下文
     * @returns {boolean} 条件结果
     */
    evaluateCondition(condition, context) {
        // 简单的条件评估逻辑
        for (const [key, expectedValue] of Object.entries(condition)) {
            const actualValue = this.getNestedValue(context, key);
            if (actualValue !== expectedValue) {
                return false;
            }
        }
        return true;
    }

    /**
     * 获取嵌套对象的值
     * @param {Object} obj - 对象
     * @param {string} path - 路径（如 'user.profile.name'）
     * @returns {any} 值
     */
    getNestedValue(obj, path) {
        return path.split('.').reduce((current, key) => 
            current && current[key] !== undefined ? current[key] : undefined, obj
        );
    }

    /**
     * 记录执行历史
     * @param {Object} execution - 执行记录
     */
    recordExecution(execution) {
        this.executionHistory.push(execution);
        
        // 限制历史记录大小
        if (this.executionHistory.length > this.maxHistorySize) {
            this.executionHistory.shift();
        }
    }

    /**
     * 清理上下文中的敏感信息
     * @param {Object} context - 原始上下文
     * @returns {Object} 清理后的上下文
     */
    sanitizeContext(context) {
        const sensitiveKeys = ['password', 'token', 'secret', 'key', 'auth'];
        const sanitized = { ...context };

        const sanitizeObject = (obj) => {
            for (const [key, value] of Object.entries(obj)) {
                if (sensitiveKeys.some(sensitive => 
                    key.toLowerCase().includes(sensitive)
                )) {
                    obj[key] = '[REDACTED]';
                } else if (value && typeof value === 'object') {
                    sanitizeObject(value);
                }
            }
        };

        sanitizeObject(sanitized);
        return sanitized;
    }

    /**
     * 获取执行历史
     * @param {Object} filter - 过滤条件
     * @returns {Array} 执行历史
     */
    getExecutionHistory(filter = {}) {
        let history = [...this.executionHistory];

        if (filter.methodName) {
            history = history.filter(h => h.methodName === filter.methodName);
        }

        if (filter.success !== undefined) {
            history = history.filter(h => h.success === filter.success);
        }

        if (filter.startTime && filter.endTime) {
            history = history.filter(h => {
                const timestamp = new Date(h.timestamp).getTime();
                return timestamp >= filter.startTime && timestamp <= filter.endTime;
            });
        }

        return history.slice(-filter.limit || history.length);
    }

    /**
     * 获取执行统计
     * @returns {Object} 统计信息
     */
    getExecutionStats() {
        const stats = {
            totalExecutions: this.executionHistory.length,
            successfulExecutions: 0,
            failedExecutions: 0,
            averageDuration: 0,
            methodStats: {},
            recentExecutions: this.executionHistory.slice(-10)
        };

        let totalDuration = 0;
        
        for (const execution of this.executionHistory) {
            if (execution.success) {
                stats.successfulExecutions++;
            } else {
                stats.failedExecutions++;
            }

            totalDuration += execution.duration || 0;

            // 方法统计
            if (!stats.methodStats[execution.methodName]) {
                stats.methodStats[execution.methodName] = {
                    count: 0,
                    successes: 0,
                    failures: 0,
                    averageDuration: 0
                };
            }

            const methodStat = stats.methodStats[execution.methodName];
            methodStat.count++;
            
            if (execution.success) {
                methodStat.successes++;
            } else {
                methodStat.failures++;
            }
        }

        stats.averageDuration = this.executionHistory.length > 0 
            ? totalDuration / this.executionHistory.length 
            : 0;

        // 计算每个方法的平均执行时间
        for (const methodStat of Object.values(stats.methodStats)) {
            const methodExecutions = this.executionHistory.filter(
                e => e.methodName === methodStat.methodName
            );
            const methodTotalDuration = methodExecutions.reduce(
                (sum, e) => sum + (e.duration || 0), 0
            );
            methodStat.averageDuration = methodExecutions.length > 0 
                ? methodTotalDuration / methodExecutions.length 
                : 0;
        }

        return stats;
    }

    /**
     * 清空执行历史
     */
    clearHistory() {
        this.executionHistory = [];
    }
}

module.exports = MethodExecutor;