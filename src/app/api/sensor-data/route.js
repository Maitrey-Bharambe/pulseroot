import { NextResponse } from 'next/server';
import { z } from 'zod';
import { fetchThingSpeakFeeds } from '@/lib/aiService';
import { getAuthenticatedUser } from '@/lib/auth';

const SensorPayloadSchema = z.object({
  deviceId: z.string(),
  temperature: z.number(),
  humidity: z.number().min(0).max(100),
  lightStatus: z.enum(['DARK', 'BRIGHT', 'DIM']),
  lightValue: z.number().min(0).max(1023),
  ledStatus: z.boolean(),
  environmentCondition: z.string()
});

export async function POST(req) {
  try {
    const rawBody = await req.text();
    const body = JSON.parse(rawBody);

    const validation = SensorPayloadSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, message: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    const { deviceId, temperature, humidity, lightStatus, lightValue, ledStatus, environmentCondition } = validation.data;

    // Proxy and Submit directly to ThingSpeak Cloud IoT (Stateless write API)
    const writeKey = process.env.THINGSPEAK_WRITE_API_KEY;
    if (writeKey) {
      try {
        const thingspeakUrl = `https://api.thingspeak.com/update?api_key=${writeKey}&field1=${temperature}&field2=${humidity}&field3=${lightValue}&field4=${lightStatus}&field5=${ledStatus ? 1 : 0}&field6=${environmentCondition}`;
        fetch(thingspeakUrl).then(tsRes => {
          if (!tsRes.ok) console.warn('[ThingSpeakProxy] Submission warning:', tsRes.status);
        });
      } catch (err) {
        console.warn('[ThingSpeakProxy] Network submit error:', err.message);
      }
    }

    // Build immediate response object to broadcast over WebSockets
    const telemetryRecord = {
      deviceId,
      temperature,
      humidity,
      lightStatus,
      lightValue,
      ledStatus,
      environmentCondition,
      timestamp: new Date()
    };

    // Push WebSocket update to custom Socket.IO listeners (so dashboard reflects live updates instantly)
    if (req.io) {
      console.log(`[SocketIngest] Broadcasting ThingSpeak telemetry for ${deviceId}`);
      req.io.to(deviceId).emit('telemetry', telemetryRecord);
      req.io.to(deviceId).emit('status-update', { deviceId, ledStatus });
    }

    return NextResponse.json({
      success: true,
      message: 'Telemetry proxied to ThingSpeak successfully.'
    });
  } catch (error) {
    console.error('[TelemetryIngestAPI] Error proxying sensor data:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error while proxying telemetry.' },
      { status: 500 }
    );
  }
}

export async function GET(req) {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return NextResponse.json(
      { success: false, message: 'Unauthorized request.' },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(req.url);
  const limit = parseInt(searchParams.get('limit') || '50', 10);

  try {
    // Query feeds directly from ThingSpeak (database-free!)
    const data = await fetchThingSpeakFeeds(limit);

    return NextResponse.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('[TelemetryAPI] Error fetching ThingSpeak logs:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error while fetching telemetry.' },
      { status: 500 }
    );
  }
}
