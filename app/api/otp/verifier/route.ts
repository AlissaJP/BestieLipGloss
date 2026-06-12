import { NextRequest, NextResponse } from 'next/server';
import { verifyOtp } from '@/lib/otpStore';

export async function POST(request: NextRequest) {
  const { email, code } = await request.json() as { email: string; code: string };

  if (!email || !code || code.length !== 6) {
    return NextResponse.json({ valid: false, reason: 'invalid' }, { status: 400 });
  }

  const result = verifyOtp(email, code);
  if (!result.valid) {
    return NextResponse.json({ valid: false, reason: result.reason }, { status: 400 });
  }

  return NextResponse.json({ valid: true, pendingUser: result.pendingUser });
}
