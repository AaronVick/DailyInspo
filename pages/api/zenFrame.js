import axios from 'axios';
import sharp from 'sharp';

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

async function generatePngImage(quoteData) {
  const width = 1200;
  const height = 630;
  const quoteText = quoteData.q;
  const authorText = `- ${quoteData.a}`;

  const svgImage = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f0f8ea"/>
      <text x="50%" y="40%" font-family="Arial, sans-serif" font-size="46" fill="#333" text-anchor="middle">${quoteText}</text>
      <text x="50%" y="60%" font-family="Arial, sans-serif" font-size="34" fill="#666" text-anchor="middle">${authorText}</text>
    </svg>
  `;

  try {
    const pngBuffer = await sharp(Buffer.from(svgImage))
      .resize(width, height)
      .png()
      .toBuffer();

    return pngBuffer;
  } catch (error) {
    console.error('Error generating PNG:', error);
    throw new Error('Failed to generate PNG image');
  }
}

export default async function handler(req, res) {
  console.log('Received request to zenFrame handler');
  console.log('Request method:', req.method);
  console.log('User-Agent:', req.headers['user-agent']);

  try {
    if (req.method === 'POST') {
      const quoteData = await fetchQuote();
      console.log('Processing quote:', `${quoteData.q} - ${quoteData.a}`);

      const pngBuffer = await generatePngImage(quoteData);
      const pngBase64 = pngBuffer.toString('base64');

      const shareText = encodeURIComponent(`Get your daily inspiration!\n\nFrame by @aaronv\n\n`);
      const shareLink = `https://warpcast.com/~/compose?text=${shareText}&embeds[]=${encodeURIComponent(process.env.NEXT_PUBLIC_BASE_URL)}`;

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