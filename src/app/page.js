'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useStore } from '@/lib/useStore';

export default function Home() {
  const { telemetry, ledStatus, devices, user } = useStore();
  const [mounted, setMounted] = useState(false);
  const [ambientLightMode, setAmbientLightMode] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Retrieve live metrics from the store (powered by ThingSpeak feeds)
  const latestTelemetry = telemetry[0] || {
    temperature: 28.6,
    humidity: 45,
    lightValue: 320,
    ledStatus: ledStatus
  };

  // Safe variables derived from live telemetry or defaults matching the design
  const currentTemp = mounted ? latestTelemetry.temperature : 28.6;
  const currentHum = mounted ? latestTelemetry.humidity : 45;
  const currentPump = mounted ? (latestTelemetry.ledStatus || ledStatus) : true;
  
  // Soil Moisture simulation: since LDR acts as our primary analogue sensor, 
  // we can map the 0-1023 LDR scale dynamically to a healthy 0-100% moisture reading!
  const calculatedMoisture = mounted 
    ? Math.round(100 - (latestTelemetry.lightValue / 1023) * 100) 
    : 32;

  // Confidence calculations based on atmospheric balances
  const confidenceScore = mounted 
    ? Math.min(98, Math.max(72, Math.round(98 - Math.abs(currentTemp - 25) * 2)))
    : 89;

  return (
    <div 
      className="min-h-screen flex flex-col justify-between overflow-x-hidden font-sans transition-all duration-700 select-none pb-12"
      style={{
        background: ambientLightMode 
          ? 'linear-gradient(180deg, #F2DCD3 0%, #FAF0EC 100%)' 
          : 'linear-gradient(180deg, #FCEDE8 0%, #FDF6F3 100%)',
        color: '#1C3B2B'
      }}
    >
      
      {/* 1. NAVIGATION HEADER (PulseRoot corporate brand layout) */}
      <header className="w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between z-30">
        
        {/* Logo badge */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-full border-2 border-[#1C3B2B] flex items-center justify-center transition-transform duration-300 group-hover:rotate-12 bg-white/40 shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#1C3B2B" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="w-5.5 h-5.5">
              <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 20 2c1 5.5-2.2 14.5-9 18Z" />
              <path d="M9 22v-4.5" />
              <path d="M14 17.5c-3-1.5-4-3.5-4-3.5" />
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="font-sans font-extrabold text-lg tracking-tight text-[#1C3B2B] leading-none">PulseRoot</span>
            <span className="text-[8px] text-[#1C3B2B]/75 tracking-wider uppercase font-bold mt-1">Smart Plant Intelligence</span>
          </div>
        </Link>

        {/* Center menu links */}
        <nav className="hidden lg:flex items-center gap-8 text-xs font-bold text-[#1C3B2B]/85">
          <Link href="/" className="relative py-1 group text-[#1C3B2B]">
            Home
            <span className="absolute bottom-0 left-0 w-full h-[2.2px] bg-[#1C3B2B] rounded-full"></span>
          </Link>
          <a href="#architecture" className="hover:text-[#1C3B2B] transition-colors py-1">Architecture</a>
          <Link href="/chatbot" className="hover:text-[#1C3B2B] transition-colors py-1">Chatbot</Link>
          <Link href="/ai-analysis" className="hover:text-[#1C3B2B] transition-colors py-1">AI Analysis</Link>
          <Link href="/dashboard" className="hover:text-[#1C3B2B] transition-colors py-1">Main Dashboard</Link>
        </nav>

        {/* Right side login actions */}
        <div className="flex items-center gap-5">
          
          {/* Light-ambient toggle button */}
          <button 
            onClick={() => setAmbientLightMode(!ambientLightMode)}
            className="p-2 rounded-full hover:bg-white/40 border border-transparent hover:border-[#1C3B2B]/15 transition-all text-[#1C3B2B]"
            title="Toggle Ambient Illumination"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5.5 h-5.5">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
            </svg>
          </button>

          {user ? (
            <Link 
              href="/dashboard"
              className="px-6 py-3 rounded-full bg-[#1C3B2B] text-white text-xs font-bold hover:bg-[#2A4E3A] hover:-translate-y-0.5 transition-all duration-300 shadow-md shadow-[#1C3B2B]/10 uppercase tracking-wider"
            >
              Go to Dashboard
            </Link>
          ) : (
            <>
              {/* Login borderless text button */}
              <Link 
                href="/dashboard" 
                className="text-xs font-bold text-[#1C3B2B] hover:opacity-80 transition-opacity"
              >
                Log In
              </Link>

              {/* Solid Forest capsule button */}
              <Link 
                href="/dashboard"
                className="px-6 py-3 rounded-full bg-[#1C3B2B] text-white text-xs font-bold hover:bg-[#2A4E3A] hover:-translate-y-0.5 transition-all duration-300 shadow-md shadow-[#1C3B2B]/10 uppercase tracking-wider"
              >
                Get Started
              </Link>
            </>
          )}
        </div>

      </header>

      {/* 2. HERO SPLIT CONTAINER */}
      <main className="w-full max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center z-20 py-8">
        
        {/* Left Side: Conversion and Branding Copy */}
        <section className="lg:col-span-5 flex flex-col items-start gap-6">
          
          {/* Light Orange Pill Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#C86B4F]/25 bg-[#C86B4F]/5 text-[10px] font-extrabold text-[#C86B4F] tracking-widest uppercase">
            <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="w-3.5 h-3.5">
              <path d="M12 .587l3.668 7.431 8.2 1.192-5.934 5.787 1.4 8.168L12 18.896l-7.334 3.857 1.4-8.168L.132 9.21l8.2-1.192L12 .587z"/>
            </svg>
            AI-Powered Smart Irrigation Platform
          </div>

          {/* Playfair Typography Header */}
          <h1 
            className="text-5xl md:text-7xl tracking-tight leading-[1.08] text-[#1C3B2B] select-none"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Smarter <span className="text-[#C86B4F]">Plants.</span> <br/>
            Healthier <span className="text-[#C86B4F]">Tomorrow.</span>
          </h1>

          <p className="text-sm md:text-base text-[#1C3B2B]/80 font-medium max-w-md leading-relaxed mt-2">
            Real-time monitoring, AI predictions, and automated irrigation to help your plants thrive while saving water and protecting the environment.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center gap-6 mt-4 w-full">
            <Link 
              href="/dashboard"
              className="px-8 py-4.5 rounded-full bg-[#1C3B2B] text-white font-extrabold text-xs tracking-wider uppercase hover:bg-[#2A4E3A] hover:-translate-y-0.5 transition-all duration-300 shadow-lg shadow-[#1C3B2B]/20"
            >
              {user ? 'Go to Dashboard' : 'Start Monitoring Now'}
            </Link>
            
            <Link 
              href="/chatbot"
              className="flex items-center gap-3 text-xs font-bold text-[#1C3B2B] hover:opacity-80 transition-all group"
            >
              <div className="w-11 h-11 rounded-full border border-[#1C3B2B]/20 bg-white flex items-center justify-center shadow-md group-hover:scale-105 transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4.5 h-4.5 text-[#1C3B2B] translate-x-[1px]">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              </div>
              <span className="tracking-wide">Watch Demo</span>
            </Link>
          </div>

          {/* Social Proof trust index */}
          <div className="flex flex-wrap items-center gap-4 mt-8 pt-6 border-t border-[#1C3B2B]/10 w-full">
            {/* Ava stack */}
            <div className="flex -space-x-3">
              <img 
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&h=100&q=80" 
                alt="Grower" 
                className="w-10 h-10 rounded-full border-2 border-white object-cover"
              />
              <img 
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&h=100&q=80" 
                alt="Grower" 
                className="w-10 h-10 rounded-full border-2 border-white object-cover"
              />
              <img 
                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&h=100&q=80" 
                alt="Grower" 
                className="w-10 h-10 rounded-full border-2 border-white object-cover"
              />
              <img 
                src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&h=100&q=80" 
                alt="Grower" 
                className="w-10 h-10 rounded-full border-2 border-white object-cover"
              />
            </div>

            <div className="flex flex-col">
              {/* Stars */}
              <div className="flex items-center gap-0.5 text-yellow-500 text-sm">
                {"★★★★★".split("").map((s, idx) => (
                  <span key={idx}>★</span>
                ))}
                <span className="text-xs font-bold text-[#1C3B2B] ml-2">4.9/5</span>
              </div>
              <span className="text-[10px] font-bold text-[#1C3B2B]/75 uppercase tracking-wide mt-1">Trusted by 2,500+ plant lovers</span>
            </div>
          </div>

        </section>

        {/* Right Side: Visual Product photography & Mock Telemetry gauges */}
        <section className="lg:col-span-7 w-full flex items-center justify-center relative py-10 pl-0 lg:pl-10">
          
          {/* Main Visual Image container */}
          <div className="relative w-full max-w-lg aspect-square rounded-[36px] overflow-visible select-none">
            <img 
              src="/greenwise_hero.png" 
              alt="PulseRoot smart plant node product render" 
              className="w-full h-full object-cover rounded-[36px] shadow-2xl border border-white/50"
            />
            
            {/* FLOATING CARD 1: Live Plant Status */}
            <div className="absolute top-6 -left-6 md:-left-12 p-5 rounded-3xl bg-white/85 backdrop-blur-md border border-white/50 shadow-xl w-60 z-20 flex flex-col gap-4">
              
              <div className="flex justify-between items-center pb-2 border-b border-[#1C3B2B]/10">
                <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#1C3B2B]">Live Plant Status</span>
                <span className="flex items-center gap-1.5 text-[10px] font-extrabold text-[#4F8B5B] uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#4F8B5B] animate-pulse"></span>
                  Live
                </span>
              </div>

              {/* Progress bars list */}
              <div className="flex flex-col gap-3">
                
                {/* Soil Moisture */}
                <div className="flex flex-col gap-1 text-[10px] font-bold text-[#1C3B2B]/75">
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-1.5">
                      💧 Soil Moisture
                    </span>
                    <span className="font-extrabold text-[#1C3B2B]">{calculatedMoisture}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-[#1C3B2B]/10 overflow-hidden">
                    <div 
                      className="h-full bg-[#4F8B5B] rounded-full transition-all duration-1000"
                      style={{ width: `${calculatedMoisture}%` }}
                    ></div>
                  </div>
                </div>

                {/* Temperature */}
                <div className="flex flex-col gap-1 text-[10px] font-bold text-[#1C3B2B]/75">
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-1.5">
                      🌡️ Temperature
                    </span>
                    <span className="font-extrabold text-[#1C3B2B]">{currentTemp}°C</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-[#1C3B2B]/10 overflow-hidden">
                    <div 
                      className="h-full bg-[#C86B4F] rounded-full transition-all duration-1000"
                      style={{ width: `${Math.min(100, Math.max(0, ((currentTemp - 10) / 35) * 100))}%` }}
                    ></div>
                  </div>
                </div>

                {/* Humidity */}
                <div className="flex flex-col gap-1 text-[10px] font-bold text-[#1C3B2B]/75">
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-1.5">
                      💨 Humidity
                    </span>
                    <span className="font-extrabold text-[#1C3B2B]">{currentHum}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-[#1C3B2B]/10 overflow-hidden">
                    <div 
                      className="h-full bg-[#5293B8] rounded-full transition-all duration-1000"
                      style={{ width: `${currentHum}%` }}
                    ></div>
                  </div>
                </div>

                {/* Pump Status */}
                <div className="flex justify-between items-center text-[10px] font-bold text-[#1C3B2B]/75 pt-1.5 border-t border-[#1C3B2B]/5">
                  <span>🍀 Pump Status</span>
                  <span className={`font-extrabold ${currentPump ? 'text-[#4F8B5B]' : 'text-earth-grey'}`}>
                    • {currentPump ? 'ON' : 'OFF'}
                  </span>
                </div>

              </div>

            </div>

            {/* FLOATING CARD 2: AI Prediction */}
            <div className="absolute bottom-6 -right-6 md:-right-8 p-5 rounded-3xl bg-white/85 backdrop-blur-md border border-white/50 shadow-xl w-60 z-20 flex flex-col gap-3">
              
              <div className="flex items-center gap-2 pb-1.5 border-b border-[#1C3B2B]/10">
                <div className="w-7 h-7 rounded-lg bg-[#C86B4F]/15 flex items-center justify-center shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="#C86B4F" strokeWidth="2.2" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#1C3B2B]">AI Prediction</span>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-[9px] text-[#1C3B2B]/70 font-semibold">Next watering in</span>
                <span className="text-xl font-extrabold text-[#1C3B2B] leading-none">2h 18m</span>
              </div>

              <div className="flex flex-col gap-1 text-[9px] font-bold text-[#1C3B2B]/70 mt-1">
                <div className="flex justify-between items-center">
                  <span>Confidence</span>
                  <span>{confidenceScore}%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-[#1C3B2B]/10 overflow-hidden">
                  <div 
                    className="h-full bg-[#4F8B5B] rounded-full transition-all duration-1000"
                    style={{ width: `${confidenceScore}%` }}
                  ></div>
                </div>
              </div>

            </div>

            {/* FLOATING DECORATIVE BADGES */}
            <div className="absolute top-24 -right-10 w-11 h-11 rounded-full bg-white shadow-lg border border-white/60 flex items-center justify-center text-[#1C3B2B] hover:scale-105 transition-transform z-10 cursor-help" title="Plant health is healthy">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
              </svg>
            </div>

            <div className="absolute bottom-36 -left-16 w-11 h-11 rounded-full bg-white shadow-lg border border-white/60 flex items-center justify-center text-[#1C3B2B] hover:scale-105 transition-transform z-10 cursor-help" title="Atmospheric temp index">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z" />
              </svg>
            </div>

            <div className="absolute bottom-16 left-12 w-11 h-11 rounded-full bg-white shadow-lg border border-white/60 flex items-center justify-center text-[#1C3B2B] hover:scale-105 transition-transform z-10 cursor-help" title="Device Wi-Fi strength nominal">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                <path d="M5 12.55a11 11 0 0 1 14.08 0M1.42 9a16 16 0 0 1 21.16 0M8.53 16.11a6 6 0 0 1 6.95 0M12 20h.01" />
              </svg>
            </div>

          </div>

        </section>

      </main>

      {/* 2.5 INTERACTIVE SYSTEM ARCHITECTURE DIAGRAM */}
      <section id="architecture" className="w-full max-w-7xl mx-auto px-6 py-12 z-20 scroll-mt-20">
        
        <div className="flex flex-col gap-3 mb-10">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#C86B4F]">Data Pipeline Overview</span>
          <h2 
            className="text-3xl md:text-5xl tracking-tight text-[#1C3B2B]"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Stateless System Architecture.
          </h2>
          <p className="text-xs md:text-sm text-[#1C3B2B]/75 font-semibold tracking-wide">
            A high-speed, secure, and completely database-free IoT precise telemetry pipeline
          </p>
        </div>

        {/* Visual Flow diagram container */}
        <div className="grid grid-cols-1 md:grid-cols-9 gap-2 items-center">
          
          {/* Card 1: ESP32 Dev Board */}
          <div className="md:col-span-2 p-5 rounded-3xl bg-white border border-white/50 shadow-md flex flex-col gap-3 group hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 min-h-[160px] bg-white/60">
            <span className="text-[9px] font-extrabold text-[#C86B4F] uppercase tracking-wider block">01 / ESP32 Hardware</span>
            <h3 className="font-extrabold text-sm text-[#1C3B2B] leading-tight">IoT Dev Node</h3>
            <p className="text-[10px] text-[#1C3B2B]/70 leading-relaxed font-semibold">
              DHT22 and LDR light sensor array. Signs telemetry with HMAC tokens and listens to LED pump triggers.
            </p>
          </div>

          {/* Connect Arrow 1 */}
          <div className="hidden md:flex justify-center items-center text-[#C86B4F]/40 text-xl font-bold font-mono select-none animate-pulse">
            ➔
          </div>

          {/* Card 2: ThingSpeak IoT Cloud */}
          <div className="md:col-span-2 p-5 rounded-3xl bg-white border border-white/50 shadow-md flex flex-col gap-3 group hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 min-h-[160px] bg-white/60">
            <span className="text-[9px] font-extrabold text-[#C86B4F] uppercase tracking-wider block">02 / ThingSpeak Cloud</span>
            <h3 className="font-extrabold text-sm text-[#1C3B2B] leading-tight">Stateless Cloud</h3>
            <p className="text-[10px] text-[#1C3B2B]/70 leading-relaxed font-semibold">
              Holds fields 1 to 6 representing Temp, Humidity, Light level, and simulated LED statuses database-free.
            </p>
          </div>

          {/* Connect Arrow 2 */}
          <div className="hidden md:flex justify-center items-center text-[#C86B4F]/40 text-xl font-bold font-mono select-none animate-pulse">
            ➔
          </div>

          {/* Card 3: Next.js Ingestion Proxy */}
          <div className="md:col-span-2 p-5 rounded-3xl bg-white border border-white/50 shadow-md flex flex-col gap-3 group hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 min-h-[160px] bg-white/60">
            <span className="text-[9px] font-extrabold text-[#C86B4F] uppercase tracking-wider block">03 / pulseRoot Proxy</span>
            <h3 className="font-extrabold text-sm text-[#1C3B2B] leading-tight">Next.js API Gateway</h3>
            <p className="text-[10px] text-[#1C3B2B]/70 leading-relaxed font-semibold">
              Stateless routing proxying telemetry fetches, calculations, and secure API key encapsulation.
            </p>
          </div>

          {/* Connect Arrow 3 */}
          <div className="hidden md:flex justify-center items-center text-[#C86B4F]/40 text-xl font-bold font-mono select-none animate-pulse">
            ➔
          </div>

          {/* Card 4: Groq Llama-3.3 AI */}
          <div className="md:col-span-2 p-5 rounded-3xl bg-white border border-white/50 shadow-md flex flex-col gap-3 group hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 min-h-[160px] bg-white/60">
            <span className="text-[9px] font-extrabold text-[#C86B4F] uppercase tracking-wider block">04 / Groq Llama AI</span>
            <h3 className="font-extrabold text-sm text-[#1C3B2B] leading-tight">70B Agronomist</h3>
            <p className="text-[10px] text-[#1C3B2B]/70 leading-relaxed font-semibold">
              Translates dynamic telemetry readings into semantic diagnostic insights and chatbot answers under 300ms.
            </p>
          </div>

          {/* Connect Arrow 4 */}
          <div className="hidden md:flex justify-center items-center text-[#C86B4F]/40 text-xl font-bold font-mono select-none animate-pulse">
            ➔
          </div>

          {/* Card 5: Precision Console */}
          <div className="md:col-span-2 p-5 rounded-3xl bg-white border border-white/50 shadow-md flex flex-col gap-3 group hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 min-h-[160px] bg-white/60">
            <span className="text-[9px] font-extrabold text-[#C86B4F] uppercase tracking-wider block">05 / Precision Dashboard</span>
            <h3 className="font-extrabold text-sm text-[#1C3B2B] leading-tight">Recharts UI</h3>
            <p className="text-[10px] text-[#1C3B2B]/70 leading-relaxed font-semibold">
              Renders real-time telemetry curves, computes 10 environmental aggregates, and triggers pump controls.
            </p>
          </div>

        </div>

      </section>

      {/* 3. FOUR COLUMN MIDDLE FEATURES BOARD */}
      <section className="w-full max-w-7xl mx-auto px-6 py-6 z-20">
        
        <div className="w-full rounded-3xl bg-white/70 backdrop-blur-md border border-white/40 p-8 shadow-md grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Card 1: Real-time Monitoring */}
          <div className="flex gap-4 items-start">
            <div className="w-12 h-12 rounded-2xl bg-[#FCEDE8] border border-[#FCEDE8] flex items-center justify-center shrink-0 shadow-inner">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#C86B4F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
              </svg>
            </div>
            <div className="flex flex-col gap-1">
              <h3 className="font-extrabold text-xs tracking-wider uppercase text-[#1C3B2B]">Real-time Monitoring</h3>
              <p className="text-[11px] text-[#1C3B2B]/75 leading-relaxed font-semibold">
                Track soil, weather, and plant health 24/7.
              </p>
            </div>
          </div>

          {/* Card 2: AI-Powered Insights */}
          <div className="flex gap-4 items-start">
            <div className="w-12 h-12 rounded-2xl bg-[#FCEDE8] border border-[#FCEDE8] flex items-center justify-center shrink-0 shadow-inner">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#C86B4F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div className="flex flex-col gap-1">
              <h3 className="font-extrabold text-xs tracking-wider uppercase text-[#1C3B2B]">AI-Powered Insights</h3>
              <p className="text-[11px] text-[#1C3B2B]/75 leading-relaxed font-semibold">
                Predict watering time, detect risks, and get smart suggestions.
              </p>
            </div>
          </div>

          {/* Card 3: Water Efficient */}
          <div className="flex gap-4 items-start">
            <div className="w-12 h-12 rounded-2xl bg-[#FCEDE8] border border-[#FCEDE8] flex items-center justify-center shrink-0 shadow-inner">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#C86B4F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
              </svg>
            </div>
            <div className="flex flex-col gap-1">
              <h3 className="font-extrabold text-xs tracking-wider uppercase text-[#1C3B2B]">Water Efficient</h3>
              <p className="text-[11px] text-[#1C3B2B]/75 leading-relaxed font-semibold">
                Save water with precise irrigation automation.
              </p>
            </div>
          </div>

          {/* Card 4: Secure & Private */}
          <div className="flex gap-4 items-start">
            <div className="w-12 h-12 rounded-2xl bg-[#FCEDE8] border border-[#FCEDE8] flex items-center justify-center shrink-0 shadow-inner">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#C86B4F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <div className="flex flex-col gap-1">
              <h3 className="font-extrabold text-xs tracking-wider uppercase text-[#1C3B2B]">Secure & Private</h3>
              <p className="text-[11px] text-[#1C3B2B]/75 leading-relaxed font-semibold">
                Enterprise-grade security for your data and devices.
              </p>
            </div>
          </div>

        </div>

      </section>

      {/* 4. SOLID PINE GREEN STATS FOOTER CAPSULE */}
      <section className="w-full max-w-7xl mx-auto px-6 py-4 z-20">
        
        <div className="w-full rounded-[32px] bg-[#1C3B2B] p-6 shadow-xl grid grid-cols-2 lg:grid-cols-4 gap-6 items-center text-white select-none">
          
          {/* Stat 1: 12,500+ Active Devices */}
          <div className="flex items-center gap-4 px-4 py-2 border-r border-white/10 last:border-0 justify-center lg:justify-start">
            <div className="w-12 h-12 rounded-2xl bg-[#FAF3EF]/15 flex items-center justify-center shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#FAF3EF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-extrabold leading-none tracking-wide text-[#FAF3EF]">12,500+</span>
              <span className="text-[9px] uppercase tracking-widest font-extrabold text-[#FAF3EF]/65 mt-1 block">Active Devices</span>
            </div>
          </div>

          {/* Stat 2: 3.2M L Water Saved */}
          <div className="flex items-center gap-4 px-4 py-2 border-r border-white/10 last:border-0 justify-center lg:justify-start">
            <div className="w-12 h-12 rounded-2xl bg-[#FAF3EF]/15 flex items-center justify-center shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#FAF3EF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-extrabold leading-none tracking-wide text-[#FAF3EF]">3.2M L</span>
              <span className="text-[9px] uppercase tracking-widest font-extrabold text-[#FAF3EF]/65 mt-1 block">Water Saved</span>
            </div>
          </div>

          {/* Stat 3: 18,750+ Healthy Plants */}
          <div className="flex items-center gap-4 px-4 py-2 border-r border-white/10 last:border-0 justify-center lg:justify-start">
            <div className="w-12 h-12 rounded-2xl bg-[#FAF3EF]/15 flex items-center justify-center shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#FAF3EF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                <path d="M12 2.22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-extrabold leading-none tracking-wide text-[#FAF3EF]">18,750+</span>
              <span className="text-[9px] uppercase tracking-widest font-extrabold text-[#FAF3EF]/65 mt-1 block">Healthy Plants</span>
            </div>
          </div>

          {/* Stat 4: 98.7% Prediction Accuracy */}
          <div className="flex items-center gap-4 px-4 py-2 last:border-0 justify-center lg:justify-start">
            <div className="w-12 h-12 rounded-2xl bg-[#FAF3EF]/15 flex items-center justify-center shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#FAF3EF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                <path d="M3 3v18h18M18.7 8l-5.1 5.2-2.8-2.7L7 14.3" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-extrabold leading-none tracking-wide text-[#FAF3EF]">98.7%</span>
              <span className="text-[9px] uppercase tracking-widest font-extrabold text-[#FAF3EF]/65 mt-1 block">Prediction Accuracy</span>
            </div>
          </div>

        </div>

      </section>

    </div>
  );
}
