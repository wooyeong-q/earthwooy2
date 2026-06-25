import { GoogleGenAI } from "@google/genai";

const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY가 설정되어 있지 않습니다.");
  }
  return new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
};

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { message, currentContext, history } = req.body;
    
    const ai = getGeminiClient();
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
      model: "gemini-3.5-flash",
      contents: [
        ...contents,
        { role: 'user', parts: [{ text: message }] }
      ],
      config: {
        systemInstruction: systemInstruction,
      }
    });

    res.status(200).json({ text: response.text || "지구쌤이 잠시 고민 중인가봐요. 다시 한번 말해줄래요?" });
  } catch (error: any) {
    console.error("Vercel AI Chat Error:", error);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
}
