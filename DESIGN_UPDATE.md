# FutureTree 手绘草图风格设计更新

## 设计概念

基于你提供的手绘草图风格代码，我将整个 FutureTree 项目重新设计为一个充满创意和手工感的界面，就像在设计师的工作台上绘制未来蓝图。

## 核心设计元素

### 1. 视觉风格
- **纸质背景**: 米白色纸张质感 (#F4F4F0)
- **墨水黑**: 深黑色线条和文字 (#1A1A18)
- **石墨灰**: 辅助文字和标注 (#A0A09A)
- **橙色强调**: 活力橙色作为主色调 (#FF6B00)

### 2. 字体系统
- **Caveat**: 手写标题字体（粗体 700）
- **Nanum Pen Script**: 手写笔记字体
- **Space Mono**: 等宽标注字体（大写字母，字间距 1.5px）

### 3. 装饰元素
- **物理工具**: 机械铅笔、黑色铅笔、细线笔、橡皮擦
- **铅笔碎屑**: 随机分布的小碎屑装饰
- **草图线条**: 虚线辅助线、实线参考线
- **手绘标注**: 设计稿风格的标注文字

### 4. 交互元素

#### 按钮样式
```css
.sketch-button {
  border: 3px solid #1A1A18;
  box-shadow: 5px 5px 0 #1A1A18;
  /* 按下时阴影减小，产生按压效果 */
}
```

#### 输入框样式
```css
.sketch-input {
  border: 3px solid #1A1A18;
  font-family: 'Nanum Pen Script';
  background: rgba(255, 255, 255, 0.8);
}
```

#### 卡片样式
```css
.sketch-card {
  border: 3px solid #1A1A18;
  box-shadow: 2px 4px 10px rgba(0,0,0,0.15);
  /* 带虚线装饰边框 */
}
```

## 页面更新

### 1. 首页 (page.tsx)
- ✅ 手绘标题 "FutureTree"（带墨水渗透效果）
- ✅ 草图辅助线背景
- ✅ 物理工具装饰（铅笔、橡皮擦等）
- ✅ 手绘箭头指向表单
- ✅ 设计稿风格标注（DRAFT: 01, REF: FUTURE_V2）

### 2. 表单组件 (InputForm.tsx)
- ✅ 移除 framer-motion 动画
- ✅ 使用手绘风格按钮和输入框
- ✅ 编号标签（01. YOUR CONFUSION, 02. YOUR STATUS 等）
- ✅ 自定义滑块样式（方形滑块，带阴影）
- ✅ 手绘风格的选项卡

### 3. 树形图页面 (tree/page.tsx)
- ✅ 手绘标题和导航
- ✅ 草图背景线条（同心圆、十字线）
- ✅ 方形和圆形节点（带粗边框）
- ✅ 手绘风格的筛选按钮
- ✅ 标注文字（TOTAL, TIMELINE）

### 4. 未来详情页 (future/[id]/page.tsx)
- ✅ 左侧设定卡片（sketch-card 样式）
- ✅ 编号信息展示（01. STATUS, 02. PROFESSION 等）
- ✅ 手绘标题和标签
- ✅ 右侧对话区域

### 5. 聊天组件 (ChatWindow.tsx & Message.tsx)
- ✅ 移除圆角气泡，使用方形边框
- ✅ 手绘装饰线条
- ✅ 表情符号头像（👤 用户，🌱 AI）
- ✅ 手写字体消息内容

### 6. 全局样式 (globals.css)
- ✅ 完整的手绘风格 CSS 变量
- ✅ SVG 墨水渗透滤镜
- ✅ 物理工具装饰类
- ✅ 草图线条样式
- ✅ 响应式设计

## 技术实现

### 墨水渗透效果
```html
<filter id="ink-bleed">
  <feTurbulence type="fractalNoise" baseFrequency="0.08" />
  <feDisplacementMap scale="3" />
  <feGaussianBlur stdDeviation="0.8" />
</filter>
```

### 按压动效
```css
.sketch-button:hover {
  transform: translate(2px, 2px);
  box-shadow: 3px 3px 0 var(--ink-black);
}

.sketch-button:active {
  transform: translate(5px, 5px);
  box-shadow: 0 0 0 var(--ink-black);
}
```

### 物理工具装饰
- 机械铅笔：渐变金属质感 + 握持区纹理
- 黑色铅笔：木质笔尖 + 金色装饰条
- 细线笔：黑色笔身 + 笔帽
- 橡皮擦：不规则圆角 + 内阴影

## 设计亮点

1. **真实感**: 通过阴影、边框、装饰元素营造真实的设计工作台氛围
2. **手工感**: 手写字体、不规则线条、草图标注增强手工绘制感
3. **层次感**: 通过阴影偏移、边框粗细、装饰线条建立视觉层次
4. **互动性**: 按压动效、悬停状态让界面更有触感
5. **一致性**: 所有页面统一使用手绘风格，保持视觉连贯性

## 使用说明

1. 启动开发服务器：
```bash
cd ~/future-tree
npm run dev
```

2. 访问 http://localhost:3000 查看效果

3. 主要交互：
   - 首页填写表单，点击"种下你的未来种子"
   - 查看树形图，点击叶子节点
   - 与未来的自己对话

## 后续优化建议

1. 添加页面切换的手绘过渡动画
2. 增加更多手绘装饰元素（回形针、便签、咖啡杯等）
3. 实现树形图节点的手绘连接线动画
4. 添加纸张纹理背景图
5. 优化移动端响应式布局

---

设计完成时间：2026-03-18
设计风格：手绘草图 / 设计工作台
灵感来源：Stewarding Kingdom Voices 草图风格
