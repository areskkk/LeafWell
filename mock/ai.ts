const MODEL = "qwen3-vl-235b-a22b-thinking";

export default [
  {
    url: "/api/ai/models",
    method: "get",
    response: () => ({
      code: 0,
      data: {
        models: [
          {
            id: MODEL,
            name: "百炼 Qwen3-VL",
            description: "阿里云百炼统一模型",
            supportsStreaming: true,
          },
        ],
      },
    }),
  },
  {
    url: "/api/ai/models/image",
    method: "get",
    response: () => ({
      code: 0,
      data: {
        models: [
          {
            id: MODEL,
            name: "百炼 Qwen3-VL",
            supportedSizes: ["1024x1024"],
          },
        ],
      },
    }),
  },
  {
    url: "/api/ai/chat/history",
    method: "get",
    response: () => ({
      code: 0,
      data: {
        messages: [],
        total: 0,
      },
    }),
  },
  {
    url: "/api/ai/settings",
    method: "get",
    response: () => ({
      code: 0,
      data: {
        defaultChatModel: MODEL,
        defaultImageModel: MODEL,
        maxTokens: 4096,
        temperature: 0.7,
        enableStreaming: true,
        autoSaveHistory: true,
        costLimit: 100,
      },
    }),
  },
];
