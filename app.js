const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

console.log('API_KEY exists?', !!process.env.API_KEY);

const app = express();
const corsOptions = {
  origin: 'https://sweet-medovik-3b21c7.netlify.app', // 替换成你的真实前端地址
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
  credentials: true,
  maxAge: 86400
};
app.use(cors(corsOptions));
app.options('/*splat', cors(corsOptions));
app.use(express.json());

app.post('/api/ask', async (req, res) => {
    console.log('Received body:', req.body);
    const userQuestion = req.body.question;
    if (!userQuestion) {
        return res.status(400).json({ error: '请输入问题' });
    }

    try {
        const response = await axios.post('https://api.deepseek.com/v1/chat/completions', {
            model: 'deepseek-v4-flash',
            messages: [
                { role:'system',content:'你是是一个专业的把中文口语转换为中国古代文言文表达的助手，只负责将用户的输入的中文口语转为中国古代文言文表达，不要输出任何额外的解释或标点，如果输入涉及政治敏感和明显色情，直接输出“该内容无法输出。”。'},
                { role: 'user', content: userQuestion }],
            max_tokens: 300,
            "thinking": {"type": "disabled"} 
        }, {
            headers: {
                'Authorization': `Bearer ${process.env.API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        const aiAnswer = response.data.choices[0].message.content;
        res.json({ answer: aiAnswer });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'AI调用失败' });
    }
});

const PORT = process.env.PORT||3000;
app.listen(PORT, () => {
    console.log(`后端运行在 http://localhost:${PORT}`);
});