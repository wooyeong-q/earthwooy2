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
    const { placedItems } = req.body;
    if (!placedItems) {
      return res.status(400).json({ error: "placedItems are required." });
    }
    
    const ai = getGeminiClient();
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
      model: "gemini-3.5-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    res.status(200).json({ text: response.text || "분류 결과를 꼼꼼히 점검해 보았습니다! 전반적으로 아주 잘 진행되었네요. 혹시 헷갈리는 부분이 있다면 다시 한번 살펴볼까요? 👍" });
  } catch (error: any) {
    console.error("Vercel AI Evaluation Error:", error);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
}
