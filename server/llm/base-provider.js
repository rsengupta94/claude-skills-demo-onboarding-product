/**
 * Base LLM Provider class
 * Separated to avoid circular imports
 */

export class LLMProvider {
  constructor(config = {}) {
    this.config = config;
    this.model = config.model;
  }

  async generateStructured(prompt, schema) {
    throw new Error('generateStructured must be implemented by subclass');
  }

  async generate(prompt) {
    throw new Error('generate must be implemented by subclass');
  }

  setModel(modelName) {
    this.model = modelName;
  }

  getProviderName() {
    throw new Error('getProviderName must be implemented by subclass');
  }
}
