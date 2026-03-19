'use client';

interface MessageProps {
  role: 'user' | 'assistant';
  content: string;
  isTyping?: boolean;
  avatar?: string;
  displayName?: string;
}

export default function Message({ role, content, isTyping, avatar, displayName }: MessageProps) {
  const isUser = role === 'user';

  return (
    <div className={`flex gap-4 ${isUser ? 'flex-row-reverse' : ''}`}>
      {/* 头像 */}
      <div className={`w-10 h-10 flex items-center justify-center flex-shrink-0 border-3 border-ink-black ${
        isUser ? 'bg-accent-orange' : 'bg-white'
      }`}>
        {isUser ? (
          <span className="text-white text-lg">👤</span>
        ) : (
          <span className="text-lg">{avatar || '🌱'}</span>
        )}
      </div>

      {/* 消息内容区 */}
      <div className="flex flex-col max-w-[70%]">
        {/* 昵称 */}
        {!isUser && displayName && (
          <span className={`text-xs mb-1 ${isUser ? 'text-right' : 'text-left'} text-graphite handwritten`}>
            {displayName}
          </span>
        )}

        {/* 消息气泡 */}
        <div className={`px-5 py-4 border-3 border-ink-black relative ${
          isUser
            ? 'bg-accent-orange/10'
            : 'bg-white'
        }`}>
          {/* 手绘装饰线 */}
          <svg className="absolute -top-1 -left-1 w-full h-full pointer-events-none opacity-30" style={{ zIndex: 0 }}>
            <line x1="0" y1="0" x2="100%" y2="0" className="draft-line-dash" />
            <line x1="0" y1="100%" x2="100%" y2="100%" className="draft-line-dash" />
          </svg>

          {isTyping ? (
            <div className="flex items-center gap-3">
              <div className="flex gap-2">
                <span className="w-2 h-2 bg-graphite rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-graphite rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-graphite rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <span className="sketch-note text-graphite text-sm">生成中...</span>
            </div>
          ) : (
            <p className="sketch-note text-base leading-relaxed text-ink-black whitespace-pre-wrap relative z-10">
              {content}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
