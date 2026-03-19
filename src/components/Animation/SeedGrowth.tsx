'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { UserFutureTree } from '@/types';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

declare global {
  interface Window {
    p5: any;
  }
}

export default function TreeGrowth() {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const p5InstanceRef = useRef<any>(null);
  const [treeData, setTreeData] = useState<UserFutureTree | null>(null);
  const [isP5Loaded, setIsP5Loaded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('futureTree');
    if (stored) {
      setTreeData(JSON.parse(stored));
    } else {
      router.push('/');
    }
  }, [router]);

  // 加载 p5.js
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.7.0/p5.min.js';
    script.async = true;
    script.onload = () => setIsP5Loaded(true);
    document.head.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  // 初始化 p5.js sketch
  useEffect(() => {
    if (!isP5Loaded || !treeData || !containerRef.current || p5InstanceRef.current) return;

    const sketch = (p: any) => {
      let branches: any[] = [];
      let leaves: any[] = [];
      let growthProgress = 0;
      let currentStage = 0; // 0: seed, 1: grow, 2: bloom, 3: complete
      let stageTimer = 0;
      const futures = treeData.futures;

      class Branch {
        start: any;
        end: any;
        depth: number;
        thickness: number;

        constructor(start: any, end: any, depth: number, thickness: number) {
          this.start = start;
          this.end = end;
          this.depth = depth;
          this.thickness = thickness;
        }

        show() {
          p.strokeWeight(this.thickness);
          const alpha = p.map(this.depth, 0, 5, 150, 255);
          p.stroke(255, 200, 100, alpha);
          p.line(this.start.x, this.start.y, this.end.x, this.end.y);
        }
      }

      class Leaf {
        pos: any;
        future: any;
        delay: number;
        size: number;

        constructor(pos: any, future: any, delay: number) {
          this.pos = pos;
          this.future = future;
          this.delay = delay;
          this.size = 0;
        }

        show(progress: number) {
          if (progress < this.delay) return;

          const localProgress = p.constrain((progress - this.delay) / 0.3, 0, 1);
          this.size = p.lerp(0, 12, localProgress);
          const alpha = p.lerp(0, 255, localProgress);

          const colorMap: any = {
            '事业': [59, 130, 246],
            '关系': [249, 115, 22],
            '成长': [16, 185, 129],
            '健康': [239, 68, 68],
            '创意': [139, 92, 246],
            '财务': [234, 179, 8],
          };
          const rgb = colorMap[this.future.category] || [245, 166, 35];

          p.noStroke();

          // 外层光晕
          for (let i = 3; i > 0; i--) {
            p.fill(rgb[0], rgb[1], rgb[2], alpha / (i * 3));
            p.circle(this.pos.x, this.pos.y, this.size * (1 + i * 0.6));
          }

          // 核心
          p.fill(rgb[0], rgb[1], rgb[2], alpha);
          p.circle(this.pos.x, this.pos.y, this.size);
        }

        isHovered(mx: number, my: number) {
          return p.dist(mx, my, this.pos.x, this.pos.y) < this.size + 10;
        }
      }

      function generateTree(x: number, y: number, angle: number, depth: number, length: number) {
        if (depth === 0) {
          const leafIndex = leaves.length;
          if (leafIndex < futures.length) {
            leaves.push(new Leaf(
              p.createVector(x, y),
              futures[leafIndex],
              0.7 + leafIndex * 0.015
            ));
          }
          return;
        }

        const endX = x + p.cos(angle) * length;
        const endY = y + p.sin(angle) * length;

        branches.push(new Branch(
          p.createVector(x, y),
          p.createVector(endX, endY),
          depth,
          depth * 1.5
        ));

        const newLength = length * 0.7;
        const angleOffset = p.PI / 5 + p.random(-0.1, 0.1);

        generateTree(endX, endY, angle - angleOffset, depth - 1, newLength);
        generateTree(endX, endY, angle + angleOffset, depth - 1, newLength);
      }

      p.setup = () => {
        const canvas = p.createCanvas(
          containerRef.current!.clientWidth,
          containerRef.current!.clientHeight
        );
        canvas.parent(containerRef.current!);
        p.frameRate(60);

        // 生成树结构
        const startX = p.width / 2;
        const startY = p.height - 80;
        generateTree(startX, startY, -p.PI / 2, 5, 100);

        console.log('Tree generated:', branches.length, 'branches,', leaves.length, 'leaves');
      };

      p.draw = () => {
        // 渐变背景
        for (let i = 0; i < p.height; i++) {
          const inter = p.map(i, 0, p.height, 0, 1);
          const c = p.lerpColor(
            p.color(10, 10, 26),
            p.color(26, 26, 58),
            inter
          );
          p.stroke(c);
          p.line(0, i, p.width, i);
        }

        // 星星
        p.fill(255, 255, 255, 100);
        p.noStroke();
        for (let i = 0; i < 50; i++) {
          const x = (i * 137.5) % p.width;
          const y = (i * 73.3) % (p.height * 0.6);
          const twinkle = p.sin(p.frameCount * 0.05 + i) * 0.5 + 0.5;
          p.circle(x, y, 2 * twinkle);
        }

        // 阶段管理
        stageTimer++;
        if (stageTimer > 90 && currentStage === 0) currentStage = 1; // seed -> grow
        if (stageTimer > 240 && currentStage === 1) currentStage = 2; // grow -> bloom
        if (stageTimer > 360 && currentStage === 2) currentStage = 3; // bloom -> complete

        if (currentStage === 0) {
          // 种子阶段
          p.push();
          p.translate(p.width / 2, p.height / 2);
          p.rotate(p.frameCount * 0.02);
          p.noStroke();
          p.fill(245, 166, 35, 200);
          p.circle(0, 0, 40);
          p.fill(255, 200, 100, 100);
          p.circle(0, 0, 60);
          p.pop();
        } else {
          // 生长动画
          if (growthProgress < 1) {
            growthProgress += 0.008;
          }

          const visibleBranches = Math.floor(branches.length * Math.min(growthProgress / 0.7, 1));

          // 绘制树枝
          for (let i = 0; i < visibleBranches; i++) {
            branches[i].show();
          }

          // 绘制叶子
          if (currentStage >= 2) {
            for (const leaf of leaves) {
              leaf.show(growthProgress);
            }
          }
        }

        // 标题
        p.fill(245, 200, 100);
        p.noStroke();
        p.textAlign(p.CENTER);
        p.textSize(24);
        if (currentStage === 0) p.text('种子正在萌芽...', p.width / 2, 60);
        else if (currentStage === 1) p.text('未来之树正在生长...', p.width / 2, 60);
        else if (currentStage === 2) p.text('可能性正在绽放...', p.width / 2, 60);
        else if (currentStage === 3) {
          p.text('✨ 点击任意光点探索未来 ✨', p.width / 2, p.height - 30);
        }
      };

      p.mousePressed = () => {
        if (currentStage < 3) return;

        for (const leaf of leaves) {
          if (leaf.isHovered(p.mouseX, p.mouseY)) {
            router.push(`/future/${leaf.future.id}`);
            break;
          }
        }
      };

      p.windowResized = () => {
        if (containerRef.current) {
          p.resizeCanvas(
            containerRef.current.clientWidth,
            containerRef.current.clientHeight
          );
        }
      };
    };

    p5InstanceRef.current = new window.p5(sketch);

    return () => {
      if (p5InstanceRef.current) {
        p5InstanceRef.current.remove();
        p5InstanceRef.current = null;
      }
    };
  }, [isP5Loaded, treeData, router]);

  if (!treeData) return null;

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-[#0a0a1a] to-[#1a1a3a]">
      <Link
        href="/"
        className="absolute top-6 left-6 z-50 flex items-center gap-2 text-white/60 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        返回
      </Link>

      <div ref={containerRef} className="w-full h-screen" />
    </div>
  );
}
