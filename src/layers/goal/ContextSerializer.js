/**
 * 上下文序列化工具类
 * 负责上下文数据的序列化和反序列化
 */

class ContextSerializer {
    constructor(options = {}) {
        this.version = options.version || '1.0.0';
        this.compressionEnabled = options.compression || false;
        this.encryptionEnabled = options.encryption || false;
        this.encryptionKey = options.encryptionKey || null;
        
        // 支持的序列化格式
        this.formats = {
            JSON: 'json',
            BINARY: 'binary',
            COMPRESSED: 'compressed'
        };
        
        this.defaultFormat = options.format || this.formats.JSON;
    }

    /**
     * 序列化上下文数据
     * @param {Object} context - 上下文对象
     * @param {Object} options - 序列化选项
     * @returns {Object} 序列化后的数据
     */
    serialize(context, options = {}) {
        const format = options.format || this.defaultFormat;
        const metadata = this.createMetadata(context, format);
        
        try {
            let serialized;
            
            switch (format) {
                case this.formats.JSON:
                    serialized = this.serializeToJSON(context);
                    break;
                case this.formats.BINARY:
                    serialized = this.serializeToBinary(context);
                    break;
                case this.formats.COMPRESSED:
                    serialized = this.serializeCompressed(context);
                    break;
                default:
                    throw new Error(`不支持的序列化格式: ${format}`);
            }

            // 应用压缩
            if (this.compressionEnabled || options.compress) {
                serialized = this.compress(serialized);
                metadata.compressed = true;
            }

            // 应用加密
            if (this.encryptionEnabled || options.encrypt) {
                serialized = this.encrypt(serialized);
                metadata.encrypted = true;
            }

            return {
                metadata,
                data: serialized,
                version: this.version,
                serializedAt: new Date().toISOString()
            };
        } catch (error) {
            throw new Error(`序列化失败: ${error.message}`);
        }
    }

    /**
     * 反序列化上下文数据
     * @param {Object} serializedData - 序列化的数据
     * @param {Object} options - 反序列化选项
     * @returns {Object} 原始上下文对象
     */
    deserialize(serializedData, options = {}) {
        try {
            let data = serializedData.data;
            const metadata = serializedData.metadata;

            // 解密
            if (metadata.encrypted) {
                data = this.decrypt(data);
            }

            // 解压缩
            if (metadata.compressed) {
                data = this.decompress(data);
            }

            // 根据格式反序列化
            switch (metadata.format) {
                case this.formats.JSON:
                    return this.deserializeFromJSON(data);
                case this.formats.BINARY:
                    return this.deserializeFromBinary(data);
                case this.formats.COMPRESSED:
                    return this.deserializeCompressed(data);
                default:
                    throw new Error(`不支持的反序列化格式: ${metadata.format}`);
            }
        } catch (error) {
            throw new Error(`反序列化失败: ${error.message}`);
        }
    }

    /**
     * JSON序列化
     */
    serializeToJSON(context) {
        return JSON.stringify(context, this.jsonReplacer, 2);
    }

    deserializeFromJSON(data) {
        return JSON.parse(data, this.jsonReviver);
    }

    /**
     * 二进制序列化
     */
    serializeToBinary(context) {
        const jsonStr = JSON.stringify(context);
        return Buffer.from(jsonStr, 'utf8');
    }

    deserializeFromBinary(data) {
        const jsonStr = data.toString('utf8');
        return JSON.parse(jsonStr);
    }

    /**
     * 压缩序列化
     */
    serializeCompressed(context) {
        const jsonStr = JSON.stringify(context);
        return this.compress(jsonStr);
    }

    deserializeCompressed(data) {
        const jsonStr = this.decompress(data);
        return JSON.parse(jsonStr);
    }

    /**
     * 压缩数据
     */
    compress(data) {
        const zlib = require('zlib');
        if (typeof data === 'string') {
            return zlib.gzipSync(Buffer.from(data, 'utf8')).toString('base64');
        } else if (Buffer.isBuffer(data)) {
            return zlib.gzipSync(data).toString('base64');
        }
        return data;
    }

    /**
     * 解压缩数据
     */
    decompress(data) {
        const zlib = require('zlib');
        try {
            const buffer = Buffer.from(data, 'base64');
            const decompressed = zlib.gunzipSync(buffer);
            return decompressed.toString('utf8');
        } catch (error) {
            throw new Error(`解压缩失败: ${error.message}`);
        }
    }

