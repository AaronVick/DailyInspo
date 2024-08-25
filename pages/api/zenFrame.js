import axios from 'axios';
import { ImageResponse } from '@vercel/og';

export const config = {
  runtime: 'experimental-edge',
};

async function fetchQuote() {
  const apiUrl = 'https://zenquotes.io/api/random';

  console.log(`Fetching quote from ZenQuotes API: ${apiUrl}`);

  try {
    const response = await axios.get(apiUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Content-Type': 'application/json',
        'Origin': process.env.NEXT_PUBLIC_BASE_URL,
      },
    });
    console.log('Quote fetched successfully:', response.data[0]);
    return response.data[0];
  } catch (error) {
    console.error(
      'Error fetching quote from ZenQuotes API:',
      error.response ? error.response.status : error.message
    );
    throw new Error('Failed to fetch quote');
  }
}

export default async function handler(req) {
  console.log('Received request to zenFrame handler');
  console.log('Request method:', req.method);

  try {
    if (req.method === 'GET' || req.method === 'POST') {
      const quoteData = await fetchQuote();
      console.log('Processing quote:', `${quoteData.q} - ${quoteData.a}`);

      const imageResponse = new ImageResponse(
        (
          <div
            style={{
              width: '1200px',
              height: '630px',
              backgroundColor: '#f0f8ea',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              flexDirection: 'column',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                fontSize: '46px',
                color: '#333',
                marginBottom: '20px',
                fontFamily: 'Arial, sans-serif',
              }}
            >
              {quoteData.q}
            </div>
            <div
              style={{
                fontSize: '34px',
                color: '#666',
                fontFamily: 'Arial, sans-serif',
              }}
            >
              - {quoteData.a}
            </div>
          </div>
        ),
        {
          width: 1200,
          height: 630,
        }
      );

      // Render the HTML with Farcaster meta tags
      return new Response(
        `
        <!DOCTYPE html>
        <html>
          <head>
            <meta property="fc:frame" content="vNext" />
            <meta property="fc:frame:image" content="data:image/png;base64,${imageResponse}" />
            <meta property="fc:frame:button:1" content="Get Another" />
            <meta property="fc:frame:post_url" content="${process.env.NEXT_PUBLIC_BASE_URL}/api/zenFrame" />
            <meta property="fc:frame:button:2" content="Share" />
            <meta property="fc:frame:button:2:action" content="link" />
            <meta property="fc:frame:button:2:target" content="https://warpcast.com/~/compose?text=Get%20your%20daily%20inspiration!%0A%0AFrame%20by%20@aaronv%0A%0A&embeds[]=${encodeURIComponent(process.env.NEXT_PUBLIC_BASE_URL)}" />
          </head>
        </html>
      `,
        {
          headers: {
            'Content-Type': 'text/html',
          },
        }
      );
    } else {
      console.log('Method not allowed:', req.method);
      return new Response(
        JSON.stringify({ error: `Method ${req.method} Not Allowed` }),
        { status: 405 }
      );
    }
  } catch (error) {
    console.error('Error processing request:', error.message);
    return new Response('Internal Server Error', { status: 500 });
  }
}
