import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { connectToDatabase } from '@/lib/db';
import User from '@/models/User';
import SecurityLog from '@/models/SecurityLog';
import { rateLimit } from '@/lib/rateLimit';
import { signAccessToken, signRefreshToken, getAuthenticatedUser } from '@/lib/auth';

const LoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
});

export async function POST(req) {
  const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';

  // Throttling login attempts to prevent dictionary/brute-force attacks
  const limitCheck = await rateLimit(`rate_limit:login:${ip}`, 10, 60);
  if (!limitCheck.success) {
    return NextResponse.json(
      { success: false, message: 'Too many authentication attempts. Please try again later.' },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();
    const validation = LoginSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { success: false, message: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    const { email, password } = validation.data;

    await connectToDatabase();

    // Verify user exists
    const user = await User.findOne({ email });
    if (!user) {
      await SecurityLog.create({
        eventType: 'auth_fail',
        ipAddress: ip,
        details: `Login failure: user email ${email} not found.`
      });
      return NextResponse.json(
        { success: false, message: 'Invalid email or password.' },
        { status: 401 }
      );
    }

    // Verify password hash
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      await SecurityLog.create({
        eventType: 'auth_fail',
        userId: user.id,
        ipAddress: ip,
        details: `Login failure: incorrect password for email ${email}.`
      });
      return NextResponse.json(
        { success: false, message: 'Invalid email or password.' },
        { status: 401 }
      );
    }

    // Prepare credentials payload
    const tokenPayload = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=1C3B2B&color=FCEDE8`
    };

    // Sign token pairs
    const accessToken = signAccessToken(tokenPayload);
    const refreshToken = signRefreshToken(tokenPayload);

    // Logging event
    await SecurityLog.create({
      eventType: 'auth_success',
      userId: user.id,
      ipAddress: ip,
      details: `Successful credentials check: user login for ${email}.`
    });

    const response = NextResponse.json({
      success: true,
      message: 'Login successful.',
      user: tokenPayload
    });

    const isProd = process.env.NODE_ENV === 'production';

    // Inject secure HTTP-only cookies
    response.cookies.set('accessToken', accessToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/'
    });

    response.cookies.set('refreshToken', refreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/'
    });

    return response;
  } catch (error) {
    console.error('[LoginAPI] Error authenticating user:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error during credentials check.' },
      { status: 500 }
    );
  }
}
export async function DELETE() {
  // Logout function: Clears token cookies
  const response = NextResponse.json({
    success: true,
    message: 'Logged out successfully.'
  });

  response.cookies.set('accessToken', '', { maxAge: 0, path: '/' });
  response.cookies.set('refreshToken', '', { maxAge: 0, path: '/' });

  return response;
}

export async function GET(req) {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return NextResponse.json(
      { success: false, message: 'Unauthorized request.' },
      { status: 401 }
    );
  }
  return NextResponse.json({
    success: true,
    user
  });
}
