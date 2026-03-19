import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // 开发模式且未配置 OAuth URL：使用测试模式
  if (process.env.NODE_ENV === 'development' && !process.env.SECONDME_AUTH_URL) {
    const response = NextResponse.redirect(new URL('/form', request.url));
    response.cookies.set('auth_token', 'dev_token_' + Date.now(), {
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 7
    });
    response.cookies.set('user_id', 'dev_user_' + Date.now(), {
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 7
    });
    return response;
  }

  // 使用真实 OAuth
  const clientId = process.env.SECONDME_CLIENT_ID;
  const authUrl = process.env.SECONDME_AUTH_URL || 'https://go.second.me/oauth/';
  const redirectUri = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/auth/callback`;
  const state = Math.random().toString(36).substring(7);

  const params = new URLSearchParams({
    client_id: clientId!,
    redirect_uri: redirectUri,
    response_type: 'code',
    state,
  });

  return NextResponse.redirect(`${authUrl}?${params.toString()}`);
}
