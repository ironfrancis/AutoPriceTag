// 布局模板数据库接口
export interface LayoutArea {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  content: string;
  fontSize: number;
  fontWeight: number;
  color: string;
  align: 'left' | 'center' | 'right';
}

export interface LayoutTemplate {
  id: string;
  name: string;
  areas: LayoutArea[];
  width: number;
  height: number;
  createdAt: string;
  updatedAt: string;
}

// 本地存储键
const LAYOUT_TEMPLATES_KEY = 'layout_templates';

// 获取所有布局模板
export function getLayoutTemplates(): LayoutTemplate[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(LAYOUT_TEMPLATES_KEY);
    if (!stored) {
      // 返回默认模板
      return [getDefaultTemplate()];
    }
    return JSON.parse(stored);
  } catch (error) {
    console.error('Failed to load layout templates:', error);
    return [getDefaultTemplate()];
  }
}

// 保存布局模板
export function saveLayoutTemplate(template: LayoutTemplate): void {
  if (typeof window === 'undefined') return;
  
  try {
    const templates = getLayoutTemplates();
    const existingIndex = templates.findIndex(t => t.id === template.id);
    
    if (existingIndex >= 0) {
      // 更新现有模板
      templates[existingIndex] = {
        ...template,
        updatedAt: new Date().toISOString()
      };
    } else {
      // 添加新模板
      templates.push({
        ...template,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
    
    localStorage.setItem(LAYOUT_TEMPLATES_KEY, JSON.stringify(templates));
  } catch (error) {
    console.error('Failed to save layout template:', error);
  }
}

// 删除布局模板
export function deleteLayoutTemplate(templateId: string): void {
  if (typeof window === 'undefined') return;
  
  try {
    const templates = getLayoutTemplates();
    const filteredTemplates = templates.filter(t => t.id !== templateId);
    localStorage.setItem(LAYOUT_TEMPLATES_KEY, JSON.stringify(filteredTemplates));
  } catch (error) {
    console.error('Failed to delete layout template:', error);
  }
}

// 获取默认模板
export function getDefaultTemplate(): LayoutTemplate {
  return {
    id: 'default',
    name: '默认布局',
    width: 80,
    height: 50,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    areas: [
      {
        id: 'text-area',
        x: 0,
        y: 0,
        width: 60,
        height: 50,
        content: 'product_name',
        fontSize: 14,
        fontWeight: 500,
        color: '#111827',
        align: 'left'
      },
      {
        id: 'price-area',
        x: 60,
        y: 0,
        width: 20,
        height: 50,
        content: 'price',
        fontSize: 18,
        fontWeight: 600,
        color: '#2563eb',
        align: 'center'
      }
    ]
  };
}

// 创建新模板
export function createNewTemplate(name: string, width: number, height: number): LayoutTemplate {
  return {
    id: `template-${Date.now()}`,
    name,
    width,
    height,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    areas: []
  };
}

// 复制模板
export function duplicateTemplate(template: LayoutTemplate, newName?: string): LayoutTemplate {
  return {
    ...template,
    id: `template-${Date.now()}`,
    name: newName || `${template.name} (副本)`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}