    /**
     * 加密数据
     */
    encrypt(data) {
        if (!this.encryptionKey) {
            throw new Error('加密密钥未设置');
        }

        const crypto = require('crypto');
        const algorithm = 'aes-256-gcm';
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipher(algorithm, this.encryptionKey);
        
        let encrypted = cipher.update(data, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        
        const authTag = cipher.getAuthTag();
        
        return {
            algorithm,
            iv: iv.toString('hex'),
            authTag: authTag.toString('hex'),
            data: encrypted
        };
    }

    /**
     * 解密数据
     */
    decrypt(encryptedData) {
        if (!this.encryptionKey) {
            throw new Error('解密密钥未设置');
        }

        const crypto = require('crypto');
        const decipher = crypto.createDecipher(
            encryptedData.algorithm,
            this.encryptionKey
        );
        
        decipher.setAuthTag(Buffer.from(encryptedData.authTag, 'hex'));
        
        let decrypted = decipher.update(encryptedData.data, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        
        return decrypted;
    }

    /**
     * 创建元数据
     */
    createMetadata(context, format) {
        return {
            format,
            version: this.version,
            contextType: this.detectContextType(context),
            size: this.calculateSize(context),
            checksum: this.calculateChecksum(context),
            compressed: false,
            encrypted: false,
            createdAt: new Date().toISOString()
        };
    }

    /**
     * 检测上下文类型
     */
    detectContextType(context) {
        if (context.projectContext && context.goals) {
            return 'full_context';
        } else if (context.projectContext) {
            return 'project_context';
        } else if (context.goals) {
            return 'goals_only';
        }
        return 'unknown';
    }

    /**
     * 计算数据大小
     */
    calculateSize(context) {
        return JSON.stringify(context).length;
    }

    /**
     * 计算校验和
     */
    calculateChecksum(context) {
        const crypto = require('crypto');
        const data = JSON.stringify(context, Object.keys(context).sort());
        return crypto.createHash('sha256').update(data).digest('hex');
    }

    /**
     * JSON替换器（处理特殊类型）
     */
    jsonReplacer(key, value) {
        // 处理Date对象
        if (value instanceof Date) {
            return { __type: 'Date', value: value.toISOString() };
        }
        
        // 处理RegExp对象
        if (value instanceof RegExp) {
            return { __type: 'RegExp', source: value.source, flags: value.flags };
        }
        
        // 处理Map对象
        if (value instanceof Map) {
            return { __type: 'Map', entries: Array.from(value.entries()) };
        }
        
        // 处理Set对象
        if (value instanceof Set) {
            return { __type: 'Set', values: Array.from(value.values()) };
        }
        
        return value;
    }

    /**
     * JSON恢复器（重构特殊类型）
     */
    jsonReviver(key, value) {
        if (value && typeof value === 'object' && value.__type) {
            switch (value.__type) {
                case 'Date':
                    return new Date(value.value);
                case 'RegExp':
                    return new RegExp(value.source, value.flags);
                case 'Map':
                    return new Map(value.entries);
                case 'Set':
                    return new Set(value.values);
            }
        }
        return value;
    }

    /**
     * 验证序列化数据
     */
    validate(serializedData) {
        const errors = [];
        
        if (!serializedData.metadata) {
            errors.push('缺少元数据');
        }
        
        if (!serializedData.data) {
            errors.push('缺少数据');
        }
        
        if (!serializedData.version) {
            errors.push('缺少版本信息');
        }
        
        if (serializedData.metadata && !Object.values(this.formats).includes(serializedData.metadata.format)) {
            errors.push(`不支持的格式: ${serializedData.metadata.format}`);
        }
        
        return {
            valid: errors.length === 0,
            errors
        };
    }

    /**
     * 获取序列化统计信息
     */
    getStatistics(serializedData) {
        if (!serializedData.metadata) {
            return null;
        }
        
        return {
            format: serializedData.metadata.format,
            originalSize: serializedData.metadata.size,
            serializedSize: JSON.stringify(serializedData).length,
            compressed: serializedData.metadata.compressed,
            encrypted: serializedData.metadata.encrypted,
            compressionRatio: serializedData.metadata.compressed ? 
                (serializedData.metadata.size / JSON.stringify(serializedData).length) : 1,
            createdAt: serializedData.metadata.createdAt,
            version: serializedData.version
        };
    }

    /**
     * 升级序列化格式版本
     */
    upgradeVersion(serializedData, targetVersion) {
        // TODO: 实现版本升级逻辑
        throw new Error('版本升级功能尚未实现');
    }
}

module.exports = ContextSerializer;