import type { TStory } from './types';

// 这里改成相对路径，Vite 会自动把它代理到后端
const BACKEND_API_URL = '/api/chat';

export async function askAI(question: string, story: TStory): Promise<string> {
  try {
    const response = await fetch(BACKEND_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        question,
        story,
      }),
    });

    if (!response.ok) {
      // 尝试解析后端的错误信息
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `请求失败，状态码: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data || !data.answer) {
      throw new Error('服务器返回的数据格式异常');
    }

    return data.answer;
  } catch (error: any) {
    console.error('Frontend askAI Error:', error);
    throw new Error(error.message || '网络连接失败，请检查后端是否启动。');
  }
}
