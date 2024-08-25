import axios from 'axios';
import { ImageResponse } from '@vercel/og';

export const config = {
  runtime: 'experimental-edge',
};

async function fetchQuote() {
  const apiUrl = 'https://zenquotes.io/api/random';

  try {
    const response = await axios.get(apiUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Content-Type': 'application/json',
        'Origin': process.env.NEXT_PUBLIC_BASE_URL,
      },
    });
    return response.data[0];
  } catch (error) {
    console.error('Error fetching quote from ZenQuotes API:', error.message);
    throw new Error('Failed to fetch quote');
  }
}

export default async function handler(req) {
  try {
    if (req.method !== 'GET' && req.method !== 'POST') {
      return new Response('Method Not Allowed', { status: 405 });
    }

    const quoteData = await fetchQuote();

    const imageResponse = new ImageResponse(
      (
        <div
          style={{
            fontSize: 48,
            background: '#f0f8ea',
            width: '1200px',
            height: '630px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            textAlign: 'center',
            padding: '40px',
            flexDirection: 'column',
          }}
        >
          <p style={{ fontWeight: 'bold', color: '#333' }}>
            {quoteData.q}
          </p>
          <p style={{ marginTop: '20px', fontSize: 32, color: '#666' }}>
            - {quoteData.a}
          </p>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );

    return new Response(imageResponse.body, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'no-cache',
        'fc-frame': 'vNext',
        'fc-frame:image': 'data:image/png;base64,' + Buffer.from(await imageResponse.arrayBuffer()).toString('base64'),
        'fc-frame:button:1': 'Get Another',
        'fc-frame:post_url': `${process.env.NEXT_PUBLIC_BASE_URL}/api/zenFrame`,
        'fc-frame:button:2': 'Share',
        'fc-frame:button:2:action': 'link',
        'fc-frame:button:2:target': `https://warpcast.com/~/compose?text=Get your daily inspiration!&embeds[]=${encodeURIComponent(process.env.NEXT_PUBLIC_BASE_URL)}`,
      },
    });
  } catch (error) {
    console.error('Error processing request:', error.message);
    return new Response('Internal Server Error', { status: 500 });
  }
}
