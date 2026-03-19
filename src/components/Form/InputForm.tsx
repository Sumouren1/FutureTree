'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { UserInput } from '@/types';

const QUICK_CONFUSIONS = [
  '不知道该继续打工还是创业',
  '想转行但不知道转什么',
  '感觉现在的工作没意思',
  '想做自己喜欢的事但不知道是什么',
  '害怕做错选择后悔',
];

const STATUS_OPTIONS = [
  { value: '学生', emoji: '🎓', desc: '还在读书' },
  { value: '职场新人', emoji: '🌱', desc: '刚工作1-3年' },
  { value: '职场老手', emoji: '💼', desc: '工作3年以上' },
  { value: '创业者', emoji: '🚀', desc: '正在创业' },
  { value: '自由职业', emoji: '🎨', desc: '自由工作' },
  { value: '待业中', emoji: '🤔', desc: '在找方向' },
] as const;

const INTEREST_OPTIONS = [
  { value: 'AI', emoji: '🤖' },
  { value: '科技', emoji: '💻' },
  { value: '创意', emoji: '🎨' },
  { value: '金融', emoji: '💰' },
  { value: '教育', emoji: '📚' },
  { value: '医疗', emoji: '⚕️' },
  { value: '环保', emoji: '🌱' },
  { value: '其他', emoji: '✨' },
];

const TIMELINE_LABELS: Record<number, string> = {
  1: '1年后',
  3: '3年后',
  5: '5年后',
  10: '10年后',
};

export default function InputForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string>('');
  const [formData, setFormData] = useState<UserInput>({
    confusion: '',
    status: '职场新人',
    interests: [],
    timeline: 3,
  });

  useEffect(() => {
    fetch('/api/auth/user').then(r => r.json()).then(d => setUserId(d.userId)).catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.confusion.trim()) return;

    setLoading(true);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, userId }),
      });

      const data = await response.json();

      if (data.futures) {
        const treeData = {
          id: Date.now().toString(),
          userInput: formData,
          futures: data.futures,
          createdAt: Date.now(),
        };
        localStorage.setItem('futureTree', JSON.stringify(treeData));
        router.push('/explore');
      }
    } catch (error) {
      console.error('生成失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleInterest = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 困惑输入 */}
        <div className="space-y-2">
          <label className="mono-label block text-ink-black text-[9px]">
            YOUR CONFUSION
          </label>

          {/* 快速选择 */}
          <div className="flex flex-wrap gap-1.5">
            {QUICK_CONFUSIONS.map((text) => (
              <button
                key={text}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, confusion: text }))}
                className="text-[10px] px-2 py-0.5 border border-graphite/30 hover:border-accent-orange hover:bg-accent-orange/10 text-ink-black transition-all"
              >
                {text}
              </button>
            ))}
          </div>

          <textarea
            placeholder="或者自己写..."
            value={formData.confusion}
            onChange={(e) => setFormData(prev => ({ ...prev, confusion: e.target.value }))}
            className="sketch-input w-full min-h-[60px] resize-none text-sm"
          />
        </div>

        {/* 状态选择 */}
        <div className="space-y-2">
          <label className="mono-label block text-ink-black text-[9px]">
            YOUR STATUS
          </label>
          <div className="grid grid-cols-3 gap-1.5">
            {STATUS_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, status: option.value }))}
                className={`p-2 border-2 transition-all text-left ${
                  formData.status === option.value
                    ? 'border-accent-orange bg-accent-orange/10 shadow-[2px_2px_0_var(--ink-black)]'
                    : 'border-ink-black bg-white/50 hover:shadow-[1px_1px_0_var(--ink-black)]'
                }`}
                style={{ borderRadius: '0' }}
              >
                <div className="text-lg mb-0.5">{option.emoji}</div>
                <div className="text-[9px] font-bold text-ink-black leading-tight">{option.value}</div>
              </button>
            ))}
          </div>
        </div>

        {/* 兴趣选择 */}
        <div className="space-y-2">
          <label className="mono-label block text-ink-black text-[9px]">
            INTERESTS
          </label>
          <div className="flex flex-wrap gap-1.5">
            {INTEREST_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => toggleInterest(option.value)}
                className={`px-2 py-1 border-2 transition-all flex items-center gap-1 text-[10px] ${
                  formData.interests.includes(option.value)
                    ? 'border-accent-orange bg-accent-orange text-white shadow-[2px_2px_0_var(--ink-black)]'
                    : 'border-ink-black bg-white/50 text-ink-black hover:shadow-[1px_1px_0_var(--ink-black)]'
                }`}
                style={{ borderRadius: '0' }}
              >
                <span className="text-sm">{option.emoji}</span>
                <span>{option.value}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 时间线滑块 */}
        <div className="space-y-2">
          <label className="mono-label block text-ink-black flex items-center justify-between text-[9px]">
            <span>TIMELINE</span>
            <span className="handwritten text-xl text-accent-orange">
              {TIMELINE_LABELS[formData.timeline]}
            </span>
          </label>

          {/* 自定义滑块 */}
          <div className="relative py-2">
            <input
              type="range"
              min="1"
              max="10"
              step="1"
              value={formData.timeline}
              onChange={(e) => setFormData(prev => ({ ...prev, timeline: parseInt(e.target.value) }))}
              className="w-full h-1.5 bg-graphite/20 appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, var(--accent-orange) 0%, var(--accent-orange) ${(formData.timeline - 1) * 11.11}%, rgba(160, 160, 154, 0.2) ${(formData.timeline - 1) * 11.11}%, rgba(160, 160, 154, 0.2) 100%)`,
              }}
            />
            <style jsx>{`
              input[type="range"]::-webkit-slider-thumb {
                appearance: none;
                width: 16px;
                height: 16px;
                background: var(--accent-orange);
                border: 2px solid var(--ink-black);
                cursor: pointer;
                box-shadow: 1px 1px 0 var(--ink-black);
              }
              input[type="range"]::-moz-range-thumb {
                width: 16px;
                height: 16px;
                background: var(--accent-orange);
                border: 2px solid var(--ink-black);
                cursor: pointer;
                box-shadow: 1px 1px 0 var(--ink-black);
                border-radius: 0;
              }
            `}</style>
          </div>

          <div className="flex justify-between text-[9px] text-graphite">
            <span>近期</span>
            <span>中期</span>
            <span>长期</span>
          </div>
        </div>

        {/* 提交按钮 */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={loading || !formData.confusion.trim()}
            className="sketch-button-primary w-full py-2.5 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                正在生长...
              </span>
            ) : (
              '种下你的未来种子'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
