/**
 * 目标层主模块
 * 负责管理学习目标、项目上下文和进度跟踪
 */

const ProjectContext = require('./ProjectContext');
const GoalManager = require('./GoalManager');
const ContextStore = require('./ContextStore');
const ContextSerializer = require('./ContextSerializer');

class GoalLayer {
    constructor() {
        this.projectContext = new ProjectContext();
        this.goalManager = new GoalManager();
        this.contextStore = new ContextStore();
        this.contextSerializer = new ContextSerializer();
        this.initialized = false;
    }

    /**
     * 初始化目标层
     * @param {Object} config - 配置选项
     */
    async initialize(config = {}) {
        try {
            // 初始化项目上下文
            await this.projectContext.initialize(config.context || {});
            
            // 初始化目标管理器
            await this.goalManager.initialize(this.projectContext);
            
            // 加载持久化的上下文
            if (config.loadPreviousContext) {
                await this.loadContext(config.contextId);
            }
            
            this.initialized = true;
            return { success: true, message: '目标层初始化成功' };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * 设置学习目标
     * @param {Object} goalData - 目标数据
     */
    async setGoal(goalData) {
        if (!this.initialized) {
            throw new Error('目标层尚未初始化');
        }
        
        return await this.goalManager.setGoal(goalData);
    }

    /**
     * 获取当前目标
     */
    getCurrentGoal() {
        return this.goalManager.getCurrentGoal();
    }

    /**
     * 更新目标进度
     * @param {string} goalId - 目标ID
     * @param {Object} progress - 进度数据
     */
    async updateProgress(goalId, progress) {
        const result = await this.goalManager.updateProgress(goalId, progress);
        
        // 自动保存上下文
        await this.saveContext();
        
        return result;
    }

    /**
     * 评估目标达成情况
     * @param {string} goalId - 目标ID
     */
    async assessGoal(goalId) {
        return await this.goalManager.assessGoal(goalId);
    }

    /**
     * 动态调整目标
     * @param {string} goalId - 目标ID
     * @param {Object} adjustments - 调整内容
     */
    async adjustGoal(goalId, adjustments) {
        return await this.goalManager.adjustGoal(goalId, adjustments);
    }

    /**
     * 保存当前上下文
     */
    async saveContext() {
        const context = {
            projectContext: this.projectContext.getContext(),
            goals: this.goalManager.getAllGoals(),
            timestamp: new Date().toISOString()
        };
        
        const serialized = this.contextSerializer.serialize(context);
        return await this.contextStore.save(serialized);
    }

    /**
     * 加载上下文
     * @param {string} contextId - 上下文ID
     */
    async loadContext(contextId) {
        const serialized = await this.contextStore.load(contextId);
        const context = this.contextSerializer.deserialize(serialized);
        
        // 恢复项目上下文
        this.projectContext.setContext(context.projectContext);
        
        // 恢复目标
        this.goalManager.restoreGoals(context.goals);
        
        return { success: true, message: '上下文加载成功' };
    }

    /**
     * 切换上下文
     * @param {string} contextId - 新上下文ID
     */
    async switchContext(contextId) {
        // 保存当前上下文
        await this.saveContext();
        
        // 加载新上下文
        return await this.loadContext(contextId);
    }

    /**
     * 获取上下文历史
     */
    async getContextHistory() {
        return await this.contextStore.getHistory();
    }

    /**
     * 获取目标层状态
     */
    getStatus() {
        return {
            initialized: this.initialized,
            context: this.projectContext.getContext(),
            currentGoal: this.goalManager.getCurrentGoal(),
            allGoals: this.goalManager.getAllGoals(),
            statistics: this.goalManager.getStatistics()
        };
    }

    /**
     * 重置目标层
     */
    async reset() {
        this.projectContext.reset();
        this.goalManager.reset();
        await this.contextStore.clear();
        this.initialized = false;
    }
}

module.exports = GoalLayer;