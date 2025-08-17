/**
 * 方法层主模块
 * 负责管理和协调所有教学方法的执行
 */

const MethodRegistry = require('./MethodRegistry');
const MethodExecutor = require('./MethodExecutor');
const MethodTemplate = require('./MethodTemplate');

class MethodLayer {
    constructor() {
        this.registry = new MethodRegistry();
        this.executor = new MethodExecutor(this.registry);
    }

    /**
     * 注册新的教学方法
     * @param {string} name - 方法名称
     * @param {MethodTemplate} method - 方法实例
     */
    registerMethod(name, method) {
        if (!(method instanceof MethodTemplate)) {
            throw new Error('方法必须继承自MethodTemplate');
        }
        this.registry.register(name, method);
    }

    /**
     * 执行指定的教学方法
     * @param {string} methodName - 方法名称
     * @param {Object} context - 执行上下文
     * @param {Object} params - 方法参数
     * @returns {Promise<Object>} 执行结果
     */
    async execute(methodName, context, params = {}) {
        return await this.executor.execute(methodName, context, params);
    }

    /**
     * 组合执行多个方法
     * @param {Array<string>} methodNames - 方法名称列表
     * @param {Object} context - 执行上下文
     * @param {Object} params - 参数配置
     * @returns {Promise<Array>} 执行结果数组
     */
    async executeChain(methodNames, context, params = {}) {
        return await this.executor.executeChain(methodNames, context, params);
    }

    /**
     * 获取所有已注册的方法
     * @returns {Array<string>} 方法名称列表
     */
    getAvailableMethods() {
        return this.registry.list();
    }

    /**
     * 获取方法的详细信息
     * @param {string} methodName - 方法名称
     * @returns {Object} 方法信息
     */
    getMethodInfo(methodName) {
        const method = this.registry.get(methodName);
        if (!method) {
            return null;
        }
        return {
            name: methodName,
            description: method.getDescription(),
            parameters: method.getParameters(),
            capabilities: method.getCapabilities()
        };
    }
}

module.exports = {
    MethodLayer,
    MethodTemplate,
    MethodRegistry,
    MethodExecutor
};