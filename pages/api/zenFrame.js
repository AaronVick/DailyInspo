import axios from 'axios';
import { createCanvas } from 'canvas';

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
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Set background
  ctx.fillStyle = '#f0f8ea';
  ctx.fillRect(0, 0, width, height);

  // Set text styles
  ctx.fillStyle = '#333';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Write quote
  ctx.font = '46px Arial';
  const words = quoteData.q.split(' ');
  let line = '';
  let y = height / 2 - 50;
  for (let i = 0; i < words.length; i++) {
    const testLine = line + words[i] + ' ';
    const metrics = ctx.measureText(testLine);
    if (metrics.width > width - 100 && i > 0) {
      ctx.fillText(line, width / 2, y);
      line = words[i] + ' ';
      y += 60;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, width / 2, y);

  // Write author
  ctx.font = '34px Arial';
  ctx.fillStyle = '#666';
  ctx.fillText(`- ${quoteData.a}`, width / 2, y + 80);

  return canvas.toBuffer('image/png');
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