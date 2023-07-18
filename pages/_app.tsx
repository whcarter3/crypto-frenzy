import '../styles/globals.css'
import { AppProps } from 'next/app'
import { Analytics } from '@vercel/analytics/react'

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Component {...pageProps} classname="bg-slate-600" />)
      <Analytics />
    </>
}

export default MyApp
