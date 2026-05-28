'use client';

import React, { useState } from 'react';
import { useStore } from '@/lib/useStore';

export default function Alerts() {
  const { notifications, logout } = useStore();
  const [filter, setFilter] = useState('all');

  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'all') return true;
    return n.type === filter;
  });

  const clearAlerts = () => {
    // We can clear notifications from store
    useStore.setState({ notifications: [] });
  };

  return (
    <div className="flex-grow w-full max-w-4xl mx-auto px-6 py-8 flex flex-col gap-6">
      
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-primary/10 pb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-dark tracking-wide font-sans">Notification Logs</h1>
          <p className="text-xs text-primary/75 font-semibold tracking-wide uppercase mt-1">
            Historical audit logs of plant stress and system operations
          </p>
        </div>

        {/* Filter triggers and clear action */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all border ${
              filter === 'all'
                ? 'organic-gradient text-sand border-primary/20 shadow-sm'
                : 'bg-sand/40 hover:bg-sand/75 text-primary border-sand/55'
            }`}
          >
            All Logs
          </button>
          <button
            onClick={() => setFilter('alert')}
            className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all border ${
              filter === 'alert'
                ? 'bg-terracotta/15 text-terracotta border-terracotta/25 shadow-sm'
                : 'bg-sand/40 hover:bg-sand/75 text-primary border-sand/55'
            }`}
          >
            Critical
          </button>
          <button
            onClick={() => setFilter('info')}
            className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all border ${
              filter === 'info'
                ? 'bg-secondary/15 text-primary border-secondary/25 shadow-sm'
                : 'bg-sand/40 hover:bg-sand/75 text-primary border-sand/55'
            }`}
          >
            System
          </button>

          <button
            onClick={clearAlerts}
            disabled={notifications.length === 0}
            className="px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider text-terracotta/80 hover:text-terracotta hover:bg-terracotta/10 border border-transparent transition-all disabled:opacity-40"
          >
            Clear History
          </button>
        </div>
      </div>

      {/* Alerts log panel container */}
      <div className="glass-panel border border-sand/55 rounded-3xl p-6 shadow-sm flex flex-col gap-4">
        
        {filteredNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-xs text-earth-grey">No matching notification entries in store logs.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filteredNotifications.map((n) => {
              const isAlert = n.type === 'alert';
              return (
                <div
                  key={n.id}
                  className={`p-4 rounded-2xl border flex flex-col sm:flex-row justify-between gap-3 items-start sm:items-center transition-all duration-300 ${
                    isAlert
                      ? 'bg-terracotta/10 border-terracotta/20 text-terracotta'
                      : 'bg-sand/35 border-sand/50 text-primary'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Event Type Icon */}
                    <div className="w-8 h-8 rounded-xl bg-background border border-sand/50 flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                      {isAlert ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-terracotta" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      )}
                    </div>

                    <div className="flex flex-col gap-0.5">
                      <span className={`text-[10px] font-extrabold tracking-wider uppercase ${isAlert ? 'text-terracotta/75' : 'text-primary/70'}`}>
                        {isAlert ? 'Critical Agronomic Trigger' : 'System Event Notification'}
                      </span>
                      <p className="text-xs font-semibold leading-relaxed text-dark">
                        {n.message}
                      </p>
                    </div>
                  </div>

                  {/* Timestamp details */}
                  <div className="text-[10px] font-bold text-earth-grey shrink-0 flex flex-col items-end">
                    <span>{new Date(n.timestamp).toLocaleDateString()}</span>
                    <span>{new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>

    </div>
  );
}
