/**
 * 项目上下文管理类
 * 负责管理学习项目的上下文信息
 */

class ProjectContext {
    constructor() {
        this.context = {
            // 学习主题和目标
            learningTopic: null,
            learningObjectives: [],
            
            // 用户知识水平(ZPD - Zone of Proximal Development)
            userLevel: {
                current: 'beginner', // beginner, intermediate, advanced
                zpd: {
                    canDo: [], // 用户已掌握的技能
                    canDoWithHelp: [], // 在帮助下能完成的技能
                    cannotDo: [] // 暂时无法掌握的技能
                }
            },
            
            // 学习风格偏好
            learningStyle: {
                preferredFormat: 'interactive', // text, video, interactive, mixed
                pace: 'moderate', // slow, moderate, fast
                depth: 'detailed', // overview, detailed, comprehensive
                practiceType: 'hands-on' // theoretical, hands-on, mixed
            },
            
            // 历史学习记录
            learningHistory: [],
            
            // 当前进度状态
            currentState: {
                phase: 'planning', // planning, learning, practicing, evaluating
                completedTopics: [],
                currentTopic: null,
                lastActivity: null,
                sessionStartTime: null
            },
            
            // 项目特定信息
            projectInfo: {
                name: '',
                description: '',
                domain: '',
                complexity: 'medium',
                estimatedDuration: null
            },
            
            // 环境配置
            environment: {
                tools: [],
                resources: [],
                constraints: []
            }
        };
        
        this.version = '1.0.0';
        this.lastModified = new Date().toISOString();
    }

    /**
     * 初始化项目上下文
     * @param {Object} config - 初始化配置
     */
    async initialize(config) {
        // 合并配置
        if (config.learningTopic) {
            this.context.learningTopic = config.learningTopic;
        }
        
        if (config.learningObjectives) {
            this.context.learningObjectives = config.learningObjectives;
        }
        
        if (config.userLevel) {
            this.context.userLevel = { ...this.context.userLevel, ...config.userLevel };
        }
        
        if (config.learningStyle) {
            this.context.learningStyle = { ...this.context.learningStyle, ...config.learningStyle };
        }
        
        if (config.projectInfo) {
            this.context.projectInfo = { ...this.context.projectInfo, ...config.projectInfo };
        }
        
        if (config.environment) {
            this.context.environment = { ...this.context.environment, ...config.environment };
        }
        
        this.context.currentState.sessionStartTime = new Date().toISOString();
        this.context.currentState.phase = 'planning';
        this.updateModified();
        
        return { success: true, message: '项目上下文初始化完成' };
    }

    /**
     * 设置学习主题
     * @param {string} topic - 学习主题
     */
    setLearningTopic(topic) {
        this.context.learningTopic = topic;
        this.updateModified();
    }

    /**
     * 添加学习目标
     * @param {Object} objective - 学习目标
     */
    addLearningObjective(objective) {
        this.context.learningObjectives.push({
            id: this.generateId(),
            ...objective,
            createdAt: new Date().toISOString()
        });
        this.updateModified();
    }

    /**
     * 更新用户知识水平
     * @param {Object} level - 知识水平信息
     */
    updateUserLevel(level) {
        this.context.userLevel = { ...this.context.userLevel, ...level };
        this.updateModified();
    }

    /**
     * 更新ZPD信息
     * @param {Object} zpd - ZPD信息
     */
    updateZPD(zpd) {
        this.context.userLevel.zpd = { ...this.context.userLevel.zpd, ...zpd };
        this.updateModified();
    }

    /**
     * 设置学习风格偏好
     * @param {Object} style - 学习风格
     */
    setLearningStyle(style) {
        this.context.learningStyle = { ...this.context.learningStyle, ...style };
        this.updateModified();
    }

    /**
     * 添加学习记录
     * @param {Object} record - 学习记录
     */
    addLearningRecord(record) {
        this.context.learningHistory.push({
            id: this.generateId(),
            timestamp: new Date().toISOString(),
            ...record
        });
        this.updateModified();
    }

