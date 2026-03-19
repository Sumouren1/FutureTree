'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NotebookForm() {
  const router = useRouter();
  const [confusion, setConfusion] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('正在构建未来世界树...');

  const statusMessages = [
    { threshold: 0, text: '正在阅读你的故事...' },
    { threshold: 10, text: '正在构思10个平行人生...' },
    { threshold: 20, text: '正在为每个未来书写传记...' },
    { threshold: 35, text: '正在描写做出选择的瞬间...' },
    { threshold: 50, text: '正在叙述挣扎与成长的故事...' },
    { threshold: 65, text: '正在刻画人生的转折点...' },
    { threshold: 80, text: '正在描绘未来生活的细节...' },
    { threshold: 90, text: '正在润色每个角色的声音...' },
    { threshold: 95, text: '即将完成长篇小说...' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confusion.trim() || !description.trim()) return;

    setLoading(true);
    setProgress(0);

    // 模拟进度动画 - API 现在生成小说级详细内容，需要 30-60 秒
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        // 非线性增长：开始快，后面慢
        if (prev >= 95) {
          clearInterval(progressInterval);
          return 95;
        }
        // 越接近 95 增长越慢
        const increment = Math.max(1, Math.floor((95 - prev) / 15));
        const newProgress = prev + increment;

        // 更新状态文字
        const currentStatus = statusMessages
          .slice()
          .reverse()
          .find((m) => newProgress >= m.threshold);
        if (currentStatus) {
          setStatusText(currentStatus.text);
        }

        return newProgress;
      });
    }, 2000);

    try {
      const response = await fetch('/api/generate-futures', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confusion, description }),
      });

      const data = await response.json();

      clearInterval(progressInterval);
      setProgress(100);

      // 保存到 localStorage
      localStorage.setItem('futures', JSON.stringify(data.futures));
      localStorage.setItem('userInput', JSON.stringify({ confusion, description }));

      setTimeout(() => {
        router.push('/tree');
      }, 500);
    } catch (error) {
      console.error('Error:', error);
      clearInterval(progressInterval);
      setLoading(false);
      setProgress(0);
      setStatusText('生成失败，请重试');
      alert('生成失败，请重试');
    }
  };

  return (
    <div className="notebook-page">
      <form onSubmit={handleSubmit} className="notebook-content">
        {loading && (
          <div className="loading-overlay">
            <div className="seed-animation">🌱</div>
            <div className="progress-text">{statusText} {progress}%</div>
          </div>
        )}

        <div className="notebook-field">
          <textarea
            value={confusion}
            onChange={(e) => setConfusion(e.target.value)}
            placeholder="写下你的困惑..."
            className="notebook-input"
            rows={4}
            disabled={loading}
          />
        </div>

        <div className="notebook-field">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="简单介绍一下自己..."
            className="notebook-input"
            rows={3}
            disabled={loading}
          />
        </div>

        <button
          type="submit"
          disabled={loading || !confusion.trim() || !description.trim()}
          className="notebook-button"
        >
          {loading ? '正在构建未来世界树...' : '开始探索'}
        </button>
      </form>
    </div>
  );
}
