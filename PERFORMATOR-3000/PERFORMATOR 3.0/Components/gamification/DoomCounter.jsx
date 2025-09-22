import React from 'react';

export default function DoomCounter({ count = 0 }) {
  const safeCount = Math.max(0, Math.min(count, 3));

  const barColors = {
    0: 'bg-green-500',
    1: 'bg-yellow-500',
    2: 'bg-orange-500',
    3: 'bg-red-500',
  };
  
  const textColors = {
    0: 'text-green-600 dark:text-green-400',
    1: 'text-yellow-600 dark:text-yellow-400',
    2: 'text-orange-600 dark:text-orange-400',
    3: 'text-red-600 dark:text-red-400',
  };

  return (
    <div>
      <div className="flex w-full h-2.5 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700/60 space-x-0.5 p-0.5">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className={`w-1/3 h-full rounded-sm transition-colors duration-300 ${
              safeCount > i ? barColors[safeCount] : ''
            }`}
          />
        ))}
      </div>
       <p className={`text-center text-xs font-bold italic mt-1 ${textColors[safeCount]}`}>
        {safeCount} / 3
      </p>
    </div>
  );
}