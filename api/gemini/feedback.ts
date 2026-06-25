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
    const { itemName, sphereName } = req.body;
    if (!itemName || !sphereName) {
      return res.status(400).json({ error: "itemName and sphereName are required." });
    }
    
    const ai = getGeminiClient();
    const prompt = `당신은 중학교 과학 교사 '지구쌤'입니다. 
상황: 학생이 '${itemName}' 요소를 '${sphereName}'권으로 분류했습니다.
지침: 이 분류가 과학적인 관점에서 적절한지 판단하고(정답 여부 포함), 그 이유를 카톡 스타일로 아주 짧고 친절하게 한 문장 정도로 설명해주세요. 이모지도 사용하세요.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash", 
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    res.status(200).json({ text: response.text || "멋진 분류네요! 계속 탐구해봐요. 😊" });
  } catch (error: any) {
    console.error("Vercel AI Feedback Error:", error);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
}
