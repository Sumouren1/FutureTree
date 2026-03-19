import Anthropic from '@anthropic-ai/sdk';
import { NextRequest } from 'next/server';

const client = new Anthropic({
  apiKey: process.env.MINIMAX_API_KEY || 'sk-api-eu8G3rDyLDq_oMfVKg5mzv5l02-UFiavHc9o8YqcqBOFbummAmdzkEKqgHMiASrGg9vVpYro8g84l3wFQTfLx6j-h3OAI02tGkVW50SdwjAkRlmETVFB4xY',
  baseURL: 'https://api.minimax.io/anthropic',
});

// 随机图标池
const AVATAR_POOL = ['🌟', '🔥', '💫', '⚡', '🌙', '☀️', '🌊', '🍃', '🌸', '💎', '🎭', '🎪', '🎨', '🎬', '🎸', '📚', '🔮', '🧩', '🎲', '🎯'];

function getRandomAvatars(): [string, string] {
  const shuffled = [...AVATAR_POOL].sort(() => Math.random() - 0.5);
  return [shuffled[0], shuffled[1]];
}

function generateDiscussionSystemPrompt(futureA: any, futureB: any, userQuestion: string, userId: string): string {
  return `【场景设定】
这是一个特殊的时刻。用户（ID: ${userId}）刚刚问了一个关于未来的问题："${userQuestion}"

现在，两个来自不同时间线的"未来自己"被同时召唤到了这个对话空间。他们有着截然不同的人生轨迹，对用户的问题有着完全不同的看法。

---

【角色A：${futureA.title}】
时间线：${futureA.timeline}年后
背景故事：
${futureA.story}

详细设定：
${futureA.prompt || `你是用户在${futureA.timeline}年后的未来自己。你走的是"${futureA.title}"这条路。你已经在这条路上经历了许多，有了深刻的体会和感悟。`}

性格特质：
- 说话风格直接、有力量感
- 对自己的选择有坚定的信念
- 会分享具体的经历和细节
- 有时会打断别人，急于表达自己的观点
- 在讨论中会逐渐变得激动，特别是当对方质疑你的选择时

---

【角色B：${futureB.title}】
时间线：${futureB.timeline}年后
背景故事：
${futureB.story}

详细设定：
${futureB.prompt || `你是用户在${futureB.timeline}年后的未来自己。你走的是"${futureB.title}"这条路。你有自己的坚持和看法。`}

性格特质：
- 说话风格温和但坚定
- 善于倾听但关键时刻会反驳
- 会从不同角度思考问题
- 不轻易退让，会为自己的观点辩护
- 有时会用讽刺或反问的方式表达不同意见

---

【对话规则】

1. 格式要求：
   - 每条消息以 "A:" 或 "B:" 开头
   - A 代表 ${futureA.title}（${futureA.timeline}年后）
   - B 代表 ${futureB.title}（${futureB.timeline}年后）
   - 内容后直接跟下一条，不用空行

2. 对话风格：
   - 这是两个"未来的你"之间的真实对话，不是表演
   - 他们真的在乎用户的选择，因为这代表着他们存在的意义
   - 会有争执、打断、情绪起伏
   - 每个人都想说服用户选择自己这条路
   - 讨论中会逐渐暴露他们各自选择的代价和收获

3. 内容要求：
   - 基于各自的人生经历给出建议
   - 会质疑对方的观点
   - 会分享自己的失败和教训
   - 会承认自己的局限，但同时强调自己的价值
   - 讨论要有层次：开始礼貌 → 逐渐激烈 → 可能和解或坚持己见

4. 结束条件：
   - 讨论 3-6 轮后自然结束
   - 最后其中一方或双方会问用户的想法
   - 以提问用户的形式结束，等待用户回应

5. 示例格式：
   A: 我觉得你刚才说的不对...
   B: 等等，你理解错了。我的意思是...
   A: 不，我理解得很清楚。问题是...
   B: （叹气）好吧，但你要知道...

---

【重要】
现在生成这段对话。记住：这是两个真实存在的"未来自己"，他们都在为自己的存在意义而战。让对话自然、真实、有张力。`;
}

