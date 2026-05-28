'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useStore } from '@/lib/useStore';

const PlantGrowAnimation = () => {
  const [stage, setStage] = useState(0); // 0: Seed, 1: Sprout, 2: Sapling, 3: Tree
  
  useEffect(() => {
    const timer = setInterval(() => {
      setStage((prev) => (prev + 1) % 4);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const stages = [
    { label: 'Seed', desc: 'Moisture synced' },
    { label: 'Sprouting', desc: 'Photosynthesis active' },
    { label: 'Sapling', desc: 'Cellular growth' },
    { label: 'Mature Tree', desc: 'PulseRoot complete' }
  ];

  return (
    <div className="p-4 rounded-[24px] bg-white/10 border border-white/10 flex flex-col items-center gap-3 relative shadow-md overflow-hidden text-center">
      <span className="text-[9px] uppercase tracking-widest font-extrabold text-[#FCEDE8]/75 leading-none">Plant Growth Simulator</span>
      
      {/* SVG Canvas for plant growing */}
      <div className="w-full h-24 relative flex items-center justify-center">
        
        {/* Ground */}
        <div className="absolute bottom-2 w-3/4 h-1.5 bg-[#8B7B75]/40 rounded-full"></div>
        
        {/* Stage 0: Seed */}
        {stage === 0 && (
          <div className="absolute bottom-2.5 flex flex-col items-center animate-bounce">
            <div className="w-3.5 h-3 bg-[#B55441] rounded-full border border-white/20"></div>
          </div>
        )}

        {/* Stage 1: Sprout */}
        {stage === 1 && (
          <svg className="w-16 h-16 absolute bottom-2" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M50 95 C50 70, 45 60, 50 40" stroke="#FAF3EF" strokeWidth="4" strokeLinecap="round" className="animate-pulse" />
            <path d="M50 40 C45 35, 35 38, 32 45" stroke="#FAF3EF" strokeWidth="3.5" strokeLinecap="round" />
            <path d="M50 45 C55 40, 65 42, 68 50" stroke="#FAF3EF" strokeWidth="3.5" strokeLinecap="round" />
          </svg>
        )}

        {/* Stage 2: Sapling */}
        {stage === 2 && (
          <svg className="w-16 h-16 absolute bottom-2" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M50 95 C50 50, 48 40, 50 15" stroke="#FAF3EF" strokeWidth="4" strokeLinecap="round" />
            {/* Branches */}
            <path d="M50 55 C40 45, 30 50, 25 60" stroke="#FAF3EF" strokeWidth="3" strokeLinecap="round" />
            <path d="M50 40 C60 30, 70 35, 75 45" stroke="#FAF3EF" strokeWidth="3" strokeLinecap="round" />
            {/* Small leaves */}
            <circle cx="25" cy="60" r="3.5" fill="#C86B4F" />
            <circle cx="75" cy="45" r="3.5" fill="#C86B4F" />
            <circle cx="50" cy="15" r="4.5" fill="#FAF3EF" />
          </svg>
        )}

        {/* Stage 3: Mature Tree */}
        {stage === 3 && (
          <svg className="w-20 h-20 absolute bottom-2" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Trunk */}
            <path d="M50 95 C50 60, 50 40, 50 30" stroke="#FAF3EF" strokeWidth="5" strokeLinecap="round" />
            {/* Primary Branches */}
            <path d="M50 65 C40 50, 25 55, 20 70" stroke="#FAF3EF" strokeWidth="3.5" strokeLinecap="round" />
            <path d="M50 50 C60 35, 75 40, 80 55" stroke="#FAF3EF" strokeWidth="3.5" strokeLinecap="round" />
            <path d="M50 40 C45 25, 30 20, 35 10" stroke="#FAF3EF" strokeWidth="3.5" strokeLinecap="round" />
            
            {/* Dynamic Foliage / Canopy */}
            <circle cx="50" cy="25" r="12" fill="#FAF3EF" opacity="0.9" />
            <circle cx="35" cy="15" r="10" fill="#FAF3EF" opacity="0.85" />
            <circle cx="65" cy="22" r="9" fill="#C86B4F" opacity="0.9" />
            <circle cx="20" cy="70" r="6" fill="#C86B4F" opacity="0.9" />
            <circle cx="80" cy="55" r="6" fill="#FAF3EF" opacity="0.9" />
          </svg>
        )}

      </div>

      <div className="flex flex-col mt-1">
        <span className="text-sm font-extrabold leading-none text-white transition-all duration-500">{stages[stage].label}</span>
        <span className="text-[9px] font-bold text-[#FCEDE8]/60 mt-1">{stages[stage].desc}</span>
      </div>

    </div>
  );
};

export default function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useStore();

  const links = [
    { href: '/dashboard', label: 'Dashboard', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' },
    { href: '/chatbot', label: 'Plants', icon: 'M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z' },
    { href: '/alerts', label: 'Alerts', icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9' },
    { href: '/ai-analysis', label: 'Reports', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' }
  ];

  const handleLogoutClick = async () => {
    try {
      await fetch('/api/auth/login', { method: 'DELETE' });
      logout();
      router.push('/');
    } catch (e) {
      console.error('Logout error:', e);
    }
  };

  // Only render on dashboard/subpages, NOT on homepage `/`
  if (pathname === '/' || pathname === '/api/auth/google/signin') return null;

  return (
    <aside className="w-64 bg-[#1C3B2B] text-[#FCEDE8] shrink-0 h-screen flex flex-col justify-between p-6 select-none border-r border-[#1C3B2B]/20">
      
      <div className="flex flex-col gap-8">
        
        {/* Brand Logo Header */}
        <Link href="/dashboard" className="flex items-center gap-3.5 group pb-4 border-b border-white/10">
          <div className="w-10 h-10 rounded-full border-2 border-[#FCEDE8] flex items-center justify-center transition-transform duration-300 group-hover:rotate-12 bg-white/10 shadow-inner">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#FCEDE8" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="w-5.5 h-5.5">
              <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 20 2c1 5.5-2.2 14.5-9 18Z" />
              <path d="M9 22v-4.5" />
              <path d="M14 17.5c-3-1.5-4-3.5-4-3.5" />
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="font-sans font-extrabold text-[17px] tracking-tight leading-none">PulseRoot</span>
            <span className="text-[8px] text-[#FCEDE8]/75 tracking-wider uppercase font-bold mt-1">Smart Plant Intelligence</span>
          </div>
        </Link>

        {/* Sidebar Nav Links */}
        <nav className="flex flex-col gap-1.5">
          {links.map((link) => {
            const isActive = pathname === link.href || (link.label === 'Reports' && pathname === '/ai-analysis') || (link.label === 'Plants' && pathname === '/chatbot');
            return (
              <Link
                key={link.label}
                href={link.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold tracking-wide transition-all duration-200 ${
                  isActive
                    ? 'bg-white/15 text-white shadow-inner font-extrabold'
                    : 'text-[#FCEDE8]/80 hover:text-white hover:bg-white/5'
                }`}
              >
                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" d={link.icon}></path>
                </svg>
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="flex flex-col gap-6">
        
        <PlantGrowAnimation />

        {/* User Signout Button */}
        <button
          onClick={handleLogoutClick}
          className="w-full py-3 rounded-2xl bg-white/5 hover:bg-white/10 text-xs font-bold tracking-wide uppercase transition-all duration-200 border border-white/10 text-center flex items-center justify-center gap-2 cursor-pointer"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Sign Out
        </button>

      </div>

    </aside>
  );
}
