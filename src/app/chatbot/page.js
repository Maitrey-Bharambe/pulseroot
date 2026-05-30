'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '@/lib/useStore';

// Top-level helper function for pure ID generation
const generateId = () => {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
};

export default function Chatbot() {
  const { activeDeviceId, devices, telemetry, ledStatus } = useStore();
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'ai',
      text: 'Hello, grower! I am your AI Agronomist Copilot. I have full real-time access to your ESP32 telemetry nodes. Ask me anything about ambient light curves, heat stress risk indices, or simulated LED watering cycles!'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  // Auto-scroll chat to bottom on updates
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const activeDeviceDetails = devices.find(d => d.deviceId === activeDeviceId) || {
    deviceName: 'Simulation Node',
    location: 'Garden Greenhouse'
  };

  // Get current live telemetry or fall back to defaults
  const latestTelemetry = telemetry[0] || {
    temperature: 28.6,
    humidity: 55,
    lightValue: 720,
    lightStatus: 'BRIGHT',
    ledStatus: ledStatus,
    environmentCondition: 'OPTIMAL'
  };

  const handleSend = async (e, textToSend = null) => {
    e?.preventDefault();
    const queryText = textToSend || input;
    if (!queryText.trim() || loading) return;

    // Add user message
    const userMsg = { id: generateId(), sender: 'user', text: queryText };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deviceId: activeDeviceId,
          query: queryText
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setMessages((prev) => [
          ...prev,
          { id: generateId(), sender: 'ai', text: data.reply }
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          { id: generateId(), sender: 'ai', text: 'Handshake timeout: I could not contact the agronomic core. Please check device status.' }
        ]);
      }
    } catch (err) {
      console.error('Chat failed:', err);
      setMessages((prev) => [
        ...prev,
        { id: generateId(), sender: 'ai', text: 'Handshake timeout: connection to security gateway failed.' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Quick action query prompt templates
  const promptChips = [
    'Explain my current sensor status',
    'Assess fungal outbreak risks',
    'Evaluate light exposure & LDR readings',
    'Is there any thermal heat stress?'
  ];

  return (
    <div className="flex-grow w-full max-w-7xl mx-auto px-6 py-8 flex flex-col gap-6">
      
      {/* Header */}
      <div className="border-b border-primary/10 pb-4 shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-dark tracking-wide font-sans leading-none">AI Agronomist Copilot</h1>
          <p className="text-xs text-primary/75 font-semibold tracking-wide uppercase mt-2">
            Linked Node: {activeDeviceDetails.deviceName} ({activeDeviceDetails.location})
          </p>
        </div>

        {/* Live sync connection state */}
        <div className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-secondary/10 text-primary border border-secondary/20 text-[10px] font-bold tracking-widest uppercase self-start sm:self-auto shadow-sm">
          <span className="w-2.5 h-2.5 rounded-full bg-secondary animate-pulse"></span>
          Telemetry Synced Live
        </div>
      </div>

      {/* Main Two-Column Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch flex-grow min-h-[500px]">
        
        {/* Left Column: Live Sensor Statistics Widget (4/12) */}
        <div className="lg:col-span-4 flex flex-col gap-6 h-full">
          <div className="glass-panel border border-sand/55 rounded-3xl p-6 shadow-sm flex flex-col justify-between gap-6 h-full bg-white/40 backdrop-blur-md">
            
            <div className="flex flex-col gap-4">
              <div className="border-b border-primary/10 pb-3">
                <h3 className="font-extrabold text-xs text-dark uppercase tracking-wider">Active Telemetry Stream</h3>
                <p className="text-[10px] text-primary/70 mt-0.5">Real-time parameters loaded directly in LLM system prompt</p>
              </div>

              {/* Stat rows */}
              <div className="flex flex-col gap-3">
                
                {/* Temp */}
                <div className="p-3.5 rounded-2xl bg-sand/30 border border-sand/45 flex items-center justify-between shadow-sm">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[9px] uppercase tracking-widest font-extrabold text-primary/70">Temperature</span>
                    <span className="text-sm font-extrabold text-dark">{latestTelemetry.temperature}°C</span>
                  </div>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md border ${
                    latestTelemetry.temperature > 35 
                      ? 'bg-terracotta/15 border-terracotta/20 text-terracotta animate-pulse'
                      : 'bg-primary/5 border-primary/10 text-primary'
                  }`}>
                    {latestTelemetry.temperature > 35 ? 'HEAT STRESS' : 'STABLE'}
                  </span>
                </div>

                {/* Humidity */}
                <div className="p-3.5 rounded-2xl bg-sand/30 border border-sand/45 flex items-center justify-between shadow-sm">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[9px] uppercase tracking-widest font-extrabold text-primary/70">Air Humidity</span>
                    <span className="text-sm font-extrabold text-dark">{latestTelemetry.humidity}% RH</span>
                  </div>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md border ${
                    latestTelemetry.humidity < 30 
                      ? 'bg-terracotta/15 border-terracotta/20 text-terracotta'
                      : 'bg-primary/5 border-primary/10 text-primary'
                  }`}>
                    {latestTelemetry.humidity < 30 ? 'DRY AIR' : 'OPTIMAL'}
                  </span>
                </div>

                {/* Light */}
                <div className="p-3.5 rounded-2xl bg-sand/30 border border-sand/45 flex items-center justify-between shadow-sm">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[9px] uppercase tracking-widest font-extrabold text-primary/70">Light (LDR)</span>
                    <span className="text-sm font-extrabold text-dark">{latestTelemetry.lightStatus} <span className="text-[10px] font-normal text-primary/65">({latestTelemetry.lightValue})</span></span>
                  </div>
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-md border bg-primary/5 border-primary/10 text-primary">
                    LUX NOMINAL
                  </span>
                </div>

                {/* Simulated LED status */}
                <div className="p-3.5 rounded-2xl bg-sand/30 border border-sand/45 flex items-center justify-between shadow-sm">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[9px] uppercase tracking-widest font-extrabold text-primary/70">simulated Pump</span>
                    <span className="text-sm font-extrabold text-dark">{latestTelemetry.ledStatus ? 'ACTIVATED' : 'IDLE'}</span>
                  </div>
                  <span className={`w-2.5 h-2.5 rounded-full ${latestTelemetry.ledStatus ? 'bg-secondary animate-ping' : 'bg-earth-grey'}`}></span>
                </div>

              </div>
            </div>

            {/* Ingestion notice */}
            <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 shadow-inner flex flex-col gap-1">
              <span className="text-[8px] font-extrabold uppercase tracking-widest text-[#C86B4F]">Data Pipeline Ingestion</span>
              <p className="text-[11px] leading-relaxed text-primary font-medium">
                Our semantic parser packages these active telemetry readings dynamically into a context-envelope, allowing the Llama/GPT model to produce highly optimal, zero-hallucination diagnostics.
              </p>
            </div>

          </div>
        </div>

        {/* Right Column: Chat Dialog Box (8/12) */}
        <div className="lg:col-span-8 flex flex-col gap-4 h-[600px]">
          
          {/* Conversational Area */}
          <div className="flex-grow glass-panel border border-sand/55 rounded-3xl p-6 shadow-sm overflow-y-auto no-scrollbar flex flex-col gap-4 bg-white/40">
            {messages.map((m) => {
              const isAi = m.sender === 'ai';
              return (
                <div 
                  key={m.id} 
                  className={`flex flex-col max-w-[80%] ${
                    isAi ? 'self-start items-start' : 'self-end items-end'
                  } animate-in fade-in slide-in-from-bottom-2 duration-300`}
                >
                  <span className="text-[9px] uppercase tracking-widest font-extrabold text-primary/70 mb-1 px-1">
                    {isAi ? 'Agronomist AI' : 'Operator'}
                  </span>
                  
                  <div 
                    className={`p-4 rounded-2xl text-xs font-semibold leading-relaxed shadow-sm border ${
                      isAi 
                        ? 'bg-sand/40 border-sand/65 text-dark rounded-tl-none' 
                        : 'organic-gradient border-primary/20 text-sand rounded-tr-none'
                    }`}
                  >
                    {m.text}
                  </div>
                </div>
              );
            })}

            {loading && (
              <div className="self-start flex flex-col items-start max-w-[80%]">
                <span className="text-[9px] uppercase tracking-widest font-extrabold text-primary/70 mb-1 px-1">Agronomist AI</span>
                <div className="p-4 rounded-2xl bg-sand/40 border border-sand/65 text-dark rounded-tl-none flex items-center gap-2 shadow-sm">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:0.4s]"></span>
                </div>
              </div>
            )}

            <div ref={scrollRef}></div>
          </div>

          {/* Quick Prompt Suggestions */}
          <div className="flex flex-wrap gap-2 shrink-0">
            {promptChips.map((chip, idx) => (
              <button
                key={idx}
                onClick={(e) => handleSend(e, chip)}
                disabled={loading}
                className="px-4 py-2.5 rounded-xl bg-sand/35 hover:bg-sand/65 text-primary border border-sand/55 text-[10px] font-bold tracking-wide transition-all duration-200 shadow-sm disabled:opacity-50"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Text input form */}
          <form onSubmit={handleSend} className="flex gap-3 shrink-0">
            <input
              type="text"
              required
              disabled={loading}
              placeholder="Ask your agronomist copilot (e.g. Evaluate heat stress indices)"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-grow px-5 py-4 rounded-2xl border border-sand bg-sand/30 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 text-primary font-semibold transition-all placeholder:text-primary/50 shadow-sm"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="px-8 py-4 rounded-2xl organic-gradient text-sand font-bold text-xs tracking-wider uppercase shadow-md hover:opacity-95 transition-all flex items-center justify-center min-w-[110px]"
            >
              Send
            </button>
          </form>

        </div>

      </div>

    </div>
  );
}
