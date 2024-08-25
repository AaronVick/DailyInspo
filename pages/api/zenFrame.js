import axios from 'axios';
import { ImageResponse } from '@vercel/og';

export const config = {
  runtime: 'edge',
};

async function fetchQuote() {
  const apiUrl = 'https://zenquotes.io/api/random';
  
  console.log(`Fetching quote from ZenQuotes API: ${apiUrl}`);
  
  try {
    const response = await axios.get(apiUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Content-Type': 'application/json',
        'Origin': process.env.NEXT_PUBLIC_BASE_URL
      }
    });
    console.log('Quote fetched successfully:', response.data[0]);
    return response.data[0];
  } catch (error) {
    console.error('Error fetching quote from ZenQuotes API:', error.response ? error.response.status : error.message);
    throw new Error('Failed to fetch quote');
  }
}

export default async function handler(req) {
  console.log('Received request to zenFrame handler');

  try {
    const quoteData = await fetchQuote();
    console.log('Processing quote:', `${quoteData.q} - ${quoteData.a}`);

    const shareText = encodeURIComponent(`Get your daily inspiration!\n\nFrame by @aaronv\n\n`);
    const shareLink = `https://warpcast.com/~/compose?text=${shareText}&embeds[]=${encodeURIComponent(process.env.NEXT_PUBLIC_BASE_URL)}`;

    const imageResponse = new ImageResponse(
      (
        <div
          style={{
            display: 'flex',
            height: '100%',
            width: '100%',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#f0f8ea',
            color: '#333',
            fontSize: 46,
            textAlign: 'center',
            padding: '50px',
            fontFamily: 'Arial, sans-serif',
          }}
        >
          <div>
            <p>{quoteData.q}</p>
            <p style={{ marginTop: '20px', fontSize: 34, color: '#666' }}>
              - {quoteData.a}
            </p>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );

    return new Response(
      `<!DOCTYPE html>
      <html>
        <head>
          <meta property="fc:frame" content="vNext" />
          <meta property="fc:frame:image" content="${imageResponse}" />
          <meta property="fc:frame:button:1" content="Get Another" />
          <meta property="fc:frame:post_url" content="${process.env.NEXT_PUBLIC_BASE_URL}/api/zenFrame" />
          <meta property="fc:frame:button:2" content="Share" />
          <meta property="fc:frame:button:2:action" content="link" />
          <meta property="fc:frame:button:2:target" content="${shareLink}" />
        </head>
      </html>`,
      {
        headers: {
          'Content-Type': 'text/html',
        },
      }
    );
  } catch (error) {
    console.error('Error processing request:', error.message);
    return new Response(
      `<!DOCTYPE html>
      <html>
        <head>
          <meta property="fc:frame" content="vNext" />
          <meta property="fc:frame:image" content="${process.env.NEXT_PUBLIC_BASE_URL}/zen-placeholder.png" />
          <meta property="fc:frame:button:1" content="Try Again" />
          <meta property="fc:frame:post_url" content="${process.env.NEXT_PUBLIC_BASE_URL}/api/zenFrame" />
        </head>
      </html>`,
      {
        headers: {
          'Content-Type': 'text/html',
        },
      }
    );
  }
}
