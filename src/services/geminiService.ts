import { ChatMessage } from "../types";

export async function getAIFeedback(itemName: string, sphereName: string) {
  try {
    const response = await fetch('/api/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        isFeedback: true,
        itemName,
        sphereName
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        const data = await response.json();
        return data.text;
      }
      throw new Error('API request failed');
    }

    const data = await response.json();
    return data.text || "멋진 분류네요! 계속 탐구해봐요. 😊";
  } catch (error) {
    console.error("Service Error:", error);
    return "지구쌤과 연결이 잠시 끊겼어! 다시 시도해줘. 🌏";
  }
}

export async function getAIChatResponse(message: string, currentContext?: string, history: ChatMessage[] = []) {
  try {
    const response = await fetch('/api/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        history,
        context: currentContext,
        isFeedback: false
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        const data = await response.json();
        return data.text;
      }
      throw new Error('API request failed');
    }

    const data = await response.json();
    return data.text || "지구쌤이 잠시 고민 중인가봐요. 다시 한번 말해줄래요?";
  } catch (error) {
    console.error("Service Error:", error);
    return "지구쌤과 연결이 잠시 끊겼어! 다시 시도해줘. 🌏";
  }
}
