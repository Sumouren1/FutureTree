import { kv } from '@vercel/kv';
import { UserFutureTree, Conversation } from '@/types';

export async function saveFutureTree(userId: string, data: UserFutureTree): Promise<void> {
  await kv.set(`future:${userId}`, JSON.stringify(data));
  // 设置 30 天过期
  await kv.expire(`future:${userId}`, 30 * 24 * 60 * 60);
}

export async function getFutureTree(userId: string): Promise<UserFutureTree | null> {
  const data = await kv.get(`future:${userId}`);
  return data ? JSON.parse(data as string) : null;
}

export async function saveConversation(
  userId: string,
  futureId: number,
  messages: Conversation['messages']
): Promise<void> {
  const key = `conversation:${userId}:${futureId}`;
  await kv.set(key, JSON.stringify(messages));
  await kv.expire(key, 30 * 24 * 60 * 60);
}

export async function getConversation(
  userId: string,
  futureId: number
): Promise<Conversation['messages'] | null> {
  const key = `conversation:${userId}:${futureId}`;
  const data = await kv.get(key);
  return data ? JSON.parse(data as string) : null;
}
