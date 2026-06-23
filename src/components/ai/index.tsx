import React, { useState } from "react";
import { Button, Field, Tag } from "react-vant";
import { BAILIAN_MODEL } from "../../utils/llm";

interface ChatMessage {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
  model?: string;
}

interface ChatBotProps {
  messages: ChatMessage[];
  onSendMessage: (message: string, model?: string) => void;
  loading?: boolean;
  className?: string;
}

export const ChatBot: React.FC<ChatBotProps> = ({
  messages,
  onSendMessage,
  loading = false,
  className = "",
}) => {
  const [inputValue, setInputValue] = useState("");

  const handleSend = () => {
    const text = inputValue.trim();
    if (!text) return;
    onSendMessage(text, BAILIAN_MODEL);
    setInputValue("");
  };

  return (
    <div className={className}>
      <Tag type="primary">{BAILIAN_MODEL}</Tag>
      <div>
        {messages.map((message) => (
          <div key={message.id}>
            <strong>{message.role === "user" ? "用户" : "AI"}：</strong>
            {message.content}
          </div>
        ))}
      </div>
      <Field
        value={inputValue}
        onChange={setInputValue}
        placeholder="输入消息"
        onKeyPress={(e) => {
          if (e.key === "Enter") handleSend();
        }}
      />
      <Button type="primary" loading={loading} onClick={handleSend}>
        发送
      </Button>
    </div>
  );
};

export const PlantRecognition = () => null;
export const ImageGeneration = () => null;
export const PlantDiagnosis = () => null;
export default ChatBot;
