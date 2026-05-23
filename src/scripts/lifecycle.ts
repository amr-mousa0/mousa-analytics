type CleanupFn = () => void;

class LifecycleManager {
  private cleanups: Set<CleanupFn> = new Set();
  private registeredListeners: Map<EventTarget, Map<string, Set<any>>> = new Map();

  constructor() {
    if (typeof window !== 'undefined') {
      document.addEventListener('astro:before-swap', () => this.cleanup());
    }
  }

  /**
   * Registers a cleanup function to run on page swap.
   */
  public onCleanup(fn: CleanupFn): void {
    this.cleanups.add(fn);
  }

  /**
   * Tracks an observer to disconnect it automatically on page swap.
   */
  public trackObserver(observer: { disconnect: () => void }): void {
    this.onCleanup(() => {
      try {
        observer.disconnect();
      } catch (err) {
        console.error('[Lifecycle] Error disconnecting observer:', err);
      }
    });
  }

  /**
   * Registers an event listener safely, ensuring duplicate listeners are not added
   * and that they are cleaned up on route swap.
   */
  public addListener(
    target: EventTarget,
    type: string,
    listener: any,
    options?: boolean | AddEventListenerOptions
  ): void {
    let targetMap = this.registeredListeners.get(target);
    if (!targetMap) {
      targetMap = new Map();
      this.registeredListeners.set(target, targetMap);
    }

    let listenersSet = targetMap.get(type);
    if (!listenersSet) {
      listenersSet = new Set();
      targetMap.set(type, listenersSet);
    }

    if (listenersSet.has(listener)) {
      // Prevent duplicate listener
      return;
    }

    listenersSet.add(listener);
    target.addEventListener(type, listener, options);

    // Track for cleanup
    this.onCleanup(() => {
      target.removeEventListener(type, listener, options);
      const tMap = this.registeredListeners.get(target);
      if (tMap) {
        const lSet = tMap.get(type);
        if (lSet) {
          lSet.delete(listener);
        }
      }
    });
  }

  /**
   * Cleans up all registered listeners and observers.
   */
  public cleanup(): void {
    for (const fn of this.cleanups) {
      try {
        fn();
      } catch (err) {
        console.error('[Lifecycle] Error running cleanup function:', err);
      }
    }
    this.cleanups.clear();
    this.registeredListeners.clear();
  }
}

export const lifecycle = new LifecycleManager();
