import { NextResponse } from 'next/server';

export async function POST(req) {
  const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';

  try {
    const body = await req.json();
    const { deviceId } = body;

    const targetDeviceId = deviceId || 'ESP001';

    // Submit state change directly to ThingSpeak Cloud IoT Update API (Field5 = 0)
    const writeKey = process.env.THINGSPEAK_WRITE_API_KEY;
    if (writeKey) {
      try {
        const thingspeakUrl = `https://api.thingspeak.com/update?api_key=${writeKey}&field5=0`;
        fetch(thingspeakUrl).then(tsRes => {
          if (!tsRes.ok) console.warn('[ThingSpeakOverride] Write warning:', tsRes.status);
        });
      } catch (err) {
        console.warn('[ThingSpeakOverride] Write error:', err.message);
      }
    }

    // Broadcast immediate deactivation command over Socket.IO to any active dev boards
    if (req.io) {
      console.log(`[PumpOFF] Emitting led-command 'off' to device room ${targetDeviceId}`);
      req.io.to(targetDeviceId).emit('led-command', { deviceId: targetDeviceId, action: 'off' });
      req.io.to(targetDeviceId).emit('pump-command', { deviceId: targetDeviceId, action: 'off' });
    }

    return NextResponse.json({
      success: true,
      message: 'Simulated LED watering stopped successfully over ThingSpeak.'
    });
  } catch (error) {
    console.error('[PumpOFF_API] Error deactivating pump LED:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error while stopping pump LED.' },
      { status: 500 }
    );
  }
}
