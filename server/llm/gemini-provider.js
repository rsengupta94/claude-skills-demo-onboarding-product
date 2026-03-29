/**
 * Gemini Provider Implementation
 * Uses Gemini 1.5 Pro with JSON mode
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { LLMProvider } from './base-provider.js';

export class GeminiProvider extends LLMProvider {
  constructor(config) {
    super(config);

    if (!config.apiKey) {
      throw new Error('Gemini API key is required');
    }

    this.genAI = new GoogleGenerativeAI(config.apiKey);
    this.model = config.model || process.env.GEMINI_MODEL || 'gemini-2.5-flash';
    this.temperature = config.temperature || 0.7;
    this.maxRetries = config.maxRetries || 3;
  }

  /**
   * Generate structured JSON response using Gemini's JSON mode
   */
  async generateStructured(prompt, schema) {
    const systemPrompt = `You are a helpful AI assistant that generates structured JSON responses.
You must respond with valid JSON matching the provided schema. Do not include any markdown formatting or code blocks - return pure JSON only.
Schema: ${JSON.stringify(schema, null, 2)}`;

    const fullPrompt = `${systemPrompt}\n\n${prompt}`;

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        const model = this.genAI.getGenerativeModel({
          model: this.model,
          generationConfig: {
            temperature: this.temperature
          }
        });

        const result = await model.generateContent(fullPrompt);
        const response = await result.response;
        const text = response.text();

        // Clean up response (remove markdown formatting if present)
        let cleanText = text.trim();
        if (cleanText.startsWith('```json')) {
          cleanText = cleanText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
        } else if (cleanText.startsWith('```')) {
          cleanText = cleanText.replace(/^```\s*/, '').replace(/\s*```$/, '');
        }

        const parsed = JSON.parse(cleanText);

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
        console.error(`Gemini structured generation attempt ${attempt} failed:`, error.message);

        if (attempt === this.maxRetries) {
          throw new Error(`Gemini structured generation failed after ${this.maxRetries} attempts: ${error.message}`);
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
    const fullPrompt = `${systemPrompt}\n\n${prompt}`;

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        const model = this.genAI.getGenerativeModel({
          model: this.model,
          generationConfig: {
            temperature: this.temperature
          }
        });

        const result = await model.generateContent(fullPrompt);
        const response = await result.response;
        return response.text();
      } catch (error) {
        console.error(`Gemini generation attempt ${attempt} failed:`, error.message);

        if (attempt === this.maxRetries) {
          throw new Error(`Gemini generation failed after ${this.maxRetries} attempts: ${error.message}`);
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
    return 'gemini';
  }

  /**
   * Get current model
   */
  getModel() {
    return this.model;
  }
}
