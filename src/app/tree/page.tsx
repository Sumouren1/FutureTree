'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';

interface Future {
  id: number;
  title: string;
  description: string;
  years: number;
  prompt: string;
}

// 确定性随机数
function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

// 手抖线条
function wobblyLine(
  x1: number, y1: number,
  x2: number, y2: number,
  segments: number,
  wobble: number,
  rng: () => number
): string {
  const points: [number, number][] = [];
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const x = x1 + (x2 - x1) * t + (rng() - 0.5) * wobble;
    const y = y1 + (y2 - y1) * t + (rng() - 0.5) * wobble;
    points.push([x, y]);
  }

  let d = `M ${points[0][0]} ${points[0][1]}`;
  for (let i = 1; i < points.length; i++) {
    d += ` L ${points[i][0]} ${points[i][1]}`;
  }
  return d;
}

const FRUIT_COLORS = [
  '#e8837c', '#7cc5e8', '#e8d07c', '#7ce8a3',
  '#c47ce8', '#e8a77c', '#7ce8d4', '#e87cbb',
  '#a3e87c', '#7c8fe8',
];

export default function TreePage() {
  const router = useRouter();
  const [futures, setFutures] = useState<Future[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFuture, setSelectedFuture] = useState<Future | null>(null);
  const [highlightedId, setHighlightedId] = useState<number | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('futures');
    if (!stored || stored === 'undefined') {
      const testFutures: Future[] = [
        { id: 1, title: '创业成功', description: '你成为了一名成功的创业者，拥有自己的科技公司，团队有15人。', years: 5, prompt: '' },
        { id: 2, title: '继续打工', description: '你在职场稳步发展，成为了技术总监，管理着30人的团队。', years: 8, prompt: '' },
        { id: 3, title: '转行成功', description: '你成功转行到自己热爱的设计行业，成为了知名设计师。', years: 3, prompt: '' },
        { id: 4, title: '自由职业', description: '你成为了一名自由职业者，在世界各地远程工作。', years: 4, prompt: '' },
        { id: 5, title: '学习进修', description: '你选择了继续深造，获得了博士学位。', years: 6, prompt: '' },
        { id: 6, title: '海外发展', description: '你去了硅谷工作，加入了顶级科技公司。', years: 10, prompt: '' },
        { id: 7, title: '创业失败', description: '创业遇到挫折，但你从中学到了很多，重新出发。', years: 3, prompt: '' },
        { id: 8, title: '财务自由', description: '通过投资和理财，你在40岁实现了财务自由。', years: 15, prompt: '' },
        { id: 9, title: '跨界发展', description: '你在科技和艺术的交叉领域找到了独特的定位。', years: 7, prompt: '' },
        { id: 10, title: '稳定生活', description: '你过上了稳定而幸福的生活，家庭美满。', years: 12, prompt: '' },
      ];
      setFutures(testFutures);
      setLoading(false);
      return;
    }
    try {
      setFutures(JSON.parse(stored));
    } catch {
      router.push('/form');
    }
    setLoading(false);
  }, [router]);

  // 生成树结构
  const { branches, fruits } = useMemo(() => {
    if (futures.length === 0) return { branches: [], fruits: [] };

    const rng = seededRandom(123);
    const allBranches: { path: string; width: number; delay: number; length: number }[] = [];
    const allFruits: { x: number; y: number; size: number; color: string; delay: number; future: Future }[] = [];

    // 书页参数
    const pageLeft = 40;
    const pageRight = 460;
    const pageWidth = pageRight - pageLeft;
    const pageTop = 30;
    const pageBottom = 620;
    const pageHeight = pageBottom - pageTop;

    // 树干：从底部中间向上，树更高
    const trunkBaseX = (pageLeft + pageRight) / 2;
    const trunkBaseY = pageBottom;
    const trunkTopX = trunkBaseX + (rng() - 0.5) * 10;
    const trunkTopY = pageBottom - pageHeight * 0.55;

    // 树干（多段手抖）
    const trunkSegments = 4;
    for (let i = 0; i < trunkSegments; i++) {
      const t1 = i / trunkSegments;
      const t2 = (i + 1) / trunkSegments;
      allBranches.push({
        path: wobblyLine(
          trunkBaseX + (trunkTopX - trunkBaseX) * t1,
          trunkBaseY + (trunkTopY - trunkBaseY) * t1,
          trunkBaseX + (trunkTopX - trunkBaseX) * t2,
          trunkBaseY + (trunkTopY - trunkBaseY) * t2,
          5, 4, rng
        ),
        width: 10 - i * 1.5,
        delay: i * 0.12,
        length: 200,
      });
    }

    // 树冠：从树干顶部向四周展开
    const canopyCenterX = trunkTopX;
    const canopyCenterY = trunkTopY;
    const canopyRadius = pageHeight * 0.42;

    // 为每个未来生成分支和果实
    futures.forEach((future, index) => {
      // 角度：均匀分布在360度
      const baseAngle = (index / futures.length) * Math.PI * 2 - Math.PI / 2; // 从正上方开始
      const angleVariation = (rng() - 0.5) * 0.5; // 角度抖动
      const angle = baseAngle + angleVariation;

      // 分支长度随机
      const branchLength = canopyRadius * (0.6 + rng() * 0.5);

      // 分支末端位置（在树冠外围）
      const branchEndX = canopyCenterX + Math.cos(angle) * branchLength;
      const branchEndY = canopyCenterY + Math.sin(angle) * branchLength * 0.8; // 稍微扁一点

      const clampedX = Math.max(pageLeft + 20, Math.min(pageRight - 20, branchEndX));
      const clampedY = Math.max(pageTop + 20, Math.min(pageBottom * 0.65, branchEndY));

      // 主分支
      allBranches.push({
        path: wobblyLine(canopyCenterX, canopyCenterY, clampedX, clampedY, 6, 5, rng),
        width: 4 - index * 0.1,
        delay: 0.6 + index * 0.1,
        length: 300,
      });

      // 小分叉（1-2个）
      const subBranches = 1 + Math.floor(rng() * 2);
      for (let j = 0; j < subBranches; j++) {
        const subT = 0.3 + rng() * 0.5;
        const subStartX = canopyCenterX + (clampedX - canopyCenterX) * subT;
        const subStartY = canopyCenterY + (clampedY - canopyCenterY) * subT;
        const subAngle = angle + (rng() - 0.5) * 0.8;
        const subLen = 20 + rng() * 40;
        const subEndX = subStartX + Math.cos(subAngle) * subLen;
        const subEndY = subStartY + Math.sin(subAngle) * subLen * 0.7;

        allBranches.push({
          path: wobblyLine(subStartX, subStartY, subEndX, subEndY, 3, 3, rng),
          width: 1.5 + rng(),
          delay: 1.0 + index * 0.1 + j * 0.05,
          length: 100,
        });
      }

      // 果实
      const fruitSize = 14 + rng() * 12;
      allFruits.push({
        x: clampedX,
        y: clampedY,
        size: fruitSize,
        color: FRUIT_COLORS[index % FRUIT_COLORS.length],
        delay: 1.2 + index * (0.4 + rng() * 0.3),
        future,
      });
    });

    return { branches: allBranches, fruits: allFruits };
  }, [futures]);

  const [hasStoredData, setHasStoredData] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('futures');
    setHasStoredData(!!stored && stored !== 'undefined');
  }, []);

  const handleFruitClick = (future: Future) => {
    if (highlightedId !== null) return;
    setHighlightedId(future.id);
    setTimeout(() => {
      setSelectedFuture(future);
      setHighlightedId(null);
    }, 800);
  };

  const handleBack = () => {
    setSelectedFuture(null);
  };

  if (loading) {
    return <div className="loading-page">加载中...</div>;
  }

  return (
    <div className="tree-page">
      <div className="tree-notebook">
        {/* 书页背景 */}
        <div className="notebook-page-bg">
          {/* 横线 */}
          {Array.from({ length: 25 }).map((_, i) => (
            <div
              key={`line-${i}`}
              className="notebook-line"
              style={{ top: `${80 + i * 30}px` }}
            />
          ))}
        </div>

        {/* 树 */}
        <svg className="tree-svg" viewBox="0 0 500 650" preserveAspectRatio="xMidYMid meet">
          <defs>
            <filter id="pencil-effect">
              <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="3" result="noise" />
              <feDisplacementMap in="SourceGraphic" in2="noise" scale="1" />
            </filter>
            <filter id="watercolor-effect">
              <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="2" result="noise" />
              <feDisplacementMap in="SourceGraphic" in2="noise" scale="2" />
              <feGaussianBlur stdDeviation="0.5" />
            </filter>
          </defs>

          {/* 树枝 */}
          <g filter="url(#pencil-effect)">
            {branches.map((branch, i) => (
              <path
                key={`branch-${i}`}
                d={branch.path}
                stroke="rgba(90, 80, 70, 0.55)"
                strokeWidth={branch.width}
                fill="none"
                strokeLinecap="round"
                className="tree-branch"
                style={{
                  '--branch-delay': `${branch.delay}s`,
                  '--branch-length': branch.length,
                } as React.CSSProperties}
              />
            ))}
          </g>

          {/* 果实 */}
          <g filter="url(#watercolor-effect)">
            {fruits.map((fruit, i) => (
              <g
                key={`fruit-${i}`}
                className={`tree-fruit ${highlightedId === fruit.future.id ? 'highlighted' : ''}`}
                style={{ '--fruit-delay': `${fruit.delay}s` } as React.CSSProperties}
                onClick={() => handleFruitClick(fruit.future)}
              >
                {/* 晕染 */}
                <ellipse
                  cx={fruit.x}
                  cy={fruit.y}
                  rx={fruit.size + 5}
                  ry={fruit.size + 5}
                  fill={fruit.color}
                  opacity="0.15"
                />
                {/* 主体 */}
                <ellipse
                  cx={fruit.x}
                  cy={fruit.y}
                  rx={fruit.size}
                  ry={fruit.size * 0.85}
                  fill={fruit.color}
                  opacity="0.7"
                  stroke="rgba(90,80,70,0.25)"
                  strokeWidth="1"
                />
                {/* 高光 */}
                <ellipse
                  cx={fruit.x - fruit.size * 0.25}
                  cy={fruit.y - fruit.size * 0.25}
                  rx={fruit.size * 0.25}
                  ry={fruit.size * 0.2}
                  fill="white"
                  opacity="0.35"
                />
              </g>
            ))}
          </g>
        </svg>
      </div>

      {/* 详情页 */}
      {selectedFuture && (
        <div className="detail-overlay" onClick={handleBack}>
          <div className="detail-notebook" onClick={(e) => e.stopPropagation()}>
            <button className="back-btn" onClick={handleBack}>← 返回</button>
            <h2 className="detail-title" style={{ fontSize: '1.8rem' }}>未来 #{selectedFuture.id} · {selectedFuture.title}</h2>
            <p className="detail-years" style={{ fontSize: '1rem' }}>{selectedFuture.years} 年后</p>
            <p className="detail-desc" style={{ fontSize: '1.2rem', lineHeight: 2 }}>{selectedFuture.description}</p>
            <button className="chat-btn" onClick={() => {
              if (!hasStoredData) {
                alert('请先创建未来树！点击"开始探索"并填写表单生成你的未来。');
                return;
              }
              router.push(`/future/${selectedFuture.id}`);
            }}>与未来的自己对话</button>
          </div>
        </div>
      )}
    </div>
  );
}
