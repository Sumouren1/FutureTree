'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Message from './Message';
import { ConversationMessage, Future } from '@/types';

interface ChatWindowProps {
  futureId: number;
  futureData: Future;
  conversationHistory: ConversationMessage[];
  onHistoryChange: (history: ConversationMessage[] | ((prev: ConversationMessage[]) => ConversationMessage[])) => void;
  allFutures?: Future[];
  userId?: string;
}

// 随机图标池
const AVATAR_POOL = ['🌟', '🔥', '💫', '⚡', '🌙', '☀️', '🌊', '🍃', '🌸', '💎', '🎭', '🎪', '🎨', '🎬', '🎸', '📚', '🔮', '🧩', '🎲', '🎯'];

export default function ChatWindow({
  futureId,
  futureData,
  conversationHistory,
  onHistoryChange,
  allFutures = [],
  userId = 'guest',
}: ChatWindowProps) {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [isDiscussionMode, setIsDiscussionMode] = useState(false);
  const [currentSpeaker, setCurrentSpeaker] = useState<{ avatar: string; futureId: number; futureTitle: string; futureYears: number } | null>(null);
  const [discussionLocked, setDiscussionLocked] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // 智能滚动状态
  const [autoScrollEnabled, setAutoScrollEnabled] = useState(true);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isUserScrollingRef = useRef(false);

  const scrollToBottom = () => {
    if (autoScrollEnabled && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // 监听对话历史变化，自动滚动
  useEffect(() => {
    scrollToBottom();
  }, [conversationHistory, streamingContent, autoScrollEnabled]);

  // 处理用户手动滚动
  const handleScroll = useCallback(() => {
    if (!messagesContainerRef.current) return;

    const container = messagesContainerRef.current;
    const { scrollTop, scrollHeight, clientHeight } = container;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;

    // 如果用户滚动到离底部超过100px，认为是手动滚动
    if (!isNearBottom && !isUserScrollingRef.current) {
      isUserScrollingRef.current = true;
      setAutoScrollEnabled(false);
    }

    // 清除之前的定时器
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    // 5秒后恢复自动滚动
    scrollTimeoutRef.current = setTimeout(() => {
      isUserScrollingRef.current = false;
      setAutoScrollEnabled(true);
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 5000);
  }, []);

  // 清理函数
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  const getRandomAvatars = (): [string, string] => {
    const shuffled = [...AVATAR_POOL].sort(() => Math.random() - 0.5);
    return [shuffled[0], shuffled[1]];
  };

  const selectRandomFutures = useCallback((): [Future, Future] => {
    const otherFutures = allFutures.filter((f) => f.id !== futureId);
    const shuffled = [...otherFutures].sort(() => Math.random() - 0.5);
    const partnerFuture = shuffled[0] || futureData;
    return [futureData, partnerFuture];
  }, [allFutures, futureId, futureData]);

  const shouldTriggerDiscussion = (): boolean => {
    if (allFutures.length < 2) return false;
    return Math.random() < 0.40; // 40% 概率
  };

  const generateDiscussion = async (userMessage: string, [futureA, futureB]: [Future, Future]) => {
    setIsDiscussionMode(true);
    setDiscussionLocked(true);

    const [avatarA, avatarB] = getRandomAvatars();

    try {
      abortControllerRef.current = new AbortController();

      const response = await fetch('/api/discussion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          futureA: {
            id: futureA.id,
            title: futureA.title,
            timeline: futureA.timeline,
            story: futureA.story,
            prompt: (futureA as any).prompt,
          },
          futureB: {
            id: futureB.id,
            title: futureB.title,
            timeline: futureB.timeline,
            story: futureB.story,
            prompt: (futureB as any).prompt,
          },
          userQuestion: userMessage,
          userId,
          rounds: Math.floor(Math.random() * 3) + 3, // 3-5 轮
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) throw new Error('讨论生成失败');

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (reader) {
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (!line.trim()) continue;

            try {
              const data = JSON.parse(line);

              // 设置当前发言者信息
              setCurrentSpeaker({
                avatar: data.avatar,
                futureId: data.futureId,
                futureTitle: data.futureTitle,
                futureYears: data.futureYears,
              });

              // 添加到对话历史 - 使用函数式更新
              const assistantMsg: ConversationMessage = {
                role: 'assistant',
                content: data.content,
                timestamp: Date.now(),
                futureId: data.futureId,
                futureTitle: data.futureTitle,
                futureYears: data.futureYears,
                avatar: data.avatar,
                isInterruption: data.isInterruption,
              };

              // 关键修改：使用函数式更新，确保追加而不是替换
              onHistoryChange((prevHistory) => [...prevHistory, assistantMsg]);

              // 短暂停顿模拟打断效果
              await new Promise((r) => setTimeout(r, data.isInterruption ? 200 : 800));
            } catch (e) {
              console.error('Parse error:', e);
            }
          }
        }
      }
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        console.error('讨论失败:', error);
        // 添加错误消息 - 使用函数式更新
        const errorMsg: ConversationMessage = {
          role: 'assistant',
          content: '（两个未来的自己似乎没谈拢，陷入了沉默...）',
          timestamp: Date.now(),
          avatar: '💭',
        };
        onHistoryChange((prevHistory) => [...prevHistory, errorMsg]);
      }
    } finally {
      setIsDiscussionMode(false);
      setDiscussionLocked(false);
      setCurrentSpeaker(null);
      abortControllerRef.current = null;
    }
  };

  const handleSend = async () => {
    if (!input.trim() || loading || discussionLocked) return;

    const userMessage = input.trim();
    const userMsg: ConversationMessage = {
      role: 'user',
      content: userMessage,
      timestamp: Date.now(),
    };

    setInput('');
    setLoading(true);

    // 添加用户消息 - 使用函数式更新
    onHistoryChange((prevHistory) => [...prevHistory, userMsg]);

    // 检查是否触发抢占对话
    if (shouldTriggerDiscussion()) {
      const selectedFutures = selectRandomFutures();
      await generateDiscussion(userMessage, selectedFutures);
      setLoading(false);
      return;
    }

    // 正常单 AI 对话
    try {
      abortControllerRef.current = new AbortController();

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          futureId,
          futureData,
          userMessage,
          conversationHistory: conversationHistory.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) throw new Error('请求失败');

      const data = await response.json();

      // 添加助手消息 - 使用函数式更新
      const assistantMsg: ConversationMessage = {
        role: 'assistant',
        content: data.reply || '抱歉，我现在有点累，让我们换个话题吧。',
        timestamp: Date.now(),
        futureId,
        futureTitle: futureData.title,
        futureYears: futureData.timeline,
      };

      onHistoryChange((prevHistory) => [...prevHistory, assistantMsg]);
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        console.error('对话失败:', error);
        const errorMsg: ConversationMessage = {
          role: 'assistant',
          content: '抱歉，我现在有点累，让我们换个话题吧。',
          timestamp: Date.now(),
        };
        onHistoryChange((prevHistory) => [...prevHistory, errorMsg]);
      }
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // 获取昵称显示
  const getDisplayName = (msg: ConversationMessage): string => {
    if (msg.role === 'user') return '';
    if (msg.futureYears && userId) {
      return `${msg.futureYears}年后的 #${userId.slice(-4)}`;
    }
    return '';
  };

  return (
    <div className="flex flex-col h-full">
      {/* 讨论模式指示器 */}
      {isDiscussionMode && (
        <div className="px-4 py-2 bg-accent-orange/10 border-b-2 border-accent-orange shrink-0">
          <p className="handwritten text-base text-accent-orange text-center">
            ✨ 两个未来的自己正在讨论你的问题...
          </p>
        </div>
      )}

      {/* 消息列表 */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0"
        onScroll={handleScroll}
      >
        {conversationHistory.length === 0 && !streamingContent && (
          <div className="text-center py-8">
            <div className="sketch-card inline-block p-6 max-w-md">
              <p className="handwritten text-2xl text-ink-black mb-2">
                你好 👋
              </p>
              <p className="sketch-note text-base text-graphite">
                我是 {futureData.timeline} 年后的你。<br />
                听说你现在很困惑，来聊聊吧。
              </p>
            </div>
          </div>
        )}

        {conversationHistory.map((msg, i) => (
          <div key={i}>
            <Message
              role={msg.role}
              content={msg.content}
              avatar={msg.avatar}
              displayName={getDisplayName(msg)}
            />
            {msg.isInterruption && (
              <div className="text-center my-2">
                <span className="text-xs text-graphite handwritten">（打断）</span>
              </div>
            )}
          </div>
        ))}

        {streamingContent && (
          <Message role="assistant" content={streamingContent} />
        )}

        {loading && !streamingContent && !isDiscussionMode && (
          <Message role="assistant" content="" isTyping />
        )}

        {isDiscussionMode && (
          <div className="flex gap-4">
            <div className="w-10 h-10 flex items-center justify-center flex-shrink-0 border-3 border-ink-black bg-white animate-pulse">
              <span className="text-lg">{currentSpeaker?.avatar || '💬'}</span>
            </div>
            <div className="flex flex-col">
              {currentSpeaker && (
                <span className="text-xs mb-1 text-graphite handwritten">
                  {currentSpeaker.futureYears}年后的 #{userId.slice(-4)}
                </span>
              )}
              <div className="px-5 py-4 border-3 border-ink-black bg-white">
                <div className="flex items-center gap-3">
                  <div className="flex gap-2">
                    <span className="w-2 h-2 bg-graphite rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-graphite rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-graphite rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  <span className="sketch-note text-graphite text-sm">生成中...</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 输入框 */}
      <div className={`p-4 border-t-3 border-ink-black bg-white/80 transition-opacity duration-300 shrink-0 ${discussionLocked ? 'opacity-50' : ''}`}>
        <div className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={discussionLocked ? '请等待讨论结束...' : '输入你想对未来自己说的话...'}
            disabled={loading || discussionLocked}
            className="flex-1 sketch-input disabled:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim() || discussionLocked}
            className="sketch-button-primary px-6 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              '发送'
            )}
          </button>
        </div>
        {discussionLocked && (
          <p className="text-center text-sm text-graphite mt-2 handwritten">
            两个未来的自己正在激烈讨论中，请稍候...
          </p>
        )}
      </div>
    </div>
  );
}
