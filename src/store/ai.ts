import type { ChatMessage, ImageGenerationResult, PlantRecognitionResult } from "./types";
import { BAILIAN_MODEL, streamPlantCareChat, type LLMMessage } from "../utils/llm";

export const aiStore = (set: any, get: any) => ({
  chatMessages: [] as ChatMessage[],
  aiLoading: false,
  recognitionResult: null as PlantRecognitionResult | null,
  generationResults: [] as ImageGenerationResult[],

  sendChatMessage: async (message: string, model: string = BAILIAN_MODEL) => {
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: message,
      role: "user",
      timestamp: new Date(),
    };

    const assistantMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      content: "",
      role: "assistant",
      timestamp: new Date(),
      model: BAILIAN_MODEL,
    };

    set((state: any) => ({
      chatMessages: [...state.chatMessages, userMessage, assistantMessage],
      aiLoading: true,
    }));

    try {
      const chatHistory: LLMMessage[] = get()
        .chatMessages.slice(-10)
        .map((msg: ChatMessage) => ({
          role: msg.role,
          content: msg.content,
        }));

      const response = await streamPlantCareChat(
        message,
        (chunk: string) => {
          set((state: any) => ({
            chatMessages: state.chatMessages.map((msg: ChatMessage) =>
              msg.id === assistantMessage.id
                ? { ...msg, content: msg.content + chunk }
                : msg
            ),
          }));
        },
        chatHistory,
        model
      );

      if (response.code !== 0 || !response.data) {
        throw new Error(response.msg || "AI 响应失败");
      }

      set((state: any) => ({
        chatMessages: state.chatMessages.map((msg: ChatMessage) =>
          msg.id === assistantMessage.id
            ? { ...msg, content: response.data!.content }
            : msg
        ),
        aiLoading: false,
      }));
    } catch (error) {
      set((state: any) => ({
        chatMessages: state.chatMessages.map((msg: ChatMessage) =>
          msg.id === assistantMessage.id
            ? {
                ...msg,
                content:
                  error instanceof Error
                    ? `AI 服务暂时不可用：${error.message}`
                    : "AI 服务暂时不可用，请稍后重试。",
              }
            : msg
        ),
        aiLoading: false,
      }));
      throw error;
    }
  },

  recognizePlant: async (image: File) => {
    const result: PlantRecognitionResult = {
      plantName: "待识别植物",
      species: "未知",
      confidence: 0,
      careTips: ["请在 AI 识别页面上传图片进行识别。"],
      image: URL.createObjectURL(image),
    };
    set({ recognitionResult: result });
  },

  generateImage: async (prompt: string, model: string = BAILIAN_MODEL) => {
    const result: ImageGenerationResult = {
      imageUrl:
        "https://images.unsplash.com/photo-1593691509543-c55fb32e5cee?w=512&h=512&fit=crop",
      prompt,
      model,
      createdAt: new Date(),
    };
    set((state: any) => ({
      generationResults: [...state.generationResults, result],
    }));
    return result;
  },

  diagnosePlant: async (image: File) => {
    return get().recognizePlant(image);
  },

  clearChat: () => set({ chatMessages: [] }),
  clearRecognitionResult: () => set({ recognitionResult: null }),
  clearGenerationResults: () => set({ generationResults: [] }),
  getChatHistory: () => get().chatMessages,
  getRecentMessages: (count: number = 10) => get().chatMessages.slice(-count),
  switchModel: () => undefined,
  getSupportedModels: () => [
    { value: BAILIAN_MODEL, label: "百炼 Qwen3-VL", color: "primary" },
  ],
  getImageModels: () => [
    { value: BAILIAN_MODEL, label: "百炼 Qwen3-VL", color: "primary" },
  ],
  getAvailableModels: async () => [
    { value: BAILIAN_MODEL, label: "百炼 Qwen3-VL", color: "primary" },
  ],
});
