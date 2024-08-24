import axios from 'axios';

const VERCEL_OG_API = `${process.env.NEXT_PUBLIC_BASE_URL}/api/og`;
const DEFAULT_PLACEHOLDER_IMAGE = `${process.env.NEXT_PUBLIC_BASE_URL}/zen-placeholder.png`;

async function fetchQuote() {
  const apiUrl = 'https://zenquotes.io/api/random';
  
  try {
    const response = await axios.get(apiUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Content-Type': 'application/json',
        'Origin': process.env.NEXT_PUBLIC_BASE_URL
      }
    });
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

      let imageUrl = DEFAULT_PLACEHOLDER_IMAGE;
      
      if (quoteData.background) {
        try {
          const imageResponse = await axios.get(quoteData.background);
          if (imageResponse.status === 200) {
            imageUrl = quoteData.background;
          } else {
            console.warn('ZenQuotes returned an invalid image URL. Using placeholder.');
          }
        } catch (imageError) {
          console.error('Error fetching ZenQuotes background image:', imageError);
          console.warn('Using placeholder image instead.');
        }
      }

      const ogImageUrl = `${VERCEL_OG_API}?text=${encodeURIComponent(quoteText)}`;

      res.setHeader('Content-Type', 'text/html');
      return res.status(200).send(`
        <!DOCTYPE html>
        <html>
          <head>
            <meta property="fc:frame" content="vNext" />
            <meta property="fc:frame:image" content="${imageUrl}" />
            <meta property="fc:frame:button:1" content="Get Another" />
            <meta property="fc:frame:button:1:post_url" content="${process.env.NEXT_PUBLIC_BASE_URL}/api/zenFrame" />
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
    const errorImageUrl = DEFAULT_PLACEHOLDER_IMAGE;
    return res.status(200).send(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta property="fc:frame" content="vNext" />
          <meta property="fc:frame:image" content="${errorImageUrl}" />
          <meta property="fc:frame:button:1" content="Try Again" />
          <meta property="fc:frame:button:1:post_url" content="${process.env.NEXT_PUBLIC_BASE_URL}/api/zenFrame" />
        </head>
        <body>
          <h1>Error Fetching Inspiration</h1>
          <p>Sorry, we couldn't fetch a new quote at this time. Please try again.</p>
          <img src="${errorImageUrl}" alt="Error Placeholder">
          <div>
            <button onclick="window.location.href='/zen'">Try Again</button>
          </div>
        </body>
      </html>
    `);
  }
}
