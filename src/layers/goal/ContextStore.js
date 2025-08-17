/**
 * 上下文存储管理类
 * 负责上下文数据的持久化存储和检索
 */

const fs = require('fs').promises;
const path = require('path');

class ContextStore {
    constructor(options = {}) {
        this.storageType = options.storageType || 'file'; // file, memory, database
        this.storageDir = options.storageDir || './data/contexts';
        this.maxVersions = options.maxVersions || 10;
        this.memoryStore = new Map();
        this.initialized = false;
    }

    /**
     * 初始化存储
     */
    async initialize() {
        if (this.storageType === 'file') {
            try {
                await fs.mkdir(this.storageDir, { recursive: true });
            } catch (error) {
                throw new Error(`无法创建存储目录: ${error.message}`);
            }
        }
        this.initialized = true;
    }

    /**
     * 保存上下文
     * @param {Object} context - 序列化后的上下文数据
     * @returns {Promise<string>} 上下文ID
     */
    async save(context) {
        if (!this.initialized) {
            await this.initialize();
        }

        const contextId = this.generateContextId();
        const contextWithMeta = {
            id: contextId,
            data: context,
            timestamp: new Date().toISOString(),
            version: context.version || '1.0.0',
            checksum: this.calculateChecksum(context)
        };

        switch (this.storageType) {
            case 'file':
                await this.saveToFile(contextId, contextWithMeta);
                break;
            case 'memory':
                this.memoryStore.set(contextId, contextWithMeta);
                break;
            case 'database':
                await this.saveToDatabase(contextId, contextWithMeta);
                break;
        }

        // 清理旧版本
        await this.cleanupOldVersions();

        return contextId;
    }

    /**
     * 加载上下文
     * @param {string} contextId - 上下文ID
     * @returns {Promise<Object>} 上下文数据
     */
    async load(contextId) {
        if (!this.initialized) {
            await this.initialize();
        }

        let contextWithMeta;

        switch (this.storageType) {
            case 'file':
                contextWithMeta = await this.loadFromFile(contextId);
                break;
            case 'memory':
                contextWithMeta = this.memoryStore.get(contextId);
                break;
            case 'database':
                contextWithMeta = await this.loadFromDatabase(contextId);
                break;
        }

        if (!contextWithMeta) {
            throw new Error(`上下文不存在: ${contextId}`);
        }

        // 验证数据完整性
        const calculatedChecksum = this.calculateChecksum(contextWithMeta.data);
        if (calculatedChecksum !== contextWithMeta.checksum) {
            throw new Error(`上下文数据损坏: ${contextId}`);
        }

        return contextWithMeta.data;
    }

    /**
     * 获取上下文历史
     * @returns {Promise<Array>} 上下文历史列表
     */
    async getHistory() {
        if (!this.initialized) {
            await this.initialize();
        }

        switch (this.storageType) {
            case 'file':
                return await this.getFileHistory();
            case 'memory':
                return Array.from(this.memoryStore.values()).map(ctx => ({
                    id: ctx.id,
                    timestamp: ctx.timestamp,
                    version: ctx.version
                }));
            case 'database':
                return await this.getDatabaseHistory();
        }
    }

    /**
     * 删除上下文
     * @param {string} contextId - 上下文ID
     */
    async delete(contextId) {
        switch (this.storageType) {
            case 'file':
                await this.deleteFromFile(contextId);
                break;
            case 'memory':
                this.memoryStore.delete(contextId);
                break;
            case 'database':
                await this.deleteFromDatabase(contextId);
                break;
        }
    }

    /**
     * 清空所有上下文
     */
    async clear() {
        switch (this.storageType) {
            case 'file':
                await this.clearFiles();
                break;
            case 'memory':
                this.memoryStore.clear();
                break;
            case 'database':
                await this.clearDatabase();
                break;
        }
    }

    /**
     * 备份上下文
     * @param {string} contextId - 上下文ID
     * @param {string} backupPath - 备份路径
     */
    async backup(contextId, backupPath) {
        const context = await this.load(contextId);
        const backupData = {
            contextId,
            data: context,
            backupTimestamp: new Date().toISOString(),
            originalTimestamp: context.timestamp
        };

        await fs.writeFile(
            backupPath,
            JSON.stringify(backupData, null, 2),
            'utf8'
        );
    }

