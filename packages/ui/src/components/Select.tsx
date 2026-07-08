import * as React from 'react';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  onValueChange?: (value: string) => void;
  value?: string;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className = '', onValueChange, value, children, ...props }, ref) => {
    return (
      <select
        ref={ref}
        className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2D69B3] ${className}`}
        value={value}
        onChange={(e) => onValueChange?.(e.target.value)}
        {...props}
      >
        {children}
      </select>
    );
  }
);

Select.displayName = 'Select';

const SelectTrigger = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className = '', children, ...props }, ref) => {
    return (
      <div ref={ref} className={`relative ${className}`} {...props}>
        {children}
      </div>
    );
  }
);

SelectTrigger.displayName = 'SelectTrigger';

const SelectValue = React.forwardRef<HTMLSpanElement, React.HTMLAttributes<HTMLSpanElement>>(
  ({ className = '', children, ...props }, ref) => {
    return (
      <span ref={ref} className={`block ${className}`} {...props}>
        {children}
      </span>
    );
  }
);

SelectValue.displayName = 'SelectValue';

const SelectContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className = '', children, ...props }, ref) => {
    return (
      <div ref={ref} className={`w-full ${className}`} {...props}>
        {children}
      </div>
    );
  }
);

SelectContent.displayName = 'SelectContent';

const SelectItem = React.forwardRef<HTMLOptionElement, React.OptionHTMLAttributes<HTMLOptionElement>>(
  ({ className = '', children, ...props }, ref) => {
    return (
      <option ref={ref} className={`px-3 py-2 ${className}`} {...props}>
        {children}
      </option>
    );
  }
);

SelectItem.displayName = 'SelectItem';

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem };
