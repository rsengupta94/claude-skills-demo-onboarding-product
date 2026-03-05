/**
 * LLM Provider Abstraction Layer
 * Unified interface for OpenAI and Gemini
 */

import { OpenAIProvider } from './openai-provider.js';
import { GeminiProvider } from './gemini-provider.js';

/**
 * Base LLM Provider interface
 */
export class LLMProvider {
  constructor(config = {}) {
    this.config = config;
    this.model = config.model;
  }

  /**
   * Generate structured JSON response matching a schema
   * @param {string} prompt - The prompt to send to the LLM
   * @param {object} schema - JSON schema for structured output
   * @returns {Promise<object>} Parsed JSON response
   */
  async generateStructured(prompt, schema) {
    throw new Error('generateStructured must be implemented by subclass');
  }

  /**
   * Generate text response
   * @param {string} prompt - The prompt to send to the LLM
   * @returns {Promise<string>} Text response
   */
  async generate(prompt) {
    throw new Error('generate must be implemented by subclass');
  }

  /**
   * Set the model to use
   * @param {string} modelName - Model identifier
   */
  setModel(modelName) {
    this.model = modelName;
  }

  /**
   * Get current provider name
   */
  getProviderName() {
    throw new Error('getProviderName must be implemented by subclass');
  }
}

/**
 * Factory function to get LLM provider based on configuration
 * @param {object} config - Configuration object
 * @returns {LLMProvider} Instance of OpenAIProvider or GeminiProvider
 */
export function getLLMProvider(config = {}) {
  const provider = config.provider || process.env.LLM_PROVIDER || 'openai';

  switch (provider.toLowerCase()) {
    case 'openai':
      return new OpenAIProvider({
        apiKey: config.apiKey || process.env.OPENAI_API_KEY,
        model: config.model || process.env.OPENAI_MODEL || 'gpt-4o',
        ...config
      });

    case 'gemini':
      return new GeminiProvider({
        apiKey: config.apiKey || process.env.GEMINI_API_KEY,
        model: config.model || process.env.GEMINI_MODEL || 'gemini-2.5-flash',
        ...config
      });

    default:
      throw new Error(`Unknown LLM provider: ${provider}. Supported: openai, gemini`);
  }
}

/**
 * Get provider with automatic fallback
 * @param {object} config - Configuration object
 * @returns {LLMProvider} Primary or fallback provider
 */
export async function getLLMProviderWithFallback(config = {}) {
  const primaryProvider = config.provider || process.env.LLM_PROVIDER || 'openai';
  const fallbackProvider = primaryProvider === 'openai' ? 'gemini' : 'openai';

  try {
    const provider = getLLMProvider({ ...config, provider: primaryProvider });
    // Test provider with a simple call
    await provider.generate('test');
    return provider;
  } catch (error) {
    console.warn(`Primary provider ${primaryProvider} failed, falling back to ${fallbackProvider}`);
    return getLLMProvider({ ...config, provider: fallbackProvider });
  }
}

export { OpenAIProvider } from './openai-provider.js';
export { GeminiProvider } from './gemini-provider.js';
