/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GENASISSTANTGROQAPI: string
  readonly VITE_GENASISSTANTOROUTERAPI: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
