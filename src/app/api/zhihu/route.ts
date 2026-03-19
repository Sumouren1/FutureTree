import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// 生成知乎 API 签名
function generateSignature(ak: string, sk: string, timestamp: string): string {
  const stringToSign = `${ak}:${timestamp}`;
  return crypto.createHmac('sha256', sk).update(stringToSign).digest('hex');
}

// 测试数据 - 当没有知乎凭证时使用
const MOCK_RESULTS = [
  {
    title: '如何面对职业迷茫？',
    summary: '职业迷茫是很多人都会经历的阶段，关键是要先了解自己真正想要什么...',
    url: 'https://www.zhihu.com/question/1'
  },
  {
    title: '30岁转行晚不晚？',
    summary: '任何时候开始都不晚，重要的是你是否做好了准备...',
    url: 'https://www.zhihu.com/question/2'
  },
  {
    title: '创业还是打工？',
    summary: '选择创业还是打工，要看你的风险承受能力和个人追求...',
    url: 'https://www.zhihu.com/question/3'
  },
  {
    title: '如何找到人生方向？',
    summary: '迷茫时不妨多尝试，多接触不同的人和事，方向会逐渐清晰...',
    url: 'https://www.zhihu.com/question/4'
  },
  {
    title: '人生选择的智慧',
    summary: '选择比努力更重要，但更重要的是选择之后的坚持...',
    url: 'https://www.zhihu.com/question/5'
  }
];

export async function POST(request: NextRequest) {
  const { query } = await request.json();

  const ak = process.env.ZHIHU_AK;
  const sk = process.env.ZHIHU_SK;

  // 如果没有配置知乎凭证，返回测试数据
  if (!ak || !sk || !ak.startsWith('ak_')) {
    return NextResponse.json({
      success: true,
      mock: true,
      results: MOCK_RESULTS.map(r => ({
        ...r,
        summary: `【知乎讨论】${r.summary}`
      }))
    });
  }

  try {
    const timestamp = Date.now().toString();
    const signature = generateSignature(ak, sk, timestamp);

    const response = await fetch(
      `https://openapi.zhihu.com/openapi/search/global?q=${encodeURIComponent(query)}&limit=5`,
      {
        headers: {
          'X-Api-Key': ak,
          'X-Timestamp': timestamp,
          'X-Signature': signature
        }
      }
    );

    if (!response.ok) {
      throw new Error(`知乎API错误: ${response.status}`);
    }

    const data = await response.json();

    return NextResponse.json({
      success: true,
      mock: false,
      results: data.data || []
    });
  } catch (error) {
    console.error('知乎搜索失败:', error);
    // API 失败时返回测试数据
    return NextResponse.json({
      success: false,
      mock: true,
      results: MOCK_RESULTS.map(r => ({
        ...r,
        summary: `【参考讨论】${r.summary}`
      }))
    });
  }
}
