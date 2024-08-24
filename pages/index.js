import Head from 'next/head';

export default function Home() {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>ZenQuotes Farcaster Frame</title>
        <meta property="og:title" content="ZenQuotes Farcaster Frame" />
        <meta property="og:image" content="https://your-vercel-deployment-url.com/zen.png" />
        <meta property="fc:frame" content="vNext" />
        <meta property="fc:frame:image" content="https://your-vercel-deployment-url.com/zen.png" />
        <meta property="fc:frame:button:1" content="Get Your Daily Inspo" />
        <meta property="fc:frame:post_url" content="https://your-vercel-deployment-url.com/api/zenFrame" />
      </head>
      <body>
        <main>
          <h1>Welcome to Your Daily Inspiration!</h1>
          <p>Tap the button below to receive a new quote each time.</p>
        </main>
      </body>
    </html>
  `;
}
