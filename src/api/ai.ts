import { api } from "../utils/request";
import { BAILIAN_MODEL, chatWithModel, type LLMMessage } from "../utils/llm";
import type {
  ChatMessage,
  ImageGenerationResult,
  PlantRecognitionResult,
} from "../store/types";

export const aiChatAPI = {
  sendMessage: async (data: {
    message: string;
    model?: string;
    history?: ChatMessage[];
    context?: string;
  }): Promise<{
    content: string;
    model: string;
    timestamp: string;
    usage?: {
      promptTokens: number;
      completionTokens: number;
      totalTokens: number;
    };
  }> => {
    const messages: LLMMessage[] = [];

    if (data.context) {
      messages.push({ role: "system", content: data.context });
    }

    if (data.history?.length) {
      messages.push(
        ...data.history.slice(-10).map((msg) => ({
          role: msg.role,
          content: msg.content,
        }))
      );
    }

    messages.push({ role: "user", content: data.message });

    const response = await chatWithModel(BAILIAN_MODEL, messages);
    if (response.code !== 0 || !response.data) {
      throw new Error(response.msg || "LLM 调用失败");
    }

    return {
      content: response.data.content,
      model: BAILIAN_MODEL,
      timestamp: new Date().toISOString(),
      usage: {
        promptTokens: 0,
        completionTokens: 0,
        totalTokens: 0,
      },
    };
  },

  getChatHistory: async (params?: {
    page?: number;
    pageSize?: number;
    model?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<{ messages: ChatMessage[]; total: number }> => {
    return api.get("/ai/chat/history", { params });
  },

  clearChatHistory: async (): Promise<void> => {
    return api.delete("/ai/chat/history");
  },

  getChatModels: async () => ({
    models: [
      {
        id: BAILIAN_MODEL,
        name: "百炼 Qwen3-VL",
        description: "阿里云百炼 qwen3-vl-235b-a22b-thinking",
        maxTokens: 128000,
        supportsStreaming: true,
        pricing: {
          input: 0,
          output: 0,
        },
      },
    ],
  }),

  streamChat: async (
    _data: {
      message: string;
      model?: string;
      history?: ChatMessage[];
    },
    _onMessage: (chunk: string) => void
  ): Promise<void> => {
    throw new Error("请使用 streamPlantCareChat 进行流式聊天");
  },
};

export const aiRecognitionAPI = {
  recognizePlant: async (
    image: File,
    options?: { confidence?: number; maxResults?: number }
  ): Promise<PlantRecognitionResult> => {
    const formData = new FormData();
    formData.append("image", image);
    if (options) formData.append("options", JSON.stringify(options));
    return api.upload("/ai/recognize", formData);
  },

  recognizePlants: async (images: File[]): Promise<PlantRecognitionResult[]> => {
    const formData = new FormData();
    images.forEach((image, index) => formData.append(`images[${index}]`, image));
    return api.upload("/ai/recognize/batch", formData);
  },

  getRecognitionHistory: async (params?: {
    page?: number;
    pageSize?: number;
    startDate?: string;
    endDate?: string;
  }) => {
    return api.get("/ai/recognize/history", { params });
  },

  getPlantInfo: async (plantName: string) => {
    return api.get(`/ai/plants/${encodeURIComponent(plantName)}/info`);
  },
};

export const aiGenerationAPI = {
  generateImage: async (data: {
    prompt: string;
    model?: string;
    size?: string;
    quality?: string;
    style?: string;
  }): Promise<ImageGenerationResult> => {
    return api.post("/ai/generate", { ...data, model: BAILIAN_MODEL });
  },

  generateImages: async (data: {
    prompts: string[];
    model?: string;
    size?: string;
    quality?: string;
  }): Promise<ImageGenerationResult[]> => {
    return api.post("/ai/generate/batch", { ...data, model: BAILIAN_MODEL });
  },

  getGenerationHistory: async (params?: {
    page?: number;
    pageSize?: number;
    model?: string;
    startDate?: string;
    endDate?: string;
  }) => {
    return api.get("/ai/generate/history", { params });
  },

  getImageModels: async () => ({
    models: [
      {
        id: BAILIAN_MODEL,
        name: "百炼 Qwen3-VL",
        description: "阿里云百炼统一模型",
        supportedSizes: ["1024x1024"],
        pricing: { perImage: 0 },
      },
    ],
  }),
};

export const aiDiagnosisAPI = {
  diagnosePlant: async (data: {
    image: File;
    symptoms?: string;
    plantName?: string;
  }) => {
    const formData = new FormData();
    formData.append("image", data.image);
    if (data.symptoms) formData.append("symptoms", data.symptoms);
    if (data.plantName) formData.append("plantName", data.plantName);
    return api.upload("/ai/diagnose", formData);
  },
  getDiagnosisHistory: async (params?: Record<string, any>) => {
    return api.get("/ai/diagnose/history", { params });
  },
  getCommonPlantIssues: async (plantName?: string) => {
    return api.get("/ai/diagnose/common-issues", {
      params: plantName ? { plantName } : undefined,
    });
  },
};

export const aiWorkflowAPI = {
  executeWorkflow: async (workflowId: string, data: Record<string, any>) => {
    return api.post(`/ai/workflows/${workflowId}/execute`, data);
  },
  getWorkflows: async () => api.get("/ai/workflows"),
  getWorkflowHistory: async (params?: Record<string, any>) => {
    return api.get("/ai/workflows/history", { params });
  },
};

export const aiSettingsAPI = {
  getAISettings: async () => api.get("/ai/settings"),
  updateAISettings: async (settings: Record<string, any>) => {
    return api.put("/ai/settings", settings);
  },
  getAIUsageStats: async (params?: Record<string, any>) => {
    return api.get("/ai/usage", { params });
  },
};

export const aiAPIs = {
  chat: aiChatAPI,
  recognition: aiRecognitionAPI,
  generation: aiGenerationAPI,
  diagnosis: aiDiagnosisAPI,
  workflow: aiWorkflowAPI,
  settings: aiSettingsAPI,
};
