import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer rounded-xl text-sm font-medium transition-all duration-200 disabled:pointer-events-none disabled:opacity-45 border',
  {
    variants: {
      variant: {
        default:
          'bg-primary/15 text-primary border-primary/35 hover:bg-primary/25 hover:border-primary/55',

        destructive:
          'border border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500/50',

        outline:
          'border-border/50 bg-transparent text-secondary-foreground hover:bg-surface/5 hover:border-border hover:text-foreground',

        secondary:
          'bg-surface/5 text-secondary-foreground border-surface/30 hover:bg-surface/10 hover:border-surface/50',

        ghost:
          'border-transparent text-secondary-foreground hover:bg-surface/8 hover:text-foreground',

        todo:
          'bg-violet-500/12 text-violet-400 border-violet-500/30 hover:bg-violet-500/22 hover:border-violet-500/50',

        success:
          'bg-emerald-500/10 text-emerald-400 border-emerald-500/26 hover:bg-emerald-500/20 hover:border-emerald-500/44',

        'design-review':
          'bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/26 hover:bg-fuchsia-500/20 hover:border-fuchsia-500/44',

        'on-hold':
          'bg-gradient-to-br from-amber-900 to-amber-800 text-amber-100 border-amber-600 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_1px_3px_rgba(0,0,0,0.35)] hover:from-amber-800 hover:to-amber-700 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_2px_8px_rgba(180,83,9,0.4)]',
      },
      size: {
        default: 'min-h-9 px-5 py-2',
        sm: 'min-h-8 px-4 py-1.5 text-xs rounded-lg',
        lg: 'min-h-11 px-6 py-2.5 text-base rounded-xl',
        icon: 'h-9 w-9 aspect-square',
        iconSm: 'h-8 w-8 aspect-square',
        iconLg: 'h-10 w-10 aspect-square',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'button';
  return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
});
Button.displayName = 'Button';

export { Button, buttonVariants };
