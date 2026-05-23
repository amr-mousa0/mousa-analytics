interface Window {
  // Safe registry for tracking active dynamic observers across view transition swaps
  __activeObservers?: Array<{ disconnect: () => void }>;
  
  // Custom click tracker callback for dynamic analytics telemetry
  trackClick?: (action: string, metadata?: Record<string, any>) => void;
}
