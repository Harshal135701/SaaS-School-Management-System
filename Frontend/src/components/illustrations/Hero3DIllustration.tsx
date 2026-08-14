import React from 'react';
import { motion } from 'framer-motion';

export const Hero3DIllustration: React.FC = () => {
  return (
    <div className="relative w-48 h-36 md:w-64 md:h-44 flex items-center justify-center">
      <motion.div 
        animate={{ y: [-4, 4, -4] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="w-full h-full flex items-center justify-center"
      >
        <svg viewBox="0 0 320 220" className="w-full h-full drop-shadow-xl overflow-visible">
          <defs>
            <linearGradient id="heroScreenGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#eff6ff" />
            </linearGradient>
            <linearGradient id="heroBlueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#60a5fa" />
              <stop offset="100%" stopColor="#2563eb" />
            </linearGradient>
            <filter id="heroShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="8" stdDeviation="10" floodColor="#000000" floodOpacity="0.15" />
            </filter>
          </defs>

          {/* Oval Shadow Floor */}
          <ellipse cx="160" cy="180" rx="120" ry="25" fill="#1e40af" opacity="0.3" />

          {/* Central Glass Card */}
          <g filter="url(#heroShadow)">
            <rect x="70" y="35" width="180" height="120" rx="14" fill="url(#heroScreenGrad)" stroke="#93c5fd" strokeWidth="2" />
            
            {/* Header */}
            <rect x="70" y="35" width="180" height="24" rx="14" fill="#ffffff" />
            <line x1="70" y1="59" x2="250" y2="59" stroke="#cbd5e1" strokeWidth="1" />
            <circle cx="84" cy="47" r="3" fill="#ef4444" />
            <circle cx="93" cy="47" r="3" fill="#f59e0b" />
            <circle cx="102" cy="47" r="3" fill="#10b981" />
            
            {/* Mini Donut Chart inside Screen */}
            <circle cx="195" cy="95" r="22" fill="none" stroke="#e2e8f0" strokeWidth="8" />
            <circle cx="195" cy="95" r="22" fill="none" stroke="#2563eb" strokeWidth="8" strokeDasharray="100 150" strokeDashoffset="10" />
            <circle cx="195" cy="95" r="22" fill="none" stroke="#10b981" strokeWidth="8" strokeDasharray="30 150" strokeDashoffset="-90" />

            {/* Dashboard Lines */}
            <rect x="85" y="70" width="55" height="6" rx="3" fill="#3b82f6" />
            <rect x="85" y="82" width="40" height="5" rx="2.5" fill="#94a3b8" />
            <rect x="85" y="95" width="65" height="6" rx="3" fill="#10b981" />
            <rect x="85" y="107" width="50" height="5" rx="2.5" fill="#cbd5e1" />
          </g>

          {/* Floating Left Character */}
          <g>
            <circle cx="50" cy="85" r="9" fill="#fde68a" />
            <rect x="38" y="96" width="24" height="35" rx="6" fill="#1d4ed8" />
            <rect x="42" y="131" width="7" height="25" rx="3" fill="#0f172a" />
            <rect x="51" y="131" width="7" height="25" rx="3" fill="#0f172a" />
            {/* Holding Card */}
            <rect x="25" y="105" width="24" height="20" rx="4" fill="#ffffff" stroke="#60a5fa" strokeWidth="1.5" />
            <rect x="29" y="110" width="16" height="3" rx="1.5" fill="#2563eb" />
            <rect x="29" y="116" width="10" height="3" rx="1.5" fill="#94a3b8" />
          </g>

          {/* Floating Right Character */}
          <g>
            <circle cx="270" cy="85" r="9" fill="#fed7aa" />
            <rect x="258" y="96" width="24" height="35" rx="6" fill="#3b82f6" />
            <rect x="262" y="131" width="7" height="25" rx="3" fill="#1e293b" />
            <rect x="271" y="131" width="7" height="25" rx="3" fill="#1e293b" />
            {/* Holding Card */}
            <rect x="270" y="105" width="24" height="20" rx="4" fill="#ffffff" stroke="#93c5fd" strokeWidth="1.5" />
            <rect x="274" y="110" width="16" height="3" rx="1.5" fill="#10b981" />
            <rect x="274" y="116" width="12" height="3" rx="1.5" fill="#cbd5e1" />
          </g>

          {/* 3D Pillars in foreground */}
          <rect x="125" y="135" width="14" height="35" rx="4" fill="#1d4ed8" />
          <rect x="144" y="125" width="14" height="45" rx="4" fill="#2563eb" />
          <rect x="163" y="145" width="14" height="25" rx="4" fill="#3b82f6" />
        </svg>
      </motion.div>
    </div>
  );
};
