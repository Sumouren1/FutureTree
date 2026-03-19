import { NextRequest, NextResponse } from 'next/server';
import { generateFutures } from '@/lib/llm';
import { UserInput } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const userInput: UserInput = await request.json();

    if (!userInput.confusion) {
      return NextResponse.json(
        { error: '请描述你的困惑' },
        { status: 400 }
      );
    }

    const futures = await generateFutures(userInput);

    return NextResponse.json({ futures });
  } catch (error) {
    console.error('生成未来失败:', error);
    return NextResponse.json(
      { error: '生成失败，请稍后重试' },
      { status: 500 }
    );
  }
}
