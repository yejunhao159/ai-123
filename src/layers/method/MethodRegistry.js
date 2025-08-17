/**
 * 方法注册表
 * 管理所有已注册的教学方法
 */

class MethodRegistry {
    constructor() {
        this.methods = new Map();
        this.categories = new Map();
        this.tags = new Map();
    }

    /**
     * 注册方法
     * @param {string} name - 方法名称
     * @param {MethodTemplate} method - 方法实例
     * @param {Object} metadata - 元数据
     */
    register(name, method, metadata = {}) {
        if (this.methods.has(name)) {
            throw new Error(`方法 ${name} 已存在`);
        }

        const methodInfo = {
            instance: method,
            name,
            category: metadata.category || 'general',
            tags: metadata.tags || [],
            registeredAt: new Date(),
            ...metadata
        };

        this.methods.set(name, methodInfo);

        // 按类别分组
        const category = methodInfo.category;
        if (!this.categories.has(category)) {
            this.categories.set(category, new Set());
        }
        this.categories.get(category).add(name);

        // 按标签分组
        methodInfo.tags.forEach(tag => {
            if (!this.tags.has(tag)) {
                this.tags.set(tag, new Set());
            }
            this.tags.get(tag).add(name);
        });
    }

    /**
     * 获取方法实例
     * @param {string} name - 方法名称
     * @returns {MethodTemplate|null} 方法实例
     */
    get(name) {
        const methodInfo = this.methods.get(name);
        return methodInfo ? methodInfo.instance : null;
    }

    /**
     * 获取方法信息
     * @param {string} name - 方法名称
     * @returns {Object|null} 方法信息
     */
    getInfo(name) {
        return this.methods.get(name) || null;
    }

    /**
     * 检查方法是否存在
     * @param {string} name - 方法名称
     * @returns {boolean} 是否存在
     */
    has(name) {
        return this.methods.has(name);
    }

    /**
     * 注销方法
     * @param {string} name - 方法名称
     */
    unregister(name) {
        const methodInfo = this.methods.get(name);
        if (!methodInfo) {
            return false;
        }

        // 从类别中移除
        const category = methodInfo.category;
        if (this.categories.has(category)) {
            this.categories.get(category).delete(name);
            if (this.categories.get(category).size === 0) {
                this.categories.delete(category);
            }
        }

        // 从标签中移除
        methodInfo.tags.forEach(tag => {
            if (this.tags.has(tag)) {
                this.tags.get(tag).delete(name);
                if (this.tags.get(tag).size === 0) {
                    this.tags.delete(tag);
                }
            }
        });

        this.methods.delete(name);
        return true;
    }

    /**
     * 列出所有方法名称
     * @returns {Array<string>} 方法名称列表
     */
    list() {
        return Array.from(this.methods.keys());
    }

    /**
     * 按类别获取方法
     * @param {string} category - 类别名称
     * @returns {Array<string>} 方法名称列表
     */
    getByCategory(category) {
        const methods = this.categories.get(category);
        return methods ? Array.from(methods) : [];
    }

    /**
     * 按标签获取方法
     * @param {string} tag - 标签名称
     * @returns {Array<string>} 方法名称列表
     */
    getByTag(tag) {
        const methods = this.tags.get(tag);
        return methods ? Array.from(methods) : [];
    }

    /**
     * 搜索方法
     * @param {Object} criteria - 搜索条件
     * @returns {Array<Object>} 匹配的方法信息
     */
    search(criteria = {}) {
        const results = [];
        
        for (const [name, methodInfo] of this.methods) {
            let matches = true;

            // 按名称搜索
            if (criteria.name && !name.includes(criteria.name)) {
                matches = false;
            }

            // 按类别搜索
            if (criteria.category && methodInfo.category !== criteria.category) {
                matches = false;
            }

            // 按标签搜索
            if (criteria.tags && criteria.tags.length > 0) {
                const hasTag = criteria.tags.some(tag => methodInfo.tags.includes(tag));
                if (!hasTag) {
                    matches = false;
                }
            }

            // 按能力搜索
            if (criteria.capabilities && criteria.capabilities.length > 0) {
                const hasCapability = criteria.capabilities.some(cap => 
                    methodInfo.instance.hasCapability(cap)
                );
                if (!hasCapability) {
                    matches = false;
                }
            }

            if (matches) {
                results.push({
                    name,
                    ...methodInfo,
                    instance: undefined // 不返回实例对象
                });
            }
        }

        return results;
    }

    /**
     * 获取所有类别
     * @returns {Array<string>} 类别列表
     */
    getCategories() {
        return Array.from(this.categories.keys());
    }

    /**
     * 获取所有标签
     * @returns {Array<string>} 标签列表
     */
    getTags() {
        return Array.from(this.tags.keys());
    }

    /**
     * 获取注册表统计信息
     * @returns {Object} 统计信息
     */
    getStats() {
        return {
            totalMethods: this.methods.size,
            totalCategories: this.categories.size,
            totalTags: this.tags.size,
            methodsByCategory: Object.fromEntries(
                Array.from(this.categories).map(([cat, methods]) => [cat, methods.size])
            ),
            methodsByTag: Object.fromEntries(
                Array.from(this.tags).map(([tag, methods]) => [tag, methods.size])
            )
        };
    }

    /**
     * 清空注册表
     */
    clear() {
        this.methods.clear();
        this.categories.clear();
        this.tags.clear();
    }

    /**
     * 批量注册方法
     * @param {Array<Object>} methodConfigs - 方法配置数组
     */
    batchRegister(methodConfigs) {
        const results = [];
        
        for (const config of methodConfigs) {
            try {
                this.register(config.name, config.instance, config.metadata);
                results.push({ name: config.name, success: true });
            } catch (error) {
                results.push({ 
                    name: config.name, 
                    success: false, 
                    error: error.message 
                });
            }
        }

        return results;
    }
}

module.exports = MethodRegistry;