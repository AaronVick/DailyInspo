async function generatePngImage(quoteData) {
  const width = 1200;
  const height = 630;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Set background
  ctx.fillStyle = '#f0f8ea'; // Soft green background
  ctx.fillRect(0, 0, width, height);

  // Set text styles
  ctx.font = '46px sans-serif'; // Changed to sans-serif
  ctx.fillStyle = '#333';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Write quote
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
  ctx.font = '34px sans-serif'; // Changed to sans-serif and reduced size
  ctx.fillStyle = '#666';
  ctx.fillText(`- ${quoteData.a}`, width / 2, y + 80);

  return canvas.toBuffer('image/png');
}