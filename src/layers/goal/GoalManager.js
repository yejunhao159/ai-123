/**
 * 目标管理类
 * 负责学习目标的创建、跟踪、评估和动态调整
 */

class GoalManager {
    constructor() {
        this.goals = new Map();
        this.activeGoals = new Set();
        this.completedGoals = new Set();
        this.goalHierarchy = new Map(); // 目标层级关系
        this.progressTracking = new Map();
        this.assessmentCriteria = new Map();
        this.projectContext = null;
        this.initialized = false;
    }

    /**
     * 初始化目标管理器
     * @param {ProjectContext} projectContext - 项目上下文
     */
    async initialize(projectContext) {
        this.projectContext = projectContext;
        this.initialized = true;
        
        // 从项目上下文中恢复目标
        const context = projectContext.getContext();
        if (context.learningObjectives) {
            for (const objective of context.learningObjectives) {
                await this.createGoalFromObjective(objective);
            }
        }
        
        return { success: true, message: '目标管理器初始化完成' };
    }

    /**
     * 设置学习目标
     * @param {Object} goalData - 目标数据
     */
    async setGoal(goalData) {
        const goal = this.createGoal(goalData);
        
        // 验证目标
        const validation = this.validateGoal(goal);
        if (!validation.valid) {
            throw new Error(`目标验证失败: ${validation.errors.join(', ')}`);
        }
        
        // 保存目标
        this.goals.set(goal.id, goal);
        this.activeGoals.add(goal.id);
        
        // 建立层级关系
        if (goal.parentId) {
            this.establishHierarchy(goal.id, goal.parentId);
        }
        
        // 设置评估标准
        if (goal.assessmentCriteria) {
            this.assessmentCriteria.set(goal.id, goal.assessmentCriteria);
        }
        
        // 初始化进度跟踪
        this.initializeProgressTracking(goal.id);
        
        // 更新项目上下文
        if (this.projectContext) {
            this.projectContext.addLearningObjective({
                id: goal.id,
                title: goal.title,
                description: goal.description,
                type: goal.type
            });
        }
        
        return { success: true, goalId: goal.id, message: '目标设置成功' };
    }

    /**
     * 创建目标对象
     * @param {Object} goalData - 目标数据
     */
    createGoal(goalData) {
        return {
            id: goalData.id || this.generateGoalId(),
            title: goalData.title,
            description: goalData.description,
            type: goalData.type || 'learning', // learning, practice, assessment, project
            priority: goalData.priority || 'medium', // low, medium, high, critical
            difficulty: goalData.difficulty || 'medium', // easy, medium, hard, expert
            
            // 目标层级
            parentId: goalData.parentId || null,
            childIds: goalData.childIds || [],
            
            // 时间相关
            estimatedDuration: goalData.estimatedDuration || null,
            deadline: goalData.deadline || null,
            createdAt: new Date().toISOString(),
            startedAt: null,
            completedAt: null,
            
            // 状态
            status: 'pending', // pending, active, completed, cancelled, on_hold
            progress: 0, // 0-100
            
            // 评估相关
            assessmentCriteria: goalData.assessmentCriteria || [],
            successMetrics: goalData.successMetrics || [],
            
            // 学习相关
            prerequisites: goalData.prerequisites || [],
            resources: goalData.resources || [],
            tags: goalData.tags || [],
            
            // 适应性
            adaptable: goalData.adaptable !== false,
            adjustmentHistory: [],
            
            // 上下文关联
            contextDependencies: goalData.contextDependencies || [],
            
            // 元数据
            metadata: goalData.metadata || {}
        };
    }

    /**
     * 从学习目标创建目标
     */
    async createGoalFromObjective(objective) {
        const goalData = {
            id: objective.id,
            title: objective.title || objective.description,
            description: objective.description,
            type: objective.type || 'learning',
            createdAt: objective.createdAt
        };
        
        return await this.setGoal(goalData);
    }

