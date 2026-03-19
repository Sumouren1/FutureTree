'use client';

export default function Landing() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6 relative overflow-hidden">
      <svg className="svg-filters">
        <defs>
          <filter id="ink-bleed" x="-10%" y="-10%" width="120%" height="120%">
            <feTurbulence type="fractalNoise" baseFrequency="0.08" numOctaves="3" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="2" xChannelSelector="R" yChannelSelector="G" result="displaced" />
            <feGaussianBlur in="displaced" stdDeviation="0.5" result="blurred" />
            <feMerge>
              <feMergeNode in="blurred" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
      </svg>

      <div className="physical-tools">
        <div className="mech-pencil">
          <div className="mech-lead"></div>
        </div>
        <div className="eraser"></div>
      </div>

      <div className="relative z-10 text-center max-w-2xl">
        <h1 className="handwritten text-8xl text-ink-black mb-6" style={{ transform: 'rotate(-1deg)' }}>
          FutureTree
        </h1>

        <p className="handwritten text-3xl text-ink-black mb-12"
           style={{
             filter: 'url(#ink-bleed)',
             transform: 'rotate(-2deg)'
           }}>
          让未来的自己们吵一架，再决定怎么走
        </p>

        <div className="sketch-card mb-12 p-8">
          <div className="space-y-6 text-left">
            <div className="flex items-start gap-4">
              <span className="text-3xl">🌱</span>
              <div>
                <h3 className="sketch-note text-xl font-semibold mb-2">AI 生成 20 种未来可能性</h3>
                <p className="sketch-note text-graphite">基于你的当前状态，探索多元未来路径</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <span className="text-3xl">💬</span>
              <div>
                <h3 className="sketch-note text-xl font-semibold mb-2">与未来的自己对话</h3>
                <p className="sketch-note text-graphite">跨越时空，获得未来视角的建议</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <span className="text-3xl">🎨</span>
              <div>
                <h3 className="sketch-note text-xl font-semibold mb-2">可视化你的未来森林</h3>
                <p className="sketch-note text-graphite">手绘风格呈现，每个可能都是一棵独特的树</p>
              </div>
            </div>
          </div>
        </div>

        <a href="/api/auth/login" className="sketch-button-primary inline-block px-12 py-4 text-xl">
          开始探索
        </a>
      </div>
    </div>
  );
}
