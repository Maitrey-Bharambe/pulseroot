'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useStore } from '@/lib/useStore';

export default function Devices() {
  const { devices, setDevices, addNotification } = useStore();
  const [deviceName, setDeviceName] = useState('');
  const [location, setLocation] = useState('Garden');
  const [loading, setLoading] = useState(false);
  
  // Registration key modal states
  const [registeredDevice, setRegisteredDevice] = useState(null);
  const [deviceToken, setDeviceToken] = useState('');
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [copied, setCopied] = useState(false);

  // Edit (Rename) states
  const [editingDevice, setEditingDevice] = useState(null);
  const [editName, setEditName] = useState('');
  const [editLocation, setEditLocation] = useState('');

  // Fetch latest devices on load
  const refreshDevices = useCallback(async () => {
    try {
      const res = await fetch('/api/device/register');
      if (res.ok) {
        const data = await res.json();
        setDevices(data.devices || []);
      }
    } catch (e) {
      console.error('Failed refreshing devices:', e);
    }
  }, [setDevices]);

  useEffect(() => {
    refreshDevices();
  }, [refreshDevices]);

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!deviceName) return;
    setLoading(true);

    try {
      const res = await fetch('/api/device/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deviceName, location })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setRegisteredDevice(data.device);
        setDeviceToken(data.deviceToken);
        setShowKeyModal(true);
        setDeviceName('');
        setLocation('Garden');
        addNotification({
          type: 'info',
          message: `IoT Node Registered: '${data.device.deviceName}' successfully enrolled.`
        });
        refreshDevices();
      } else {
        alert(data.message || 'Registration failed');
      }
    } catch (err) {
      console.error('Registration failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRename = async (e) => {
    e.preventDefault();
    if (!editingDevice || !editName) return;

    try {
      const res = await fetch(`/api/device/${editingDevice.deviceId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deviceName: editName, location: editLocation })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        addNotification({
          type: 'info',
          message: `IoT Node Updated: ${editingDevice.deviceName} renamed to ${editName}.`
        });
        setEditingDevice(null);
        refreshDevices();
      } else {
        alert(data.message || 'Update failed');
      }
    } catch (err) {
      console.error('Device update failed:', err);
    }
  };

  const handleDelete = async (deviceId, name) => {
    if (!confirm(`Are you sure you want to unregister and remove '${name}'? This will permanently delete all associated telemetry logs.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/device/${deviceId}`, {
        method: 'DELETE'
      });

      const data = await res.json();
      if (res.ok && data.success) {
        addNotification({
          type: 'alert',
          message: `IoT Node Removed: '${name}' deleted from platform.`
        });
        refreshDevices();
      } else {
        alert(data.message || 'Removal failed');
      }
    } catch (err) {
      console.error('Deletion error:', err);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(deviceToken);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex-grow w-full max-w-7xl mx-auto px-6 py-8 flex flex-col gap-8">
      
      {/* Header */}
      <div className="border-b border-primary/10 pb-6">
        <h1 className="text-2xl font-extrabold text-dark tracking-wide font-sans">Device Management Hub</h1>
        <p className="text-xs text-primary/75 font-semibold tracking-wide uppercase mt-1">
          Enroll, rename, and configure smart hardware sensors
        </p>
      </div>

      {/* Main Grid: Add Device Form vs Registered list */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left: Register Node Form (4/12) */}
        <div className="lg:col-span-4 w-full">
          <div className="glass-panel border border-sand/55 rounded-3xl p-6 shadow-sm flex flex-col gap-4">
            
            <div className="flex items-center gap-2 pb-3 border-b border-primary/10">
              <div className="w-6 h-6 rounded-lg organic-gradient flex items-center justify-center shadow-md">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-sand" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-bold text-xs text-dark uppercase tracking-wider">Register IoT Node</h3>
            </div>

            <form onSubmit={handleRegister} className="flex flex-col gap-4">
              
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase tracking-wider font-bold text-primary/70">Device Nickname</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ESP32 Greenhouse A"
                  value={deviceName}
                  onChange={(e) => setDeviceName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-sand bg-sand/20 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 text-primary font-medium transition-all"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase tracking-wider font-bold text-primary/70">Location Zone</label>
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-sand bg-sand/20 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 text-primary font-semibold transition-all"
                >
                  <option value="Indoor Lab">Indoor Lab</option>
                  <option value="Garden Greenhouse">Garden Greenhouse</option>
                  <option value="Terrace Bed">Terrace Bed</option>
                  <option value="Orchard Plot">Orchard Plot</option>
                  <option value="Hydroponics Row">Hydroponics Row</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl organic-gradient text-sand font-bold text-sm tracking-wide shadow-lg hover:opacity-95 transition-all flex items-center justify-center disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-5 h-5 rounded-full border-2 border-sand/35 border-t-sand animate-spin"></div>
                ) : (
                  'Generate Cryptographic Link'
                )}
              </button>

            </form>

            <div className="p-3.5 rounded-2xl bg-primary/5 border border-primary/10 text-[10px] text-primary/75 leading-relaxed">
              <span className="font-extrabold uppercase text-[8px] tracking-widest text-primary block mb-1">IoT Handshake Protocol</span>
              Enrolling spawns a unique device ID and generates a symmetric handshake key. Configured units sign every payload with an HMAC-SHA256 signature, shielding systems from replay attacks.
            </div>

          </div>
        </div>

        {/* Right: Enrolled list (8/12) */}
        <div className="lg:col-span-8 w-full flex flex-col gap-4">
          
          <div className="glass-panel border border-sand/55 rounded-3xl p-6 shadow-sm w-full">
            
            <div className="flex items-center justify-between pb-3 border-b border-primary/10 mb-6">
              <h3 className="font-bold text-xs text-dark uppercase tracking-wider">Active Device Registers</h3>
              <span className="px-2.5 py-0.5 rounded-lg text-[9px] font-bold bg-secondary/15 text-primary border border-secondary/20 uppercase tracking-widest">
                {devices.length} Nodes Online
              </span>
            </div>

            {devices.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <p className="text-xs text-earth-grey">No hardware units enrolled yet. Use the registration form to start monitoring.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {devices.map((d) => (
                  <div key={d.deviceId} className="p-4 rounded-2xl bg-sand/30 border border-sand/40 flex flex-col justify-between gap-4 shadow-sm hover:shadow-md transition-all duration-300">
                    
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 className="font-bold text-sm text-dark tracking-wide font-sans">{d.deviceName}</h4>
                        <span className="text-[10px] text-primary/70 font-semibold">{d.location}</span>
                      </div>
                      
                      {/* Interactive Edit & Delete Actions */}
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            setEditingDevice(d);
                            setEditName(d.deviceName);
                            setEditLocation(d.location);
                          }}
                          className="p-1.5 rounded-lg bg-sand/45 hover:bg-sand/85 text-primary/80 border border-sand/55 transition-all"
                          title="Rename Node"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(d.deviceId, d.deviceName)}
                          className="p-1.5 rounded-lg bg-terracotta/10 hover:bg-terracotta/20 text-terracotta border border-terracotta/25 transition-all"
                          title="Unregister Node"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    <div className="border-t border-primary/5 pt-3 flex flex-col gap-1 text-[10px] text-primary/70 font-semibold font-mono">
                      <div className="flex justify-between">
                        <span>NODE ID:</span>
                        <span className="text-dark font-bold">{d.deviceId.substring(0, 8)}...</span>
                      </div>
                      <div className="flex justify-between">
                        <span>REGISTERED:</span>
                        <span>{new Date(d.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            )}

          </div>

        </div>

      </div>

      {/* POPUP MODAL: Display plaintext token ONCE */}
      {showKeyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-dark/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg glass-panel rounded-3xl border border-sand/40 p-8 shadow-2xl relative animate-in zoom-in-95 duration-200">
            
            <div className="flex flex-col items-center gap-3 text-center mb-6">
              <div className="w-12 h-12 rounded-2xl sunset-gradient flex items-center justify-center shadow-lg shadow-terracotta/20 animate-bounce">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-sand" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
              </div>
              <h3 className="text-lg font-extrabold text-dark tracking-wide font-sans leading-none">Cryptographic Credentials Generated</h3>
              <span className="text-[10px] text-terracotta font-extrabold tracking-widest uppercase mt-1">Copy key now. Plaintext hidden after close.</span>
            </div>

            <div className="flex flex-col gap-4 text-xs">
              
              <p className="text-primary/80 leading-relaxed font-medium">
                To link your ESP32 physical hardware node safely to our cloud network, load the following credentials into your device firmware.
              </p>

              <div className="flex flex-col gap-1.5 p-3 rounded-2xl bg-charcoal text-sand font-mono text-[11px] border border-sand/10 relative group">
                <span className="text-[8px] text-sand/45 font-bold uppercase tracking-wider block">DEVICE ID (UUID)</span>
                <span className="text-sand/90 break-all select-all font-bold block">{registeredDevice?.deviceId}</span>
              </div>

              <div className="flex flex-col gap-1.5 p-3 rounded-2xl bg-charcoal text-sand font-mono text-[11px] border border-sand/10 relative group">
                <span className="text-[8px] text-sand/45 font-bold uppercase tracking-wider block">SYMMETRIC SECURE KEY</span>
                <span className="text-gold break-all select-all font-bold block">{deviceToken}</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={copyToClipboard}
                  className="py-3 rounded-xl bg-sand hover:bg-sand/85 text-primary border border-primary/20 font-bold uppercase tracking-wider text-[10px] transition-all"
                >
                  {copied ? 'Copied to Clipboard!' : 'Copy Private Key'}
                </button>
                <button
                  onClick={() => setShowKeyModal(false)}
                  className="py-3 rounded-xl organic-gradient text-sand font-bold uppercase tracking-wider text-[10px] shadow-md transition-all"
                >
                  Configure and Close
                </button>
              </div>

              <div className="p-3.5 rounded-2xl bg-terracotta/10 border border-terracotta/20 text-[10px] text-terracotta leading-relaxed font-medium">
                <strong className="block mb-0.5">WARNING:</strong>
                This private key acts as the physical cryptographic credential for your hardware. Store it safely. The system hashes and encrypts this key in the database and it cannot be retrieved again.
              </div>

            </div>

          </div>
        </div>
      )}

      {/* POPUP EDIT MODAL */}
      {editingDevice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-dark/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md glass-panel rounded-3xl border border-sand/40 p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="font-extrabold text-sm text-dark uppercase tracking-wider pb-3 border-b border-primary/10 mb-4">Rename Enrolled Node</h3>
            
            <form onSubmit={handleRename} className="flex flex-col gap-4">
              
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase tracking-wider font-bold text-primary/70">New Device Name</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-sand bg-sand/20 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 text-primary font-medium transition-all"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase tracking-wider font-bold text-primary/70">New Location Zone</label>
                <select
                  value={editLocation}
                  onChange={(e) => setEditLocation(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-sand bg-sand/20 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 text-primary font-semibold transition-all"
                >
                  <option value="Indoor Lab">Indoor Lab</option>
                  <option value="Garden Greenhouse">Garden Greenhouse</option>
                  <option value="Terrace Bed">Terrace Bed</option>
                  <option value="Orchard Plot">Orchard Plot</option>
                  <option value="Hydroponics Row">Hydroponics Row</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-2">
                <button
                  type="button"
                  onClick={() => setEditingDevice(null)}
                  className="py-3 rounded-xl bg-sand hover:bg-sand/80 text-primary border border-primary/25 font-bold uppercase tracking-wider text-[10px] transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-3 rounded-xl organic-gradient text-sand font-bold uppercase tracking-wider text-[10px] shadow-md transition-all"
                >
                  Save Changes
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
