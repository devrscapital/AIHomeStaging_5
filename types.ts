// Fix: Replaced failing vite/client type reference and defined global types for
// `import.meta.env` (for Firebase) and `process.env.API_KEY` (for Gemini API)
// to resolve TypeScript errors and align with Gemini SDK guidelines.
declare global {
  interface ImportMeta {
    readonly env: {
      readonly VITE_FIREBASE_API_KEY: string;
      readonly VITE_FIREBASE_AUTH_DOMAIN: string;
      readonly VITE_FIREBASE_PROJECT_ID: string;
      readonly VITE_FIREBASE_STORAGE_BUCKET: string;
      readonly VITE_FIREBASE_MESSAGING_SENDER_ID: string;
      readonly VITE_FIREBASE_APP_ID: string;
      readonly VITE_FIREBASE_MEASUREMENT_ID: string;
    };
  }
  var process: {
    env: {
      API_KEY: string;
    };
  };
}

export interface ProcessedImage {
  id: string;
  originalFile: File;
  originalUrl: string;
  retouchedUrl: string | null;
  status: 'pending' | 'processing' | 'completed' | 'error';
  isUnlocked: boolean;
  error: string | null;
}

export interface User {
  uid: string;
  email: string | null;
}
