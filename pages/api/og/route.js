import { ImageResponse } from '@vercel/og';

export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  const { searchParams } = new URL(req.url);
  const text = searchParams.get('text');
  const bgColor = searchParams.get('bgColor') || 'lightgreen';
  const textColor = searchParams.get('textColor') || 'black';
  const fontSize = searchParams.get('fontSize') || '48px';

  return new ImageResponse(
    (
      <div
        style={{
          background: bgColor,
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px',
        }}
      >
        <div
          style={{
            fontSize: fontSize,
            fontWeight: 'bold',
            color: textColor,
            textAlign: 'center',
          }}
        >
          {text}
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}