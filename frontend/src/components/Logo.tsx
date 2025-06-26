import React from 'react';
import AnimatedBeeLogo from './AnimatedBeeLogo';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showText?: boolean;
}

const textSizeClasses = {
  sm: 'text-lg',
  md: 'text-xl',
  lg: 'text-2xl'
};

export const Logo: React.FC<LogoProps> = ({ 
  size = 'md', 
  className = '', 
  showText = true 
}) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <AnimatedBeeLogo size={size} />
      {showText && (
        <span className={`font-bold ${textSizeClasses[size]} text-gray-900 dark:text-white`}>
          BuzzChat
        </span>
      )}
    </div>
  );
};

export default Logo; 