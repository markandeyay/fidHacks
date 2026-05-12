import type { Metadata } from 'next';
import { Permanent_Marker, Caveat, Patrick_Hand, Space_Mono, Inter } from 'next/font/google';
import './globals.css';

const marker = Permanent_Marker({ subsets: ['latin'], weight: '400', variable: '--font-marker', display: 'swap' });
const caveat = Caveat({ subsets: ['latin'], variable: '--font-caveat', display: 'swap' });
const patrick = Patrick_Hand({ subsets: ['latin'], weight: '400', variable: '--font-patrick', display: 'swap' });
const mono = Space_Mono({ subsets: ['latin'], weight: ['400','700'], variable: '--font-mono', display: 'swap' });
const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });

export const metadata: Metadata = {
  title: 'Forte - Financial Literacy Simulator',
  description: 'Five interactive simulations that teach the money skills nobody teaches in school.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${marker.variable} ${caveat.variable} ${patrick.variable} ${mono.variable} ${inter.variable}`}>
      <body>
        {/* Shared SVG filter defs — referenced from CSS via url(#id) */}
        <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
          <defs>
            <filter id="paper-grain">
              <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" stitchTiles="stitch"/>
              <feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.18 0"/>
              <feComposite in2="SourceGraphic" operator="in"/>
            </filter>
            <filter id="deckled-edge">
              <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="3" seed="2"/>
              <feDisplacementMap in="SourceGraphic" scale="6"/>
            </filter>
            <filter id="rough-paper">
              <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="5"/>
              <feDiffuseLighting lightingColor="#fff" surfaceScale="2">
                <feDistantLight azimuth="45" elevation="60"/>
              </feDiffuseLighting>
              <feComposite in2="SourceGraphic" operator="in"/>
            </filter>
            <filter id="marker-wobble">
              <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="3"/>
              <feDisplacementMap in="SourceGraphic" scale="2"/>
            </filter>
          </defs>
        </svg>
        {children}
      </body>
    </html>
  );
}
