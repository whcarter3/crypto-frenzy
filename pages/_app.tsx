import '../styles/globals.css';
import '../styles/crt.css';
import { AppProps } from 'next/app';
import { Analytics } from '@vercel/analytics/react';
import { NotificationProvider } from '../lib/NotificationContext';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <NotificationProvider>
      <Component {...pageProps} className="bg-slate-600 crt" />
      <Analytics />
    </NotificationProvider>
  );
}

export default MyApp;
