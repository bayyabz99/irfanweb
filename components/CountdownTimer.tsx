'use client';

import React, { useState, useEffect } from 'react';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function SquareCountdownCard({ value, label }: { value: number | string; label: string }) {
  return (
    <div className="group relative flex flex-col items-center justify-center w-full py-2.5 sm:py-3.5 px-1.5 sm:px-2 rounded-xl sm:rounded-2xl bg-gradient-to-b from-[#092542]/85 via-[#051829]/90 to-[#030e18]/95 backdrop-blur-md border border-[#4DA3FF]/25 hover:border-[#4DA3FF]/70 shadow-lg shadow-black/40 hover:shadow-[0_8px_24px_rgba(77,163,255,0.22)] hover:-translate-y-0.5 transition-all duration-300 select-none overflow-hidden min-h-[64px] sm:min-h-[80px]">
      {/* Top subtle ambient highlight line */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#4DA3FF]/60 to-transparent" />
      
      {/* Corner subtle glow on hover */}
      <div className="absolute inset-0 bg-radial-gradient from-[#4DA3FF]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

      {/* Value (Large bold white serif number) */}
      <span className="relative z-10 text-xl xs:text-2xl sm:text-3xl md:text-4xl font-serif font-black text-white tracking-tight leading-none drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
        {typeof value === 'number' ? String(value).padStart(2, '0') : value}
      </span>

      {/* Label (Clean uppercase subtitle) */}
      <span className="relative z-10 text-[9px] xs:text-[10px] sm:text-xs md:text-sm font-sans font-semibold text-[#8EC5E5] group-hover:text-[#b2daf0] mt-1 sm:mt-1.5 tracking-wider uppercase transition-colors drop-shadow-sm">
        {label}
      </span>
    </div>
  );
}

export default function CountdownTimer({ 
  targetDate = '2026-10-23T09:00:00+03:00'
}: { 
  targetDate?: string;
  countdownText?: string;
}) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 41,
    hours: 16,
    minutes: 22,
    seconds: 20
  });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const calculateTimeLeft = (): TimeLeft => {
      const difference = +new Date(targetDate) - +new Date();
      if (difference <= 0) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      }

      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60)
      };
    };

    setTimeLeft(calculateTimeLeft());
    const interval = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  if (!mounted) {
    return (
      <div className="w-full max-w-lg">
        <div className="grid grid-cols-4 gap-2.5 sm:gap-3.5 w-full max-w-md">
          {['Gün', 'Saat', 'Dakika', 'Saniye'].map((label, idx) => (
            <SquareCountdownCard key={idx} value="--" label={label} />
          ))}
        </div>
      </div>
    );
  }

  const items = [
    { label: 'Gün', value: timeLeft.days },
    { label: 'Saat', value: timeLeft.hours },
    { label: 'Dakika', value: timeLeft.minutes },
    { label: 'Saniye', value: timeLeft.seconds },
  ];

  return (
    <div className="w-full max-w-lg">
      {/* 4 Modern Square Countdown Cards */}
      <div className="grid grid-cols-4 gap-2.5 sm:gap-3.5 w-full max-w-md">
        {items.map((item, idx) => (
          <SquareCountdownCard key={idx} value={item.value} label={item.label} />
        ))}
      </div>
    </div>
  );
}
