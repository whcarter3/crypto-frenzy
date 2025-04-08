import '../styles/globals.css';
import { AppProps } from 'next/app';
import { Analytics } from '@vercel/analytics/react';
import { NotificationProvider } from '../lib/NotificationContext';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <NotificationProvider>
      <Component {...pageProps} classname="bg-slate-600" />
      <Analytics />
    </NotificationProvider>
  );
}

export default MyApp;
