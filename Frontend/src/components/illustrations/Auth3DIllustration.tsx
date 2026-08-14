import React from 'react';
import { motion } from 'framer-motion';

export const Auth3DIllustration: React.FC = () => {
  return (
    <div className="relative w-full max-w-md aspect-square flex items-center justify-center">
      {/* Background Soft Glow Circles */}
      <div className="absolute inset-0 bg-blue-400/20 rounded-full blur-3xl transform -translate-y-4 scale-90" />
      <div className="absolute w-72 h-72 bg-indigo-300/30 rounded-full blur-2xl transform translate-x-8 translate-y-8" />
      
      {/* Animated Floating Graphic Container */}
      <motion.div 
        animate={{ 
          y: [-8, 8, -8],
          rotate: [-0.5, 0.5, -0.5]
        }}
        transition={{ 
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="relative z-10 w-full h-full flex items-center justify-center p-4"
      >
        <svg viewBox="0 0 500 400" className="w-full h-auto drop-shadow-2xl overflow-visible">
          <defs>
            <linearGradient id="screenGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#eff6ff" />
            </linearGradient>
            <linearGradient id="headerGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#2563eb" />
            </linearGradient>
            <linearGradient id="pieGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#1d4ed8" />
            </linearGradient>
            <linearGradient id="pieGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#0891b2" />
            </linearGradient>
            <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="12" stdDeviation="16" floodColor="#1e3a8a" floodOpacity="0.12" />
            </filter>
            <filter id="pillShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#2563eb" floodOpacity="0.15" />
            </filter>
          </defs>

          {/* Background Oval Base Platform */}
          <ellipse cx="250" cy="220" rx="190" ry="120" fill="#dbeafe" opacity="0.6" />
          <ellipse cx="250" cy="220" rx="160" ry="100" fill="#bfdbfe" opacity="0.8" />

          {/* Floating 3D Elements background */}
          {/* Top Left Pie Slice */}
          <motion.g
            animate={{ y: [-4, 4, -4] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            <path d="M 120 70 L 145 90 A 25 25 0 0 0 160 65 Z" fill="#2563eb" />
            <path d="M 120 70 L 160 65 A 25 25 0 0 0 135 45 Z" fill="#60a5fa" />
          </motion.g>

          {/* Top Right Floating Sphere */}
          <circle cx="365" cy="85" r="10" fill="#3b82f6" />

          {/* Center Main Screen Monitor Card */}
          <g filter="url(#softShadow)">
            <rect x="110" y="100" width="280" height="180" rx="18" fill="url(#screenGrad)" stroke="#bfdbfe" strokeWidth="3" />
            
            {/* Screen Header Bar */}
            <rect x="110" y="100" width="280" height="32" rx="18" fill="#ffffff" />
            <line x1="110" y1="132" x2="390" y2="132" stroke="#e2e8f0" strokeWidth="2" />
            
            {/* Window buttons */}
            <circle cx="132" cy="116" r="4" fill="#ef4444" />
            <circle cx="144" cy="116" r="4" fill="#f59e0b" />
            <circle cx="156" cy="116" r="4" fill="#10b981" />
            
            {/* Horizontal Line Mockups */}
            <rect x="175" y="112" width="70" height="8" rx="4" fill="#cbd5e1" />
            <rect x="345" y="110" width="30" height="12" rx="3" fill="#e2e8f0" />
            
            {/* Screen Content: Left Lines */}
            <rect x="130" y="148" width="80" height="8" rx="4" fill="#3b82f6" />
            <rect x="130" y="164" width="60" height="6" rx="3" fill="#94a3b8" />
            
            <rect x="130" y="180" width="90" height="8" rx="4" fill="#10b981" />
            <rect x="130" y="196" width="100" height="12" rx="6" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="1.5" />
            
            {/* Screen Content: Right Donut Chart */}
            <circle cx="310" cy="180" r="32" fill="none" stroke="#e2e8f0" strokeWidth="12" />
            <circle cx="310" cy="180" r="32" fill="none" stroke="url(#pieGrad1)" strokeWidth="12" strokeDasharray="140 200" strokeDashoffset="20" />
            <circle cx="310" cy="180" r="32" fill="none" stroke="#22c55e" strokeWidth="12" strokeDasharray="50 200" strokeDashoffset="-120" />
          </g>

          {/* Floating Left Character (Student/Admin holding bar chart card) */}
          <g filter="url(#pillShadow)">
            {/* Body */}
            <rect x="90" y="180" width="36" height="50" rx="10" fill="#1e3a8a" />
            {/* Shirt */}
            <path d="M 90 200 L 126 200 L 126 230 L 90 230 Z" fill="#ffffff" />
            {/* Head */}
            <circle cx="108" cy="168" r="12" fill="#fed7aa" />
            {/* Hair */}
            <path d="M 96 166 C 96 156, 120 156, 120 166 Z" fill="#1e293b" />
            {/* Legs */}
            <rect x="96" y="230" width="10" height="35" rx="4" fill="#1e293b" />
            <rect x="110" y="230" width="10" height="35" rx="4" fill="#1e293b" />

            {/* Floating Mini Chart Card Held */}
            <rect x="65" y="200" width="45" height="35" rx="8" fill="#ffffff" stroke="#93c5fd" strokeWidth="2" />
            <rect x="73" y="220" width="6" height="10" rx="2" fill="#3b82f6" />
            <rect x="83" y="214" width="6" height="16" rx="2" fill="#2563eb" />
            <rect x="93" y="208" width="6" height="22" rx="2" fill="#1d4ed8" />
          </g>

          {/* Floating Right Character (Teacher holding notification card) */}
          <g filter="url(#pillShadow)">
            {/* Body */}
            <rect x="365" y="180" width="36" height="50" rx="10" fill="#2563eb" />
            {/* Shirt */}
            <path d="M 365 200 L 401 200 L 401 230 L 365 230 Z" fill="#ffffff" />
            {/* Head */}
            <circle cx="383" cy="168" r="12" fill="#fde68a" />
            {/* Hair */}
            <path d="M 371 166 C 371 156, 395 156, 395 166 Z" fill="#475569" />
            {/* Legs */}
            <rect x="371" y="230" width="10" height="35" rx="4" fill="#0f172a" />
            <rect x="385" y="230" width="10" height="35" rx="4" fill="#0f172a" />

            {/* Held Card */}
            <rect x="390" y="195" width="40" height="28" rx="6" fill="#ffffff" stroke="#93c5fd" strokeWidth="2" />
            <rect x="396" y="203" width="28" height="4" rx="2" fill="#3b82f6" />
            <rect x="396" y="211" width="18" height="4" rx="2" fill="#94a3b8" />
          </g>

          {/* Bottom Floating 3D Bar Blocks */}
          <g>
            <rect x="180" y="250" width="20" height="40" rx="6" fill="#1d4ed8" />
            <rect x="205" y="230" width="20" height="60" rx="6" fill="#2563eb" />
            <rect x="230" y="260" width="20" height="30" rx="6" fill="#3b82f6" />
            <rect x="255" y="240" width="20" height="50" rx="6" fill="#60a5fa" />
          </g>

          {/* Floating Pill Checkmark Badge */}
          <g filter="url(#pillShadow)">
            <rect x="220" y="210" width="75" height="24" rx="12" fill="#ffffff" stroke="#bfdbfe" strokeWidth="1.5" />
            <circle cx="232" cy="222" r="7" fill="#22c55e" />
            <path d="M 229 222 L 231 224 L 235 220" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <rect x="244" y="219" width="40" height="6" rx="3" fill="#475569" />
          </g>
        </svg>
      </motion.div>
    </div>
  );
};
