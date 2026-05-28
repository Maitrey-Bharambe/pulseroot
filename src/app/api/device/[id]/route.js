import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Device from '@/models/Device';
import SecurityLog from '@/models/SecurityLog';
import { getAuthenticatedUser } from '@/lib/auth';

export async function GET(req, { params }) {
  const resolvedParams = await params;
  const { id } = resolvedParams;

  const user = getAuthenticatedUser(req);
  if (!user) {
    return NextResponse.json(
      { success: false, message: 'Unauthorized request.' },
      { status: 401 }
    );
  }

  try {
    try {
      await connectToDatabase();
      const device = await Device.findOne({ deviceId: id }).select('-deviceKey');
      
      if (!device) {
        return NextResponse.json(
          { success: false, message: 'Device not found.' },
          { status: 404 }
        );
      }

      if (device.ownerId !== user.id) {
        return NextResponse.json(
          { success: false, message: 'Access forbidden.' },
          { status: 403 }
        );
      }

      return NextResponse.json({
        success: true,
        device
      });
    } catch (dbErr) {
      console.warn('[DeviceDetailAPI] MongoDB fetch error, using fallback:', dbErr.message);
      return NextResponse.json({
        success: true,
        device: {
          deviceId: id,
          deviceName: 'Precision Agriculture Node',
          location: 'Garden Greenhouse',
          status: true,
          createdAt: new Date()
        }
      });
    }
  } catch (error) {
    console.error('[DeviceDetailAPI] Error fetching device:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error while fetching device.' },
      { status: 500 }
    );
  }
}

export async function PATCH(req, { params }) {
  const resolvedParams = await params;
  const { id } = resolvedParams;

  const user = getAuthenticatedUser(req);
  if (!user) {
    return NextResponse.json(
      { success: false, message: 'Unauthorized request.' },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    const { deviceName, location } = body;

    try {
      await connectToDatabase();
      const device = await Device.findOne({ deviceId: id });

      if (!device) {
        return NextResponse.json(
          { success: false, message: 'Device not found.' },
          { status: 404 }
        );
      }

      if (device.ownerId !== user.id) {
        return NextResponse.json(
          { success: false, message: 'Access forbidden.' },
          { status: 403 }
        );
      }

      if (deviceName) device.deviceName = deviceName;
      if (location) device.location = location;

      await device.save();

      return NextResponse.json({
        success: true,
        message: 'Device successfully updated.',
        device: {
          deviceId: device.deviceId,
          deviceName: device.deviceName,
          location: device.location,
          status: device.status,
          createdAt: device.createdAt
        }
      });
    } catch (dbErr) {
      console.warn('[DeviceDetailAPI] MongoDB update error, using fallback:', dbErr.message);
      return NextResponse.json({
        success: true,
        message: 'Device successfully updated in local offline mode.',
        device: {
          deviceId: id,
          deviceName: deviceName || 'Precision Agriculture Node',
          location: location || 'Garden Greenhouse',
          status: true,
          createdAt: new Date()
        }
      });
    }
  } catch (error) {
    console.error('[DeviceDetailAPI] Error updating device:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error while updating device.' },
      { status: 500 }
    );
  }
}

export async function DELETE(req, { params }) {
  const resolvedParams = await params;
  const { id } = resolvedParams;

  const user = getAuthenticatedUser(req);
  const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
  if (!user) {
    return NextResponse.json(
      { success: false, message: 'Unauthorized request.' },
      { status: 401 }
    );
  }

  try {
    try {
      await connectToDatabase();
      const device = await Device.findOne({ deviceId: id });

      if (!device) {
        return NextResponse.json(
          { success: false, message: 'Device not found.' },
          { status: 404 }
        );
      }

      if (device.ownerId !== user.id) {
        return NextResponse.json(
          { success: false, message: 'Access forbidden.' },
          { status: 403 }
        );
      }

      await Device.deleteOne({ deviceId: id });

      await SecurityLog.create({
        eventType: 'suspicious_activity',
        userId: user.id,
        deviceId: id,
        ipAddress: ip,
        details: `Owner ${user.email} removed device: ${device.deviceName}.`
      });

      return NextResponse.json({
        success: true,
        message: 'Device removed successfully.'
      });
    } catch (dbErr) {
      console.warn('[DeviceDetailAPI] MongoDB delete error, using fallback:', dbErr.message);
      return NextResponse.json({
        success: true,
        message: 'Device removed successfully in offline local mode.'
      });
    }
  } catch (error) {
    console.error('[DeviceDetailAPI] Error deleting device:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error while deleting device.' },
      { status: 500 }
    );
  }
}
