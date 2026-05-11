import { NextResponse } from 'next/server';

export async function POST() {
  // D-ID Talks API is build-time only per the system design.
  // Runtime avatar uses pre-rendered clips + Web Speech API TTS.
  return NextResponse.json({
    message: 'Avatar speak is handled client-side via Web Speech API and pre-rendered video clips.',
  });
}
