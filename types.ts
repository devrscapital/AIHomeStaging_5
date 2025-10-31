/// <reference types="vite/client" />

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
