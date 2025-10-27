import { createClient } from '@supabase/supabase-js';

// Supabase 配置
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// 检查是否配置了 Supabase
const isSupabaseConfigured = supabaseUrl && supabaseAnonKey;

// 只有在配置了 Supabase 的情况下才创建客户端
export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * Supabase 客户端
 * 
 * 用于与 Supabase 数据库交互
 * 支持：
 * - 用户认证（登录、注册、登出）
 * - 数据存储（保存、加载、删除设计）
 * - 实时同步
 * 
 * 使用方法：
 * ```typescript
 * import { supabase } from '@/lib/supabase/client';
 * 
 * // 登录
 * const { data, error } = await supabase.auth.signInWithPassword({
 *   email: 'user@example.com',
 *   password: 'password'
 * });
 * ```
 */

