import { IChatContext, IChatRequestMessage } from 'intellichat/types';
import { urlJoin } from 'utils/util';
import OpenAIChatService from './OpenAIChatService';
import Azure from '../../providers/Azure';
import INextChatService from './INextCharService';

export default class AzureChatService
  extends OpenAIChatService
  implements INextChatService
{
  constructor(chatContext: IChatContext) {
    super(chatContext);
    this.provider = Azure;
  }

  protected async makeRequest(
    messages: IChatRequestMessage[],
    msgId?: string,
  ): Promise<Response> {
    const defaultAPIVersion = '2024-12-01-preview';
    const provider = this.context.getProvider();
    const model = this.context.getModel();
    const deploymentId = model.extras?.deploymentId || model.name;
    const url = urlJoin(
      `/openai/deployments/${deploymentId}/chat/completions?api-version=${provider.apiVersion || defaultAPIVersion}`,
      provider.apiBase.trim(),
    );
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': provider.apiKey,
      },
      body: JSON.stringify(await this.makePayload(messages, msgId)),
      signal: this.abortController.signal,
    });
    return response;
  }
}
