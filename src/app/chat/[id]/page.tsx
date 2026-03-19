'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';

interface Future {
  id: number;
  title: string;
  description: string;
  years: number;
  prompt: string;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function ChatPage() {
  const router = useRouter();
  const params = useParams();
  const [future, setFuture] = useState<Future | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem('chatFuture');
    if (!stored) {
      router.push('/tree');
      return;
    }
    const data = JSON.parse(stored);
    setFuture(data);

    // 初始问候
    setMessages([
      {
        role: 'assistant',
        content: `你好，我是${data.years}年后的你。${data.description} 你有什么想问我的吗？`,
      },
    ]);
  }, [router]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading || !future) return;

    const userMessage = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, { role: 'user', content: userMessage }],
          systemPrompt: future.prompt,
          futureTitle: future.title,
          futureYears: future.years,
          futureDescription: future.description,
        }),
      });

      const data = await response.json();
      setMessages((prev) => [...prev, { role: 'assistant', content: data.reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: '抱歉，连接中断了，请重试。' },
      ]);
    }
    setLoading(false);
  };

  if (!future) {
    return <div className="loading-page">加载中...</div>;
  }

  return (
    <div className="chat-page">
      <div className="chat-notebook">
        {/* 顶部 */}
        <div className="chat-header">
          <button className="back-btn" onClick={() => router.push('/tree')}>
            ← 返回
          </button>
          <div className="chat-title">
            未来 #{future.id} · {future.title}
            <span className="chat-subtitle">{future.years}年后的自己</span>
          </div>
        </div>

        {/* 消息列表 */}
        <div className="chat-messages">
          {messages.map((msg, i) => (
            <div key={i} className={`chat-bubble ${msg.role}`}>
              <div className="bubble-label">
                {msg.role === 'assistant' ? `${future.years}年后的我` : '现在的我'}
              </div>
              <div className="bubble-content">{msg.content}</div>
            </div>
          ))}
          {loading && (
            <div className="chat-bubble assistant">
              <div className="bubble-label">{future.years}年后的我</div>
              <div className="bubble-content typing">正在思考...</div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* 输入框 */}
        <div className="chat-input-area">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="输入你想问未来自己的话..."
            className="chat-input"
            rows={2}
            disabled={loading}
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="send-btn"
          >
            发送
          </button>
        </div>
      </div>
    </div>
  );
}
