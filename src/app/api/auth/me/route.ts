import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const authToken = request.cookies.get('auth_token')?.value;

  if (!authToken) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    // 从 secondme API 获取用户信息
    const userInfoUrl = process.env.SECONDME_USERINFO_URL || 'https://api.mindverse.com/gate/lab/api/oauth/userinfo';

    const response = await fetch(userInfoUrl, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
      },
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch user info' }, { status: 401 });
    }

    const userData = await response.json();

    // 返回用户ID，如果API返回的是嵌套结构则提取
    const userId = userData.data?.id || userData.id || 'unknown';

    return NextResponse.json({ userId });
  } catch (error) {
    console.error('Get user info error:', error);
    // 如果无法获取，返回一个基于token的临时ID
    const tempId = authToken.slice(-8);
    return NextResponse.json({ userId: `user_${tempId}` });
  }
}
