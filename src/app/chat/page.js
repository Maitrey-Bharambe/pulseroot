'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '@/lib/useStore';

export default function Chat() {
  const { activeDeviceId, devices } = useStore();
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'ai',
      text: 'Hello, grower! I am your AI Agronomist Copilot. I have access to your live LDR light and DHT22 atmospheric telemetry nodes. Ask me anything about ambient light curves, heat stress risk indices, or simulated LED watering cycles!'
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

  const handleSend = async (e, textToSend = null) => {
    e?.preventDefault();
    const queryText = textToSend || input;
    if (!queryText.trim() || loading) return;

    // Add user message
    const userMsg = { id: Math.random().toString(), sender: 'user', text: queryText };
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
          { id: Math.random().toString(), sender: 'ai', text: data.reply }
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          { id: Math.random().toString(), sender: 'ai', text: 'Handshake timeout: I could not contact the agronomic core. Please check device status.' }
        ]);
      }
    } catch (err) {
      console.error('Chat failed:', err);
      setMessages((prev) => [
        ...prev,
        { id: Math.random().toString(), sender: 'ai', text: 'Handshake timeout: connection to security gateway failed.' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Quick action query prompt templates
  const promptChips = [
    'Why is plant health decreasing?',
    'Assess fungal risk indices',
    'Explain current sensor status',
    'Is ambient light exposure sufficient?'
  ];

  return (
    <div className="flex-grow w-full max-w-5xl mx-auto px-6 py-8 flex flex-col gap-6 h-[calc(100vh-130px)]">
      
      {/* Header */}
      <div className="border-b border-primary/10 pb-4 shrink-0 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-dark tracking-wide font-sans">AI Agronomist Copilot</h1>
          <p className="text-xs text-primary/75 font-semibold tracking-wide uppercase mt-0.5">
            Context Node: {activeDeviceDetails.deviceName} ({activeDeviceDetails.location})
          </p>
        </div>

        {/* Status indicator */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/15 text-primary border border-secondary/20 text-[10px] font-bold tracking-widest uppercase">
          <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
          Ready
        </div>
      </div>

      {/* Chat Conversation Canvas */}
      <div className="flex-grow glass-panel border border-sand/55 rounded-3xl p-6 shadow-sm overflow-y-auto no-scrollbar flex flex-col gap-4">
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
                    ? 'bg-sand/35 border-sand/50 text-dark rounded-tl-none' 
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
            <div className="p-4 rounded-2xl bg-sand/35 border border-sand/50 text-dark rounded-tl-none flex items-center gap-2 shadow-sm">
              <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce"></span>
              <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:0.2s]"></span>
              <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:0.4s]"></span>
            </div>
          </div>
        )}

        <div ref={scrollRef}></div>
      </div>

      {/* Quick Prompt Chips (Shrink-0) */}
      <div className="flex flex-wrap gap-2 shrink-0">
        {promptChips.map((chip, idx) => (
          <button
            key={idx}
            onClick={(e) => handleSend(e, chip)}
            disabled={loading}
            className="px-4 py-2 rounded-xl bg-sand/40 hover:bg-sand/75 text-primary border border-sand/55 text-[10px] font-bold tracking-wide transition-all duration-200 shadow-sm disabled:opacity-50"
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Input bar */}
      <form onSubmit={handleSend} className="flex gap-3 shrink-0">
        <input
          type="text"
          required
          disabled={loading}
          placeholder="Ask a question (e.g. Is light exposure sufficient?)"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-grow px-5 py-3.5 rounded-2xl border border-sand bg-sand/30 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 text-primary font-semibold transition-all placeholder:text-primary/50 shadow-sm"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="px-6 py-3.5 rounded-2xl organic-gradient text-sand font-bold text-xs tracking-wider uppercase shadow-md hover:opacity-95 transition-all flex items-center justify-center min-w-[100px]"
        >
          Send
        </button>
      </form>

    </div>
  );
}
