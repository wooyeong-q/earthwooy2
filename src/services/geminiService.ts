import { ChatMessage } from "../types";

/**
 * 1. 분류 결과에 대한 AI 피드백 생성
 */
export async function getAIFeedback(itemName: string, sphereName: string) {
  try {
    const res = await fetch("/api/gemini/feedback", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ itemName, sphereName }),
    });

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const data = await res.json();
    return data.text || "멋진 분류네요! 계속 탐구해봐요. 😊";
  } catch (error: any) {
    console.error("AI Feedback Error:", error);
    return "좋은 시도예요! 다른 것도 분류해볼까요?";
  }
}

/**
 * 2. 자유 채팅 응답 생성
 */
export async function getAIChatResponse(message: string, currentContext?: string, history: ChatMessage[] = []) {
  try {
    const res = await fetch("/api/gemini/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message, currentContext, history }),
    });

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const data = await res.json();
    return data.text || "지구쌤이 잠시 고민 중인가봐요. 다시 한번 말해줄래요?";
  } catch (error: any) {
    console.error("AI Chat Error:", error);
    return "지금은 선생님이 잠시 자리를 비웠어요. 나중에 다시 물어봐 주세요!";
  }
}

/**
 * 3. 전체 분류 결과 정밀 점검 (오류 확인 기능)
 */
export async function getGlobalEvaluation(placedItems: Record<string, any[]>) {
  try {
    const res = await fetch("/api/gemini/evaluation", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ placedItems }),
    });

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const data = await res.json();
    return data.text || "분류 결과를 꼼꼼히 점검해 보았습니다! 전반적으로 아주 잘 진행되었네요. 혹시 헷갈리는 부분이 있다면 다시 한번 살펴볼까요? 👍";
  } catch (error) {
    console.error("Global Evaluation Error:", error);
    return "분류 결과를 점검하는 중에 잠시 오류가 났어요. 다시 한번 시도해볼까요? 😊";
  }
}
