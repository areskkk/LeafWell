const BAILIAN_BASE_URL =
  import.meta.env.VITE_BAILIAN_BASE_URL ||
  "https://dashscope.aliyuncs.com/compatible-mode/v1";
const BAILIAN_CHAT_API_URL =
  import.meta.env.VITE_BAILIAN_CHAT_API_URL ||
  `${BAILIAN_BASE_URL}/chat/completions`;
const BAILIAN_MODEL =
  import.meta.env.VITE_BAILIAN_MODEL ||
  "qwen3-vl-235b-a22b-thinking";

export const chat = async (
  messages,
  apiUrl = BAILIAN_CHAT_API_URL,
  apiKey = import.meta.env.VITE_BAILIAN_API_KEY,
  model = BAILIAN_MODEL
) => {
  try {
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
    const data = await response.json();
    return {
      code: 0,
      data: {
        role: "assistant",
        content: data.choices[0].message.content,
      },
    };
  } catch (err) {
    return {
      code: 1,
      msg: "百炼 API 调用出错",
    };
  }
};

export const bailianChat = async (messages) => {
  return chat(messages);
};

export const kimiChat = bailianChat;

export const generateAvatar = async (text) => {
  const prompt = `
    你是一位漫画设计师，需要为用户设计头像。
    用户的信息是${text}
    要求有个性，有设计感。
    `;
  return prompt;
};
