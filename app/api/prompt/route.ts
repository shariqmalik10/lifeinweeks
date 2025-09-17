
import { streamText } from 'ai';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { NextResponse } from 'next/server';

const openrouter = createOpenRouter({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY!,
});

export async function POST(req: Request) {

  try {
    const { messages } = await req.json();
    console.log(messages)

    const response = streamText({
      model: openrouter('gpt-5-mini'),
      messages,
    });

    console.log(response)

    await response.consumeStream();
    return new NextResponse(await response.text);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate response' },
      { status: 500 }
    );
  }
}
