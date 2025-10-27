import { CanvasPreset } from '@/lib/types';

/**
 * 画布预设尺寸配置
 * 
 * 提供常见的打印画布尺寸预设，包括：
 * - 标准纸张尺寸（A4、A3等）
 * - 照片尺寸（5寸、6寸、7寸等）
 * - 商业标签纸尺寸
 */

export const CANVAS_PRESETS: CanvasPreset[] = [
  // 标准纸张尺寸
  {
    id: 'a4',
    name: 'A4纸张',
    width: 210,
    height: 297,
    description: '标准A4纸张 (210×297mm)'
  },
  {
    id: 'a3',
    name: 'A3纸张',
    width: 297,
    height: 420,
    description: '标准A3纸张 (297×420mm)'
  },
  {
    id: 'letter',
    name: 'Letter',
    width: 216,
    height: 279,
    description: 'Letter尺寸 (216×279mm)'
  },

  // 照片尺寸
  {
    id: 'photo-5inch',
    name: '5寸照片',
    width: 127,
    height: 89,
    description: '5寸照片 (127×89mm)'
  },
  {
    id: 'photo-6inch',
    name: '6寸照片',
    width: 152,
    height: 102,
    description: '6寸照片 (152×102mm)'
  },
  {
    id: 'photo-7inch',
    name: '7寸照片',
    width: 178,
    height: 127,
    description: '7寸照片 (178×127mm)'
  },

  // 商业标签纸
  {
    id: 'label-small',
    name: '小型标签纸',
    width: 100,
    height: 70,
    description: '小型标签纸 (100×70mm)'
  },
  {
    id: 'label-medium',
    name: '中型标签纸',
    width: 150,
    height: 100,
    description: '中型标签纸 (150×100mm)'
  },
  {
    id: 'label-large',
    name: '大型标签纸',
    width: 200,
    height: 150,
    description: '大型标签纸 (200×150mm)'
  }
];

/**
 * 根据ID获取画布预设
 */
export function getCanvasPresetById(id: string): CanvasPreset | undefined {
  return CANVAS_PRESETS.find(preset => preset.id === id);
}

/**
 * 获取默认画布预设
 */
export function getDefaultCanvasPreset(): CanvasPreset {
  return CANVAS_PRESETS.find(preset => preset.id === 'a4') || CANVAS_PRESETS[0];
}

/**
 * 添加自定义画布预设
 */
export function addCustomCanvasPreset(name: string, width: number, height: number, description?: string): CanvasPreset {
  const preset: CanvasPreset = {
    id: `custom_${Date.now()}`,
    name,
    width,
    height,
    description
  };
  
  // 这里可以扩展为保存到本地存储
  return preset;
}
