import React, { useRef, useState } from "react";
import { Button, Card, Field, Image, Loading } from "react-vant";
import { Arrow, ArrowLeft, Delete, PhotoO } from "@react-vant/icons";
import { useNavigate } from "react-router-dom";
import {
  BAILIAN_CHAT_API_URL,
  BAILIAN_MODEL,
  hasBailianConfig,
  streamPlantCareChat,
} from "../../../utils/llm";
import { useTitle } from "../../../hooks";
import styles from "./recognition.module.css";

interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
  type: "text" | "recognition";
}

const recognitionPrompt = `请分析这张植物图片，识别植物种类并提供养护建议。请尽量返回 JSON：
{
  "plantName": "植物中文名",
  "scientificName": "植物学名",
  "confidence": 0.95,
  "description": "植物描述",
  "careAdvice": "浇水、光照、温度、施肥等建议"
}`;

const PlantRecognition: React.FC = () => {
  useTitle();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isRecognizing, setIsRecognizing] = useState(false);
  const [isChatting, setIsChatting] = useState(false);
  const configured = hasBailianConfig();

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("请选择图片文件");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      alert("图片大小不能超过 10MB");
      return;
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const recognizePlant = async () => {
    if (!imageFile || !configured) {
      alert("请先上传图片并配置百炼 API Key");
      return;
    }

    setIsRecognizing(true);
    try {
      const imageBase64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(imageFile);
      });

      const response = await fetch(BAILIAN_CHAT_API_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_BAILIAN_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: BAILIAN_MODEL,
          messages: [
            {
              role: "user",
              content: [
                { type: "image_url", image_url: { url: imageBase64 } },
                { type: "text", text: recognitionPrompt },
              ],
            },
          ],
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error?.message || "识别失败");
      }

      const content = data?.choices?.[0]?.message?.content || "未获取到识别结果";
      setMessages([
        {
          id: Date.now().toString(),
          content,
          role: "assistant",
          timestamp: new Date(),
          type: "recognition",
        },
      ]);
    } catch (error) {
      alert(error instanceof Error ? error.message : "识别失败，请重试");
    } finally {
      setIsRecognizing(false);
    }
  };

  const handleSendMessage = async () => {
    const text = inputValue.trim();
    if (!text || isChatting || !configured) return;

    const context = messages.length
      ? `前面植物识别结果：${messages[messages.length - 1].content}\n用户追问：${text}`
      : text;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: text,
      role: "user",
      timestamp: new Date(),
      type: "text",
    };
    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      content: "",
      role: "assistant",
      timestamp: new Date(),
      type: "text",
    };

    setMessages((prev) => [...prev, userMessage, assistantMessage]);
    setInputValue("");
    setIsChatting(true);

    try {
      const response = await streamPlantCareChat(
        context,
        (chunk) => {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMessage.id
                ? { ...msg, content: msg.content + chunk }
                : msg
            )
          );
        },
        [],
        BAILIAN_MODEL
      );

      if (response.code !== 0) {
        throw new Error(response.msg || "AI 回复失败");
      }
    } catch (error) {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessage.id
            ? {
                ...msg,
                content: error instanceof Error ? error.message : "AI 回复失败",
              }
            : msg
        )
      );
    } finally {
      setIsChatting(false);
    }
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview("");
    setMessages([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className={styles.recognitionPage}>
      <div className={styles.header}>
        <Button
          size="small"
          icon={<ArrowLeft />}
          onClick={() => navigate("/ai")}
          className={styles.backButton}
        >
          返回
        </Button>
        <div className={styles.headerContent}>
          <div className={styles.headerText}>
            <h1 className={styles.title}>植物识别</h1>
            <p className={styles.subtitle}>模型：{BAILIAN_MODEL}</p>
          </div>
        </div>
      </div>

      {!configured && (
        <Card className={styles.warningCard}>
          <div className={styles.warningText}>
            请在 .env.local 配置 VITE_BAILIAN_API_KEY
          </div>
        </Card>
      )}

      <div className={styles.uploadSection}>
        <Card className={styles.uploadCard}>
          {!imagePreview ? (
            <div
              className={styles.uploadArea}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className={styles.uploadIcon}>
                <PhotoO />
              </div>
              <div className={styles.uploadText}>
                <h3>上传植物照片</h3>
                <p>支持 JPG、PNG，文件不超过 10MB</p>
              </div>
            </div>
          ) : (
            <div className={styles.imagePreview}>
              <Image
                src={imagePreview}
                alt="植物照片"
                fit="cover"
                width="100%"
                height="200"
                radius="8"
              />
              <Button size="small" type="danger" icon={<Delete />} onClick={clearImage}>
                重新选择
              </Button>
              <Button
                type="primary"
                size="large"
                block
                loading={isRecognizing}
                disabled={!configured}
                onClick={recognizePlant}
                className={styles.recognizeButton}
              >
                开始识别
              </Button>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            style={{ display: "none" }}
          />
        </Card>
      </div>

      {messages.length > 0 && (
        <div className={styles.chatSection}>
          <Card className={styles.chatCard}>
            <div className={styles.messagesContainer}>
              <div className={styles.messagesList}>
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`${styles.messageItem} ${
                      message.role === "user"
                        ? styles.userMessage
                        : styles.assistantMessage
                    }`}
                  >
                    <div className={styles.messageContent}>
                      <div className={styles.messageText}>{message.content}</div>
                    </div>
                  </div>
                ))}
                {isChatting && (
                  <Loading size="small" color="#4CAF50">
                    正在思考...
                  </Loading>
                )}
              </div>
            </div>

            <div className={styles.inputSection}>
              <div className={styles.inputContainer}>
                <Field
                  value={inputValue}
                  onChange={setInputValue}
                  placeholder="继续追问养护问题..."
                  className={styles.messageInput}
                  onKeyPress={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                />
                <Button
                  type="primary"
                  size="small"
                  icon={<Arrow />}
                  className={styles.sendButton}
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isChatting || !configured}
                />
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default PlantRecognition;
