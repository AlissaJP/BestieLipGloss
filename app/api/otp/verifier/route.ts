import { NextRequest, NextResponse } from 'next/server';
import { verifyOtpToken } from '@/lib/otpJwt';

export async function POST(request: NextRequest) {
  const { email, code, token } = await request.json() as {
    email: string;
    code: string;
    token: string;
  };

  if (!email || !code || code.length !== 6) {
    return NextResponse.json({ valid: false, reason: 'invalid' }, { status: 400 });
  }

  const result = await verifyOtpToken(token ?? '', email, code);

  if (!result.valid) {
    return NextResponse.json({ valid: false, reason: result.reason }, { status: 400 });
  }

  return NextResponse.json({ valid: true, pendingUser: result.pendingUser });
}
