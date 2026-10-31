/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_PUBLISHABLE_KEY: string;
  readonly VITE_DUITKU_ENV: "sandbox" | "production";
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
