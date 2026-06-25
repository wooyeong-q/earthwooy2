import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Server-side secure Gemini API Endpoints
  app.post("/api/gemini/feedback", async (req, res) => {
    try {
      const { itemName, sphereName } = req.body;
      if (!itemName || !sphereName) {
        return res.status(400).json({ error: "itemName and sphereName are required." });
      }
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "GEMINI_API_KEY environment variable is not set on the server." });
      }
      const ai = new GoogleGenAI({ apiKey });
      const prompt = `당신은 중학교 과학 교사 '지구쌤'입니다. 
상황: 학생이 '${itemName}' 요소를 '${sphereName}'권으로 분류했습니다.
지침: 이 분류가 과학적인 관점에서 적절한지 판단하고(정답 여부 포함), 그 이유를 카톡 스타일로 아주 짧고 친절하게 한 문장 정도로 설명해주세요. 이모지도 사용하세요.`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview", 
        contents: [{ role: "user", parts: [{ text: prompt }] }],
      });

      res.json({ text: response.text || "멋진 분류네요! 계속 탐구해봐요. 😊" });
    } catch (error: any) {
      console.error("Server AI Feedback Error:", error);
      res.status(500).json({ error: error.message || "Internal Server Error" });
    }
  });

  app.post("/api/gemini/chat", async (req, res) => {
    try {
      const { message, currentContext, history } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "GEMINI_API_KEY environment variable is not set on the server." });
      }
      const ai = new GoogleGenAI({ apiKey });
      const systemInstruction = `당신은 초등/중학생을 가르치는 친절하고 짧게 말하는 과학 선생님 '지구쌤'입니다.
핵심 규칙:
1. 답변은 카톡 스타일로 아주 짧고 친절하게 하세요.
2. 전문 용어보다는 학생이 이해하기 쉬운 말로 풀어서 설명하세요.
3. 적절한 이모지를 섞어서 사용하세요.
4. 질문과 관련 없는 이야기는 하지 마세요.
현재 상황: ${currentContext || "지구계 학습 중"}`;

      const contents = (history || []).map((h: any) => ({
        role: h.role === 'model' ? 'model' : 'user',
        parts: [{ text: h.content }]
      }));

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          ...contents,
          { role: 'user', parts: [{ text: message }] }
        ],
        config: {
          systemInstruction: systemInstruction,
        }
      });

      res.json({ text: response.text || "지구쌤이 잠시 고민 중인가봐요. 다시 한번 말해줄래요?" });
    } catch (error: any) {
      console.error("Server AI Chat Error:", error);
      res.status(500).json({ error: error.message || "Internal Server Error" });
    }
  });

  app.post("/api/gemini/evaluation", async (req, res) => {
    try {
      const { placedItems } = req.body;
      if (!placedItems) {
        return res.status(400).json({ error: "placedItems are required." });
      }
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "GEMINI_API_KEY environment variable is not set on the server." });
      }
      const ai = new GoogleGenAI({ apiKey });
      const summary = Object.entries(placedItems)
        .map(([sphere, items]: [string, any]) => `${sphere}: ${items.map((i: any) => i.name).join(", ")}`)
        .join("\n");

      const prompt = `당신은 중학교 과학 교사 '지구쌤'입니다.
학생이 분류한 결과입니다:
${summary}

지침:
1. 각 권역(기권, 지권, 수권, 생물권, 외권)에 분류된 요소들이 과학적으로 올바른지 하나씩 '정밀하게' 점검하세요.
2. 잘못 분류된 요소가 있다면 어떤 것이 잘못되었고, 원래 어디에 속해야 하는지 친절하지만 명확하게 지적해주세요.
3. 모든 분류가 정확하다면 점검이 완료되었음을 알려주고, 고칠 부분이 있다면 어떤 부분을 다시 생각해보면 좋을지 힌트를 주며 조언해주세요.
4. 카톡 스타일로 친절하고 따뜻하게 작성하되, 점수를 매기거나 평가하는 표현은 피하고 '함께 점검하고 확인'하는 느낌으로 작성하세요.
5. 이모지를 적절히 섞어서 3~5문장 내외로 작성하세요.`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [{ role: "user", parts: [{ text: prompt }] }],
      });

      res.json({ text: response.text || "분류 결과를 꼼꼼히 점검해 보았습니다! 전반적으로 아주 잘 진행되었네요. 혹시 헷갈리는 부분이 있다면 다시 한번 살펴볼까요? 👍" });
    } catch (error: any) {
      console.error("Server AI Evaluation Error:", error);
      res.status(500).json({ error: error.message || "Internal Server Error" });
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
