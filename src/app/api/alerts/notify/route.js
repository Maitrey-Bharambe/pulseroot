import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getAuthenticatedUser } from '@/lib/auth';
import { sendAgronomicAlertEmail } from '@/lib/emailService';
import SecurityLog from '@/models/SecurityLog';

const AlertNotifySchema = z.object({
  alertType: z.string().min(1, 'Alert type is required'),
  message: z.string().min(1, 'Message description is required'),
  deviceName: z.string().default('PulseRoot Node')
});

export async function POST(req) {
  const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';

  try {
    // 1. Authenticate user from session token
    const user = getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Access denied: unauthorized security gateway payload.' },
        { status: 401 }
      );
    }

    // 2. Parse request body
    const body = await req.json();
    const validation = AlertNotifySchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, message: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    const { alertType, message, deviceName } = validation.data;

    console.log(`[AlertNotifyAPI] Dispatching alert email to ${user.email} for event: ${alertType}`);

    // 3. Dispatch alert email using NodeMailer service
    const result = await sendAgronomicAlertEmail({
      email: user.email,
      userName: user.name,
      deviceName,
      alertType,
      message
    });

    // 4. Log event in MongoDB security register
    await SecurityLog.create({
      eventType: 'alert_dispatched',
      userId: user.id,
      ipAddress: ip,
      details: `Agronomic Alert Email dispatched to ${user.email}: Type = ${alertType}, Device = ${deviceName}. MockMode = ${!!result.mock}`
    });

    return NextResponse.json({
      success: true,
      message: 'Agronomic alert email dispatched successfully.',
      mock: !!result.mock,
      result
    });

  } catch (err) {
    console.error('[AlertNotifyAPI] Internal server error:', err);
    return NextResponse.json(
      { success: false, message: 'Internal server error while dispatching email notification.' },
      { status: 500 }
    );
  }
}
