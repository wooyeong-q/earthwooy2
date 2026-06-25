import { ChatMessage } from "../types";
import { GoogleGenAI } from "@google/genai";

// Initialize client-side Gemini client lazily if fallback key is provided
let clientSideAI: any = null;

function getClientSideAI() {
  if (clientSideAI) return clientSideAI;
  
  const apiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY || (window as any).GEMINI_API_KEY;
  if (apiKey) {
    clientSideAI = new GoogleGenAI({ apiKey });
    return clientSideAI;
  }
  return null;
}

/**
 * 1. 분류 결과에 대한 AI 피드백 생성
 */
export async function getAIFeedback(itemName: string, sphereName: string) {
  // First, try secure server-side API call
  try {
    const res = await fetch("/api/gemini/feedback", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ itemName, sphereName }),
    });

    if (res.ok) {
      const data = await res.json();
      return data.text || "멋진 분류네요! 계속 탐구해봐요. 😊";
    }
  } catch (serverError) {
    console.warn("Server API not available, trying client-side fallback...", serverError);
  }

  // Fallback to direct client-side Gemini call if VITE_GEMINI_API_KEY is available
  try {
    const ai = getClientSideAI();
    if (ai) {
      const prompt = `당신은 중학교 과학 교사 '지구쌤'입니다. 
상황: 학생이 '${itemName}' 요소를 '${sphereName}'권으로 분류했습니다.
지침: 이 분류가 과학적인 관점에서 적절한지 판단하고(정답 여부 포함), 그 이유를 카톡 스타일로 아주 짧고 친절하게 한 문장 정도로 설명해주세요. 이모지도 사용하세요.`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [{ role: "user", parts: [{ text: prompt }] }],
      });
      return response.text || "멋진 분류네요! 계속 탐구해봐요. 😊";
    }
  } catch (clientError) {
    console.error("Client-side fallback error:", clientError);
  }

  return "좋은 시도예요! 다른 것도 분류해볼까요?";
}

/**
 * 2. 자유 채팅 응답 생성
 */
export async function getAIChatResponse(message: string, currentContext?: string, history: ChatMessage[] = []) {
  // First, try secure server-side API call
  try {
    const res = await fetch("/api/gemini/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message, currentContext, history }),
    });

    if (res.ok) {
      const data = await res.json();
      return data.text || "지구쌤이 잠시 고민 중인가봐요. 다시 한번 말해줄래요?";
    }
  } catch (serverError) {
    console.warn("Server API not available, trying client-side fallback...", serverError);
  }

  // Fallback to direct client-side Gemini call if VITE_GEMINI_API_KEY is available
  try {
    const ai = getClientSideAI();
    if (ai) {
      const systemInstruction = `당신은 초등/중학생을 가르치는 친절하고 짧게 말하는 과학 선생님 '지구쌤'입니다.
핵심 규칙:
1. 답변은 카톡 스타일로 아주 짧고 친절하게 하세요.
2. 전문 용어보다는 학생이 이해하기 쉬운 말로 풀어서 설명하세요.
3. 적절한 이모지를 섞어서 사용하세요.
4. 질문과 관련 없는 이야기는 하지 마세요.
현재 상황: ${currentContext || "지구계 학습 중"}`;

      const contents = history.map(h => ({
        role: h.role === 'model' ? 'model' : 'user',
        parts: [{ text: h.content }]
      }));

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
          ...contents,
          { role: 'user', parts: [{ text: message }] }
        ],
        config: {
          systemInstruction: systemInstruction,
        }
      });
      return response.text || "지구쌤이 잠시 고민 중인가봐요. 다시 한번 말해줄래요?";
    }
  } catch (clientError) {
    console.error("Client-side fallback error:", clientError);
  }

  return "지금은 선생님이 잠시 자리를 비웠어요. 나중에 다시 물어봐 주세요! (정적 호스팅 환경인 경우 VITE_GEMINI_API_KEY 설정을 확인해주세요)";
}

/**
 * 3. 전체 분류 결과 정밀 점검 (오류 확인 기능)
 */
export async function getGlobalEvaluation(placedItems: Record<string, any[]>) {
  // First, try secure server-side API call
  try {
    const res = await fetch("/api/gemini/evaluation", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ placedItems }),
    });

    if (res.ok) {
      const data = await res.json();
      return data.text || "분류 결과를 꼼꼼히 점검해 보았습니다! 전반적으로 아주 잘 진행되었네요. 혹시 헷갈리는 부분이 있다면 다시 한번 살펴볼까요? 👍";
    }
  } catch (serverError) {
    console.warn("Server API not available, trying client-side fallback...", serverError);
  }

  // Fallback to direct client-side Gemini call if VITE_GEMINI_API_KEY is available
  try {
    const ai = getClientSideAI();
    if (ai) {
      const summary = Object.entries(placedItems)
        .map(([sphere, items]) => `${sphere}: ${items.map(i => i.name).join(", ")}`)
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
        model: "gemini-2.5-flash",
        contents: [{ role: "user", parts: [{ text: prompt }] }],
      });
      return response.text || "분류 결과를 꼼꼼히 점검해 보았습니다! 전반적으로 아주 잘 진행되었네요. 혹시 헷갈리는 부분이 있다면 다시 한번 살펴볼까요? 👍";
    }
  } catch (clientError) {
    console.error("Client-side fallback error:", clientError);
  }

  return "분류 결과를 점검하는 중에 잠시 오류가 났어요. 서버 연결 또는 API Key 설정을 확인해주세요! 😊";
}
