import { supabase } from '@/lib/supabase/client';
import { PageLayoutDesign } from '@/lib/types';

/**
 * 整页排版存储服务
 * 
 * 提供整页排版的云端存储 CRUD 操作：
 * - savePageLayout: 保存排版到 Supabase 数据库
 * - loadPageLayouts: 加载所有排版
 * - deletePageLayout: 删除排版
 * - exportPageLayoutJSON: 导出为 JSON 文件
 * - importPageLayoutJSON: 从 JSON 导入
 */

/**
 * 保存整页排版到 Supabase 数据库
 */
export const savePageLayout = async (layout: PageLayoutDesign): Promise<{ success: boolean; error?: string }> => {
  if (!supabase) {
    return { success: false, error: 'Supabase 未配置，无法保存' };
  }

  try {
    // 检查是否已登录
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: '未登录，请先登录' };
    }

    // 准备保存的数据
    const layoutData = {
      user_id: user.id,
      layout_id: layout.layoutId || `layout_${Date.now()}`,
      layout_name: layout.layoutName || '未命名排版',
      canvas_preset: JSON.stringify(layout.canvasPreset),
      instances: JSON.stringify(layout.instances),
      created_at: layout.createdAt || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // 保存到 Supabase（使用 upsert 支持更新）
    const { data, error } = await supabase
      .from('page_layouts')
      .upsert(layoutData, { onConflict: 'layout_id' });

    if (error) {
      console.error('保存整页排版失败:', error);
      // 如果表不存在，提示用户
      if (error.message?.includes('page_layouts') || error.code === '42P01') {
        return { success: false, error: '数据库表不存在，请先运行迁移文件创建表' };
      }
      return { success: false, error: error.message || '保存失败' };
    }

    return { success: true };
  } catch (error) {
    console.error('保存整页排版失败:', error);
    return { success: false, error: '保存失败' };
  }
};

/**
 * 从 Supabase 加载所有整页排版
 */
export const loadPageLayouts = async (): Promise<{ layouts: PageLayoutDesign[]; error?: string }> => {
  if (!supabase) {
    return { layouts: [], error: 'Supabase 未配置，无法加载' };
  }

  try {
    // 检查是否已登录
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { layouts: [], error: '未登录，请先登录' };
    }

    // 从数据库加载
    const { data, error } = await supabase
      .from('page_layouts')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('加载整页排版失败:', error);
      // 如果表不存在，提示用户
      if (error.message?.includes('page_layouts') || error.code === '42P01') {
        return { layouts: [], error: '数据库表不存在，请先运行迁移文件创建表' };
      }
      return { layouts: [], error: error.message || '加载失败' };
    }

    // 解析数据
    const layouts: PageLayoutDesign[] = (data || []).map(row => {
      try {
        return {
          layoutId: row.layout_id,
          layoutName: row.layout_name,
          canvasPreset: typeof row.canvas_preset === 'string' 
            ? JSON.parse(row.canvas_preset) 
            : row.canvas_preset,
          instances: typeof row.instances === 'string' 
            ? JSON.parse(row.instances) 
            : row.instances,
          createdAt: row.created_at,
          updatedAt: row.updated_at,
        };
      } catch (e) {
        console.error('解析排版数据失败:', e);
        return null;
      }
    }).filter(Boolean) as PageLayoutDesign[];

    return { layouts };
  } catch (error) {
    console.error('加载整页排版失败:', error);
    return { layouts: [], error: '加载失败' };
  }
};

/**
 * 从 Supabase 删除整页排版
 */
export const deletePageLayout = async (layoutId: string): Promise<{ success: boolean; error?: string }> => {
  if (!supabase) {
    return { success: false, error: 'Supabase 未配置，无法删除' };
  }

  try {
    // 检查是否已登录
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: '未登录，请先登录' };
    }

    // 删除排版
    const { error } = await supabase
      .from('page_layouts')
      .delete()
      .eq('layout_id', layoutId)
      .eq('user_id', user.id);

    if (error) {
      console.error('删除整页排版失败:', error);
      if (error.message?.includes('page_layouts') || error.code === '42P01') {
        return { success: false, error: '数据库表不存在' };
      }
      return { success: false, error: error.message || '删除失败' };
    }

    return { success: true };
  } catch (error) {
    console.error('删除整页排版失败:', error);
    return { success: false, error: '删除失败' };
  }
};

/**
 * 导出整页排版为 JSON 文件
 */
export const exportPageLayoutJSON = (layout: PageLayoutDesign): void => {
  try {
    const json = JSON.stringify(layout, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `${layout.layoutName || 'page_layout'}_${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('导出 JSON 失败:', error);
    throw new Error('导出失败');
  }
};

/**
 * 从 JSON 导入整页排版
 * 导入后自动保存到数据库
 */
export const importPageLayoutJSON = async (
  jsonString: string
): Promise<{ layout?: PageLayoutDesign; error?: string }> => {
  try {
    const layout = JSON.parse(jsonString) as PageLayoutDesign;
    
    // 验证必需字段
    if (!layout.canvasPreset || !layout.instances) {
      return { error: 'JSON 格式不正确，缺少必需字段' };
    }
    
    // 生成新的 ID 和时间戳
    const now = new Date().toISOString();
    const importedLayout: PageLayoutDesign = {
      ...layout,
      layoutId: `layout_${Date.now()}`,
      layoutName: `${layout.layoutName || '导入的排版'} (副本)`,
      createdAt: now,
      updatedAt: now,
    };
    
    // 自动保存到数据库
    const result = await savePageLayout(importedLayout);
    if (!result.success) {
      return { error: result.error };
    }
    
    return { layout: importedLayout };
  } catch (error) {
    console.error('导入 JSON 失败:', error);
    return { error: '导入失败，请检查 JSON 格式' };
  }
};


