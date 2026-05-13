import express from "express";
import { createServer as createViteServer } from "vite";
import { GoogleGenerativeAI } from "@google/generative-ai";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Initialize AI lazily to ensure API key is available
  const getAIModel = (systemInstruction?: string) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("API_KEY_MISSING");
    }
    const genAI = new GoogleGenerativeAI(apiKey);
    return genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      systemInstruction: systemInstruction 
    });
  };

  // 🌏 지구쌤 AI 라우트
  app.post("/api/ai", async (req, res) => {
    const { message, history, context, isFeedback } = req.body;

    try {
      if (isFeedback) {
        // Classifier feedback logic
        const { itemName, sphereName } = req.body;
        const prompt = `당신은 중학교 과학 교사 '지구쌤'입니다. 
        상황: 학생이 '${itemName}' 요소를 '${sphereName}'권으로 분류했습니다.
        지침: 이 분류가 과학적인 관점에서 적절한지 판단하고(정답 여부 포함), 그 이유를 카톡 스타일로 아주 짧고 친절하게 한 문장 정도로 설명해주세요. 이모지도 사용하세요.`;

        const model = getAIModel();
        const result = await model.generateContent(prompt);
        const response = await result.response;

        return res.json({ text: response.text() });
      } else {
        // Chat logic
        const systemPrompt = `당신은 초등/중학생을 가르치는 친절하고 짧게 말하는 과학 선생님 '지구쌤'입니다.
핵심 규칙:
1. 답변은 카톡 스타일로 아주 짧고 친절하게 하세요.
2. 전문 용어보다는 학생이 이해하기 쉬운 말로 풀어서 설명하세요.
3. 적절한 이모지를 섞어서 사용하세요.
4. 질문과 관련 없는 이야기는 하지 마세요.
현재 상황: ${context || "지구계 학습 중"}`;

        const model = getAIModel(systemPrompt);
        
        // Convert history for @google/generative-ai
        const chat = model.startChat({
          history: history.map((h: any) => ({
            role: h.role === 'model' ? 'model' : 'user',
            parts: [{ text: h.content }]
          })),
        });

        const result = await chat.sendMessage(message);
        const response = await result.response;

        return res.json({ text: response.text() });
      }
    } catch (error: any) {
      console.error("AI Error:", error);
      
      if (error.message === "API_KEY_MISSING") {
        return res.status(500).json({ text: "지구쌤의 열쇠(API 키)가 설정되지 않았어! 🔑" });
      }

      // Handle 429 and other API errors
      const status = error.status || 500;
      if (status === 429) {
        return res.status(429).json({ 
          text: "앗, 지금 친구들이 한꺼번에 질문해서 지구쌤이 조금 어지러워! 잠시만 이따가 다시 물어봐줄래? 🌏" 
        });
      }
      
      res.status(500).json({ text: "지구쌤이 잠시 응답하기 힘들대. 나중에 다시 시도해줘! 🌏" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
