import { IServiceProvider } from './types';

const chatModels = [
  {
    name: 'gpt-4o',
    contextWindow: 128000,
    maxTokens: 4096,
    defaultMaxTokens: 4000,
    inputPrice: 0.005,
    outputPrice: 0.015,
    capabilities: {
      vision: {
        enabled: true,
        allowBase64: true,
        allowUrl: true,
      },
    },
    description: ``,
  },
  {
    name: 'gpt-4',
    contextWindow: 128000,
    maxTokens: 4096,
    defaultMaxTokens: 4000,
    inputPrice: 0.03,
    outputPrice: 0.06,
  },
  {
    name: 'gpt-35-turbo',
    contextWindow: 16385,
    maxTokens: 4096,
    defaultMaxTokens: 4000,
    inputPrice: 0.0015,
    outputPrice: 0.002,
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
