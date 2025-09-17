
import { generateText, streamText } from 'ai';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { NextResponse } from 'next/server';

const openrouter = createOpenRouter({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY!,
});

export async function POST(req: Request) {

  try {
    const { prompt }: { prompt: string } = await req.json();

    const result = streamText({
      model: openrouter('gpt-3.5-turbo'),
      prompt,
    });


    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate response' },
      { status: 500 }
    );
  }
}
