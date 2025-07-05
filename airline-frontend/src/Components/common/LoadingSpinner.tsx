import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'white' | 'airline' | 'gray' | 'success' | 'warning' | 'error';
  text?: string;
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  color = 'airline', 
  text,
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  const colorClasses = {
    white: 'border-white border-t-transparent',
    airline: 'border-airline-600 border-t-transparent',
    gray: 'border-gray-600 border-t-transparent',
    success: 'border-success-600 border-t-transparent',
    warning: 'border-warning-600 border-t-transparent',
    error: 'border-error-600 border-t-transparent'
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="flex items-center space-x-3">
        <div
          className={`${sizeClasses[size]} border-2 rounded-full animate-spin ${colorClasses[color]}`}
        />
        {text && (
          <span className="text-sm font-medium text-gray-700">{text}</span>
        )}
      </div>
    </div>
  );
};

export default LoadingSpinner; 