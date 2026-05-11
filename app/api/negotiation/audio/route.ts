import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { text } = await request.json() as { text: string };
    if (!text) return NextResponse.json({ error: 'No text provided' }, { status: 400 });

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ fallback: true });
    }

    // Gemini native audio output requires multimodal API which isn't
    // directly supported in the current SDK. Signal client to use
    // Web Speech API TTS instead (which works instantly and reliably).
    return NextResponse.json({ fallback: true, text });
  } catch {
    return NextResponse.json({ fallback: true });
  }
}
