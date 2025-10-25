import Dexie, { Table } from 'dexie';
import { LabelTemplate, ProductData, HistoryRecord, UserSettings, SavedLabel } from './types';

export class AutoPriceTagDB extends Dexie {
  templates!: Table<LabelTemplate>;
  products!: Table<ProductData>;
  history!: Table<HistoryRecord>;
  settings!: Table<UserSettings>;
  savedLabels!: Table<SavedLabel>;

  constructor() {
    super('AutoPriceTagDB');
    this.version(1).stores({
      templates: 'id, name, type, createdAt, updatedAt',
      products: 'id, name, price, createdAt',
      history: 'id, templateId, createdAt',
      settings: 'id, language, autoSaveEnabled',
      savedLabels: 'id, name, createdAt, updatedAt',
    });
  }
}

export const db = new AutoPriceTagDB();

// 数据库初始化
export async function initDatabase() {
  try {
    await db.open();
    console.log('数据库初始化成功');
  } catch (error) {
    console.error('数据库初始化失败:', error);
  }
}

// 默认设置
export const defaultSettings: UserSettings = {
  defaultPaperSize: { name: 'A4', width: 210, height: 297, dpi: 300 },
  defaultLabelSize: { width: 40, height: 30 },
  recentTemplates: [],
  autoSaveEnabled: true,
  language: 'zh-CN',
};

// 获取用户设置
export async function getUserSettings(): Promise<UserSettings> {
  try {
    const settings = await db.settings.get('default');
    return settings || defaultSettings;
  } catch (error) {
    console.error('获取用户设置失败:', error);
    return defaultSettings;
  }
}

// 保存用户设置
export async function saveUserSettings(settings: UserSettings): Promise<void> {
  try {
    await db.settings.put({ ...settings, id: 'default' });
  } catch (error) {
    console.error('保存用户设置失败:', error);
  }
}

// 获取历史记录
export async function getHistoryRecords(limit = 50): Promise<HistoryRecord[]> {
  try {
    return await db.history
      .orderBy('createdAt')
      .reverse()
      .limit(limit)
      .toArray();
  } catch (error) {
    console.error('获取历史记录失败:', error);
    return [];
  }
}

// 保存历史记录
export async function saveHistoryRecord(record: Omit<HistoryRecord, 'id'>): Promise<string> {
  try {
    const id = `history_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    await db.history.add({ ...record, id });
    return id;
  } catch (error) {
    console.error('保存历史记录失败:', error);
    throw error;
  }
}

// 删除历史记录
export async function deleteHistoryRecord(id: string): Promise<void> {
  try {
    await db.history.delete(id);
  } catch (error) {
    console.error('删除历史记录失败:', error);
  }
}

// 清理过期历史记录（保留最近100条）
export async function cleanupHistoryRecords(): Promise<void> {
  try {
    const records = await db.history
      .orderBy('createdAt')
      .reverse()
      .offset(100)
      .toArray();
    
    const idsToDelete = records.map(record => record.id);
    await db.history.bulkDelete(idsToDelete);
  } catch (error) {
    console.error('清理历史记录失败:', error);
  }
}

// 保存标签
export async function saveLabel(label: Omit<SavedLabel, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  try {
    const id = `label_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date();
    await db.savedLabels.add({
      ...label,
      id,
      createdAt: now,
      updatedAt: now,
    });
    return id;
  } catch (error) {
    console.error('保存标签失败:', error);
    throw error;
  }
}

// 获取所有保存的标签
export async function getSavedLabels(): Promise<SavedLabel[]> {
  try {
    return await db.savedLabels
      .orderBy('updatedAt')
      .reverse()
      .toArray();
  } catch (error) {
    console.error('获取保存的标签失败:', error);
    return [];
  }
}

// 根据ID获取标签
export async function getSavedLabelById(id: string): Promise<SavedLabel | undefined> {
  try {
    return await db.savedLabels.get(id);
  } catch (error) {
    console.error('获取标签失败:', error);
    return undefined;
  }
}

// 更新标签
export async function updateSavedLabel(id: string, updates: Partial<SavedLabel>): Promise<void> {
  try {
    await db.savedLabels.update(id, {
      ...updates,
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error('更新标签失败:', error);
    throw error;
  }
}

// 删除标签
export async function deleteSavedLabel(id: string): Promise<void> {
  try {
    await db.savedLabels.delete(id);
  } catch (error) {
    console.error('删除标签失败:', error);
    throw error;
  }
}
