const BAILIAN_BASE_URL =
  import.meta.env.VITE_BAILIAN_BASE_URL ||
  "https://dashscope.aliyuncs.com/compatible-mode/v1";

export const BAILIAN_CHAT_API_URL =
  import.meta.env.VITE_BAILIAN_CHAT_API_URL ||
  `${BAILIAN_BASE_URL}/chat/completions`;

export const BAILIAN_MODEL =
  import.meta.env.VITE_BAILIAN_MODEL ||
  "qwen3-vl-235b-a22b-thinking";

export type LLMContent =
  | string
  | Array<
      | { type: "text"; text: string }
      | { type: "image_url"; image_url: { url: string } }
    >;

export interface LLMMessage {
  role: "user" | "assistant" | "system";
  content: LLMContent;
}

export interface LLMResponse {
  code: number;
  data?: {
    role: "assistant";
    content: string;
  };
  msg?: string;
}

export const hasBailianConfig = () => {
  return Boolean(import.meta.env.VITE_BAILIAN_API_KEY);
};

export const getBailianModel = () => BAILIAN_MODEL;

const getBailianApiKey = () => import.meta.env.VITE_BAILIAN_API_KEY;

const readMessageContent = (data: any): string => {
  const message = data?.choices?.[0]?.message;
  const content = message?.content;

  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    return content
      .map((item) => (typeof item?.text === "string" ? item.text : ""))
      .join("");
  }

  return "";
};

export const chat = async (
  messages: LLMMessage[],
  apiUrl: string = BAILIAN_CHAT_API_URL,
  apiKey: string = getBailianApiKey(),
  model: string = BAILIAN_MODEL
): Promise<LLMResponse> => {
  try {
    if (!apiKey) {
      throw new Error("百炼 API Key 未配置，请检查 .env.local 中的 VITE_BAILIAN_API_KEY");
    }

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        stream: false,
      }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data?.error?.message || `API 请求失败: ${response.status} ${response.statusText}`);
    }

    const content = readMessageContent(data);
    if (!content) {
      throw new Error("API 响应格式不正确");
    }

    return {
      code: 0,
      data: {
        role: "assistant",
        content,
      },
    };
  } catch (err) {
    console.error("百炼 API 调用失败:", err);
    return {
      code: 1,
      msg: err instanceof Error ? err.message : "百炼 API 调用出错",
    };
  }
};

export const streamChat = async (
  messages: LLMMessage[],
  onChunk: (chunk: string) => void,
  apiUrl: string = BAILIAN_CHAT_API_URL,
  apiKey: string = getBailianApiKey(),
  model: string = BAILIAN_MODEL
): Promise<LLMResponse> => {
  try {
    if (!apiKey) {
      throw new Error("百炼 API Key 未配置，请检查 .env.local 中的 VITE_BAILIAN_API_KEY");
    }

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        stream: true,
      }),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data?.error?.message || `API 请求失败: ${response.status} ${response.statusText}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error("无法读取响应流");
    }

    const decoder = new TextDecoder();
    let fullContent = "";
    let buffer = "";

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith("data:")) continue;

          const payload = trimmed.slice(5).trim();
          if (payload === "[DONE]") {
            return {
              code: 0,
              data: {
                role: "assistant",
                content: fullContent,
              },
            };
          }

          try {
            const parsed = JSON.parse(payload);
            const delta = parsed?.choices?.[0]?.delta;
            const content = delta?.content || "";
            if (content) {
              fullContent += content;
              onChunk(content);
            }
          } catch {
            // Ignore malformed stream fragments.
          }
        }
      }
    } finally {
      reader.releaseLock();
    }

    return {
      code: 0,
      data: {
        role: "assistant",
        content: fullContent,
      },
    };
  } catch (err) {
    console.error("百炼流式 API 调用失败:", err);
    return {
      code: 1,
      msg: err instanceof Error ? err.message : "百炼 API 调用出错",
    };
  }
};

export const bailianChat = async (messages: LLMMessage[]): Promise<LLMResponse> => {
  return chat(messages);
};

export const chatWithModel = async (
  _model: string,
  messages: LLMMessage[]
): Promise<LLMResponse> => {
  return bailianChat(messages);
};

export const plantCareChat = async (
  userMessage: string,
  chatHistory: LLMMessage[] = [],
  _model: string = BAILIAN_MODEL
): Promise<LLMResponse> => {
  const systemPrompt: LLMMessage = {
    role: "system",
    content:
      "你是一个专业的植物养护 AI 助手，名叫小养。请提供专业、准确、简洁、易懂的植物养护建议。涉及疾病诊断时提醒用户结合更多信息或咨询专业人士。",
  };

  const messages: LLMMessage[] = [
    systemPrompt,
    ...chatHistory,
    {
      role: "user",
      content: userMessage,
    },
  ];

  return chatWithModel(BAILIAN_MODEL, messages);
};

export const streamPlantCareChat = async (
  userMessage: string,
  onChunk: (chunk: string) => void,
  chatHistory: LLMMessage[] = [],
  _model: string = BAILIAN_MODEL
): Promise<LLMResponse> => {
  const systemPrompt: LLMMessage = {
    role: "system",
    content:
      "你是一个专业的植物养护 AI 助手，名叫小养。请提供专业、准确、简洁、易懂的植物养护建议。涉及疾病诊断时提醒用户结合更多信息或咨询专业人士。",
  };

  const messages: LLMMessage[] = [
    systemPrompt,
    ...chatHistory,
    {
      role: "user",
      content: userMessage,
    },
  ];

  return streamChat(messages, onChunk);
};
