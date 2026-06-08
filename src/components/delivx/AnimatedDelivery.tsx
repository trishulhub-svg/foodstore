'use client'

import React from 'react'
import { motion } from 'framer-motion'

export default function AnimatedDelivery({ className = '' }: { className?: string }) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Dotted path */}
      <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2">
        <svg width="100%" height="4" className="opacity-30">
          <line
            x1="0"
            y1="2"
            x2="100%"
            y2="2"
            stroke="#f97316"
            strokeWidth="2"
            strokeDasharray="8 6"
          >
            <animate
              attributeName="strokeDashoffset"
              from="0"
              to="-28"
              dur="1s"
              repeatCount="indefinite"
            />
          </line>
        </svg>
      </div>

      {/* Delivery bike */}
      <motion.div
        className="relative z-10"
        animate={{ x: ['-10%', '110%'] }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: 'linear',
          repeatDelay: 2,
        }}
      >
        <svg width="80" height="48" viewBox="0 0 80 48" fill="none">
          {/* Rear wheel */}
          <circle cx="20" cy="36" r="10" stroke="#f97316" strokeWidth="2.5" fill="none">
            <animateTransform
              attributeName="transform"
              type="rotate"
              from="0 20 36"
              to="360 20 36"
              dur="0.6s"
              repeatCount="indefinite"
            />
          </circle>
          <circle cx="20" cy="36" r="2" fill="#f97316" />

          {/* Front wheel */}
          <circle cx="60" cy="36" r="10" stroke="#f97316" strokeWidth="2.5" fill="none">
            <animateTransform
              attributeName="transform"
              type="rotate"
              from="0 60 36"
              to="360 60 36"
              dur="0.6s"
              repeatCount="indefinite"
            />
          </circle>
          <circle cx="60" cy="36" r="2" fill="#f97316" />

          {/* Frame */}
          <path d="M20 36 L35 20 L55 20 L60 36" stroke="#ea580c" strokeWidth="2" fill="none" />
          <path d="M35 20 L20 36" stroke="#ea580c" strokeWidth="2" fill="none" />
          <path d="M35 20 L40 28 L55 20" stroke="#ea580c" strokeWidth="1.5" fill="none" />

          {/* Delivery box */}
          <rect x="30" y="8" width="16" height="14" rx="2" fill="#f97316" stroke="#ea580c" strokeWidth="1.5" />
          <text x="38" y="18" textAnchor="middle" fill="white" fontSize="6" fontWeight="bold">DX</text>

          {/* Handlebar */}
          <path d="M55 20 L62 16 M60 14 L64 18" stroke="#ea580c" strokeWidth="2" strokeLinecap="round" />

          {/* Exhaust smoke */}
          <circle cx="14" cy="32" r="2" fill="#d1d5db" opacity="0.4">
            <animate attributeName="cx" from="14" to="4" dur="1s" repeatCount="indefinite" />
            <animate attributeName="opacity" from="0.4" to="0" dur="1s" repeatCount="indefinite" />
            <animate attributeName="r" from="2" to="4" dur="1s" repeatCount="indefinite" />
          </circle>
          <circle cx="10" cy="30" r="1.5" fill="#d1d5db" opacity="0.3">
            <animate attributeName="cx" from="10" to="0" dur="1.2s" repeatCount="indefinite" />
            <animate attributeName="opacity" from="0.3" to="0" dur="1.2s" repeatCount="indefinite" />
            <animate attributeName="r" from="1.5" to="3.5" dur="1.2s" repeatCount="indefinite" />
          </circle>
        </svg>
      </motion.div>
    </div>
  )
}
