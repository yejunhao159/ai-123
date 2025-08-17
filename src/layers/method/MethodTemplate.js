/**
 * 方法模板基类
 * 所有教学方法都必须继承此类
 */

class MethodTemplate {
    constructor(config = {}) {
        this.name = config.name || 'UnnamedMethod';
        this.description = config.description || '';
        this.version = config.version || '1.0.0';
        this.parameters = config.parameters || {};
        this.capabilities = config.capabilities || [];
        this.hooks = {
            beforeExecute: [],
            afterExecute: [],
            onError: []
        };
    }

    /**
     * 验证参数是否符合要求
     * @param {Object} params - 输入参数
     * @returns {Object} 验证结果
     */
    validateParams(params) {
        const errors = [];
        const validated = {};

        for (const [key, config] of Object.entries(this.parameters)) {
            const value = params[key];
            
            // 检查必填参数
            if (config.required && value === undefined) {
                errors.push(`缺少必填参数: ${key}`);
                continue;
            }

            // 使用默认值
            if (value === undefined && config.default !== undefined) {
                validated[key] = config.default;
                continue;
            }

            // 类型验证
            if (value !== undefined && config.type) {
                const actualType = typeof value;
                if (actualType !== config.type) {
                    errors.push(`参数 ${key} 类型错误: 期望 ${config.type}, 实际 ${actualType}`);
                    continue;
                }
            }

            // 自定义验证
            if (config.validate && typeof config.validate === 'function') {
                const validationResult = config.validate(value);
                if (validationResult !== true) {
                    errors.push(`参数 ${key} 验证失败: ${validationResult}`);
                    continue;
                }
            }

            validated[key] = value;
        }

        return {
            valid: errors.length === 0,
            errors,
            params: validated
        };
    }

    /**
     * 执行前准备
     * @param {Object} context - 执行上下文
     * @param {Object} params - 方法参数
     */
    async prepare(context, params) {
        // 子类可以重写此方法进行准备工作
        return { context, params };
    }

    /**
     * 核心执行逻辑（必须由子类实现）
     * @param {Object} context - 执行上下文
     * @param {Object} params - 方法参数
     * @returns {Promise<Object>} 执行结果
     */
    async execute(context, params) {
        throw new Error('子类必须实现execute方法');
    }

    /**
     * 执行后处理
     * @param {Object} result - 执行结果
     * @param {Object} context - 执行上下文
     */
    async postProcess(result, context) {
        // 子类可以重写此方法进行后处理
        return result;
    }

    /**
     * 完整的执行流程
     * @param {Object} context - 执行上下文
     * @param {Object} params - 输入参数
     * @returns {Promise<Object>} 执行结果
     */
    async run(context, params = {}) {
        try {
            // 参数验证
            const validation = this.validateParams(params);
            if (!validation.valid) {
                throw new Error(`参数验证失败: ${validation.errors.join(', ')}`);
            }

            // 执行前钩子
            await this.runHooks('beforeExecute', context, validation.params);

            // 准备阶段
            const prepared = await this.prepare(context, validation.params);

            // 执行核心逻辑
            let result = await this.execute(prepared.context, prepared.params);

            // 后处理
            result = await this.postProcess(result, prepared.context);

            // 执行后钩子
            await this.runHooks('afterExecute', result, context);

            return {
                success: true,
                data: result,
                method: this.name,
                timestamp: new Date().toISOString()
            };

        } catch (error) {
            // 错误处理钩子
            await this.runHooks('onError', error, context);
            
            return {
                success: false,
                error: error.message,
                method: this.name,
                timestamp: new Date().toISOString()
            };
        }
    }

    /**
     * 注册钩子函数
     * @param {string} type - 钩子类型
     * @param {Function} handler - 处理函数
     */
    addHook(type, handler) {
        if (this.hooks[type] && typeof handler === 'function') {
            this.hooks[type].push(handler);
        }
    }

    /**
     * 运行钩子函数
     * @param {string} type - 钩子类型
     * @param {...any} args - 传递给钩子的参数
     */
    async runHooks(type, ...args) {
        const hooks = this.hooks[type] || [];
        for (const hook of hooks) {
            await hook(...args);
        }
    }

    /**
     * 获取方法描述
     * @returns {string} 方法描述
     */
    getDescription() {
        return this.description;
    }

    /**
     * 获取参数配置
     * @returns {Object} 参数配置
     */
    getParameters() {
        return this.parameters;
    }

    /**
     * 获取方法能力
     * @returns {Array} 能力列表
     */
    getCapabilities() {
        return this.capabilities;
    }

    /**
     * 检查是否支持某个能力
     * @param {string} capability - 能力名称
     * @returns {boolean} 是否支持
     */
    hasCapability(capability) {
        return this.capabilities.includes(capability);
    }

    /**
     * 克隆方法实例
     * @returns {MethodTemplate} 新的方法实例
     */
    clone() {
        const Constructor = this.constructor;
        return new Constructor({
            name: this.name,
            description: this.description,
            version: this.version,
            parameters: { ...this.parameters },
            capabilities: [...this.capabilities]
        });
    }
}

module.exports = MethodTemplate;