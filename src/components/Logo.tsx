import { cn } from '@/lib/utils';
import washLabLogo from '@/assets/washlab-logo.png';

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const Logo = ({ className, showText = true, size = 'md' }: LogoProps) => {
  const sizeClasses = {
    sm: 'h-8',
    md: 'h-10',
    lg: 'h-14',
  };

  return (
    <div className={cn('flex items-center', className)}>
      <img 
        src={washLabLogo} 
        alt="WashLab - Life made simple" 
        className={cn(sizeClasses[size], 'w-auto')}
      />
    </div>
  );
};
