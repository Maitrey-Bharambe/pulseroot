import { NextResponse } from 'next/server';

export async function POST(req) {
  const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';

  try {
    const body = await req.json();
    const { deviceId } = body;

    const targetDeviceId = deviceId || 'ESP001';

    // Submit state change directly to ThingSpeak Cloud IoT Update API (Field5 = 1)
    const writeKey = process.env.THINGSPEAK_WRITE_API_KEY;
    if (writeKey) {
      try {
        const thingspeakUrl = `https://api.thingspeak.com/update?api_key=${writeKey}&field5=1`;
        fetch(thingspeakUrl).then(tsRes => {
          if (!tsRes.ok) console.warn('[ThingSpeakOverride] Write warning:', tsRes.status);
        });
      } catch (err) {
        console.warn('[ThingSpeakOverride] Write error:', err.message);
      }
    }

    // Broadcast immediate activation command over Socket.IO to any active dev boards
    if (req.io) {
      console.log(`[PumpON] Emitting led-command 'on' to device room ${targetDeviceId}`);
      req.io.to(targetDeviceId).emit('led-command', { deviceId: targetDeviceId, action: 'on' });
      req.io.to(targetDeviceId).emit('pump-command', { deviceId: targetDeviceId, action: 'on' });
    }

    return NextResponse.json({
      success: true,
      message: 'Simulated LED watering started successfully over ThingSpeak.'
    });
  } catch (error) {
    console.error('[PumpON_API] Error activating pump LED:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error while starting pump LED.' },
      { status: 500 }
    );
  }
}
