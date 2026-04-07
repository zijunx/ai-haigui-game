import type { TStory, TMessage } from './types';

//const BACKEND_API_URL = '/api/chat';
const BACKEND_API_URL = import.meta.env.VITE_BACKEND_API_URL;
console.log(
  "VITE_BACKEND_API_URL=",
  import.meta.env.VITE_BACKEND_API_URL
);

const TIMEOUT_MS = 15000; // 15秒超时

export interface AIResponse {
  answer: string;
  isFinished: boolean;
  atmosphere: string | null;
}

export async function askAI(question: string, story: TStory, history: TMessage[] = []): Promise<AIResponse> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(BACKEND_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        question,
        story,
        history,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      if (response.status >= 500) {
        throw new Error('SERVER_ERROR');
      }
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'REQUEST_FAILED');
    }

    const data = await response.json();
    if (!data || !data.answer) {
      throw new Error('FORMAT_ERROR');
    }

    return {
      answer: data.answer,
      isFinished: !!data.isFinished,
      atmosphere: data.atmosphere || null
    };
  } catch (error: any) {
    clearTimeout(timeoutId);
    console.error('Frontend askAI Error:', error);

    if (error.name === 'AbortError') {
      throw new Error('TIMEOUT');
    }

    if (error.message === 'SERVER_ERROR') {
      throw new Error('服务器开小差了');
    }

    if (!window.navigator.onLine || error.message.includes('Failed to fetch')) {
      throw new Error('网络异常，请检查连接');
    }

    if (error.message === 'TIMEOUT') {
      throw new Error('响应超时，请重试');
    }

    // Default or other errors
    throw new Error(error.message || '未知错误，请重试');
  }
}
