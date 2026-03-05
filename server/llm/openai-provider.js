/**
 * OpenAI Provider Implementation
 * Uses GPT-4o with structured outputs
 */

import OpenAI from 'openai';
import { LLMProvider } from './provider.js';

export class OpenAIProvider extends LLMProvider {
  constructor(config) {
    super(config);

    if (!config.apiKey) {
      throw new Error('OpenAI API key is required');
    }

    this.client = new OpenAI({
      apiKey: config.apiKey
    });

    this.model = config.model || process.env.OPENAI_MODEL || 'gpt-4o';
    this.temperature = config.temperature || 0.7;
    this.maxRetries = config.maxRetries || 3;
  }

  /**
   * Generate structured JSON response using OpenAI's JSON mode
   */
  async generateStructured(prompt, schema) {
    const systemPrompt = `You are a helpful AI assistant that generates structured JSON responses.
You must respond with valid JSON matching the provided schema.
Schema: ${JSON.stringify(schema, null, 2)}`;

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        const response = await this.client.chat.completions.create({
          model: this.model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt }
          ],
          response_format: { type: 'json_object' },
          temperature: this.temperature
        });

        const content = response.choices[0].message.content;
        const parsed = JSON.parse(content);

        // Basic schema validation
        if (schema.required) {
          for (const field of schema.required) {
            if (!(field in parsed)) {
              throw new Error(`Missing required field: ${field}`);
            }
          }
        }

        return parsed;
      } catch (error) {
        console.error(`OpenAI structured generation attempt ${attempt} failed:`, error.message);

        if (attempt === this.maxRetries) {
          throw new Error(`OpenAI structured generation failed after ${this.maxRetries} attempts: ${error.message}`);
        }

        // Wait before retry (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }
  }

  /**
   * Generate text response
   */
  async generate(prompt, systemPrompt = 'You are a helpful AI assistant.') {
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        const response = await this.client.chat.completions.create({
          model: this.model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt }
          ],
          temperature: this.temperature
        });

        return response.choices[0].message.content;
      } catch (error) {
        console.error(`OpenAI generation attempt ${attempt} failed:`, error.message);

        if (attempt === this.maxRetries) {
          throw new Error(`OpenAI generation failed after ${this.maxRetries} attempts: ${error.message}`);
        }

        // Wait before retry (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }
  }

  /**
   * Get provider name
   */
  getProviderName() {
    return 'openai';
  }

  /**
   * Get current model
   */
  getModel() {
    return this.model;
  }
}
