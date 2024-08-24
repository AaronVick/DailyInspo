import Head from 'next/head';

export default function Home() {
  return (
    <div>
      <Head>
        <title>ZenQuotes Farcaster Frame</title>
        <meta property="og:title" content="ZenQuotes Farcaster Frame" />
        <meta property="og:image" content={`${process.env.NEXT_PUBLIC_BASE_URL}/zen.png`} />
        <meta property="fc:frame" content="vNext" />
        <meta property="fc:frame:image" content={`${process.env.NEXT_PUBLIC_BASE_URL}/zen.png`} />
        <meta property="fc:frame:button:1" content="Get Your Daily Inspo" />
        <meta property="fc:frame:post_url" content={`${process.env.NEXT_PUBLIC_BASE_URL}/api/zenFrame`} />
      </Head>
      <main>
        <h1>Welcome to Your Daily Inspiration!</h1>
        <p>Tap the button below to receive a new quote each time.</p>
        <button onClick={() => window.location.href='/api/zenFrame'}>Get Your Daily Inspo</button>
      </main>
    </div>
  );
}
