import axios from 'axios';

const VERCEL_OG_API = `${process.env.NEXT_PUBLIC_BASE_URL}/api/og`;

async function fetchQuote() {
  try {
    const response = await axios.get('https://zenquotes.io/api/random');
    return response.data[0];
  } catch (error) {
    console.error('Error fetching quote:', error);
    throw new Error('Failed to fetch quote');
  }
}

export default async function handler(req, res) {
  console.log('Received request to zenFrame handler');
  console.log('Request method:', req.method);

  try {
    if (req.method === 'POST') {
      const quoteData = await fetchQuote();
      const quoteText = `${quoteData.q} - ${quoteData.a}`;
      const imageUrl = quoteData.background || '/zen-placeholder.png';

      const ogImageUrl = `${VERCEL_OG_API}?text=${encodeURIComponent(quoteText)}`;

      res.setHeader('Content-Type', 'text/html');
      return res.status(200).send(`
        <!DOCTYPE html>
        <html>
          <head>
            <meta property="fc:frame" content="vNext" />
            <meta property="fc:frame:image" content="${ogImageUrl}" />
            <meta property="fc:frame:button:1" content="Get Another" />
            <meta property="fc:frame:button:1:post_url" content="https://your-vercel-deployment-url.com/api/zenFrame" />
            <meta property="fc:frame:button:2" content="Share" />
            <meta property="fc:frame:button:2:action" content="link" />
            <meta property="fc:frame:button:2:target" content="https://warpcast.com/~/compose?text=Get+your+daily+inspiration+from+this+frame!" />
          </head>
          <body>
            <h1>Your Daily Inspiration</h1>
            <img src="${imageUrl}" alt="Zen Quote">
            <p>${quoteText}</p>
            <div>
              <button onclick="window.location.href='/zen'">Get Another</button>
              <button onclick="window.open('https://warpcast.com/~/compose?text=Get+your+daily+inspiration+from+this+frame!', '_blank')">Share</button>
            </div>
          </body>
        </html>
      `);
    } else {
      console.log('Method not allowed:', req.method);
      return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }
  } catch (error) {
    console.error('Error processing request:', error);
    return res.status(500).json({ error: 'Internal Server Error: ' + error.message });
  }
}
