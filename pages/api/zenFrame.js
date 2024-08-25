import axios from 'axios';
import { ImageResponse } from '@vercel/og';

export const config = {
  runtime: 'nodejs', // Use nodejs runtime to avoid edge runtime issues
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

export default async function handler(req, res) {
  console.log('Received request to zenFrame handler');
  console.log('Request method:', req.method);
  console.log('User-Agent:', req.headers['user-agent']);

  try {
    if (req.method !== 'GET' && req.method !== 'POST') {
      return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }

    const quoteData = await fetchQuote();
    console.log('Processing quote:', `${quoteData.q} - ${quoteData.a}`);

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
          <p style={{ fontWeight: 'bold', color: '#333', maxWidth: '90%' }}>
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

    const imageBuffer = await imageResponse.arrayBuffer();
    const pngBase64 = Buffer.from(imageBuffer).toString('base64');

    res.setHeader('Content-Type', 'text/html');
    return res.status(200).send(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta property="fc:frame" content="vNext" />
          <meta property="fc:frame:image" content="data:image/png;base64,${pngBase64}" />
          <meta property="fc:frame:button:1" content="Get Another" />
          <meta property="fc:frame:post_url" content="${process.env.NEXT_PUBLIC_BASE_URL}/api/zenFrame" />
          <meta property="fc:frame:button:2" content="Share" />
          <meta property="fc:frame:button:2:action" content="link" />
          <meta property="fc:frame:button:2:target" content="https://warpcast.com/~/compose?text=Get your daily inspiration!&embeds[]=${encodeURIComponent(process.env.NEXT_PUBLIC_BASE_URL)}" />
        </head>
        <body>
          <img src="data:image/png;base64,${pngBase64}" alt="Quote Image" />
        </body>
      </html>
    `);
  } catch (error) {
    console.error('Error processing request:', error.message);
    return res.status(500).send(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta property="fc:frame" content="vNext" />
          <meta property="fc:frame:image" content="${DEFAULT_PLACEHOLDER_IMAGE}" />
          <meta property="fc:frame:button:1" content="Try Again" />
          <meta property="fc:frame:post_url" content="${process.env.NEXT_PUBLIC_BASE_URL}/api/zenFrame" />
        </head>
      </html>
    `);
  }
}
