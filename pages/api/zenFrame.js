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

      const svgContent = `
        <svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
          <rect width="100%" height="100%" fill="#f0f8ea"/>
          <foreignObject x="50" y="50" width="1100" height="530">
            <div xmlns="http://www.w3.org/1999/xhtml" style="font-family: Arial, sans-serif; height: 100%; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center;">
              <p style="font-size: 46px; color: #333; max-width: 1000px; margin: 0;">${quoteData.q}</p>
              <p style="font-size: 34px; color: #666; margin-top: 20px;">- ${quoteData.a}</p>
            </div>
          </foreignObject>
        </svg>
      `;

      const htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
          </head>
          <body style="margin:0; padding:0;">
            ${svgContent}
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
            <meta property="fc:frame:image" content="data:image/svg+xml;base64,${Buffer.from(svgContent).toString('base64')}" />
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
    return res.status(200).send(`
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