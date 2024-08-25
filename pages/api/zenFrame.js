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

function generateHTML(quoteData) {
  const { q: quote, a: author } = quoteData;
  return `
    <html>
      <head>
        <style>
          body {
            margin: 0;
            padding: 0;
            width: 1200px;
            height: 630px;
            display: flex;
            justify-content: center;
            align-items: center;
            background-color: #f0f8ea;
            font-family: Arial, sans-serif;
          }
          .quote-container {
            text-align: center;
            padding: 20px;
          }
          .quote {
            font-size: 48px;
            color: #333333;
            margin-bottom: 20px;
          }
          .author {
            font-size: 36px;
            color: #666666;
          }
        </style>
      </head>
      <body>
        <div class="quote-container">
          <div class="quote">"${quote}"</div>
          <div class="author">- ${author}</div>
        </div>
      </body>
    </html>
  `;
}

export default async function handler(req, res) {
  console.log('Received request to zenFrame handler');
  console.log('Request method:', req.method);
  console.log('User-Agent:', req.headers['user-agent']);

  try {
    // Handle both GET and POST requests
    if (req.method === 'GET' || req.method === 'POST') {
      const quoteData = await fetchQuote();
      console.log('Processing quote:', `${quoteData.q} - ${quoteData.a}`);

      const htmlContent = generateHTML(quoteData);
      const encodedHtml = Buffer.from(htmlContent).toString('base64');

      const shareText = encodeURIComponent(`Get your daily inspiration!\n\nFrame by @aaronv\n\n`);
      const shareLink = `https://warpcast.com/~/compose?text=${shareText}&embeds[]=${encodeURIComponent(process.env.NEXT_PUBLIC_BASE_URL)}`;

      res.setHeader('Content-Type', 'text/html');
      return res.status(200).send(`
        <!DOCTYPE html>
        <html>
          <head>
            <meta property="fc:frame" content="vNext" />
            <meta property="fc:frame:image" content="data:text/html;base64,${encodedHtml}" />
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