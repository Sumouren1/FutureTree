export interface UserInput {
  confusion: string;
  status: '学生' | '职场新人' | '职场老手' | '创业者' | '自由职业' | '待业中';
  interests: string[];
  timeline: number; // 1, 3, 5, 10
}

export interface Future {
  id: number;
  title: string;
  category: '事业' | '关系' | '成长' | '健康' | '创意' | '财务';
  summary: string;
  story: string;
  profession?: string;
  lifeStatus?: string;
  tags?: string[];
  timeline: number;
  prompt?: string; // 角色Prompt，用于对话
}

export interface UserFutureTree {
  id: string;
  userInput: UserInput;
  futures: Future[];
  createdAt: number;
}

export interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  // 抢占对话相关
  futureId?: number;
  futureTitle?: string;
  futureYears?: number;
  avatar?: string;
  isInterruption?: boolean;
}

export interface DiscussionConfig {
  triggerProbability: number; // 触发概率 0-1
  minRounds: number;
  maxRounds: number;
  interruptionProbability: number; // 打断概率 0-1
}

export interface Conversation {
  futureId: number;
  messages: ConversationMessage[];
}

export interface TreeNode {
  name: string;
  attributes?: {
    id: string;
    category: string;
    summary: string;
  };
  children?: TreeNode[];
}

export const CATEGORY_COLORS: Record<Future['category'], string> = {
  '事业': '#3b82f6', // 蓝色
  '关系': '#f97316', // 橙色
  '成长': '#10b981', // 绿色
  '健康': '#ef4444', // 红色
  '创意': '#8b5cf6', // 紫色
  '财务': '#eab308', // 黄色
};
