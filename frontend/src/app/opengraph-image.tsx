import { readFile } from 'fs/promises';
import { join } from 'path';
import { ImageResponse } from 'next/og';

export const alt = 'Hacama Investments | Reliable Supply for Every Need';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function OgImage() {
  const logo = await readFile(join(process.cwd(), 'public', 'hacama_icon.png'));
  const logoSrc = `data:image/png;base64,${logo.toString('base64')}`;

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          width: '100%',
          height: '100%',
          padding: '80px',
          background: 'linear-gradient(135deg, #141417 0%, #2b2b32 60%, #8d3f2f 100%)',
          color: 'white',
          fontFamily: 'sans-serif',
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logoSrc} width={140} height={140} style={{ objectFit: 'contain' }} alt="" />
        <div style={{ marginTop: 40, fontSize: 72, fontWeight: 700, letterSpacing: -2 }}>Hacama Investments</div>
        <div style={{ marginTop: 16, fontSize: 34, color: '#f4dfd9' }}>Reliable Supply for Every Need</div>
        <div style={{ marginTop: 48, fontSize: 24, color: '#9ca3af' }}>Lilongwe, Malawi</div>
      </div>
    ),
    { ...size },
  );
}
