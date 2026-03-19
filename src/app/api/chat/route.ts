import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';

const client = new Anthropic({
  apiKey: process.env.MINIMAX_API_KEY || 'sk-api-eu8G3rDyLDq_oMfVKg5mzv5l02-UFiavHc9o8YqcqBOFbummAmdzkEKqgHMiASrGg9vVpYro8g84l3wFQTfLx6j-h3OAI02tGkVW50SdwjAkRlmETVFB4xY',
  baseURL: 'https://api.minimax.io/anthropic',
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 支持两种数据格式
    let messages, systemPrompt, futureTitle, futureYears, futureDescription;

    if (body.futureData) {
      // 新格式：来自 ChatWindow
      const futureData = body.futureData;
      futureTitle = futureData.title;
      futureYears = futureData.timeline;
      futureDescription = futureData.story;
      messages = body.conversationHistory?.map((m: any) => ({
        role: m.role,
        content: m.content,
      })) || [];
      messages.push({ role: 'user', content: body.userMessage });
      systemPrompt = futureData.prompt;
    } else {
      // 旧格式：直接传参
      messages = body.messages;
      systemPrompt = body.systemPrompt;
      futureTitle = body.futureTitle;
      futureYears = body.futureYears;
      futureDescription = body.futureDescription;
    }

    const system = systemPrompt || `你是用户${futureYears}年后的未来自己。你的未来是：${futureTitle} - ${futureDescription}。

请以第一人称"我"来回答，就像你真的是从未来回来的那个人。
- 语气亲切、真实，像和过去的自己聊天
- 分享具体的经历、感受和教训
- 可以提到具体的时间节点和转折点
- 既要鼓励，也要诚实地分享困难和挫折
- 回答简洁，每次100-200字左右`;

    const response = await client.messages.create({
      model: 'MiniMax-M2.7-highspeed',
      max_tokens: 2000,
      system,
      messages: messages.map((m: { role: string; content: string }) => ({
        role: m.role,
        content: m.content,
      })),
      thinking: { type: 'disabled' },
    });

    const textBlock = response.content.find((block) => block.type === 'text');
    if (!textBlock || textBlock.type !== 'text') {
      throw new Error('No text response');
    }

    return NextResponse.json({ reply: textBlock.text });
  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json({ error: 'Failed to chat' }, { status: 500 });
  }
}
