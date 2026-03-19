import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');

  if (!code) {
    return NextResponse.redirect(new URL('/landing', request.url));
  }

  try {
    const tokenUrl = process.env.SECONDME_TOKEN_URL || 'https://api.mindverse.com/gate/lab/api/oauth/token/code';
    const redirectUri = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/auth/callback`;

    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
      client_id: process.env.SECONDME_CLIENT_ID!,
      client_secret: process.env.SECONDME_CLIENT_SECRET!,
    });

    const tokenResponse = await fetch(tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });

    const result = await tokenResponse.json();

    if (result.code !== 0) {
      console.error('OAuth error:', result);
      return NextResponse.redirect(new URL('/landing', request.url));
    }

    const { accessToken, refreshToken } = result.data;

    const response = NextResponse.redirect(new URL('/form', request.url));
    response.cookies.set('auth_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 2
    });
    response.cookies.set('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 30
    });

    return response;
  } catch (error) {
    console.error('OAuth error:', error);
    return NextResponse.redirect(new URL('/landing', request.url));
  }
}
