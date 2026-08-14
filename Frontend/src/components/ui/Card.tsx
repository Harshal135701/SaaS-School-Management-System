import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hoverLift?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  hoverLift = true,
  padding = 'md'
}) => {
  const paddingStyles = {
    none: 'p-0',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };

  return (
    <div
      className={`
        bg-white rounded-2xl border border-slate-100/80 subtle-shadow
        ${hoverLift ? 'hover-lift' : ''}
        ${paddingStyles[padding]}
        ${className}
      `}
    >
      {children}
    </div>
  );
};