    /**
     * 从备份恢复上下文
     * @param {string} backupPath - 备份文件路径
     * @returns {Promise<string>} 新的上下文ID
     */
    async restore(backupPath) {
        const backupData = JSON.parse(await fs.readFile(backupPath, 'utf8'));
        return await this.save(backupData.data);
    }

    /**
     * 文件存储实现
     */
    async saveToFile(contextId, contextWithMeta) {
        const filePath = path.join(this.storageDir, `${contextId}.json`);
        await fs.writeFile(filePath, JSON.stringify(contextWithMeta, null, 2), 'utf8');
    }

    async loadFromFile(contextId) {
        const filePath = path.join(this.storageDir, `${contextId}.json`);
        try {
            const data = await fs.readFile(filePath, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            if (error.code === 'ENOENT') {
                return null;
            }
            throw error;
        }
    }

    async getFileHistory() {
        try {
            const files = await fs.readdir(this.storageDir);
            const contexts = [];

            for (const file of files) {
                if (file.endsWith('.json')) {
                    const filePath = path.join(this.storageDir, file);
                    const stats = await fs.stat(filePath);
                    const contextId = path.basename(file, '.json');
                    
                    try {
                        const data = JSON.parse(await fs.readFile(filePath, 'utf8'));
                        contexts.push({
                            id: contextId,
                            timestamp: data.timestamp,
                            version: data.version,
                            size: stats.size,
                            modifiedAt: stats.mtime.toISOString()
                        });
                    } catch (error) {
                        // 忽略损坏的文件
                        console.warn(`忽略损坏的上下文文件: ${file}`);
                    }
                }
            }

            return contexts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        } catch (error) {
            return [];
        }
    }

    async deleteFromFile(contextId) {
        const filePath = path.join(this.storageDir, `${contextId}.json`);
        try {
            await fs.unlink(filePath);
        } catch (error) {
            if (error.code !== 'ENOENT') {
                throw error;
            }
        }
    }

    async clearFiles() {
        try {
            const files = await fs.readdir(this.storageDir);
            for (const file of files) {
                if (file.endsWith('.json')) {
                    await fs.unlink(path.join(this.storageDir, file));
                }
            }
        } catch (error) {
            // 目录不存在或其他错误
        }
    }

    /**
     * 数据库存储实现（占位符）
     */
    async saveToDatabase(contextId, contextWithMeta) {
        // TODO: 实现数据库存储
        throw new Error('数据库存储尚未实现');
    }

    async loadFromDatabase(contextId) {
        // TODO: 实现数据库加载
        throw new Error('数据库存储尚未实现');
    }

    async getDatabaseHistory() {
        // TODO: 实现数据库历史查询
        throw new Error('数据库存储尚未实现');
    }

    async deleteFromDatabase(contextId) {
        // TODO: 实现数据库删除
        throw new Error('数据库存储尚未实现');
    }

    async clearDatabase() {
        // TODO: 实现数据库清空
        throw new Error('数据库存储尚未实现');
    }

    /**
     * 清理旧版本
     */
    async cleanupOldVersions() {
        const history = await this.getHistory();
        if (history.length > this.maxVersions) {
            const toDelete = history.slice(this.maxVersions);
            for (const context of toDelete) {
                await this.delete(context.id);
            }
        }
    }

    /**
     * 生成上下文ID
     */
    generateContextId() {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substr(2, 9);
        return `ctx_${timestamp}_${random}`;
    }

    /**
     * 计算校验和
     */
    calculateChecksum(data) {
        const crypto = require('crypto');
        return crypto.createHash('md5').update(JSON.stringify(data)).digest('hex');
    }

    /**
     * 获取存储统计信息
     */
    async getStatistics() {
        const history = await this.getHistory();
        
        let totalSize = 0;
        if (this.storageType === 'file') {
            for (const context of history) {
                totalSize += context.size || 0;
            }
        } else if (this.storageType === 'memory') {
            totalSize = Array.from(this.memoryStore.values())
                .reduce((size, ctx) => size + JSON.stringify(ctx).length, 0);
        }

        return {
            totalContexts: history.length,
            totalSize,
            storageType: this.storageType,
            oldestContext: history.length > 0 ? history[history.length - 1] : null,
            newestContext: history.length > 0 ? history[0] : null
        };
    }
}

module.exports = ContextStore;