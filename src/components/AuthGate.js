'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useStore } from '@/lib/useStore';

export default function AuthGate({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, setUser, setDevices } = useStore();

  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  // Auto session checker on mount
  useEffect(() => {
    async function checkSession() {
      try {
        // Try to fetch device lists. If it returns 200, we are already authorized!
        const res = await fetch('/api/device/register');
        if (res.ok) {
          const data = await res.json();
          
          // Fetch real user info from the session
          const userRes = await fetch('/api/auth/login');
          if (userRes.ok) {
            const userData = await userRes.json();
            if (userData.success && userData.user) {
              setUser(userData.user);
            } else {
              setUser({ id: 'user-001', name: 'Grower Admin', email: 'admin@antigravity.ag', role: 'admin' });
            }
          } else {
            setUser({ id: 'user-001', name: 'Grower Admin', email: 'admin@antigravity.ag', role: 'admin' });
          }
          setDevices(data.devices || []);
        }
      } catch (err) {
        console.warn('Session check failed:', err);
      } finally {
        setCheckingSession(false);
      }
    }
    checkSession();
  }, [setUser, setDevices, pathname, router]);



  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/signup';
    const payload = isLogin ? { email, password } : { name, email, password };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.message || 'Authentication handshake failed.');
        setLoading(false);
        return;
      }

      setUser(data.user);

      // Instantly load user's devices
      const devRes = await fetch('/api/device/register');
      if (devRes.ok) {
        const devData = await devRes.json();
        setDevices(devData.devices || []);
      }

      router.push('/dashboard');
      
    } catch (err) {
      console.error('Auth error:', err);
      setError('Connection to security gateway timed out.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    setError('');
    const width = 500;
    const height = 650;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    const popup = window.open(
      '/api/auth/google/signin',
      'GoogleSignIn',
      `width=${width},height=${height},left=${left},top=${top},status=no,resizable=yes`
    );

    const handleMessage = async (event) => {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type === 'GOOGLE_AUTH_SUCCESS') {
        setUser(event.data.user);

        // Load user's devices
        const devRes = await fetch('/api/device/register');
        if (devRes.ok) {
          const devData = await devRes.json();
          setDevices(devData.devices || []);
        }

        window.removeEventListener('message', handleMessage);
        if (popup) popup.close();

        router.push('/dashboard');
      } else if (event.data?.type === 'GOOGLE_AUTH_FAILURE') {
        setError(event.data.message || 'Google authentication failed.');
        window.removeEventListener('message', handleMessage);
        if (popup) popup.close();
      }
    };

    window.addEventListener('message', handleMessage);
  };

  if (checkingSession) {
    return (
      <div className="w-full min-h-screen bg-background flex flex-col items-center justify-center p-6 text-primary">
        <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin mb-4"></div>
        <span className="text-xs font-bold tracking-widest uppercase">Connecting to Security Gateway...</span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="w-full min-h-screen bg-background flex items-center justify-center p-6 relative overflow-hidden">
        
        {/* Dynamic organic backdrop shapes */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-secondary/15 filter blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-terracotta/10 filter blur-3xl animate-pulse delay-700"></div>

        <div className="w-full max-w-md glass-panel rounded-3xl border border-sand/40 p-8 shadow-2xl relative z-10">
          
          {/* Brand Header */}
          <div className="flex flex-col items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-2xl organic-gradient flex items-center justify-center shadow-lg shadow-primary/20">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-sand" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div className="text-center">
              <h2 className="text-xl font-extrabold text-dark tracking-wide font-sans leading-none">Security Authentication</h2>
              <p className="text-[10px] text-primary/75 tracking-wider font-semibold uppercase mt-1">IoT Gateway Access Control</p>
            </div>
          </div>

          {/* Selector Tabs */}
          <div className="grid grid-cols-2 p-1 bg-sand/30 rounded-xl mb-6 border border-sand/40">
            <button
              onClick={() => { setIsLogin(true); setError(''); }}
              className={`py-2 rounded-lg text-xs font-bold transition-all duration-300 ${
                isLogin ? 'bg-sand text-primary shadow-sm' : 'text-primary/70 hover:text-primary'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setIsLogin(false); setError(''); }}
              className={`py-2 rounded-lg text-xs font-bold transition-all duration-300 ${
                !isLogin ? 'bg-sand text-primary shadow-sm' : 'text-primary/70 hover:text-primary'
              }`}
            >
              Register
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            
            {error && (
              <div className="p-3 rounded-xl bg-terracotta/10 border border-terracotta/20 text-terracotta text-xs font-semibold leading-relaxed flex items-start gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                {error}
              </div>
            )}

            {!isLogin && (
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase tracking-wider font-bold text-primary/70">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="John Grower"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-sand bg-sand/20 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 text-primary font-medium transition-all"
                />
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase tracking-wider font-bold text-primary/70">Email Address</label>
              <input
                type="email"
                required
                placeholder="grower@antigravity.ag"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-sand bg-sand/20 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 text-primary font-medium transition-all"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase tracking-wider font-bold text-primary/70">Secret Password</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-sand bg-sand/20 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 text-primary font-medium transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl organic-gradient text-sand font-bold text-sm tracking-wide shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 rounded-full border-2 border-sand/35 border-t-sand animate-spin"></div>
              ) : (
                isLogin ? 'Authorize Connection' : 'Generate Operator Account'
              )}
            </button>

            {/* Google OAuth Action */}
            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-primary/10"></div>
              <span className="flex-shrink mx-4 text-[9px] text-earth-grey uppercase font-bold tracking-widest">Or</span>
              <div className="flex-grow border-t border-primary/10"></div>
            </div>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              className="w-full py-3 rounded-xl bg-white hover:bg-neutral-50 text-[#1F1F1F] font-bold text-xs tracking-wider uppercase border border-neutral-300 transition-all duration-300 flex items-center justify-center gap-2.5 shadow-sm hover:shadow"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>

          </form>

        </div>
      </div>
    );
  }

  return children;
}
