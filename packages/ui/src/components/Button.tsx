import React from 'react';
import { cn } from '../lib/utils';
import { LoadingSpinner } from './LoadingSpinner';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  className,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center rounded-xl font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-[#2D69B3] text-white hover:bg-[#122F5A] focus:ring-[#2D69B3]',
    secondary: 'bg-[#F5F7FA] text-[#122F5A] hover:bg-[#E5E7EB] focus:ring-[#2D69B3]',
    outline: 'border-2 border-[#2D69B3] text-[#2D69B3] hover:bg-[#2D69B3] hover:text-white focus:ring-[#2D69B3]',
    ghost: 'text-[#122F5A] hover:bg-[#F5F7FA] focus:ring-[#2D69B3]',
    danger: 'bg-[#E6393F] text-white hover:bg-[#A11E2D] focus:ring-[#E6393F]',
  };
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };
  
  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <LoadingSpinner size="sm" className="mr-2" />}
      {children}
    </button>
  );
};
