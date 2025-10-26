import { supabase } from '@/lib/supabase/client';
import { LabelDesign } from '@/lib/types';

/**
 * 云端存储服务
 * 
 * 提供云存储 CRUD 操作：
 * - saveDesign: 保存设计到云端
 * - loadDesigns: 加载所有云端设计
 * - deleteDesign: 删除云端设计
 * - syncWithLocal: 同步本地和云端数据
 */

/**
 * 保存设计到云端
 */
export const saveDesignToCloud = async (design: LabelDesign): Promise<{ success: boolean; error?: string }> => {
  try {
    // 检查是否已登录
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: '未登录，请先登录' };
    }

    // 准备保存的数据
    const designData = {
      user_id: user.id,
      label_id: design.labelId || `design_${Date.now()}`,
      name: design.labelName || design.productData.name || '未命名设计',
      data: JSON.stringify(design),
      created_at: design.createdAt || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // 保存到 Supabase
    const { data, error } = await supabase
      .from('projects')
      .upsert(designData, { onConflict: 'label_id' });

    if (error) {
      console.error('保存到云端失败:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('保存到云端失败:', error);
    return { success: false, error: '保存失败' };
  }
};

/**
 * 从云端加载所有设计
 */
export const loadDesignsFromCloud = async (): Promise<{ designs: LabelDesign[]; error?: string }> => {
  try {
    // 检查是否已登录
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { designs: [], error: '未登录，请先登录' };
    }

    // 从云端加载
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('从云端加载失败:', error);
      return { designs: [], error: error.message };
    }

    // 解析数据
    const designs: LabelDesign[] = (data || []).map(row => {
      try {
        const design = JSON.parse(row.data);
        return {
          ...design,
          labelId: row.label_id,
          labelName: row.name,
          createdAt: row.created_at,
          updatedAt: row.updated_at,
        };
      } catch {
        return null;
      }
    }).filter(Boolean) as LabelDesign[];

    return { designs };
  } catch (error) {
    console.error('从云端加载失败:', error);
    return { designs: [], error: '加载失败' };
  }
};

/**
 * 从云端删除设计
 */
export const deleteDesignFromCloud = async (labelId: string): Promise<{ success: boolean; error?: string }> => {
  try {
    // 检查是否已登录
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: '未登录，请先登录' };
    }

    // 删除设计
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('label_id', labelId)
      .eq('user_id', user.id);

    if (error) {
      console.error('从云端删除失败:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('从云端删除失败:', error);
    return { success: false, error: '删除失败' };
  }
};

/**
 * 同步本地和云端数据
 */
export const syncWithCloud = async (
  localDesigns: LabelDesign[]
): Promise<{ synced: number; errors: number }> => {
  let synced = 0;
  let errors = 0;

  for (const design of localDesigns) {
    const result = await saveDesignToCloud(design);
    if (result.success) {
      synced++;
    } else {
      errors++;
    }
  }

  return { synced, errors };
};

