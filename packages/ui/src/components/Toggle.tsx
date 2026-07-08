import React from 'react';
import { cn } from '../lib/utils';

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
  'aria-label'?: string;
}

export const Toggle: React.FC<ToggleProps> = ({
  checked,
  onChange,
  disabled = false,
  className,
  'aria-label': ariaLabel,
}) => {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative w-12 h-6 rounded-full transition-colors duration-200',
        'focus:outline-none focus:ring-2 focus:ring-[#2D69B3] focus:ring-offset-2',
        checked ? 'bg-[#2D69B3]' : 'bg-gray-300 dark:bg-gray-600',
        disabled && 'opacity-50 cursor-not-allowed',
        !disabled && 'cursor-pointer',
        className
      )}
    >
      <span
        className={cn(
          'absolute top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200',
          checked ? 'right-1' : 'left-1'
        )}
      />
    </button>
  );
};
