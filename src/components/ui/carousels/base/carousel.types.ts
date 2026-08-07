/**
 * Shared contract for all carousel item types across the application.
 * Every carousel component MUST use or extend this interface.
 * Governed by Constitution Article 9 (Shared Components) and Article 6 (Single Source of Truth).
 */
export interface CarouselItem {
  id: string;
  title: string;
  description: string;
  tag?: string;
  icon?: string;
  href?: string;
}

export interface BaseCarouselProps {
  items: CarouselItem[];
  activeIndex?: number;
  onActiveChange?: (index: number) => void;
  autoPlay?: boolean;
  autoPlayInterval?: number;
  className?: string;
}
