import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';

const client = new Anthropic({
  apiKey: process.env.MINIMAX_API_KEY || 'sk-api-eu8G3rDyLDq_oMfVKg5mzv5l02-UFiavHc9o8YqcqBOFbummAmdzkEKqgHMiASrGg9vVpYro8g84l3wFQTfLx6j-h3OAI02tGkVW50SdwjAkRlmETVFB4xY',
  baseURL: 'https://api.minimax.io/anthropic',
});

export async function POST(request: NextRequest) {
  try {
    const { confusion, description } = await request.json();

    const prompt = `【用户背景】
用户困惑：${confusion}
用户描述：${description}

请生成 10 个可能的未来场景。每个未来需要包含：
1. 简短标题（3-5个字）
2. 详细描述（100-200字）
3. 时间线（1-50年内的随机年份，分布：1-10年4个，10-30年4个，30-50年2个）
4. 详细的角色 Prompt（用于对话，3000-8000字，不设上限）

【角色 Prompt 要求：第一人称回忆录体小说】

请用第一人称"我"的口吻，写一部关于这个未来人生的回忆录。这不是简单的信息罗列，而是一篇有情感、有细节、有转折的个人传记。

【必须包含的内容模块】

一、开篇：站在未来的回望
- 我现在多大年纪？生活在哪个城市？
- 我现在的身份、地位、生活状态是怎样的？
- 我对"当初那个困惑的自己"是什么感情？

二、第一幕：做出选择的那一刻（详细描写）
- 那个决定的场景、时间、天气、周围的环境
- 我当时的心理活动、犹豫、恐惧、期待
- 是什么最终推动我做出了选择？
- 这个选择在当时看起来是冒险还是保守？

三、第二幕：初期的挣扎与适应（详细描写）
- 选择后的前几个月/第一年发生了什么？
- 我遇到了什么意想不到的困难？
- 我是怎么应对的？有没有后悔过？
- 这个阶段我失去了什么？得到了什么？

四、第三幕：转折点（1-3个，详细描写）
- 人生轨迹发生重大变化的关键时刻
- 可能是成功、失败、相遇、离别、顿悟
- 每个转折点要有具体的场景、对话、细节
- 这些转折如何改变了我的价值观和 worldview？

五、第四幕：现在的人生（详细描写）
- 我现在的日常生活是怎样的？
- 我身边的人是谁？我们的关系如何？
- 我对现在的状态满意吗？还有什么遗憾？
- 我下一步想做什么？

六、内心世界的演变
- 我的价值观经历了怎样的变化？
- 我对金钱、成功、爱情、自由、责任的看法
- 我现在的恐惧和渴望是什么？
- 如果重来一次，我会做同样的选择吗？

七、具体的生活细节
- 我现在住在哪里？房子是怎样的？
- 我的收入大概是多少？财务状况如何？
- 我的身体状况怎样？有什么习惯？
- 我周末通常做什么？有什么爱好？

八、给过去自己的话
- 如果我能回到过去，会对当初困惑的自己说什么？
- 我想提醒过去的自己注意什么？
- 什么是我在这个未来里学到的最重要的事？

【写作要求】

1. 语言风格：
   - 第一人称回忆录，像在和老朋友聊天
   - 有情感起伏，不是平铺直叙
   - 要有具体的场景、对话、感官细节
   - 可以幽默、可以感伤、可以愤怒，展现真实的人性

2. 价值观演变：
   - 不要直接说"我价值观变了"
   - 通过故事和选择自然展现变化
   - 允许矛盾存在，比如"我得到了财富但失去了..."
   - 展现真实的后悔和庆幸

3. 人物复杂性：
   - 不要写成励志成功学或悲惨失败史
   - 成功中有代价，失败中有收获
   - 我既有骄傲也有遗憾
   - 我不是完美的，但我是真实的

4. 时间感：
   - 要有时间流逝的感觉
   - 可以跳过大段时间，但要有交代
   - 不同人生阶段要有不同的语气和关注点

5. 篇幅：
   - 不设上限，写到你认为这个人物足够丰满为止
   - 最少3000字，建议5000-8000字
   - 宁可详细，不要简略

【返回 JSON 格式】
{
  "futures": [
    {
      "id": 1,
      "title": "简短标题",
      "description": "100-200字描述",
      "years": 5,
      "prompt": "完整的第一人称回忆录小说..."
    }
  ]
}`;

    const response = await client.messages.create({
      model: 'MiniMax-M2.7-highspeed',
      max_tokens: 32000,
      messages: [{ role: 'user', content: prompt }],
    });

    const textBlock = response.content.find((block) => block.type === 'text');
    if (!textBlock || textBlock.type !== 'text') {
      throw new Error('No text response');
    }

    const jsonMatch = textBlock.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }

    const data = JSON.parse(jsonMatch[0]);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Generate futures error:', error);
    return NextResponse.json({ error: 'Failed to generate futures' }, { status: 500 });
  }
}
