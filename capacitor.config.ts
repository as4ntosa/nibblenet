import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.nibblenet.app',
  appName: 'NibbleNet',
  // webDir is required by Capacitor but server.url overrides it at runtime.
  // The www/ folder contains a minimal fallback shell.
  webDir: 'www',
  server: {
    // Load the live Vercel deployment in the native WebView.
    // This means all API routes, auth, and Supabase work out-of-the-box.
    url: 'https://nibblenet-kappa.vercel.app',
    cleartext: false,
  },
  ios: {
    contentInset: 'automatic',
    backgroundColor: '#ffffff',
  },
  android: {
    backgroundColor: '#ffffff',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#ffffff',
      showSpinner: false,
    },
    StatusBar: {
      style: 'DEFAULT',
      backgroundColor: '#ffffff',
    },
  },
};

export default config;