    /**
     * 获取当前目标
     */
    getCurrentGoal() {
        const activeGoalIds = Array.from(this.activeGoals);
        if (activeGoalIds.length === 0) return null;
        
        // 返回优先级最高的活跃目标
        let currentGoal = null;
        let highestPriority = -1;
        
        for (const goalId of activeGoalIds) {
            const goal = this.goals.get(goalId);
            const priority = this.getPriorityValue(goal.priority);
            
            if (priority > highestPriority) {
                highestPriority = priority;
                currentGoal = goal;
            }
        }
        
        return currentGoal;
    }

    /**
     * 获取所有目标
     */
    getAllGoals() {
        return Array.from(this.goals.values());
    }

    /**
     * 获取目标按状态分组
     */
    getGoalsByStatus() {
        const grouped = {
            pending: [],
            active: [],
            completed: [],
            cancelled: [],
            on_hold: []
        };
        
        for (const goal of this.goals.values()) {
            if (grouped[goal.status]) {
                grouped[goal.status].push(goal);
            }
        }
        
        return grouped;
    }

    /**
     * 更新目标进度
     * @param {string} goalId - 目标ID
     * @param {Object} progress - 进度数据
     */
    async updateProgress(goalId, progress) {
        const goal = this.goals.get(goalId);
        if (!goal) {
            throw new Error(`目标不存在: ${goalId}`);
        }
        
        // 更新进度
        if (typeof progress.percentage === 'number') {
            goal.progress = Math.max(0, Math.min(100, progress.percentage));
        }
        
        // 记录进度历史
        const progressEntry = {
            timestamp: new Date().toISOString(),
            progress: goal.progress,
            details: progress.details || '',
            milestones: progress.milestones || [],
            challenges: progress.challenges || []
        };
        
        if (!this.progressTracking.has(goalId)) {
            this.progressTracking.set(goalId, []);
        }
        this.progressTracking.get(goalId).push(progressEntry);
        
        // 更新状态
        if (goal.status === 'pending' && goal.progress > 0) {
            goal.status = 'active';
            goal.startedAt = new Date().toISOString();
            this.activeGoals.add(goalId);
        }
        
        if (goal.progress >= 100 && goal.status !== 'completed') {
            goal.status = 'completed';
            goal.completedAt = new Date().toISOString();
            this.activeGoals.delete(goalId);
            this.completedGoals.add(goalId);
            
            // 更新项目上下文
            if (this.projectContext) {
                this.projectContext.markTopicCompleted(goalId);
            }
        }
        
        // 检查子目标
        await this.updateChildGoalsProgress(goalId);
        
        // 检查父目标
        await this.updateParentGoalProgress(goalId);
        
        return { success: true, progress: goal.progress, status: goal.status };
    }

    /**
     * 评估目标达成情况
     * @param {string} goalId - 目标ID
     */
    async assessGoal(goalId) {
        const goal = this.goals.get(goalId);
        if (!goal) {
            throw new Error(`目标不存在: ${goalId}`);
        }
        
        const assessment = {
            goalId,
            title: goal.title,
            assessedAt: new Date().toISOString(),
            progress: goal.progress,
            status: goal.status,
            criteria: [],
            overall: 'pending'
        };
        
        // 根据评估标准进行评估
        const criteria = this.assessmentCriteria.get(goalId) || goal.assessmentCriteria;
        let totalScore = 0;
        let maxScore = 0;
        
        for (const criterion of criteria) {
            const score = await this.evaluateCriterion(goal, criterion);
            assessment.criteria.push({
                name: criterion.name,
                description: criterion.description,
                weight: criterion.weight || 1,
                score,
                maxScore: criterion.maxScore || 100,
                passed: score >= (criterion.passingScore || 60)
            });
            
            totalScore += score * (criterion.weight || 1);
            maxScore += (criterion.maxScore || 100) * (criterion.weight || 1);
        }
        
        // 计算总体评估
        if (maxScore > 0) {
            const percentage = (totalScore / maxScore) * 100;
            assessment.overall = percentage >= 80 ? 'excellent' :
                               percentage >= 60 ? 'good' :
                               percentage >= 40 ? 'fair' : 'poor';
            assessment.score = percentage;
        }
        
        // 生成建议
        assessment.recommendations = this.generateRecommendations(goal, assessment);
        
        return assessment;
    }

