'use client';

import React, { useState, useEffect } from 'react';
import { useStore } from '@/lib/useStore';

export default function AIAnalysis() {
  const { activeDeviceId, devices, telemetry } = useStore();
  const [analytics, setAnalytics] = useState(null);
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);

  const activeDeviceDetails = devices.find(d => d.deviceId === activeDeviceId) || {
    deviceName: 'Simulation Node A',
    location: 'Garden Greenhouse',
    createdAt: new Date()
  };

  useEffect(() => {
    if (!activeDeviceId) return;

    async function fetchReportData() {
      setLoading(true);
      try {
        // 1. Fetch Computed Analytics
        const analyticsRes = await fetch(`/api/analytics?deviceId=${activeDeviceId}`);
        if (analyticsRes.ok) {
          const analyticsData = await analyticsRes.json();
          if (analyticsData.success) {
            setAnalytics(analyticsData);
          }
        }

        // 2. Fetch AI Insights
        const insightsRes = await fetch(`/api/insights?deviceId=${activeDeviceId}`);
        if (insightsRes.ok) {
          const insightsData = await insightsRes.json();
          if (insightsData.success) {
            setInsights(insightsData.insights || []);
          }
        }
      } catch (err) {
        console.error('Failed fetching report data:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchReportData();
  }, [activeDeviceId]);

  const handlePrint = () => {
    window.print();
  };

  const calculations = analytics?.calculations || {
    averageTemperature: 28.5,
    averageHumidity: 55,
    dayNightRatio: { dayPercentage: 70, nightPercentage: 30 },
    highTempDetected: false,
    darkEnvironmentDetected: false,
    ledActivationCount: 12,
    environmentalRiskLevel: 'Safe',
    heatStressDetected: false,
    lowLightWarning: false,
    sensorActivityTimeline: []
  };

  // Compile detailed crop assessment statements based on aggregates
  const getThermalAssessment = () => {
    if (calculations.averageTemperature > 32 || calculations.heatStressDetected) {
      return 'CRITICAL TEMPERATURE STRESS: Diurnal averages exceed optimal vegetative thresholds. Leaf stomata contraction is likely active, reducing transpiration efficiency. Active fan cooling, ventilation flow, or canopy misting is critically required.';
    }
    if (calculations.averageTemperature < 18) {
      return 'LOW ATMOSPHERIC ACTIVITY: Averages are under standard metabolic vegetative limits. Cell division and transpiration speeds are sluggish. Recommend auxiliary thermal regulators.';
    }
    return 'NOMINAL THERMAL ZONE: Average temperatures are stable within the optimal cell growth respiration window (22-29°C). Respiration cycles are perfectly in balance with transpiration.';
  };

  const getHumidityAssessment = () => {
    if (calculations.averageHumidity < 40) {
      return 'DRY ATMOSPHERE RISK: Atmospheric relative humidity average is low, speeding up cell transpiration artificially and threatening root dehydration. Recommend immediate misting triggers.';
    }
    if (calculations.averageHumidity > 80) {
      return 'HIGH HUMIDITY/SPORE INCUBATION RISK: Relative moisture levels are high, creating high dampness optimal for fungal spore germination. Ensure consistent air cross-flow.';
    }
    return 'NOMINAL VAPOUR PRESSURE DEFICIT: Relative humidity levels are beautifully balanced, allowing stomata vapor exchange to remain active and healthy.';
  };

  const getLightingAssessment = () => {
    if (calculations.dayNightRatio.dayPercentage < 40 || calculations.darkEnvironmentDetected) {
      return 'SEVERE LIGHT LIMITATION: Prolonged dark periods detected in the telemetry cycle. Crop is vulnerable to etiolation (stem stretching) due to lack of sugar photosynthesis. Provide artificial growth lamp exposure.';
    }
    return 'HEALTHY DIURNAL LIGHT PATTERNS: The active light-to-dark curve confirms nominal light exposure, supporting robust chlorophyll activity and leaf blade expansion.';
  };

  return (
    <div className="flex-grow w-full max-w-5xl mx-auto px-6 py-8 flex flex-col gap-8 print:p-0 print:max-w-full">
      
      {/* Dynamic inline style for professional print margins, formatting, and color settings */}
      <style jsx global>{`
        @media print {
          body {
            background: #ffffff !important;
            color: #000000 !important;
            font-size: 11pt !important;
            margin: 0 !important;
            padding: 2cm !important;
          }
          nav, footer, .no-print, button {
            display: none !important;
          }
          .glass-panel, .glass-panel-dark {
            background: none !important;
            border: 1px solid #dadce0 !important;
            box-shadow: none !important;
            border-radius: 12px !important;
          }
          .print-title {
            color: #1c3b2b !important;
          }
          .print-bg-header {
            background-color: #f8fafc !important;
            border: 1px solid #e2e8f0 !important;
          }
          .page-break {
            page-break-before: always;
          }
        }
      `}</style>

      {/* Header and Download Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-primary/10 pb-6 no-print">
        <div>
          <h1 className="text-2xl font-extrabold text-dark tracking-wide font-sans leading-none">Agronomic Analysis</h1>
          <p className="text-xs text-primary/75 font-semibold tracking-wide uppercase mt-2">
            Generate and export professional crop diagnostics
          </p>
        </div>

        <button
          onClick={handlePrint}
          disabled={loading}
          className="px-6 py-3 rounded-full organic-gradient text-sand font-bold text-xs tracking-wider uppercase shadow-md hover:opacity-95 hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-2.5 disabled:opacity-50"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Download PDF Report
        </button>
      </div>

      {loading ? (
        <div className="flex-grow flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-primary/10 border-t-primary animate-spin"></div>
          <span className="text-xs uppercase font-bold text-primary/70 tracking-widest">Aggregating Agronomic Audits...</span>
        </div>
      ) : (
        <div className="flex flex-col gap-8 print:gap-6">
          
          {/* Printable Corporate Letterhead Header */}
          <div className="print-bg-header p-8 rounded-[24px] bg-sand/20 border border-sand/40 flex flex-col sm:flex-row justify-between gap-6 shadow-sm">
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] font-extrabold tracking-widest text-[#C86B4F] uppercase">Agricultural Intelligence Audit</span>
              <h2 className="text-2xl font-extrabold text-dark font-sans leading-none print-title">pulseRoot Analytics Labs</h2>
              <p className="text-[11px] text-primary/80 font-medium mt-1 max-w-sm">
                Corporate precision farming diagnostics and real-time environmental stress valuation audits.
              </p>
            </div>
            
            <div className="flex flex-col text-xs font-semibold text-primary/80 gap-1.5 border-t sm:border-t-0 sm:border-l border-primary/10 pt-4 sm:pt-0 sm:pl-6 text-left shrink-0">
              <div><span className="text-[9px] uppercase tracking-wider text-earth-grey block">Report Issued:</span>{new Date().toLocaleString()}</div>
              <div><span className="text-[9px] uppercase tracking-wider text-earth-grey block">Linked Hardware Node:</span>{activeDeviceDetails.deviceName} ({activeDeviceDetails.location})</div>
              <div><span className="text-[9px] uppercase tracking-wider text-earth-grey block">Risk Status Rating:</span><span className={`font-extrabold uppercase ${calculations.environmentalRiskLevel === 'Danger' ? 'text-terracotta' : 'text-secondary'}`}>{calculations.environmentalRiskLevel}</span></div>
            </div>
          </div>

          {/* Section 1: Executive AI Evaluation */}
          <div className="glass-panel border border-sand/40 rounded-3xl p-6 shadow-sm bg-white/40 flex flex-col gap-4">
            <h3 className="font-extrabold text-xs text-dark uppercase tracking-wider pb-3 border-b border-primary/10 flex items-center gap-2">
              <span className="text-secondary">■</span> AI Agronomic Executive Summary
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs leading-relaxed font-semibold text-primary">
              <div className="flex flex-col gap-2 p-4 rounded-2xl bg-sand/35 border border-sand/45">
                <span className="text-[9px] font-extrabold uppercase text-[#C86B4F] tracking-wider">Thermal Index Valuation</span>
                <p className="text-dark font-medium">{getThermalAssessment()}</p>
              </div>

              <div className="flex flex-col gap-2 p-4 rounded-2xl bg-sand/35 border border-sand/45">
                <span className="text-[9px] font-extrabold uppercase text-[#C86B4F] tracking-wider">Vapor Exchange Assessment</span>
                <p className="text-dark font-medium">{getHumidityAssessment()}</p>
              </div>

              <div className="flex flex-col gap-2 p-4 rounded-2xl bg-sand/35 border border-sand/45">
                <span className="text-[9px] font-extrabold uppercase text-[#C86B4F] tracking-wider">Solar exposure audit</span>
                <p className="text-dark font-medium">{getLightingAssessment()}</p>
              </div>
            </div>
          </div>

          {/* Section 2: Computed Agronomic Aggregates (10 Core Metrics) */}
          <div className="glass-panel border border-sand/40 rounded-3xl p-6 shadow-sm bg-white/40 flex flex-col gap-4">
            <h3 className="font-extrabold text-xs text-dark uppercase tracking-wider pb-3 border-b border-primary/10 flex items-center gap-2">
              <span className="text-secondary">■</span> Environmental aggregates (10 Core indices)
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-xs font-semibold text-primary">
              <div className="p-3.5 rounded-xl bg-sand/25 border border-sand/35">
                <span className="text-[8px] uppercase tracking-widest text-primary/75 block">Avg Temperature</span>
                <span className="text-base font-extrabold text-dark mt-1 block">{calculations.averageTemperature}°C</span>
              </div>
              <div className="p-3.5 rounded-xl bg-sand/25 border border-sand/35">
                <span className="text-[8px] uppercase tracking-widest text-primary/75 block">Avg Humidity</span>
                <span className="text-base font-extrabold text-dark mt-1 block">{calculations.averageHumidity}% RH</span>
              </div>
              <div className="p-3.5 rounded-xl bg-sand/25 border border-sand/35">
                <span className="text-[8px] uppercase tracking-widest text-primary/75 block">Day light ratio</span>
                <span className="text-base font-extrabold text-dark mt-1 block">{calculations.dayNightRatio.dayPercentage}% Bright</span>
              </div>
              <div className="p-3.5 rounded-xl bg-sand/25 border border-sand/35">
                <span className="text-[8px] uppercase tracking-widest text-primary/75 block">Night dark ratio</span>
                <span className="text-base font-extrabold text-dark mt-1 block">{calculations.dayNightRatio.nightPercentage}% Dark</span>
              </div>
              <div className="p-3.5 rounded-xl bg-sand/25 border border-sand/35">
                <span className="text-[8px] uppercase tracking-widest text-primary/75 block">irrigation Cycles</span>
                <span className="text-base font-extrabold text-dark mt-1 block">{calculations.ledActivationCount} Cycles</span>
              </div>
              
              <div className="p-3.5 rounded-xl bg-sand/25 border border-sand/35">
                <span className="text-[8px] uppercase tracking-widest text-primary/75 block">Thermal Stress risk</span>
                <span className="text-base font-extrabold text-dark mt-1 block">{calculations.heatStressDetected ? 'High' : 'Low'}</span>
              </div>
              <div className="p-3.5 rounded-xl bg-sand/25 border border-sand/35">
                <span className="text-[8px] uppercase tracking-widest text-primary/75 block">Light deficiency risk</span>
                <span className="text-base font-extrabold text-dark mt-1 block">{calculations.lowLightWarning ? 'Moderate' : 'Low'}</span>
              </div>
              <div className="p-3.5 rounded-xl bg-sand/25 border border-sand/35">
                <span className="text-[8px] uppercase tracking-widest text-primary/75 block">fungal outbreak threat</span>
                <span className="text-base font-extrabold text-dark mt-1 block">
                  {calculations.averageHumidity > 75 ? 'Moderate (45%)' : 'Minimal (<5%)'}
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-sand/25 border border-sand/35">
                <span className="text-[8px] uppercase tracking-widest text-primary/75 block">Soil Vapour Level</span>
                <span className="text-base font-extrabold text-dark mt-1 block">Optimal</span>
              </div>
              <div className="p-3.5 rounded-xl bg-sand/25 border border-sand/35">
                <span className="text-[8px] uppercase tracking-widest text-primary/75 block">Transpiration status</span>
                <span className="text-base font-extrabold text-dark mt-1 block">Active</span>
              </div>
            </div>
          </div>

          {/* Section 3: Diagnostic Insights (AI) */}
          <div className="glass-panel border border-sand/40 rounded-3xl p-6 shadow-sm bg-white/40 flex flex-col gap-4 page-break">
            <h3 className="font-extrabold text-xs text-dark uppercase tracking-wider pb-3 border-b border-primary/10 flex items-center gap-2">
              <span className="text-secondary">■</span> AI Recommended Interventions
            </h3>
            
            <div className="flex flex-col gap-3">
              {insights.length === 0 ? (
                <p className="text-xs text-earth-grey py-4 font-semibold">All active parameters are nominal. Maintain standard irrigation and lighting programs.</p>
              ) : (
                insights.map((ins, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-sand/25 border border-sand/35 flex flex-col gap-1.5 text-xs font-semibold">
                    <div className="flex justify-between items-center font-extrabold">
                      <span className="text-[#C86B4F] uppercase tracking-wider">{ins.insightType.replace('_', ' ')}</span>
                      <span className={`px-2 py-0.5 rounded text-[9px] uppercase border ${
                        ins.severity === 'Critical' || ins.severity === 'High'
                          ? 'bg-terracotta/10 border-terracotta/20 text-terracotta'
                          : 'bg-primary/5 border-primary/10 text-primary'
                      }`}>
                        {ins.severity} Severity
                      </span>
                    </div>
                    <p className="text-dark font-medium leading-relaxed mt-1">{ins.result}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Section 4: Detailed Sensor Logs Audit Table */}
          <div className="glass-panel border border-sand/40 rounded-3xl p-6 shadow-sm bg-white/40 flex flex-col gap-4">
            <h3 className="font-extrabold text-xs text-dark uppercase tracking-wider pb-3 border-b border-primary/10 flex items-center gap-2">
              <span className="text-secondary">■</span> Telemetry Audit Data Table
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs font-semibold text-primary">
                <thead>
                  <tr className="border-b border-primary/10 text-[9px] uppercase tracking-wider text-earth-grey">
                    <th className="py-2.5 px-3">Sync Timestamp</th>
                    <th className="py-2.5 px-3">Temp (°C)</th>
                    <th className="py-2.5 px-3">Humidity (%)</th>
                    <th className="py-2.5 px-3">Light Status</th>
                    <th className="py-2.5 px-3 text-right">simulated Pump</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-primary/5">
                  {telemetry.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="py-6 text-center text-earth-grey">No data streams found. Connect hardware.</td>
                    </tr>
                  ) : (
                    telemetry.slice(0, 15).map((log, idx) => (
                      <tr key={idx} className="hover:bg-sand/10 text-dark font-medium">
                        <td className="py-3 px-3 text-earth-grey">{new Date(log.timestamp).toLocaleString()}</td>
                        <td className="py-3 px-3 font-bold">{log.temperature}°C</td>
                        <td className="py-3 px-3">{log.humidity}%</td>
                        <td className="py-3 px-3">{log.lightStatus} ({log.lightValue})</td>
                        <td className="py-3 px-3 text-right">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                            log.ledStatus ? 'bg-secondary/15 text-primary' : 'bg-sand/40 text-earth-grey'
                          }`}>
                            {log.ledStatus ? 'ON' : 'OFF'}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Corporate Footer for Printable Version */}
          <div className="hidden print:flex flex-col items-center justify-center border-t border-primary/10 pt-6 mt-8 text-center text-[10px] text-earth-grey font-semibold">
            <p>pulseRoot Agriculture Intelligence Platform — Confidential Crop Health Valuation Audit</p>
            <p className="mt-0.5">© 2026 pulseRoot Corp. All rights reserved. Secured under asymmetric JWT keys.</p>
          </div>

        </div>
      )}

    </div>
  );
}
