import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Button, Card, Field, Loading, Tag } from "react-vant";
import { Arrow, PhotoO } from "@react-vant/icons";
import { useNavigate } from "react-router-dom";
import { useAI, useTitle } from "../../hooks";
import { BAILIAN_MODEL, hasBailianConfig } from "../../utils/llm";
import styles from "./ai.module.css";

const AIPage: React.FC = () => {
  useTitle();
  const navigate = useNavigate();
  const { sendChatMessage, aiLoading, chatMessages, clearChat } = useAI();
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const configured = hasBailianConfig();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const handleSendMessage = async () => {
    const message = inputValue.trim();
    if (!message || aiLoading || !configured) return;

    setInputValue("");
    await sendChatMessage(message, BAILIAN_MODEL);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const inputBar = (
    <div className={styles.inputSection}>
      <div className={styles.inputContainer}>
        <Field
          value={inputValue}
          onChange={setInputValue}
          placeholder="输入你的植物养护问题..."
          className={styles.messageInput}
          onKeyPress={handleKeyPress}
        />
        <Button
          type="primary"
          size="small"
          icon={<Arrow />}
          className={styles.sendButton}
          onClick={handleSendMessage}
          disabled={!inputValue.trim() || aiLoading || !configured}
          loading={aiLoading}
        />
      </div>
    </div>
  );

  return (
    <div className={styles.aiPage}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerText}>
            <h1 className={styles.title}>AI 植物助手</h1>
            <p className={styles.subtitle}>当前模型：{BAILIAN_MODEL}</p>
          </div>
        </div>
      </div>

      {!configured && (
        <div className={styles.configWarning}>
          <Card className={styles.warningCard}>
            <div className={styles.warningContent}>
              <div className={styles.warningText}>
                <h3>需要配置百炼 API Key</h3>
                <div className={styles.codeBlock}>
                  <pre>VITE_BAILIAN_API_KEY=sk-your-bailian-key</pre>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      <div className={styles.featuresSection}>
        <h3 className={styles.featuresTitle}>其他功能</h3>
        <div className={styles.featuresGrid}>
          <Card
            className={styles.featureCard}
            onClick={() => navigate("/ai/recognition")}
          >
            <div className={styles.featureContent}>
              <div className={styles.featureIcon}>
                <PhotoO />
              </div>
              <div className={styles.featureInfo}>
                <h4 className={styles.featureTitle}>植物识别</h4>
                <p className={styles.featureDesc}>
                  上传图片，使用百炼视觉模型识别植物。
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <div className={styles.chatContainer}>
        <div className={styles.chatHeader}>
          <div className={styles.chatHeaderInfo}>
            <h2 className={styles.chatTitle}>养护咨询</h2>
            <p className={styles.chatSubtitle}>
              <Tag type="primary">百炼</Tag> {BAILIAN_MODEL}
            </p>
          </div>
          <Button size="small" onClick={clearChat}>
            清空
          </Button>
        </div>

        <div className={styles.messagesContainer}>
          <div className={styles.messagesList}>
            {chatMessages.length === 0 && (
              <div className={styles.emptyChat}>
                <p className={styles.emptyChatText}>输入植物养护问题开始对话。</p>
              </div>
            )}

            {chatMessages.map((message: any) => (
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

            {aiLoading && (
              <div className={`${styles.messageItem} ${styles.assistantMessage}`}>
                <div className={styles.messageContent}>
                  <Loading size="small" color="#4CAF50">
                    正在思考...
                  </Loading>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

      {createPortal(inputBar, document.body)}
    </div>
  );
};

export default AIPage;
