import Link from 'next/link';
import { ForteCat } from '@/components/mascot/ForteCat';
import { PaperButton } from '@/components/paper/PaperButton';
import { MarkerText } from '@/components/paper/MarkerText';
import { StickerLabel } from '@/components/paper/StickerLabel';
import { LightningStar } from '@/components/paper/LightningStar';

export default function NotFound() {
  return (
    <main style={{ minHeight: '100vh', background: 'var(--paper-teal)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, position: 'relative', overflow: 'hidden' }}>
      <div aria-hidden style={{ position: 'absolute', top: '12%', left: '10%' }}><LightningStar size={80} variant={1} /></div>
      <div aria-hidden style={{ position: 'absolute', bottom: '14%', right: '12%' }}><LightningStar size={64} variant={3} /></div>
      <div aria-hidden style={{ position: 'absolute', top: '32%', right: '8%' }}><LightningStar size={56} variant={2} /></div>

      <div style={{ textAlign: 'center', maxWidth: 500 }}>
        <ForteCat emotion="surprised" size={180} />
        <div style={{ marginTop: 16 }}>
          <MarkerText as="h1" size="3xl" color="#F5EBD8">404</MarkerText>
        </div>
        <div style={{ marginTop: 8 }}>
          <StickerLabel color="coral" size="lg" tilt={-3}>PAGE NOT FOUND ✕</StickerLabel>
        </div>
        <p style={{ marginTop: 18, fontFamily: 'var(--font-patrick), cursive', fontSize: 20, color: 'var(--paper-cream)' }}>
          That page wandered off. Maybe the cat ate it.
        </p>
        <div style={{ marginTop: 22 }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <PaperButton color="yellow" size="lg">BACK HOME</PaperButton>
          </Link>
        </div>
      </div>
    </main>
  );
}
