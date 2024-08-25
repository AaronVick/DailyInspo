import axios from 'axios';

const DEFAULT_PLACEHOLDER_IMAGE = `${process.env.NEXT_PUBLIC_BASE_URL}/zen-placeholder.png`;
const IMGBB_API_KEY = process.env.IMGBB_API_KEY; // You'll need to set this in your Vercel environment variables

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

async function generateImageUrl(quoteData) {
  const text = `${quoteData.q} - ${quoteData.a}`;
  const encodedText = encodeURIComponent(text);
  const imageUrl = `https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}&image=https://placehold.co/1200x630/f0f8ea/333333?text=${encodedText}`;

  try {
    const response = await axios.post(imageUrl);
    console.log('Image URL generated successfully');
    return response.data.data.url;
  } catch (error) {
    console.error('Error generating image URL:', error.response ? error.response.status : error.message);
    throw new Error('Failed to generate image URL');
  }
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

      const imageUrl = await generateImageUrl(quoteData);

      const shareText = encodeURIComponent(`Get your daily inspiration!\n\nFrame by @aaronv\n\n`);
      const shareLink = `https://warpcast.com/~/compose?text=${shareText}&embeds[]=${encodeURIComponent(process.env.NEXT_PUBLIC_BASE_URL)}`;

      res.setHeader('Content-Type', 'text/html');
      return res.status(200).send(`
        <!DOCTYPE html>
        <html>
          <head>
            <meta property="fc:frame" content="vNext" />
            <meta property="fc:frame:image" content="${imageUrl}" />
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