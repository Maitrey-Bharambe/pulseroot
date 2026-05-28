'use client';

import React, { useRef, useEffect } from 'react';

export default function PlantCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    let animationId;
    let w = (canvas.width = canvas.offsetWidth);
    let h = (canvas.height = canvas.offsetHeight);

    const particles = [];
    const particleCount = 35;

    // Initialize glowing chlorophyll particles
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        size: Math.random() * 3 + 2,
        color: i % 3 === 0 ? 'rgba(181, 84, 65, 0.25)' : 'rgba(74, 94, 43, 0.3)', // terracotta & green mix
        pulseSpeed: 0.02 + Math.random() * 0.03,
        pulseVal: Math.random()
      });
    }

    const resize = () => {
      if (!canvas) return;
      w = canvas.width = canvas.offsetWidth;
      h = canvas.height = canvas.offsetHeight;
    };
    window.addEventListener('resize', resize);

    const draw = () => {
      ctx.clearRect(0, 0, w, h);

      // Render flowing abstract vines
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(74, 94, 43, 0.12)';
      ctx.lineWidth = 3;
      ctx.moveTo(w * 0.7, h);
      ctx.bezierCurveTo(
        w * 0.6, h * 0.7,
        w * 0.8, h * 0.4,
        w * 0.65, h * 0.1
      );
      ctx.stroke();

      ctx.beginPath();
      ctx.strokeStyle = 'rgba(181, 84, 65, 0.08)';
      ctx.lineWidth = 1.5;
      ctx.moveTo(w * 0.73, h * 0.65);
      ctx.quadraticCurveTo(w * 0.55, h * 0.5, w * 0.45, h * 0.55);
      ctx.moveTo(w * 0.68, h * 0.35);
      ctx.quadraticCurveTo(w * 0.88, h * 0.25, w * 0.82, h * 0.18);
      ctx.stroke();

      // Update and draw chlorophyll energy nodes
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        p.pulseVal += p.pulseSpeed;
        const scale = 0.7 + Math.abs(Math.sin(p.pulseVal)) * 0.6;

        // Wrap-around screen bounds
        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        if (p.y > h) p.y = 0;

        ctx.beginPath();
        ctx.fillStyle = p.color;
        ctx.arc(p.x, p.y, p.size * scale, 0, Math.PI * 2);
        ctx.fill();

        // Secondary ambient glow ring
        ctx.beginPath();
        ctx.fillStyle = p.color.replace('0.3', '0.08').replace('0.25', '0.05');
        ctx.arc(p.x, p.y, p.size * 3.5 * scale, 0, Math.PI * 2);
        ctx.fill();
      });

      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-0" />;
}
