import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* Favicon and Apple Touch Icons */}
        <link rel="icon" href="/bee-logo.svg" type="image/svg+xml" />
        {/* <link rel="icon" href="/favicon.ico" sizes="any" /> */}
        <link rel="apple-touch-icon" href="/bee-logo.svg" />
        <link rel="manifest" href="/site.webmanifest" />
        
        {/* Meta tags */}
        <meta name="theme-color" content="#FBBF24" />
        <meta name="description" content="BuzzChat - Where Conversations Buzz to Life" />
        <meta name="application-name" content="BuzzChat" />
        <meta name="apple-mobile-web-app-title" content="BuzzChat" />
        
        {/* Font preloads */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&display=swap"
          rel="stylesheet"
        />
      </Head>
      <body className="antialiased">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
