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
app.use(cors()); // Allow all CORS for demo, customize in production
app.use(express.json());

// Chat API Route
app.post('/api/chat', async (req, res) => {
  try {
    const { question, story } = req.body;

    if (!question || !story) {
      return res.status(400).json({ error: 'Missing question or story data' });
    }

    // 构造对AI的提示词 (System Prompt)
    const systemPrompt = `你是一个海龟汤（情境猜谜）游戏的无情裁判。
你要回答玩家的提问。你的回答只能是：“是”、“不是”或“与此无关”。
绝对不能透漏完整的真相！只能做最简单的判定。
如果玩家猜出了完整真相（即达到了【汤底】和【核心线索】的要求），你可以恭喜他们并总结真相。
当前的故事题目：${story.surface}
最终的真相（汤底）：${story.answer}
核心线索：${story.keyPoints?.join('; ')}`;

    // 调用DeepSeek API
    const completion = await openai.chat.completions.create({
      model: 'deepseek-chat', 
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: question }
      ]
    });

    const aiAnswer = completion.choices[0].message.content;
    res.json({ answer: aiAnswer });

  } catch (error) {
    console.error('DeepSeek API Error:', error.message);
    res.status(500).json({ error: '服务器裁判开小差了，请稍后再问。' });
  }
});

// GET /api/test
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'Backend server is running correctly!',
    timestamp: new Date().toISOString(),
    status: 'success'
  });
});

// Hello route
app.get('/', (req, res) => {
  res.send('AI Haigui Game Backend Server is Active.');
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🚀 Server is running on http://localhost:${PORT}`);
  console.log(`📝 Test endpoint: http://localhost:${PORT}/api/test\n`);
});
