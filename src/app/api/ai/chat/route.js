import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { getAIChatResponse, fetchThingSpeakFeeds } from '@/lib/aiService';

export async function POST(req) {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return NextResponse.json(
      { success: false, message: 'Unauthorized request.' },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    const { query } = body;

    if (!query) {
      return NextResponse.json(
        { success: false, message: 'Query string is required.' },
        { status: 400 }
      );
    }

    // Fetch last 10 telemetry logs from ThingSpeak directly (100% database-free!)
    const recentLogs = await fetchThingSpeakFeeds(10);

    // Call conversational responder with telemetry statistics (automatically handles Groq API key)
    const reply = await getAIChatResponse(recentLogs, query);

    return NextResponse.json({
      success: true,
      reply
    });
  } catch (error) {
    console.error('[AIChatAPI] Error in chatbot controller:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error during conversation processing.' },
      { status: 500 }
    );
  }
}
