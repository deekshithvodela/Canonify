import React from 'react';

interface StethoscopeLogoProps {
  className?: string;
  size?: number;
}

export const StethoscopeLogo: React.FC<StethoscopeLogoProps> = ({ className = "w-6 h-6", size = 24 }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 32 32"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {/* Dual Eartips at top-right */}
      <circle cx="18" cy="4" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="25" cy="4" r="1.5" fill="currentColor" stroke="none" />

      {/* Binaural metal headset branching down to Y-stem */}
      <path d="M 18 5.5 C 18 8, 21.5 9, 21.5 11" />
      <path d="M 25 5.5 C 25 8, 21.5 9, 21.5 11" />

      {/* Flexible acoustic tubing sweeping in a bold, prominent 'C' curve */}
      <path d="M 21.5 11 C 13.5 11, 6 15, 6 21 C 6 27, 13.5 29, 21 29" />

      {/* Circular acoustic chestpiece (bell/diaphragm) completing the lower terminal of the C */}
      <circle cx="23.5" cy="28.5" r="2.5" fill="currentColor" />
      <circle cx="23.5" cy="28.5" r="1.1" fill="white" stroke="none" />
    </svg>
  );
};
