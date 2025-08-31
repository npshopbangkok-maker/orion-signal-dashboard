/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SIGNAL_WS_URL?: string
  readonly VITE_TELEGRAM_WEBHOOK?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
