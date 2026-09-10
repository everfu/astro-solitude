export {};

declare global {
  interface Window {
    Fancybox?: { close: () => void };
    __solitudeShortcodeRuntime?: {
      init: () => void;
      configure: (config: Record<string, unknown>) => void;
    };
    Solitude: Record<string, any>;
    globalFn: Record<string, any>;
    Chart?: any;
    ABCJS?: any;
    mermaid?: any;
    TypeIt?: any;
    ColorThief?: any;
    lazyLoadInstance?: any;
    fancyboxRun?: boolean;
    meting_api?: string;
  }
}
