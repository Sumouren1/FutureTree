'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { UserFutureTree, Future, ConversationMessage, CATEGORY_COLORS } from '@/types';
import ChatWindow from '@/components/Chat/ChatWindow';

export default function FuturePage() {
  const params = useParams();
  const router = useRouter();
  const [treeData, setTreeData] = useState<UserFutureTree | null>(null);
  const [future, setFuture] = useState<Future | null>(null);
  const [conversationHistory, setConversationHistory] = useState<ConversationMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string>('guest');

  useEffect(() => {
    // 尝试读取 futureTree（新格式）或 futures（旧格式）
    const storedTree = localStorage.getItem('futureTree');
    const storedFutures = localStorage.getItem('futures');

    if (storedTree) {
      const data: UserFutureTree = JSON.parse(storedTree);
      setTreeData(data);
      const futureId = parseInt(params.id as string);
      const found = data.futures.find(f => f.id === futureId);
      setFuture(found || null);
    } else if (storedFutures) {
      // 兼容旧格式
      const futures = JSON.parse(storedFutures);
      const futureId = parseInt(params.id as string);
      const found = futures.find((f: Future) => f.id === futureId);
      setFuture(found || null);
      setTreeData({
        id: Date.now().toString(),
        userInput: { confusion: '', status: '职场新人', interests: [], timeline: 3 },
        futures,
        createdAt: Date.now(),
      });
    } else {
      // 没有存储数据，使用默认数据
      const defaultFuture: Future = {
        id: parseInt(params.id as string) || 1,
        title: '探索中的未来',
        category: '成长',
        summary: '这是一个正在探索的未来可能性',
        story: '未来的你正在这条道路上探索，一切皆有可能...',
        profession: '探索者',
        lifeStatus: '成长中',
        tags: ['探索', '成长', '可能性'],
        timeline: 5,
        prompt: '你是用户5年后的未来自己。你正在探索人生的各种可能性，保持开放和好奇的心态。'
      };
      setFuture(defaultFuture);
      setTreeData({
        id: Date.now().toString(),
        userInput: { confusion: '', status: '职场新人', interests: [], timeline: 3 },
        futures: [defaultFuture],
        createdAt: Date.now(),
      });
    }
    setLoading(false);
  }, [params.id, router]);

  // 获取用户ID
  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const data = await response.json();
          setUserId(data.userId);
        }
      } catch (error) {
        console.error('Failed to fetch user ID:', error);
      }
    };
    fetchUserId();
  }, []);

  if (loading || !treeData || !future) {
    return (
      <div className="workspace">
        <div className="handwritten text-6xl text-accent-orange">Loading...</div>
      </div>
    );
  }

  const categoryColor = CATEGORY_COLORS[future.category] || '#1A1A18';

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      {/* SVG 滤镜 */}
      <svg className="svg-filters">
        <defs>
          <filter id="ink-bleed" x="-10%" y="-10%" width="120%" height="120%">
            <feTurbulence type="fractalNoise" baseFrequency="0.08" numOctaves="3" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="3" xChannelSelector="R" yChannelSelector="G" result="displaced" />
            <feGaussianBlur in="displaced" stdDeviation="0.8" result="blurred" />
            <feMerge>
              <feMergeNode in="blurred" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
      </svg>

      {/* 顶部导航 - 减小高度 */}
      <header className="flex items-center justify-between px-6 py-3 border-b-3 border-ink-black shrink-0">
        <Link href="/tree" className="sketch-button text-sm py-1.5 px-3">
          ← 返回森林
        </Link>
        <h1 className="handwritten text-3xl text-accent-orange">
          未来 #{future.id}
        </h1>
        <div className="flex gap-2">
          <button className="sketch-button text-xs py-1.5 px-2.5">
            分享
          </button>
          <button className="sketch-button text-xs py-1.5 px-2.5">
            收藏
          </button>
        </div>
      </header>

      {/* 内容区 */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* 左侧：未来设定 - 固定位置，内部滚动 */}
        <div className="w-full md:w-1/3 p-4 border-b-3 md:border-b-0 md:border-r-3 border-ink-black overflow-y-auto shrink-0">
          <div className="sketch-card p-4">
            {/* 标题区 */}
            <div className="flex items-start gap-3 mb-4 pb-4 border-b-2 border-graphite/20">
              <div
                className="w-12 h-12 flex items-center justify-center text-2xl border-3 border-ink-black shrink-0"
                style={{ backgroundColor: `${categoryColor}40` }}
              >
                ✨
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="handwritten text-2xl text-ink-black mb-1 truncate">{future.title}</h2>
                <span
                  className="mono-label text-xs px-2 py-0.5 border-2 inline-block"
                  style={{
                    borderColor: categoryColor,
                    backgroundColor: `${categoryColor}20`,
                    color: '#1A1A18'
                  }}
                >
                  {future.category}
                </span>
              </div>
            </div>

            {/* 设定详情 */}
            <div className="space-y-3">
              <div>
                <div className="mono-label text-graphite mb-1 text-xs">01. STATUS</div>
                <p className="sketch-note text-base">{future.lifeStatus || '待确定'}</p>
              </div>

              <div>
                <div className="mono-label text-graphite mb-1 text-xs">02. PROFESSION</div>
                <p className="sketch-note text-base">{future.profession || '待确定'}</p>
              </div>

              <div>
                <div className="mono-label text-graphite mb-1 text-xs">03. TAGS</div>
                <div className="flex flex-wrap gap-1.5">
                  {future.tags?.map((tag, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 border-2 border-graphite sketch-note text-xs"
                    >
                      #{tag}
                    </span>
                  )) || <span className="sketch-note text-graphite text-xs">无标签</span>}
                </div>
              </div>

              <div>
                <div className="mono-label text-graphite mb-1 text-xs">04. STORY</div>
                <div className="sketch-note text-sm leading-relaxed text-ink-black">
                  {future.story}
                </div>
              </div>
            </div>

            {/* 时间线标注 */}
            <div className="mt-4 pt-4 border-t-2 border-graphite/20">
              <div className="annotation text-graphite text-xs">
                TIMELINE: {future.timeline} YEARS LATER
              </div>
              <div className="note-hand text-graphite mt-1 text-sm">
                {future.timeline} 年后的某一天...
              </div>
            </div>
          </div>
        </div>

        {/* 右侧：对话区 - 固定高度，内部滚动 */}
        <div className="flex-1 flex flex-col bg-white/50 overflow-hidden min-h-0">
          {/* 对话标题 */}
          <div className="px-6 py-3 border-b-3 border-ink-black shrink-0">
            <h3 className="handwritten text-2xl text-ink-black flex items-center gap-2">
              <span>💬</span> 与未来对话
            </h3>
            <p className="note-hand text-graphite mt-1 text-sm">
              问问这个未来的你想知道的事...
            </p>
          </div>

          {/* 对话窗口 */}
          <ChatWindow
            futureId={future.id}
            futureData={future}
            conversationHistory={conversationHistory}
            onHistoryChange={setConversationHistory}
            allFutures={treeData?.futures || []}
            userId={userId}
          />
        </div>
      </div>
    </div>
  );
}
