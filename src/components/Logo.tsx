import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const Logo = ({ className, showText = true, size = 'md' }: LogoProps) => {
  const sizeClasses = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-4xl',
  };

  const iconSizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
  };

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className={cn('relative', iconSizes[size])}>
        <div className="absolute inset-0 bg-gradient-primary rounded-xl rotate-6 opacity-80" />
        <div className="absolute inset-0 bg-gradient-primary rounded-xl flex items-center justify-center">
          <span className="text-primary-foreground font-display font-bold">W</span>
        </div>
      </div>
      {showText && (
        <span className={cn('font-display font-bold', sizeClasses[size])}>
          <span className="text-gradient">Wash</span>
          <span className="text-foreground">Lab</span>
        </span>
      )}
    </div>
  );
};