    /**
     * 动态调整目标
     * @param {string} goalId - 目标ID
     * @param {Object} adjustments - 调整内容
     */
    async adjustGoal(goalId, adjustments) {
        const goal = this.goals.get(goalId);
        if (!goal) {
            throw new Error(`目标不存在: ${goalId}`);
        }
        
        if (!goal.adaptable) {
            throw new Error('该目标不支持动态调整');
        }
        
        // 记录调整历史
        const adjustment = {
            timestamp: new Date().toISOString(),
            adjustments: { ...adjustments },
            reason: adjustments.reason || '用户手动调整',
            previousState: {
                title: goal.title,
                description: goal.description,
                difficulty: goal.difficulty,
                estimatedDuration: goal.estimatedDuration,
                deadline: goal.deadline
            }
        };
        
        goal.adjustmentHistory.push(adjustment);
        
        // 应用调整
        if (adjustments.title) goal.title = adjustments.title;
        if (adjustments.description) goal.description = adjustments.description;
        if (adjustments.difficulty) goal.difficulty = adjustments.difficulty;
        if (adjustments.estimatedDuration) goal.estimatedDuration = adjustments.estimatedDuration;
        if (adjustments.deadline) goal.deadline = adjustments.deadline;
        if (adjustments.priority) goal.priority = adjustments.priority;
        
        // 调整评估标准
        if (adjustments.assessmentCriteria) {
            goal.assessmentCriteria = adjustments.assessmentCriteria;
            this.assessmentCriteria.set(goalId, adjustments.assessmentCriteria);
        }
        
        // 调整资源
        if (adjustments.resources) {
            goal.resources = [...goal.resources, ...adjustments.resources];
        }
        
        return { success: true, message: '目标调整成功', adjustmentId: adjustment.timestamp };
    }

    /**
     * 建立目标层级关系
     */
    establishHierarchy(childId, parentId) {
        if (!this.goalHierarchy.has(parentId)) {
            this.goalHierarchy.set(parentId, new Set());
        }
        this.goalHierarchy.get(parentId).add(childId);
        
        // 更新父目标的子目标列表
        const parentGoal = this.goals.get(parentId);
        if (parentGoal && !parentGoal.childIds.includes(childId)) {
            parentGoal.childIds.push(childId);
        }
    }

    /**
     * 更新子目标进度
     */
    async updateChildGoalsProgress(parentId) {
        const childIds = this.goalHierarchy.get(parentId);
        if (!childIds || childIds.size === 0) return;
        
        const parentGoal = this.goals.get(parentId);
        if (!parentGoal) return;
        
        // 计算子目标平均进度
        let totalProgress = 0;
        let completedChildren = 0;
        
        for (const childId of childIds) {
            const childGoal = this.goals.get(childId);
            if (childGoal) {
                totalProgress += childGoal.progress;
                if (childGoal.status === 'completed') {
                    completedChildren++;
                }
            }
        }
        
        const averageProgress = totalProgress / childIds.size;
        
        // 更新父目标进度
        if (averageProgress > parentGoal.progress) {
            await this.updateProgress(parentId, { percentage: averageProgress });
        }
    }

    /**
     * 更新父目标进度
     */
    async updateParentGoalProgress(childId) {
        const childGoal = this.goals.get(childId);
        if (!childGoal || !childGoal.parentId) return;
        
        await this.updateChildGoalsProgress(childGoal.parentId);
    }

    /**
     * 初始化进度跟踪
     */
    initializeProgressTracking(goalId) {
        if (!this.progressTracking.has(goalId)) {
            this.progressTracking.set(goalId, []);
        }
    }

    /**
     * 评估标准
     */
    async evaluateCriterion(goal, criterion) {
        // 基础评估逻辑
        switch (criterion.type) {
            case 'progress':
                return goal.progress;
            case 'time':
                return this.evaluateTimeProgress(goal);
            case 'quality':
                return this.evaluateQuality(goal);
            case 'completion':
                return goal.status === 'completed' ? 100 : 0;
            default:
                return 0;
        }
    }

