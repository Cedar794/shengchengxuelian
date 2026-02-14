const express = require('express');
const router = express.Router();
const AIService = require('../services/aiService');

/**
 * AI Service Test Route
 * 用于测试AI服务配置和API连接
 */

/**
 * 检查AI服务配置状态
 */
router.get('/config', (req, res) => {
  try {
    const aiService = AIService;
    const isConfigured = aiService.isConfigured();

    const configInfo = {
      provider: aiService.provider,
      model: aiService.model,
      apiURL: aiService.apiURL,
      isConfigured: isConfigured,
      hasApiKey: !!aiService.apiKey,
      apiKeyValid: aiService.validateApiKey(),
      configType: isConfigured ? 'production' : 'fallback'
    };

    res.json({
      success: true,
      message: isConfigured ? 'AI服务已正确配置' : 'AI服务未配置或配置无效，将使用备用响应',
      data: configInfo
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '检查配置时出错',
      error: error.message
    });
  }
});

/**
 * 测试API密钥连接
 */
router.post('/test-key', async (req, res) => {
  try {
    const aiService = AIService;

    if (!aiService.isConfigured()) {
      return res.status(400).json({
        success: false,
        message: 'AI服务未正确配置，无法测试API密钥'
      });
    }

    // 使用一个简单的测试消息来验证API密钥
    const testMessages = [
      { role: 'user', content: '请回复"测试成功"' }
    ];

    const testOptions = {
      temperature: 0.2,
      max_tokens: 50
    };

    const response = await aiService.generateResponse(testMessages, testOptions);

    if (response.content) {
      res.json({
        success: true,
        message: 'API密钥测试成功',
        data: {
          model: response.model,
          usage: response.usage,
          preview: response.content.substring(0, 50) + (response.content.length > 50 ? '...' : '')
        }
      });
    } else {
      throw new Error('API未返回有效响应');
    }
  } catch (error) {
    console.error('API密钥测试失败:', error);

    if (error.message === 'AUTH_FAILED') {
      res.status(401).json({
        success: false,
        message: 'API密钥验证失败 - 无效的密钥或权限不足',
        error: 'AUTH_FAILED'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'API密钥测试失败',
        error: error.message
      });
    }
  }
});

/**
 * 获取备用响应示例
 */
router.get('/fallback', (req, res) => {
  try {
    const aiService = AIService;
    const testMessages = [{ role: 'user', content: '你好' }];
    const fallbackResponse = aiService.generateFallbackResponse('你好');

    res.json({
      success: true,
      message: '备用响应演示',
      data: {
        response: fallbackResponse
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取备用响应失败',
      error: error.message
    });
  }
});

/**
 * 完整的AI服务诊断
 */
router.get('/diagnosis', (req, res) => {
  try {
    const aiService = AIService;

    const diagnosis = {
      timestamp: new Date().toISOString(),
      configuration: {
        provider: aiService.provider,
        model: aiService.model,
        apiURL: aiService.apiURL,
        hasApiKey: !!aiService.apiKey
      },
      validation: {
        isConfigured: aiService.isConfigured(),
        isValid: aiService.validateApiKey()
      },
      environment: {
        nodeEnv: process.env.NODE_ENV,
        port: process.env.PORT
      }
    };

    res.json({
      success: true,
      message: 'AI服务诊断完成',
      data: diagnosis
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '诊断过程出错',
      error: error.message
    });
  }
});

module.exports = router;