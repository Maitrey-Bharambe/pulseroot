import { create } from 'zustand';
import { io } from 'socket.io-client';

export const useStore = create((set, get) => ({
  user: null,
  devices: [],
  activeDeviceId: null,
  telemetry: [],
  notifications: [
    { id: '1', timestamp: new Date(Date.now() - 3600 * 1000), type: 'info', message: 'Precision IoT Platform initialized.' }
  ],
  ledStatus: false, // Simulates the mechanical pump indicator
  socket: null,
  lastEmailDispatchedTime: {},

  setUser: (user) => set({ user }),
  
  setDevices: (devices) => {
    const currentActive = get().activeDeviceId;
    const activeId = currentActive && devices.find(d => d.deviceId === currentActive) 
      ? currentActive 
      : (devices.length > 0 ? devices[0].deviceId : null);
      
    set({ devices, activeDeviceId: activeId });
    if (activeId) {
      get().connectSocket(activeId);
      get().fetchTelemetry();
    }
  },

  setActiveDevice: (deviceId) => {
    set({ activeDeviceId: deviceId, telemetry: [] });
    get().connectSocket(deviceId);
    get().fetchTelemetry();
  },

  fetchTelemetry: async () => {
    const activeId = get().activeDeviceId;
    if (!activeId) return;
    try {
      const res = await fetch(`/api/sensor-data?limit=50`);
      if (res.ok) {
        const result = await res.json();
        if (result.success && Array.isArray(result.data)) {
          set({ telemetry: result.data });
          if (result.data.length > 0) {
            set({ ledStatus: result.data[0].ledStatus });
          }
        }
      }
    } catch (err) {
      console.warn('Failed to fetch initial telemetry from ThingSpeak:', err);
    }
  },

  addNotification: (notification) => {
    set((state) => ({
      notifications: [
        { id: Math.random().toString(), timestamp: new Date(), ...notification },
        ...state.notifications
      ].slice(0, 50)
    }));
  },

  triggerAlertEmail: async (alertType, message) => {
    // 15-minute cooldown throttle per alert type to avoid spamming the user's inbox
    const COOLDOWN_MS = 15 * 60 * 1000;
    const now = Date.now();
    const lastSent = get().lastEmailDispatchedTime[alertType] || 0;

    if (now - lastSent < COOLDOWN_MS) {
      console.log(`[SocketStore] Alert email throttled for ${alertType}. Cooldown active.`);
      return;
    }

    // Update cooldown timestamp
    set((state) => ({
      lastEmailDispatchedTime: {
        ...state.lastEmailDispatchedTime,
        [alertType]: now
      }
    }));

    try {
      const activeId = get().activeDeviceId;
      const devicesList = get().devices;
      const activeDev = devicesList.find(d => d.deviceId === activeId) || { deviceName: 'PulseRoot - Node 01' };

      const res = await fetch('/api/alerts/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          alertType,
          message,
          deviceName: activeDev.deviceName
        })
      });

      if (res.ok) {
        console.log(`[SocketStore] Alert email dispatched successfully for: ${alertType}`);
      } else {
        console.warn(`[SocketStore] Failed to dispatch alert email: status ${res.status}`);
      }
    } catch (err) {
      console.warn('[SocketStore] Error triggering alert email:', err);
    }
  },

  connectSocket: (deviceId) => {
    let socket = get().socket;
    if (socket) {
      console.log(`[SocketStore] Switching channel room to: ${deviceId}`);
      socket.emit('join-device', deviceId);
      return;
    }

    const url = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
    console.log(`[SocketStore] Establishing connection to: ${url}`);
    
    socket = io(url, {
      transports: ['websocket', 'polling']
    });

    socket.on('connect', () => {
      console.log('[SocketStore] Socket connected:', socket.id);
      socket.emit('join-device', deviceId);
    });

    socket.on('telemetry', (record) => {
      console.log('[SocketStore] Telemetry received:', record);
      
      set((state) => {
        const updatedTelemetry = [record, ...state.telemetry].slice(0, 100);
        let extraNotifications = [];

        // Real-time agronomic client rules checker
        if (record.temperature > 35) {
          const alertType = 'CRITICAL Heat Stress';
          const msg = `Temperature exceeded 35°C (${record.temperature}°C).`;
          extraNotifications.push({
            id: Math.random().toString(),
            timestamp: new Date(),
            type: 'alert',
            message: msg
          });
          setTimeout(() => get().triggerAlertEmail(alertType, msg), 50);
        }
        if (record.humidity < 30) {
          const alertType = 'WARNING Low Humidity';
          const msg = `Relative moisture dropped below 30% (${record.humidity}%).`;
          extraNotifications.push({
            id: Math.random().toString(),
            timestamp: new Date(),
            type: 'alert',
            message: msg
          });
          setTimeout(() => get().triggerAlertEmail(alertType, msg), 50);
        }
        if (record.lightStatus === 'DARK') {
          // Track local dark warnings
          const consecutiveDark = updatedTelemetry.slice(0, 5).every(l => l.lightStatus === 'DARK') && updatedTelemetry.length >= 5;
          if (consecutiveDark) {
            const alertType = 'LIGHT WARNING';
            const msg = 'Plant environment is experiencing prolonged darkness.';
            extraNotifications.push({
              id: Math.random().toString(),
              timestamp: new Date(),
              type: 'alert',
              message: msg
            });
            setTimeout(() => get().triggerAlertEmail(alertType, msg), 50);
          }
        }

        const notifications = [...extraNotifications, ...state.notifications].slice(0, 50);

        return {
          telemetry: updatedTelemetry,
          ledStatus: record.ledStatus,
          notifications
        };
      });
    });

    socket.on('status-update', ({ ledStatus }) => {
      console.log('[SocketStore] Simulated LED update received:', ledStatus);
      
      set((state) => {
        const isChanged = state.ledStatus !== ledStatus;
        let currentNotifications = state.notifications;
        
        if (isChanged) {
          const statusVerb = ledStatus ? 'ACTIVATED' : 'SHUT DOWN';
          currentNotifications = [
            {
              id: Math.random().toString(),
              timestamp: new Date(),
              type: 'info',
              message: `LED simulated watering: irrigation indicator was ${statusVerb}.`
            },
            ...state.notifications
          ].slice(0, 50);
        }

        return {
          ledStatus,
          notifications: currentNotifications
        };
      });
    });

    set({ socket });
  },

  disconnectSocket: () => {
    const socket = get().socket;
    if (socket) {
      console.log('[SocketStore] Disconnecting socket.');
      socket.disconnect();
      set({ socket: null });
    }
  },

  logout: () => {
    get().disconnectSocket();
    set({
      user: null,
      devices: [],
      activeDeviceId: null,
      telemetry: [],
      notifications: [
        { id: '1', timestamp: new Date(), type: 'info', message: 'Logged out successfully.' }
      ],
      ledStatus: false
    });
  }
}));