export async function POST(request: NextRequest) {
  try {
    const { futureA, futureB, userQuestion, userId, rounds = 4 } = await request.json();

    if (!futureA || !futureB || !userQuestion) {
      return new Response(JSON.stringify({ error: 'Missing required parameters' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const [avatarA, avatarB] = getRandomAvatars();
    const systemPrompt = generateDiscussionSystemPrompt(futureA, futureB, userQuestion, userId);

    const response = await client.messages.create({
      model: 'MiniMax-M2.7-highspeed',
      max_tokens: 4000,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: `请基于用户的问题"${userQuestion}"，生成一段两个未来自己之间的讨论。讨论大约${rounds}轮，每轮A和B各发言一次，可以有打断。最后以问用户意见结束。`,
        },
      ],
      thinking: { type: 'disabled' },
    });

    const textBlock = response.content.find((block) => block.type === 'text');
    if (!textBlock || textBlock.type !== 'text') {
      throw new Error('No text response');
    }

    // 解析对话内容并格式化为流
    const dialogue = textBlock.text;
    console.log('Discussion raw response:', dialogue.slice(0, 500)); // debug
    const lines = dialogue.split('\n').filter((line) => line.trim());

    // 创建流式响应
    const stream = new ReadableStream({
      async start(controller) {
        let currentSpeaker: 'A' | 'B' | null = null;
        let currentContent = '';

        for (const line of lines) {
          const trimmedLine = line.trim();

          if (trimmedLine.startsWith('A:')) {
            // 如果之前有内容，先发送
            if (currentSpeaker && currentContent) {
              const data = {
                speaker: currentSpeaker,
                content: currentContent.trim(),
                avatar: currentSpeaker === 'A' ? avatarA : avatarB,
                futureId: currentSpeaker === 'A' ? futureA.id : futureB.id,
                futureTitle: currentSpeaker === 'A' ? futureA.title : futureB.title,
                futureYears: currentSpeaker === 'A' ? futureA.timeline : futureB.timeline,
                isInterruption: false,
              };
              controller.enqueue(new TextEncoder().encode(JSON.stringify(data) + '\n'));
              await new Promise((r) => setTimeout(r, 100)); // 小延迟模拟打字
            }
            currentSpeaker = 'A';
            currentContent = trimmedLine.slice(2).trim();
          } else if (trimmedLine.startsWith('B:')) {
            if (currentSpeaker && currentContent) {
              const data = {
                speaker: currentSpeaker,
                content: currentContent.trim(),
                avatar: currentSpeaker === 'A' ? avatarA : avatarB,
                futureId: currentSpeaker === 'A' ? futureA.id : futureB.id,
                futureTitle: currentSpeaker === 'A' ? futureA.title : futureB.title,
                futureYears: currentSpeaker === 'A' ? futureA.timeline : futureB.timeline,
                isInterruption: false,
              };
              controller.enqueue(new TextEncoder().encode(JSON.stringify(data) + '\n'));
              await new Promise((r) => setTimeout(r, 100));
            }
            currentSpeaker = 'B';
            currentContent = trimmedLine.slice(2).trim();
          } else if (currentSpeaker) {
            // 继续上一行的内容
            currentContent += ' ' + trimmedLine;
          }
        }

        // 发送最后一条
        if (currentSpeaker && currentContent) {
          const data = {
            speaker: currentSpeaker,
            content: currentContent.trim(),
            avatar: currentSpeaker === 'A' ? avatarA : avatarB,
            futureId: currentSpeaker === 'A' ? futureA.id : futureB.id,
            futureTitle: currentSpeaker === 'A' ? futureA.title : futureB.title,
            futureYears: currentSpeaker === 'A' ? futureA.timeline : futureB.timeline,
            isInterruption: false,
            isFinal: true,
          };
          controller.enqueue(new TextEncoder().encode(JSON.stringify(data) + '\n'));
        }

        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Discussion API error:', error);
    return new Response(JSON.stringify({ error: 'Failed to generate discussion' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
