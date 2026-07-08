import React from 'react';
import { cn } from '../lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className }) => {
  return (
    <div
      className={cn(
        'bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700',
        className
      )}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<CardProps> = ({ children, className }) => {
  return (
    <div className={cn('p-6 border-b border-gray-200 dark:border-gray-700', className)}>
      {children}
    </div>
  );
};

export const CardContent: React.FC<CardProps> = ({ children, className }) => {
  return <div className={cn('p-6', className)}>{children}</div>;
};

export const CardFooter: React.FC<CardProps> = ({ children, className }) => {
  return (
    <div className={cn('p-6 border-t border-gray-200 dark:border-gray-700', className)}>
      {children}
    </div>
  );
};