    /**
     * 评估时间进度
     */
    evaluateTimeProgress(goal) {
        if (!goal.estimatedDuration || !goal.startedAt) return 0;
        
        const startTime = new Date(goal.startedAt);
        const now = new Date();
        const elapsed = now - startTime;
        const estimated = goal.estimatedDuration * 60 * 60 * 1000; // 转换为毫秒
        
        return Math.min(100, (elapsed / estimated) * 100);
    }

    /**
     * 评估质量
     */
    evaluateQuality(goal) {
        // 基于进度历史和里程碑评估质量
        const progressHistory = this.progressTracking.get(goal.id) || [];
        if (progressHistory.length === 0) return 0;
        
        const recentProgress = progressHistory.slice(-5); // 最近5次记录
        const milestoneCount = recentProgress.reduce((count, entry) => 
            count + (entry.milestones ? entry.milestones.length : 0), 0);
        
        return Math.min(100, milestoneCount * 20); // 每个里程碑20分
    }

    /**
     * 生成建议
     */
    generateRecommendations(goal, assessment) {
        const recommendations = [];
        
        if (assessment.score < 60) {
            recommendations.push('考虑调整目标难度或分解为更小的子目标');
            recommendations.push('增加学习资源或寻求额外帮助');
        }
        
        if (goal.progress < 50 && this.isOverdue(goal)) {
            recommendations.push('目标进度滞后，建议重新评估时间安排');
        }
        
        if (assessment.criteria.some(c => !c.passed)) {
            recommendations.push('关注未达标的评估标准，针对性改进');
        }
        
        return recommendations;
    }

    /**
     * 检查目标是否逾期
     */
    isOverdue(goal) {
        if (!goal.deadline) return false;
        return new Date() > new Date(goal.deadline);
    }

    /**
     * 获取优先级数值
     */
    getPriorityValue(priority) {
        const values = { low: 1, medium: 2, high: 3, critical: 4 };
        return values[priority] || 2;
    }

    /**
     * 验证目标
     */
    validateGoal(goal) {
        const errors = [];
        
        if (!goal.title) errors.push('目标标题不能为空');
        if (!goal.description) errors.push('目标描述不能为空');
        if (!['learning', 'practice', 'assessment', 'project'].includes(goal.type)) {
            errors.push('无效的目标类型');
        }
        
        return { valid: errors.length === 0, errors };
    }

    /**
     * 生成目标ID
     */
    generateGoalId() {
        return `goal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * 获取统计信息
     */
    getStatistics() {
        const total = this.goals.size;
        const active = this.activeGoals.size;
        const completed = this.completedGoals.size;
        const pending = total - active - completed;
        
        return {
            total,
            active,
            completed,
            pending,
            completionRate: total > 0 ? (completed / total) * 100 : 0,
            avgProgress: this.calculateAverageProgress()
        };
    }

    /**
     * 计算平均进度
     */
    calculateAverageProgress() {
        if (this.goals.size === 0) return 0;
        
        let totalProgress = 0;
        for (const goal of this.goals.values()) {
            totalProgress += goal.progress;
        }
        
        return totalProgress / this.goals.size;
    }

    /**
     * 恢复目标
     */
    restoreGoals(goalsData) {
        this.goals.clear();
        this.activeGoals.clear();
        this.completedGoals.clear();
        
        if (Array.isArray(goalsData)) {
            for (const goalData of goalsData) {
                this.goals.set(goalData.id, goalData);
                
                if (goalData.status === 'active') {
                    this.activeGoals.add(goalData.id);
                } else if (goalData.status === 'completed') {
                    this.completedGoals.add(goalData.id);
                }
            }
        }
    }

    /**
     * 重置目标管理器
     */
    reset() {
        this.goals.clear();
        this.activeGoals.clear();
        this.completedGoals.clear();
        this.goalHierarchy.clear();
        this.progressTracking.clear();
        this.assessmentCriteria.clear();
        this.projectContext = null;
        this.initialized = false;
    }
}

module.exports = GoalManager;