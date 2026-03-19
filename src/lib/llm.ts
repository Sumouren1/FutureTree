import Anthropic from '@anthropic-ai/sdk';
import { UserInput, Future } from '@/types';

function generateDefaultFutures(userInput: UserInput): Future[] {
  const categories: Future['category'][] = ['事业', '关系', '成长', '健康', '创意', '财务'];
  const futures: Future[] = [];

  const titles = [
    'AI 产品经理', '技术创业者', '独立开发者', '数据科学家', '架构师',
    '找到人生伴侣', '组建家庭', '深度友谊', '社区领袖', '旅行探险家',
    '持续学习者', '技能大师', 'Mentor', '作家', '演讲家',
    '健康管理师', '运动教练', '冥想导师', '美食家', 'FIRE 追求者'
  ];

  const stories = [
    '你加入了一家 AI 教育科技公司，带领团队开发了下一代学习产品',
    '你离职创业，拿到了天使融资，产品上线后获得用户好评',
    '你成为自由开发者，接项目做产品，生活自由且充实',
    '你在大数据领域深耕，成为公司数据团队的核心成员',
    '你不断提升技术栈，最终成为技术总监',
    '你在一次技术分享会上遇到了志同道合的伴侣',
    '你用心经营感情，最终组建了温馨的家庭',
    '你经营着一个高质量的朋友圈，大家相互支持',
    '你在社区中很活跃，帮助了很多人',
    '你利用假期走了 20 个国家，看世界长见识',
    '你每年学习一项新技能，不断突破自己',
    '你在专业领域成为公认的高手',
    '你开始带新人，把经验传承下去',
    '你写了技术博客，后来出了自己的书',
    '你在技术大会上演讲，成为行业意见领袖',
    '你开始健身马拉松，身体越来越健康',
    '你成为公司篮球队长，带动同事运动',
    '你每天冥想，内心越来越平静',
    '你研究美食，周末朋友都来你家吃饭',
    '你开始极简生活，存够了钱提前退休'
  ];

  for (let i = 0; i < 20; i++) {
    const category = categories[i % 6];
    futures.push({
      id: i + 1,
      title: titles[i],
      category,
      summary: `${titles[i]} - ${category}领域的未来可能性`,
      story: stories[i],
      profession: titles[i],
      lifeStatus: category === '关系' ? '已婚/有伴侣' : '事业有成',
      tags: [category, ...userInput.interests.slice(0, 2)],
      timeline: userInput.timeline
    });
  }

  return futures;
}

export async function generateFutures(userInput: UserInput): Promise<Future[]> {
  const apiKey = process.env.CLAUDE_API_KEY;

  // 如果没有 API key，直接返回默认数据
  if (!apiKey) {
    console.log('No API key, using default futures');
    return generateDefaultFutures(userInput);
  }

  // 有 API key 时调用 Claude
  try {
    const anthropic = new Anthropic({ apiKey });

    const { confusion, status, interests, timeline } = userInput;

    const prompt = `基于以下用户信息，生成20种可能的未来场景：

困惑：${confusion}
当前状态：${status}
兴趣领域：${interests.join(', ')}
时间线：${timeline}年后

要求：
1. 每个未来30-50字，包含职业/状态/关键转折
2. 涵盖6个维度：事业、关系、成长、健康、创意、财务
3. 既有积极未来，也有挑战性未来
4. 输出严格的JSON格式数组：
[{"id": 1, "title": "标题", "category": "事业", "summary": "描述", "story": "故事", "profession": "职业", "lifeStatus": "生活状态", "tags": ["标签"]}]`;

    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 8192,
      messages: [{ role: 'user', content: prompt }]
    });

    const content = message.content[0];
    const text = content.type === 'text' ? content.text : '[]';

    const futures = JSON.parse(text) as Future[];
    return futures.map((f, i) => ({ ...f, id: i + 1, timeline }));
  } catch (error) {
    console.error('LLM generation failed:', error);
    return generateDefaultFutures(userInput);
  }
}

export async function* streamChat(
  systemPrompt: string,
  messages: { role: 'user' | 'assistant'; content: string }[],
  userMessage: string
): AsyncGenerator<string> {
  const apiKey = process.env.CLAUDE_API_KEY;

  if (!apiKey) {
    // 返回默认回复
    const responses = [
      '这是一个很有意思的问题。我当年也曾经面临类似的选择。',
      '我能理解你的困惑。让我分享一些我的经验...',
      '这条路并不容易，但只要你坚持，一定会有收获的。',
      '记住，选择没有对错，关键是要为自己的选择负责。',
      '不要太在意别人的眼光_follow your heart.'
    ];
    for (const response of responses) {
      yield response;
      await new Promise(r => setTimeout(r, 300));
    }
    return;
  }

  const anthropic = new Anthropic({ apiKey });

  const stream = await anthropic.messages.stream({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 1024,
    system: systemPrompt,
    messages: [...messages, { role: 'user', content: userMessage }]
  });

  for await (const chunk of stream) {
    if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
      yield chunk.delta.text;
    }
  }
}
