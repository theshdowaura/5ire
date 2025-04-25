import { IServiceProvider } from './types';

const chatModels = [
  {
    id: 'gpt-4o',
    name: 'gpt-4o',
    label: 'gpt-4o',
    contextWindow: 128000,
    maxTokens: 16384,
    defaultMaxTokens: 8000,
    inputPrice: 0.0025,
    outputPrice: 0.01,
    capabilities: {
      vision: {
        enabled: true,
        allowBase64: true,
        allowUrl: true,
      },
    },
    isDefault: true,
    description: `GPT-4o (“o” for “omni”) is OpenAI's versatile, high-intelligence flagship model. It accepts both text and image inputs, and produces text outputs (including Structured Outputs). It is the best model for most tasks, and is OpenAI's most capable model outside of it's o-series models.`,
  },
  {
    id: 'gpt-4o-mini',
    name: 'gpt-4o-mini',
    label: 'gpt-4o-mini',
    contextWindow: 128000,
    maxTokens: 100000,
    defaultMaxTokens: 10000,
    inputPrice: 0.0011,
    outputPrice: 0.0044,
    capabilities: {
      vision: {
        enabled: true,
        allowBase64: true,
        allowUrl: true,
      },
    },
    description: `o4-mini is OpenAI's latest small o-series model. It's optimized for fast, effective reasoning with exceptionally efficient performance in coding and visual tasks.`,
  },
  {
    id: 'gpt-4',
    name: 'gpt-4',
    contextWindow: 128000,
    maxTokens: 4096,
    defaultMaxTokens: 4000,
    inputPrice: 0.03,
    outputPrice: 0.06,
  },
];

export default {
  name: '5ire',
  apiBase: 'https://skyfire.agisurge.com',
  currency: 'USD',
  isPremium: true,
  options: {
    apiBaseCustomizable: false,
    apiKeyCustomizable: false,
  },
  chat: {
    apiSchema: ['base'],
    presencePenalty: { min: -2, max: 2, default: 0 },
    topP: { min: 0, max: 1, default: 1 },
    temperature: { min: 0, max: 1, default: 0.9 },
    options: {
      modelCustomizable: true,
    },
    models: chatModels,
  },
} as IServiceProvider;
