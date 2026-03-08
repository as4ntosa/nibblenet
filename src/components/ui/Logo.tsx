import Image from 'next/image';
import { cn } from '@/lib/utils';

interface LogoProps {
  /** px size of the icon box */
  size?: number;
  /** Show 'NibbleNet' wordmark next to the icon */
  showName?: boolean;
  /** Show 'Fantastic Fantosa Corporations' sub-brand line */
  showBrand?: boolean;
  className?: string;
  /** Light variant — white text for dark backgrounds */
  light?: boolean;
}

/**
 * NibbleNet logo mark.
 * Icon: carrot-bunny illustration (public/logo.png)
 * Brand: Fantastic Fantosa Corporations
 */
export function Logo({
  size = 40,
  showName = true,
  showBrand = false,
  className,
  light = false,
}: LogoProps) {
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      {/* Icon */}
      <div
        className="relative shrink-0 rounded-2xl overflow-hidden bg-orange-50"
        style={{ width: size, height: size }}
      >
        <Image
          src="/logo.png"
          alt="NibbleNet logo"
          fill
          className="object-cover"
          sizes={`${size}px`}
          priority
        />
      </div>

      {/* Wordmark */}
      {showName && (
        <div className="flex flex-col leading-none">
          <span
            className={cn(
              'font-extrabold tracking-tight',
              light ? 'text-white' : 'text-gray-900'
            )}
            style={{ fontSize: Math.round(size * 0.45) }}
          >
            NibbleNet
          </span>
          {showBrand && (
            <span
              className={cn(
                'font-medium tracking-wide mt-0.5',
                light ? 'text-white/70' : 'text-gray-400'
              )}
              style={{ fontSize: Math.round(size * 0.22) }}
            >
              Fantastic Fantosa Corporations
            </span>
          )}
        </div>
      )}
    </div>
  );
}

/** Just the icon — no text. Convenience wrapper. */
export function LogoIcon({ size = 40, className }: { size?: number; className?: string }) {
  return <Logo size={size} showName={false} className={className} />;
}
