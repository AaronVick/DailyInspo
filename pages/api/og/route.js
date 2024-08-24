import { createCanvas } from 'canvas';

export default async function handler(req, res) {
  const { text, bgColor = 'lightgreen', textColor = 'black', fontSize = '48' } = req.query;

  const width = 1200;
  const height = 630;

  const canvas = createCanvas(width, height);
  const context = canvas.getContext('2d');

  // Set background
  context.fillStyle = bgColor;
  context.fillRect(0, 0, width, height);

  // Set text properties
  context.font = `bold ${fontSize}px Arial, sans-serif`;
  context.fillStyle = textColor;
  context.textAlign = 'center';
  context.textBaseline = 'middle';

  // Wrap text
  const maxWidth = width - 100;
  const words = text.split(' ');
  let line = '';
  const lines = [];
  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = context.measureText(testLine);
    const testWidth = metrics.width;
    if (testWidth > maxWidth && n > 0) {
      lines.push(line);
      line = words[n] + ' ';
    } else {
      line = testLine;
    }
  }
  lines.push(line);

  // Draw text
  const lineHeight = parseInt(fontSize, 10) * 1.2;
  const totalHeight = lines.length * lineHeight;
  let y = (height - totalHeight) / 2;
  for (let i = 0; i < lines.length; i++) {
    context.fillText(lines[i], width / 2, y);
    y += lineHeight;
  }

  // Convert canvas to buffer
  const buffer = canvas.toBuffer('image/png');

  // Set response headers
  res.setHeader('Content-Type', 'image/png');
  res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');

  // Send the image
  res.end(buffer);
}