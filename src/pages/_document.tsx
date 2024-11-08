import { Head, Html, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang='en'>
      <Head>
        <link rel='manifest' href='manifest.json' suppressHydrationWarning />
        <link rel='apple-touch-icon' href='/icons/icon-512x512.png' />
        <meta name='apple-mobile-web-app-capable' content='yes' />
        <meta name='theme-color' content='#d8d8d8d8' />

        <meta httpEquiv='X-Content-Type-Options' content='nosniff' />

        <meta httpEquiv='X-Frame-Options' content='DENY' />
        <meta httpEquiv='X-XSS-Protection' content='1; mode=block' />
        <meta
          httpEquiv='Strict-Transport-Security'
          content='max-age=63072000; includeSubDomains; preload'
        />
        <meta name='referrer' content='no-referrer' />
        <meta
          name='permissions-policy'
          content='geolocation=(), microphone=(), camera=()'
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
