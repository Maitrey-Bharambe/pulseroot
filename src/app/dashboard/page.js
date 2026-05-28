'use client';

import React, { useState, useEffect } from 'react';
import { useStore } from '@/lib/useStore';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  CartesianGrid
} from 'recharts';

export default function Dashboard() {
  const {
    devices,
    activeDeviceId,
    setActiveDevice,
    telemetry,
    ledStatus,
    user,
    fetchTelemetry
  } = useStore();

  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [analytics, setAnalytics] = useState(null);
  const [insights, setInsights] = useState([]);
  const [loadingData, setLoadingData] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (activeDeviceId) {
      fetchTelemetry();
    }
  }, [activeDeviceId, fetchTelemetry]);

  // Fetch telemetry history, insights, and computed analytics with 12s automatic polling
  useEffect(() => {
    if (!activeDeviceId) return;

    async function fetchData() {
      try {
        const analyticsRes = await fetch(`/api/analytics?deviceId=${activeDeviceId}`);
        if (analyticsRes.ok) {
          const analyticsData = await analyticsRes.json();
          if (analyticsData.success) {
            setAnalytics(analyticsData);
          }
        }

        const insightsRes = await fetch(`/api/insights?deviceId=${activeDeviceId}`);
        if (insightsRes.ok) {
          const insightsData = await insightsRes.json();
          if (insightsData.success) {
            setInsights(insightsData.insights || []);
          }
        }
      } catch (err) {
        console.error('Failed fetching device logs:', err);
      }
    }

    setLoadingData(true);
    fetchData().finally(() => setLoadingData(false));

    const pollInterval = setInterval(() => {
      fetchData();
    }, 12000);

    return () => clearInterval(pollInterval);
  }, [activeDeviceId, telemetry.length]);

  // Extract latest metrics
  const latestTelemetry = telemetry[0] || {
    temperature: 28.6,
    humidity: 45,
    lightStatus: 'BRIGHT',
    lightValue: 320,
    ledStatus: ledStatus,
    environmentCondition: 'OPTIMAL'
  };

  const calculatedMoisture = Math.round(100 - (latestTelemetry.lightValue / 1023) * 100);

  // Compute calculated averages of current telemetry dataset
  const avgTemp = telemetry.length > 0 
    ? Math.round((telemetry.reduce((acc, l) => acc + l.temperature, 0) / telemetry.length) * 10) / 10
    : latestTelemetry.temperature;

  const avgHum = telemetry.length > 0
    ? Math.round(telemetry.reduce((acc, l) => acc + l.humidity, 0) / telemetry.length)
    : latestTelemetry.humidity;

  const avgLightVal = telemetry.length > 0
    ? telemetry.reduce((acc, l) => acc + l.lightValue, 0) / telemetry.length
    : latestTelemetry.lightValue;

  const avgMoisture = Math.round(100 - (avgLightVal / 1023) * 100);

  const activeDeviceDetails = devices.find(d => d.deviceId === activeDeviceId) || {
    deviceName: 'PulseRoot - Node 01',
    location: 'Garden Greenhouse'
  };

  // Safe variables mapping for calculated analytics
  const calculations = analytics?.calculations || {
    averageTemperature: 28.6,
    averageHumidity: 45,
    dayNightRatio: { dayPercentage: 70, nightPercentage: 30 },
    highTempDetected: false,
    darkEnvironmentDetected: false,
    ledActivationCount: 12,
    environmentalRiskLevel: 'Safe',
    heatStressDetected: false,
    lowLightWarning: false,
    sensorActivityTimeline: [
      { time: '10:30 PM', event: 'Pump Turned ON', type: 'Manual', value: 'Manual' },
      { time: '10:25 PM', event: 'Soil Moisture Low', type: 'Auto', value: '32%' },
      { time: '10:20 PM', event: 'Sensor Data Updated', type: 'Auto', value: '-' },
      { time: '10:15 PM', event: 'Pump Turned OFF', type: 'Auto', value: 'Auto' }
    ]
  };

  const displayUser = user || {
    name: 'Arjun Sharma',
    role: 'Admin'
  };

  // Custom tooltips for graphs
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#1C3B2B] text-white p-3 rounded-2xl border border-white/10 text-[10px] leading-tight font-bold shadow-lg">
          <p className="uppercase tracking-wider mb-1 opacity-75">{label}</p>
          {payload.map((item, idx) => (
            <p key={idx}>
              {item.name}: {item.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Pie chart data matching Soil Moisture Distribution
  const pieData = [
    { name: 'Dry (0 - 30%)', value: 20, color: '#C86B4F' },
    { name: 'Optimal (30 - 60%)', value: 60, color: '#4A5E2B' },
    { name: 'Wet (60 - 100%)', value: 20, color: '#5293B8' }
  ];

  return (
    <div 
      className="flex-grow w-full px-8 py-8 flex flex-col gap-6 select-none"
      style={{
        background: 'linear-gradient(180deg, #FCEDE8 0%, #FDF6F3 100%)',
        color: '#1C3B2B'
      }}
    >
      
      {/* 1. TOP HEADER NAVIGATION (Search, Notify, Theme, Profile) */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1C3B2B]/10 pb-4">
        
        {/* Welcome greeting */}
        <div className="flex flex-col gap-1.5">
          <Link 
            href="/" 
            className="flex items-center gap-1.5 text-[9px] font-bold text-secondary hover:text-[#C86B4F] uppercase tracking-widest bg-white/40 hover:bg-white/60 px-3.5 py-1.5 rounded-full border border-[#1C3B2B]/10 hover:border-[#1C3B2B]/20 transition-all self-start mb-2 shadow-sm w-fit cursor-pointer"
          >
            <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
            Back to Homepage
          </Link>
          <span className="text-[10px] font-extrabold tracking-widest text-[#C86B4F] uppercase">Smart Garden Panel</span>
          <h1 
            className="text-3xl md:text-4xl tracking-tight text-[#1C3B2B] leading-none"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Welcome back, <span className="text-[#C86B4F]">{displayUser.name.split(' ')[0]}</span>! 🍃
          </h1>
          <p className="text-xs text-primary/75 font-semibold tracking-wide mt-1">
            Grounded in precision real-time agronomic telemetry.
          </p>
        </div>

        {/* Action icons, Search bar, Profile info */}
        <div className="flex items-center gap-6 self-start md:self-auto w-full md:w-auto justify-between md:justify-end">
          
          {/* Search bar */}
          <div className="relative hidden lg:block w-64 shadow-sm">
            <input 
              type="text" 
              placeholder="Search anything..." 
              className="w-full pl-4 pr-10 py-2.5 rounded-full bg-white border border-sand/40 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#1C3B2B]"
            />
            <svg className="w-4 h-4 text-primary absolute right-4 top-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </div>

          {/* Icons stack */}
          <div className="flex items-center gap-4">
            
            {/* Notification badge */}
            <div className="relative">
              <button className="p-2.5 rounded-full bg-white hover:bg-neutral-50 border border-sand/40 text-[#1C3B2B] shadow-sm relative transition-all">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
                </svg>
                <span className="absolute -top-1 -right-1 w-4.5 h-4.5 rounded-full bg-[#C86B4F] text-[9px] font-bold text-white flex items-center justify-center border-2 border-[#FCEDE8]">
                  3
                </span>
              </button>
            </div>

            {/* Brightness Theme Sun icon */}
            <button className="p-2.5 rounded-full bg-white hover:bg-neutral-50 border border-sand/40 text-[#1C3B2B] shadow-sm transition-all">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z"></path>
              </svg>
            </button>

          </div>

          {/* User profile avatar info */}
          <div className="flex items-center gap-3 pl-4 border-l border-primary/10">
            <img 
              src={displayUser.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayUser.name)}&background=1C3B2B&color=FCEDE8`} 
              alt="User profile" 
              className="w-9 h-9 rounded-full object-cover border border-sand/50 shadow"
            />
            <div className="hidden sm:flex flex-col text-left">
              <span className="font-extrabold text-[12px] text-dark leading-none">{displayUser.name}</span>
              <span className="text-[9px] font-bold text-primary/70 uppercase tracking-wider mt-1">{displayUser.role}</span>
            </div>
          </div>

        </div>

      </header>

      {/* 2. SUBHEADER DEVICE SELECTION & ACTION CONTROLS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-2">
        
        {/* Device selector dropdown */}
        <div className="flex items-center gap-3">
          <label className="text-[10px] uppercase font-extrabold tracking-wider text-primary/75">Selected Device</label>
          <div className="flex items-center gap-3 bg-white/40 backdrop-blur-md px-4 py-2 rounded-xl border border-sand/40 shadow-sm">
            <select
              value={activeDeviceId || ''}
              onChange={(e) => setActiveDevice(e.target.value)}
              className="bg-transparent text-xs font-bold text-primary focus:outline-none cursor-pointer pr-4"
            >
              {devices.length === 0 ? (
                <option value="">PulseRoot - Node 01</option>
              ) : (
                devices.map((d) => (
                  <option key={d.deviceId} value={d.deviceId}>
                    {d.deviceName}
                  </option>
                ))
              )}
            </select>
            <span className="flex items-center gap-1.5 text-[9px] font-bold text-secondary uppercase tracking-widest pl-2 border-l border-primary/15 shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse"></span>
              Online
            </span>
          </div>
        </div>

        {/* Capsule button controls */}
        <div className="flex items-center gap-3 self-start sm:self-auto">
          
          <button 
            onClick={() => router.push('/ai-analysis')}
            className="px-5 py-2.5 rounded-xl bg-white/40 hover:bg-white/60 backdrop-blur-md text-xs font-bold tracking-wide text-primary border border-sand/45 shadow-sm transition-all duration-200 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
            </svg>
            Export Data
          </button>

          <button 
            className="px-5 py-2.5 rounded-xl bg-[#1C3B2B] hover:bg-[#2A4E3A] text-xs font-bold tracking-wide text-[#FCEDE8] shadow shadow-[#1C3B2B]/20 transition-all duration-200 flex items-center gap-1.5 uppercase"
          >
            <span className="text-sm font-light">+</span> Add Device
          </button>

        </div>

      </div>

      {/* 3. ROW 1: THE 5 METRIC STAT CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        
        {/* Card 1: Soil Moisture */}
        <div className="glass-panel p-5 rounded-[24px] border border-sand/35 shadow-sm flex flex-col gap-2 relative hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#E2F0D9] flex items-center justify-center shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="#385723" strokeWidth="2" className="w-4.5 h-4.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
              </svg>
            </div>
            <span className="text-[10px] font-extrabold text-primary/70 tracking-widest uppercase">Soil Moisture</span>
          </div>
          <div className="flex flex-col mt-2">
            <span className="text-2xl font-extrabold text-dark tracking-tight leading-none">{avgMoisture}%</span>
            <span className="text-[10px] font-bold text-secondary mt-1 uppercase">Avg (Optimal)</span>
          </div>
          <div className="border-t border-primary/5 pt-2 mt-2 text-[9px] font-bold text-primary/60">
            Range: 30% - 60%
          </div>
        </div>

        {/* Card 2: Temperature */}
        <div className="glass-panel p-5 rounded-[24px] border border-sand/35 shadow-sm flex flex-col gap-2 relative hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#FCEDE8] flex items-center justify-center shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="#B55441" strokeWidth="2" className="w-4.5 h-4.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z" />
              </svg>
            </div>
            <span className="text-[10px] font-extrabold text-primary/70 tracking-widest uppercase">Temperature</span>
          </div>
          <div className="flex flex-col mt-2">
            <span className="text-2xl font-extrabold text-dark tracking-tight leading-none">{avgTemp}°C</span>
            <span className="text-[10px] font-bold text-primary/70 mt-1 uppercase">Avg (Normal)</span>
          </div>
          <div className="border-t border-primary/5 pt-2 mt-2 text-[9px] font-bold text-primary/60">
            Range: 18°C - 35°C
          </div>
        </div>

        {/* Card 3: Humidity */}
        <div className="glass-panel p-5 rounded-[24px] border border-sand/35 shadow-sm flex flex-col gap-2 relative hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#E8F0FE] flex items-center justify-center shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="#1A73E8" strokeWidth="2" className="w-4.5 h-4.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
              </svg>
            </div>
            <span className="text-[10px] font-extrabold text-primary/70 tracking-widest uppercase">Humidity</span>
          </div>
          <div className="flex flex-col mt-2">
            <span className="text-2xl font-extrabold text-dark tracking-tight leading-none">{avgHum}%</span>
            <span className="text-[10px] font-bold text-primary/70 mt-1 uppercase">Avg (Normal)</span>
          </div>
          <div className="border-t border-primary/5 pt-2 mt-2 text-[9px] font-bold text-primary/60">
            Range: 40% - 70%
          </div>
        </div>

        {/* Card 4: Pump Status */}
        <div className="glass-panel p-5 rounded-[24px] border border-sand/35 shadow-sm flex flex-col gap-2 relative hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#E2F0D9] flex items-center justify-center shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="#385723" strokeWidth="2" className="w-4.5 h-4.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-[10px] font-extrabold text-primary/70 tracking-widest uppercase">Pump Status</span>
          </div>
          <div className="flex flex-col mt-2">
            <span className={`text-2xl font-extrabold tracking-tight leading-none ${ledStatus ? 'text-[#4A5E2B]' : 'text-earth-grey'}`}>
              {ledStatus ? 'ON' : 'OFF'}
            </span>
            <span className="text-[10px] font-bold text-secondary mt-1 uppercase">
              {ledStatus ? 'Running' : 'Idle'}
            </span>
          </div>
          <div className="border-t border-primary/5 pt-2 mt-2 text-[9px] font-bold text-primary/60">
            Since 10:24 AM
          </div>
        </div>

        {/* Card 5: Battery Level */}
        <div className="glass-panel p-5 rounded-[24px] border border-sand/35 shadow-sm flex flex-col gap-2 relative hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#FFF2CC] flex items-center justify-center shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="#C5A158" strokeWidth="2" className="w-4.5 h-4.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 10.5h.5c.3 0 .5.2.5.5v2c0 .3-.2.5-.5.5h-.5v-3zM3 7h15a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2z" />
              </svg>
            </div>
            <span className="text-[10px] font-extrabold text-primary/70 tracking-widest uppercase">Battery Level</span>
          </div>
          <div className="flex flex-col mt-2">
            <span className="text-2xl font-extrabold text-dark tracking-tight leading-none">89%</span>
            <span className="text-[10px] font-bold text-secondary mt-1 uppercase">Good</span>
          </div>
          <div className="border-t border-primary/5 pt-2 mt-2 text-[9px] font-bold text-primary/60">
            Charging
          </div>
        </div>

      </div>

      {/* 4. ROW 2: DIURNAL TREND CHARTS (8/12) & AI INSIGHTS WIDGET (4/12) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Left Trend Charts (8/12) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Chart 1: Soil Moisture Trend */}
            <div className="glass-panel border border-sand/40 rounded-[28px] p-6 shadow-sm hover:shadow-md transition-all duration-300">
              <div className="flex items-center justify-between pb-3 border-b border-primary/5 mb-4">
                <div>
                  <h4 className="font-extrabold text-xs text-dark uppercase tracking-wider">Soil Moisture Trend</h4>
                  <span className="text-[9px] text-earth-grey">Average moisture level (hourly)</span>
                </div>
                <div className="flex items-center gap-2 bg-sand/15 px-3 py-1.5 rounded-xl border border-sand/35 text-[9px] font-bold text-primary cursor-pointer">
                  <span>Today</span>
                  <span>▼</span>
                </div>
              </div>

              <div className="h-44 w-full relative">
                {mounted && analytics ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={analytics.hourlyHistory} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                      <defs>
                        <linearGradient id="moistureTrendGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#4A5E2B" stopOpacity={0.25}/>
                          <stop offset="95%" stopColor="#4A5E2B" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(30, 43, 20, 0.05)" />
                      <XAxis dataKey="hour" stroke="#4A5E2B" tick={{ fontSize: 8, fontWeight: 700 }} />
                      <YAxis stroke="#4A5E2B" tick={{ fontSize: 8, fontWeight: 700 }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Area type="monotone" name="Moisture (%)" dataKey="humidity" stroke="#4A5E2B" strokeWidth={2.2} fillOpacity={1} fill="url(#moistureTrendGrad)" />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs text-earth-grey">Assembling moisture curves...</div>
                )}
                {/* Pixel-perfect curvy highlight indicator */}
                <div className="absolute right-8 top-10 flex items-center gap-1 bg-[#4A5E2B] text-[#FCEDE8] px-2 py-1 rounded-full text-[8px] font-bold shadow animate-bounce">
                  <span>32%</span>
                  <span className="opacity-75">10:30 PM</span>
                </div>
              </div>
            </div>

            {/* Chart 2: Temperature Trend */}
            <div className="glass-panel border border-sand/40 rounded-[28px] p-6 shadow-sm hover:shadow-md transition-all duration-300">
              <div className="flex items-center justify-between pb-3 border-b border-primary/5 mb-4">
                <div>
                  <h4 className="font-extrabold text-xs text-dark uppercase tracking-wider">Temperature Trend</h4>
                  <span className="text-[9px] text-earth-grey">Diurnal thermal patterns</span>
                </div>
                <div className="flex items-center gap-2 bg-sand/15 px-3 py-1.5 rounded-xl border border-sand/35 text-[9px] font-bold text-primary cursor-pointer">
                  <span>Today</span>
                  <span>▼</span>
                </div>
              </div>

              <div className="h-44 w-full relative">
                {mounted && analytics ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={analytics.hourlyHistory} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                      <defs>
                        <linearGradient id="tempTrendGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#C86B4F" stopOpacity={0.25}/>
                          <stop offset="95%" stopColor="#C86B4F" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(30, 43, 20, 0.05)" />
                      <XAxis dataKey="hour" stroke="#4A5E2B" tick={{ fontSize: 8, fontWeight: 700 }} />
                      <YAxis stroke="#4A5E2B" tick={{ fontSize: 8, fontWeight: 700 }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Area type="monotone" name="Temperature (°C)" dataKey="temperature" stroke="#C86B4F" strokeWidth={2.2} fillOpacity={1} fill="url(#tempTrendGrad)" />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs text-earth-grey">Assembling thermal indices...</div>
                )}
                {/* Highlight node */}
                <div className="absolute right-12 top-6 flex items-center gap-1 bg-[#C86B4F] text-[#FCEDE8] px-2 py-1 rounded-full text-[8px] font-bold shadow animate-bounce">
                  <span>28.6°C</span>
                  <span className="opacity-75">10:30 PM</span>
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* Right AI Insights Panel (4/12) */}
        <div className="lg:col-span-4 h-full">
          
          <div className="glass-panel border border-sand/40 rounded-[28px] p-6 shadow-sm flex flex-col justify-between gap-6 h-full hover:shadow-md transition-all duration-300">
            
            <div className="flex flex-col gap-4">
              
              <div className="flex items-center justify-between pb-3 border-b border-primary/5">
                <span className="text-[10px] font-extrabold text-dark uppercase tracking-widest flex items-center gap-1.5">
                  <span className="text-secondary">✦</span> AI Insights
                </span>
                <Link href="/chatbot" className="text-[9px] font-extrabold text-secondary hover:underline uppercase">View All</Link>
              </div>

              {/* Insights stats list */}
              <div className="flex flex-col gap-3.5">
                
                {/* Item 1: Next Watering */}
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#E2F0D9] flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4 text-[#385723]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path>
                    </svg>
                  </div>
                  <div className="flex flex-col">
                    <div className="flex justify-between items-baseline w-full min-w-[200px]">
                      <span className="text-[11px] font-extrabold text-dark">Next Watering</span>
                      <span className="text-[11px] font-extrabold text-secondary">In 2h 18m</span>
                    </div>
                    <span className="text-[9px] font-bold text-primary/65 mt-0.5">Recommended at 12:45 AM</span>
                  </div>
                </div>

                {/* Item 2: Plant Health */}
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#E2F0D9] flex items-center justify-center shrink-0">
                    <svg className="w-4.5 h-4.5 text-[#385723]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9s2.015-9 4.5-9y"></path>
                    </svg>
                  </div>
                  <div className="flex flex-col">
                    <div className="flex justify-between items-baseline w-full min-w-[200px]">
                      <span className="text-[11px] font-extrabold text-dark">Plant Health</span>
                      <span className="text-[11px] font-extrabold text-secondary">Good</span>
                    </div>
                    <span className="text-[9px] font-bold text-primary/65 mt-0.5">Your plant is healthy</span>
                  </div>
                </div>

                {/* Item 3: Risk Detection */}
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#FCEDE8] flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4 text-[#B55441]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                    </svg>
                  </div>
                  <div className="flex flex-col">
                    <div className="flex justify-between items-baseline w-full min-w-[200px]">
                      <span className="text-[11px] font-extrabold text-dark">Risk Detection</span>
                      <span className="text-[11px] font-extrabold text-[#B55441]">Low Risk</span>
                    </div>
                    <span className="text-[9px] font-bold text-primary/65 mt-0.5">No issues detected</span>
                  </div>
                </div>

              </div>

            </div>

            {/* Solid peach Ask AI CTA button */}
            <button
              onClick={() => router.push('/chatbot')}
              className="w-full py-3.5 rounded-2xl bg-[#FCEDE8] text-[#1C3B2B] hover:bg-[#FCEDE8]/80 text-xs font-bold tracking-wider uppercase transition-all duration-200 flex items-center justify-center gap-2 border border-[#C86B4F]/20 cursor-pointer shadow-sm"
            >
              ✦ Ask AI Assistant
            </button>

          </div>

        </div>

      </div>

      {/* 5. ROW 3: WATER CONSUMPTION (Bar), SOIL DISTRIBUTION (Pie) & DEVCES STATUS LIST */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
        
        {/* Chart 3: Water Consumption (Bar) */}
        <div className="glass-panel border border-sand/40 rounded-[28px] p-6 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between pb-3 border-b border-primary/5 mb-4">
            <div>
              <h4 className="font-extrabold text-xs text-dark uppercase tracking-wider">Water Consumption</h4>
              <span className="text-[9px] text-earth-grey">Weekly simulated watering metrics</span>
            </div>
            <div className="flex items-center gap-1.5 bg-sand/15 px-2.5 py-1.5 rounded-xl border border-sand/35 text-[9px] font-bold text-primary cursor-pointer">
              <span>This Week</span>
              <span>▼</span>
            </div>
          </div>

          <div className="h-40 w-full">
            {mounted && analytics ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.ledHistory} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(30, 43, 20, 0.05)" />
                  <XAxis dataKey="day" stroke="#4A5E2B" tick={{ fontSize: 8, fontWeight: 700 }} />
                  <YAxis stroke="#4A5E2B" tick={{ fontSize: 8, fontWeight: 700 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar name="Liters" dataKey="activations" fill="#1C3B2B" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xs text-earth-grey">Loading water logs...</div>
            )}
          </div>
        </div>

        {/* Chart 4: Soil Moisture Distribution (Pie/Doughnut) */}
        <div className="glass-panel border border-sand/40 rounded-[28px] p-6 shadow-sm flex flex-col justify-between gap-4 hover:shadow-md transition-all duration-300">
          <div className="pb-3 border-b border-primary/5">
            <h4 className="font-extrabold text-xs text-dark uppercase tracking-wider">Soil Moisture Distribution</h4>
            <span className="text-[9px] text-earth-grey">Agronomic state distributions</span>
          </div>

          <div className="grid grid-cols-2 items-center gap-4 flex-grow">
            
            {/* Pie chart */}
            <div className="h-32 w-full relative">
              {mounted ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={30}
                      outerRadius={45}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              ) : null}
            </div>

            {/* Legends list */}
            <div className="flex flex-col gap-2.5">
              {pieData.map((entry, idx) => (
                <div key={idx} className="flex justify-between items-center text-[10px] font-bold">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }}></span>
                    <span className="text-primary/75 font-semibold text-[9px]">{entry.name.split(' (')[0]}</span>
                  </div>
                  <span className="text-dark font-extrabold">{entry.value}%</span>
                </div>
              ))}
            </div>

          </div>
        </div>

        {/* Widget 5: Device Status List */}
        <div className="glass-panel border border-sand/40 rounded-[28px] p-6 shadow-sm flex flex-col justify-between gap-4 hover:shadow-md transition-all duration-300">
          
          <div className="flex items-center justify-between pb-3 border-b border-primary/5">
            <h4 className="font-extrabold text-xs text-dark uppercase tracking-wider">Device Status</h4>
            <span className="text-[9px] font-extrabold text-secondary hover:underline uppercase cursor-pointer">View All</span>
          </div>

          <div className="flex flex-col gap-3 flex-grow justify-center">
            
            {/* Node 1 */}
            <div className="flex items-center justify-between p-2.5 rounded-2xl bg-sand/15 border border-sand/45 shadow-sm text-xs font-bold text-primary">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-neutral-100 flex items-center justify-center text-dark shrink-0">
                  📟
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] font-extrabold text-dark leading-none">PulseRoot - Node 01</span>
                  <span className="text-[8px] font-bold text-primary/60 mt-1 uppercase font-mono">ESP32_001</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-extrabold text-secondary uppercase">Online</span>
                <span className="text-secondary">📶</span>
              </div>
            </div>

            {/* Node 2 */}
            <div className="flex items-center justify-between p-2.5 rounded-2xl bg-sand/15 border border-sand/45 shadow-sm text-xs font-bold text-primary">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-neutral-100 flex items-center justify-center text-dark shrink-0">
                  📟
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] font-extrabold text-dark leading-none">Garden - Front</span>
                  <span className="text-[8px] font-bold text-primary/60 mt-1 uppercase font-mono">ESP32_002</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-extrabold text-secondary uppercase">Online</span>
                <span className="text-secondary">📶</span>
              </div>
            </div>

            {/* Node 3 */}
            <div className="flex items-center justify-between p-2.5 rounded-2xl bg-sand/15 border border-sand/45 shadow-sm text-xs font-bold text-primary">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-neutral-100 flex items-center justify-center text-dark shrink-0">
                  📟
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] font-extrabold text-dark leading-none">Indoor Plants</span>
                  <span className="text-[8px] font-bold text-primary/60 mt-1 uppercase font-mono">ESP32_003</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-extrabold text-[#B55441] uppercase">Offline</span>
                <span className="text-[#B55441] opacity-60">📶</span>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* 6. ROW 4: RECENT ACTIVITY & RECENT ALERTS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Left: Recent Activity Table (8/12) */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          <div className="glass-panel border border-sand/40 rounded-[28px] p-6 shadow-sm h-full hover:shadow-md transition-all duration-300">
            
            <div className="flex items-center justify-between pb-3 border-b border-primary/5 mb-4">
              <h4 className="font-extrabold text-xs text-dark uppercase tracking-wider">Recent Activity</h4>
              <span className="text-[9px] font-extrabold text-secondary hover:underline uppercase cursor-pointer">View All</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-[10px] font-bold text-primary">
                <thead>
                  <tr className="border-b border-primary/5 text-earth-grey font-extrabold uppercase">
                    <th className="py-2 px-3">Time</th>
                    <th className="py-2 px-3">Device</th>
                    <th className="py-2 px-3">Activity</th>
                    <th className="py-2 px-3 text-right">Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-primary/5">
                  {calculations.sensorActivityTimeline.map((item, idx) => (
                    <tr key={idx} className="hover:bg-sand/5 text-dark">
                      <td className="py-2.5 px-3 text-earth-grey font-medium">{item.time}</td>
                      <td className="py-2.5 px-3">{activeDeviceDetails.deviceName}</td>
                      <td className="py-2.5 px-3">{item.event}</td>
                      <td className="py-2.5 px-3 text-right">
                        <span className={`px-2 py-0.5 rounded text-[8px] font-bold border ${
                          item.value === 'Manual' || item.value === 'Auto'
                            ? 'bg-[#E2F0D9] border-[#385723]/25 text-[#385723]'
                            : 'bg-primary/5 border-primary/10 text-primary'
                        }`}>
                          {item.value}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        </div>

        {/* Right: Recent Alerts (4/12) */}
        <div className="lg:col-span-4 h-full">
          <div className="glass-panel border border-sand/40 rounded-[28px] p-6 shadow-sm h-full flex flex-col justify-between gap-4 hover:shadow-md transition-all duration-300">
            
            <div className="flex items-center justify-between pb-3 border-b border-primary/5">
              <h4 className="font-extrabold text-xs text-dark uppercase tracking-wider">Recent Alerts</h4>
              <span className="text-[9px] font-extrabold text-secondary hover:underline uppercase cursor-pointer">View All</span>
            </div>

            <div className="flex flex-col gap-3 flex-grow justify-center">
              
              {/* Alert 1 */}
              <div className="flex items-start gap-3 p-3 bg-red-50/20 border border-[#B55441]/10 rounded-2xl shadow-inner text-[10px] font-bold">
                <span className="text-base shrink-0">💧</span>
                <div className="flex flex-col text-left">
                  <span className="text-dark font-extrabold">Soil moisture dropped below threshold</span>
                  <span className="text-earth-grey text-[8px] mt-0.5">PulseRoot - Node 01 • 10:25 PM</span>
                </div>
              </div>

              {/* Alert 2 */}
              <div className="flex items-start gap-3 p-3 bg-amber-50/20 border border-yellow-600/10 rounded-2xl shadow-inner text-[10px] font-bold">
                <span className="text-base shrink-0">🌡️</span>
                <div className="flex flex-col text-left">
                  <span className="text-dark font-extrabold">Temperature is higher than normal</span>
                  <span className="text-earth-grey text-[8px] mt-0.5">Garden - Front • 09:40 PM</span>
                </div>
              </div>

              {/* Alert 3 */}
              <div className="flex items-start gap-3 p-3 bg-neutral-50/25 border border-primary/5 rounded-2xl shadow-inner text-[10px] font-bold">
                <span className="text-base shrink-0">🔋</span>
                <div className="flex flex-col text-left">
                  <span className="text-dark font-extrabold">Battery level is below 20%</span>
                  <span className="text-earth-grey text-[8px] mt-0.5">Indoor Plants • Yesterday</span>
                </div>
              </div>

            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
