import React from 'react';
import { cn } from '../lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  icon,
  className,
  ...props
}) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            {icon}
          </div>
        )}
        <input
          className={cn(
            'w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600',
            'bg-white dark:bg-gray-800 text-gray-900 dark:text-white',
            'focus:outline-none focus:ring-2 focus:ring-[#2D69B3] focus:border-transparent',
            'transition-all duration-200',
            icon && 'pl-10',
            error && 'border-[#E6393F] focus:ring-[#E6393F]',
            className
          )}
          {...props}
        />
      </div>
      {error && <p className="mt-1 text-sm text-[#E6393F]">{error}</p>}
    </div>
  );
};
