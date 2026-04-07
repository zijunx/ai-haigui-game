const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// 初始化DeepSeek (因为它兼容OpenAI协议，所以可以直接用openai库)
const { OpenAI } = require('openai');
const openai = new OpenAI({
  baseURL: 'https://api.deepseek.com', // DeepSeek的API地址
  apiKey: process.env.DEEPSEEK_API_KEY || 'empty',
});

// Middleware
const requestLogger = require('./logger');
const { AppError, errorHandler } = require('./errorHandler');

app.use(cors()); // Allow all CORS for demo, customize in production
app.use(express.json());
app.use(requestLogger);

// Async Wrapper to catch errors automatically
const catchAsync = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Chat API Handler Logic
const chatHandler = catchAsync(async (req, res, next) => {
  const { question, story, history = [] } = req.body;

  // 1. 参数验证 (BadRequest - 400)
  if (!question || !story) {
    return next(new AppError('参数错误：缺少问题或剧本数据 (Missing question or story)', 400));
  }

  const { surface, answer, keyPoints } = story;

  // ============================================================
  // 核心 Prompt 设计哲学：
  // 1. 判定词（是/不是/与此无关）必须精准，保证可解析
  // 2. 旁白文字营造叙事氛围，不直接泄露线索
  // 3. 鼓励高频输出旁白，建立游戏沉浸感
  // 4. 玩家完全破解时，给予戏剧性的揭幕感
  // ============================================================
  const systemPrompt = `你是一个极具风格的海龟汤游戏裁判，同时也是一位叙事者。
你掌握着这个故事的全部真相，你的职责是引导玩家抽丝剥茧地接近它。

## 角色设定
你冷静、克制、带着一丝神秘感。你不会轻易表露情绪，但当玩家触碰到关键真相时，你的语气会微妙地变化。

## 判定规则（极为严格，必须精准）：
- 若玩家的猜测符合汤底事实/方向正确 → verdict: "是"
- 若玩家的猜测违背汤底事实/方向错误 → verdict: "不是"
- 【遇到疑问句/元问题】如果玩家问“案子破了吗”、“我猜对了吗”等总结性问题，且他们**还没有**完全猜出所有核心线索：不要回答“与此无关”，请回答 "不是"，并在旁白中精准打击他们遗漏的盲区（例如：“你猜到了他们在拍戏，但你还没说出幸存者本人的真实职业是什么”）。
- 【警告】千万不要滥用“与此无关”！只有当玩家问了完全脱离故事世界观的废话（比如今天天气好吗、他多高）时才能用。只要玩家的提问试探到了核心诡计的边缘（例如气味、味道、身份真假、时间错乱等），哪怕他们的假设再离谱，你也必须根据事实回答“是”或“不是”，并用旁白纠正，**绝对不能用“与此无关”掐断线索！**
- 【通关判定（最高优先级）】**绝不能死抠字眼！** 请综合阅读玩家**整局的对话历史**。只要玩家的意思已经覆盖了所有【核心线索】（比如玩家说“拍戏用的假人和一个演员”，这就已经等同于包含了“职业是演员、别人是假人、不是活人”这所有要素），立刻无条件判定通关 → verdict: "是"，isFinished: true

## 旁白规则（即“破案提示”，强烈鼓励高频使用！）
旁白（atmosphere）是你的专属发声渠道，最多40字。除了营造悬疑氛围，**它更重要的作用是充当“指路明灯”**，帮助玩家不断推进进度。
请把握以下分寸：
1. **引导未解谜团**：当玩家猜对了一部分，但在关键点卡住时，旁白必须主动引导他们关注那些**还未被猜出的“核心线索”**（例如引导他们思考动机、被忽略的物品、某个隐藏的身份等）。
2. **纠正破案方向**：当玩家的猜测完全不符合汤底时，旁白除了否定，还要含蓄地指出一个大方向（例如玩家猜环境致死，你可以提示：“比起外部自然，致命的威胁往往来自于他主动吞下的东西”）。
3. **严控分寸**：给予“实质性的暗示”和“方向指导”，但**绝对不能直接抛出汤底里的敏感词汇/具体答案**。要用“这个东西”、“那个人”、“真正的动机”来代替。

**优质提示设计参考（切勿照搬）：**
- "这扇门确实没锁，但你有没有想过，他是为了躲避什么才跑进去的？"
- "不用纠结外表的伤痕……真正带走他生命的，或许是无形之物。"
- "那他为什么要这么做呢？有时候，牺牲是为了更重要的人。"

## 输出格式（必须严格遵守，返回纯JSON，禁止任何Markdown标记）
{
  "verdict": "是" | "不是" | "与此无关",
  "atmosphere": "旁白文字",
  "isFinished": false
}

## 当前案件档案
汤面（玩家已知）：${surface}
汤底（绝密，绝对不可直接透露任何细节）：${answer}
核心线索（全部猜出才算通关）：${(keyPoints || []).join('、')}

## 示例演示
玩家问："他有病吗？"（汤底：没病）
→ {"verdict": "不是", "atmosphere": "他的身体很健康，只是运气不太好。", "isFinished": false}

玩家问："昨天下雨了吗？"（完全无关）
→ {"verdict": "与此无关", "atmosphere": "那天的雨水，洗不掉这件案子的诡异。", "isFinished": false}

玩家问："他是被毒死的？"（触碰关键线索，开始接近真相）
→ {"verdict": "是", "atmosphere": "毒，是种安静的武器。不过，那杯水是谁递过去的呢？", "isFinished": false}

现在，请对玩家的提问进行判定。`;

  // 构建对话历史 messages
  const messagesArray = [
    { role: 'system', content: systemPrompt }
  ];

  // 只取最近的 20 条消息，防止 tokens 爆炸
  const recentHistory = history.slice(-20);
  recentHistory.forEach((msg) => {
    // 忽略第一条打招呼的系统消息
    if (msg.id === 'welcome') return;
    
    let content = msg.content;
    // 重建 AI 的历史返回格式，确保大模型不会在后续回答中“忘了”需要输出 JSON
    if (msg.role === 'assistant') {
      content = JSON.stringify({
        verdict: msg.content,
        atmosphere: msg.atmosphere || '',
        isFinished: false
      });
    }

    messagesArray.push({
      role: msg.role === 'assistant' ? 'assistant' : 'user',
      content
    });
  });

  // 加入当前的最新问题
  messagesArray.push({ role: 'user', content: question });

  try {
    const completion = await openai.chat.completions.create({
      model: 'deepseek-chat',
      messages: messagesArray,
      temperature: 0.6,        // 稍高一点，让旁白更有文学感，但不影响判定精准度
      max_tokens: 200,
      response_format: { type: 'json_object' },
    });
    //fallbacktest
    //completion.choices[0].message.content = "这是一段完全脱轨的、不符合JSON格式的瞎编乱造的回答。";
    let parsed;
    try {
      parsed = JSON.parse(completion.choices[0].message.content);
    } catch (e) {
      // JSON 解析失败：用正则兜底提取判定词
      const raw = completion.choices[0].message.content;
      console.warn('[Fallback] AI JSON parse failed, raw:', raw);
      const match = raw.match(/(与此无关|不是|是)/);
      parsed = {
        verdict: match ? match[0] : '与此无关',
        atmosphere: '（裁判走了个神，但判定已送达）',
        isFinished: false,
      };
    }

    // Fallback：判定词不在合法范围内，强制规范化
    const validVerdicts = ['是', '不是', '与此无关'];
    if (!validVerdicts.includes(parsed.verdict)) {
      parsed.verdict = '与此无关';
      parsed.atmosphere = '这个问题让裁判也陷入了沉思……试着换个角度提问吧。';
    }

    res.json({
      // 保持向前兼容：前端的 data.answer 字段仍然有效
      answer: parsed.verdict,
      atmosphere: parsed.atmosphere || null,
      isFinished: !!parsed.isFinished,
    });

  } catch (error) {
    return next(new AppError(`AI裁判调用失败: ${error.message}`, 502));
  }
});

// Chat API Routes
app.post('/api/chat', chatHandler);
app.post('/ask', chatHandler);

// GET /api/test (Also uses catchAsync)
app.get('/api/test', catchAsync(async (req, res) => {
  res.json({
    message: 'Backend server is running correctly!',
    timestamp: new Date().toISOString(),
    status: 'success'
  });
}));

// Hello route
app.get('/', (req, res) => {
  res.send('AI Haigui Game Backend Server is Active.');
});

// Final Error Handling Middleware (must be after all routes)
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`\n🚀 Server is running on http://localhost:${PORT}`);
  console.log(`📝 Test endpoint: http://localhost:${PORT}/api/test\n`);
});
