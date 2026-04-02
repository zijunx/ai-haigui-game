import type { TStory } from './types';

const API_KEY = import.meta.env.VITE_DEEPSEEK_API_KEY as string;
const API_BASE_URL = (import.meta.env.VITE_DEEPSEEK_API_BASE_URL as string) || 'https://api.deepseek.com/v1';

if (!API_KEY) {
  console.warn('[api.ts] VITE_DEEPSEEK_API_KEY is not set. AI calls will fail.');
}

// ─── Prompt builder ────────────────────────────────────────────────────────

function buildSystemPrompt(story: TStory): string {
  return `你是一个海龟汤游戏裁判（AI Agent）。

【游戏规则】
玩家正在尝试通过是非问答猜出下面故事的完整真相（"汤底"）。
你的任务是根据"汤底"判断玩家的问题，并给出标准化回答。

【你的汤底（绝对保密，禁止透露原文）】
${story.answer}

【关键线索点（判断命中用，禁止直接透露）】
${story.keyPoints.map((p: string, i: number) => `${i + 1}. ${p}`).join('\n')}

【强制规则】
1. 只允许返回 JSON 格式，不得有任何额外文字
2. "answer" 字段只能是 "yes"、"no" 或 "irrelevant"
3. "hint" 字段是可选的轻微引导（一句话，不超过20字，括号内），禁止剧透
4. 禁止重复汤底原文
5. 禁止生成汤底之外的新事实

【输出格式（严格遵守）】
{"answer": "yes | no | irrelevant", "hint": "可选引导"}`;
}

function buildUserMessage(question: string): string {
  return `玩家的问题是："${question}"`;
}

// ─── AI Response type ────────────────────────────────────────────────────────

interface AIRawResponse {
  answer: 'yes' | 'no' | 'irrelevant';
  hint?: string;
}

// ─── Response formatter ──────────────────────────────────────────────────────

const ANSWER_MAP: Record<string, string> = {
  yes: '是。',
  no: '不是。',
  irrelevant: '与此无关。',
};

function formatResponse(raw: AIRawResponse): string {
  const verdict = ANSWER_MAP[raw.answer] ?? '与此无关。';
  return raw.hint ? `${verdict}\n（${raw.hint}）` : verdict;
}

// ─── Main function ───────────────────────────────────────────────────────────

export async function askAI(question: string, story: TStory): Promise<string> {
  if (!API_KEY) {
    throw new Error('DeepSeek API Key 未配置。请在 .env.local 中设置 VITE_DEEPSEEK_API_KEY。');
  }

  const response = await fetch(`${API_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: buildSystemPrompt(story) },
        { role: 'user', content: buildUserMessage(question) },
      ],
      temperature: 0.3,        // 低温度保证裁判一致性
      max_tokens: 100,          // 只需要短回答
      response_format: { type: 'json_object' },
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text().catch(() => '');
    throw new Error(`DeepSeek API 请求失败 (${response.status}): ${errorBody}`);
  }

  const data = await response.json();
  const rawText = data.choices?.[0]?.message?.content as string | undefined;

  if (!rawText) {
    throw new Error('AI 返回了空响应');
  }

  let parsed: AIRawResponse;
  try {
    parsed = JSON.parse(rawText) as AIRawResponse;
  } catch {
    // 如果 AI 没有严格返回 JSON，尝试兜底匹配
    const lower = rawText.toLowerCase();
    if (lower.includes('yes')) return ANSWER_MAP.yes;
    if (lower.includes('no')) return ANSWER_MAP.no;
    return ANSWER_MAP.irrelevant;
  }

  return formatResponse(parsed);
}
