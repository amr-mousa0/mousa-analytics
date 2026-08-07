export type CardVariant = 'default' | 'glass' | 'bordered' | 'flat';
export type CardPadding = 'none' | 'sm' | 'md' | 'lg';

export interface CardStyleOptions {
  variant?: CardVariant;
  padding?: CardPadding;
  hoverable?: boolean;
  className?: string;
}

const baseStyles = "rounded-lg transition-all duration-300 relative overflow-hidden";

const variants: Record<CardVariant, string> = {
  default: "bg-bg-card border border-border-subtle shadow-ambient",
  glass: "glass-card",
  bordered: "bg-bg-card border border-border-strong",
  flat: "bg-bg-secondary",
};

const paddings: Record<CardPadding, string> = {
  none: "p-0",
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
};


export function getCardClasses({
  variant = 'default',
  padding = 'md',
  hoverable = true,
  className = '',
}: CardStyleOptions = {}): string {
  const hoverStyles = hoverable
    ? variant === 'glass'
      ? "glass-card-hover"
      : "hover:-translate-y-1 hover:shadow-lg hover:border-border-accent"
    : "";

  return [baseStyles, variants[variant], paddings[padding], hoverStyles, className]
    .filter(Boolean)
    .join(' ');
}