    /**
     * 更新当前状态
     * @param {Object} state - 状态信息
     */
    updateCurrentState(state) {
        this.context.currentState = { ...this.context.currentState, ...state };
        this.context.currentState.lastActivity = new Date().toISOString();
        this.updateModified();
    }

    /**
     * 标记主题完成
     * @param {string} topicId - 主题ID
     */
    markTopicCompleted(topicId) {
        if (!this.context.currentState.completedTopics.includes(topicId)) {
            this.context.currentState.completedTopics.push(topicId);
        }
        this.updateModified();
    }

    /**
     * 设置当前学习主题
     * @param {string} topicId - 主题ID
     */
    setCurrentTopic(topicId) {
        this.context.currentState.currentTopic = topicId;
        this.updateModified();
    }

    /**
     * 更新项目信息
     * @param {Object} info - 项目信息
     */
    updateProjectInfo(info) {
        this.context.projectInfo = { ...this.context.projectInfo, ...info };
        this.updateModified();
    }

    /**
     * 添加工具或资源
     * @param {string} type - 类型 ('tools' 或 'resources')
     * @param {Object} item - 工具或资源信息
     */
    addEnvironmentItem(type, item) {
        if (this.context.environment[type]) {
            this.context.environment[type].push({
                id: this.generateId(),
                addedAt: new Date().toISOString(),
                ...item
            });
            this.updateModified();
        }
    }

    /**
     * 获取完整上下文
     * @returns {Object} 上下文对象
     */
    getContext() {
        return {
            ...this.context,
            version: this.version,
            lastModified: this.lastModified
        };
    }

    /**
     * 设置上下文
     * @param {Object} context - 上下文对象
     */
    setContext(context) {
        this.context = { ...context };
        if (context.version) this.version = context.version;
        if (context.lastModified) this.lastModified = context.lastModified;
    }

    /**
     * 获取学习进度概况
     * @returns {Object} 进度概况
     */
    getProgressSummary() {
        const totalObjectives = this.context.learningObjectives.length;
        const completedTopics = this.context.currentState.completedTopics.length;
        const totalRecords = this.context.learningHistory.length;
        
        return {
            totalObjectives,
            completedTopics,
            totalRecords,
            currentPhase: this.context.currentState.phase,
            learningTime: this.calculateLearningTime(),
            completionRate: totalObjectives > 0 ? (completedTopics / totalObjectives) * 100 : 0
        };
    }

    /**
     * 重置上下文
     */
    reset() {
        this.context = {
            learningTopic: null,
            learningObjectives: [],
            userLevel: {
                current: 'beginner',
                zpd: { canDo: [], canDoWithHelp: [], cannotDo: [] }
            },
            learningStyle: {
                preferredFormat: 'interactive',
                pace: 'moderate',
                depth: 'detailed',
                practiceType: 'hands-on'
            },
            learningHistory: [],
            currentState: {
                phase: 'planning',
                completedTopics: [],
                currentTopic: null,
                lastActivity: null,
                sessionStartTime: new Date().toISOString()
            },
            projectInfo: {
                name: '',
                description: '',
                domain: '',
                complexity: 'medium',
                estimatedDuration: null
            },
            environment: {
                tools: [],
                resources: [],
                constraints: []
            }
        };
        this.updateModified();
    }

    /**
     * 计算学习时间
     */
    calculateLearningTime() {
        if (this.context.currentState.sessionStartTime) {
            const start = new Date(this.context.currentState.sessionStartTime);
            const now = new Date();
            return now - start;
        }
        return 0;
    }

    /**
     * 生成唯一ID
     */
    generateId() {
        return `id_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * 更新修改时间
     */
    updateModified() {
        this.lastModified = new Date().toISOString();
    }

    /**
     * 验证上下文数据
     * @returns {Object} 验证结果
     */
    validate() {
        const errors = [];
        
        if (!this.context.learningTopic) {
            errors.push('学习主题未设置');
        }
        
        if (this.context.learningObjectives.length === 0) {
            errors.push('学习目标未设置');
        }
        
        if (!this.context.userLevel.current) {
            errors.push('用户水平未设置');
        }
        
        return {
            valid: errors.length === 0,
            errors
        };
    }
}

module.exports = ProjectContext;