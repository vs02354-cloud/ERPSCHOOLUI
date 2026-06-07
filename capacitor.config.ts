import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'free.erpschool.com',
  appName: 'SchoolERP',
  webDir: 'dist/SchoolERP.UI/browser',
  plugins: {
    CapacitorHttp: {
      enabled: true,
    },
  },
};

export default config;
