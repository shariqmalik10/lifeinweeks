
import { generateText, streamText } from 'ai';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { NextResponse } from 'next/server';

const openrouter = createOpenRouter({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY!,
});

export async function POST(req: Request) {

  try {
    const { prompt, model }: { prompt: string; model?: string } = await req.json();

    const selectedModel = model || 'gpt-3.5-turbo';
    console.log(`API Route: Using model ${selectedModel} for prompt: ${prompt.substring(0, 50)}...`);

    const result = streamText({
      model: openrouter(selectedModel),
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
