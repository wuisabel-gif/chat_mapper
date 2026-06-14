/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Base URL of the Chat Mapper backend proxy (Render Web Service). */
  readonly VITE_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
