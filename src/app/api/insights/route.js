import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { generateDeviceInsights } from '@/lib/aiService';

export async function GET(req) {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return NextResponse.json(
      { success: false, message: 'Unauthorized request.' },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(req.url);
  const deviceId = searchParams.get('deviceId') || 'ESP001';

  try {
    // Call stateless dynamic insight engine directly (100% database-free!)
    const insights = await generateDeviceInsights(deviceId);

    return NextResponse.json({
      success: true,
      insights
    });
  } catch (error) {
    console.error('[InsightsAPI] Error generating insights:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error while compiling crop insights.' },
      { status: 500 }
    );
  }
}
