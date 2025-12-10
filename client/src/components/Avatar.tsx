import { cn } from '@/lib/utils';

interface AvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

// deterministic color from name
const getColorFromName = (name: string): string => {
  const colors = [
    'bg-blue-500',
    'bg-green-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-indigo-500',
    'bg-teal-500',
    'bg-orange-500',
    'bg-cyan-500',
  ];
  const index = name.charCodeAt(0) % colors.length;
  return colors[index];
};

const sizeClasses = {
  sm: 'h-8 w-8 text-sm',
  md: 'h-10 w-10 text-base',
  lg: 'h-16 w-16 text-2xl',
};

export default function Avatar({
  name,
  size = 'md',
  className,
}: AvatarProps): JSX.Element {
  const initial = name.charAt(0).toUpperCase();
  const bgColor = getColorFromName(name);

  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-full text-white font-semibold',
        bgColor,
        sizeClasses[size],
        className
      )}
    >
      {initial}
    </div>
  );
}
