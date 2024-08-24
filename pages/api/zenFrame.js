import axios from 'axios';

const DEFAULT_PLACEHOLDER_IMAGE = `${process.env.NEXT_PUBLIC_BASE_URL}/zen-placeholder.png`;

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

export default async function handler(req, res) {
  console.log('Received request to zenFrame handler');
  console.log('Request method:', req.method);

  try {
    if (req.method === 'POST') {
      const quoteData = await fetchQuote();
      const quoteText = `${quoteData.q} - ${quoteData.a}`;

      console.log('Processing quote:', quoteText);

      const htmlContent = `
        <html>
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body, html {
                margin: 0;
                padding: 0;
                height: 100%;
                display: flex;
                justify-content: center;
                align-items: center;
                background-color: #f0f8ea;
                font-family: Arial, sans-serif;
              }
              .quote-container {
                text-align: center;
                max-width: 80%;
                padding: 20px;
                background-color: rgba(255, 255, 255, 0.8);
                border-radius: 10px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
              }
              .quote {
                font-size: 24px;
                color: #333;
                margin-bottom: 10px;
              }
              .author {
                font-size: 18px;
                color: #666;
              }
            </style>
          </head>
          <body>
            <div class="quote-container">
              <div class="quote">${quoteData.q}</div>
              <div class="author">- ${quoteData.a}</div>
            </div>
          </body>
        </html>
      `;

      const shareText = encodeURIComponent(`"${quoteData.q}" - ${quoteData.a}\n\nGet your daily inspiration!\n\nFrame by @aaronv`);
      const shareLink = `https://warpcast.com/~/compose?text=${shareText}`;

      res.setHeader('Content-Type', 'text/html');
      return res.status(200).send(`
        <!DOCTYPE html>
        <html>
          <head>
            <meta property="fc:frame" content="vNext" />
            <meta property="fc:frame:image" content="data:text/html;base64,${Buffer.from(htmlContent).toString('base64')}" />
            <meta property="fc:frame:button:1" content="Get Another" />
            <meta property="fc:frame:post_url" content="${process.env.NEXT_PUBLIC_BASE_URL}/api/zenFrame" />
            <meta property="fc:frame:button:2" content="Share" />
            <meta property="fc:frame:button:2:action" content="link" />
            <meta property="fc:frame:button:2:target" content="${shareLink}" />
          </head>
        </html>
      `);
    } else {
      console.log('Method not allowed:', req.method);
      return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }
  } catch (error) {
    console.error('Error processing request:', error.message);
    const errorImageUrl = DEFAULT_PLACEHOLDER_IMAGE;
    return res.status(200).send(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta property="fc:frame" content="vNext" />
          <meta property="fc:frame:image" content="${errorImageUrl}" />
          <meta property="fc:frame:button:1" content="Try Again" />
          <meta property="fc:frame:post_url" content="${process.env.NEXT_PUBLIC_BASE_URL}/api/zenFrame" />
        </head>
      </html>
    `);
  }
}