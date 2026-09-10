const EVENT_PREFIX = 'solitude:';

class Lifecycle {
  #pageController = new AbortController();
  #disposers = new Set<() => void>();

  get signal() {
    return this.#pageController.signal;
  }

  add(disposer: () => void) {
    if (typeof disposer !== 'function') return () => {};
    this.#disposers.add(disposer);
    return () => this.#disposers.delete(disposer);
  }

  listen(
    target: EventTarget | null,
    type: string,
    handler: EventListener,
    options: boolean | AddEventListenerOptions = {},
  ) {
    if (!target?.addEventListener) return () => {};
    const normalized: AddEventListenerOptions =
      typeof options === 'boolean' ? { capture: options } : { ...options };
    normalized.signal ??= this.signal;
    target.addEventListener(type, handler, normalized);
    return () => target.removeEventListener(type, handler, normalized);
  }

  disposePage() {
    this.#pageController.abort();
    this.#disposers.forEach((dispose) => {
      try {
        dispose();
      } catch (error) {
        console.error('Failed to dispose a Solitude page resource:', error);
      }
    });
    this.#disposers.clear();
    this.#pageController = new AbortController();
  }

  emit(type: string, detail?: unknown) {
    document.dispatchEvent(
      new CustomEvent(`${EVENT_PREFIX}${type}`, { detail, bubbles: true }),
    );
  }

  on(type: string, handler: EventListener) {
    const eventName = `${EVENT_PREFIX}${type}`;
    document.addEventListener(eventName, handler);
    return () => document.removeEventListener(eventName, handler);
  }
}

export const lifecycle = new Lifecycle();
