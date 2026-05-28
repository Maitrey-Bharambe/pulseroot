import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { connectToDatabase } from '@/lib/db';
import User from '@/models/User';
import SecurityLog from '@/models/SecurityLog';
import { rateLimit } from '@/lib/rateLimit';

const SignupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['user', 'admin']).optional()
});

export async function POST(req) {
  const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';

  // Rate Limiting signup attempts to prevent registration abuse
  const limitCheck = await rateLimit(`rate_limit:signup:${ip}`, 5, 60);
  if (!limitCheck.success) {
    return NextResponse.json(
      { success: false, message: 'Too many registration attempts. Please try again in 1 minute.' },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();
    const validation = SignupSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { success: false, message: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    const { name, email, password, role } = validation.data;

    await connectToDatabase();

    // Check if email already in use
    const userExists = await User.findOne({ email });
    if (userExists) {
      await SecurityLog.create({
        eventType: 'auth_fail',
        ipAddress: ip,
        details: `Signup failed: email ${email} already in use.`
      });
      return NextResponse.json(
        { success: false, message: 'Email address already in use.' },
        { status: 400 }
      );
    }

    // Salt and hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user record
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || 'user'
    });

    await SecurityLog.create({
      eventType: 'auth_success',
      userId: user.id,
      ipAddress: ip,
      details: `User created successfully: ${email}`
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Account registered successfully.',
        user: { id: user.id, name: user.name, email: user.email, role: user.role }
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[SignupAPI] Error creating account:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error during registration.' },
      { status: 500 }
    );
  }
}
