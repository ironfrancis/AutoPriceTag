import { PlacedLabelInstance, LabelDesign, AutoLayoutOptions } from '@/lib/types';

/**
 * 整页排版自动布局算法
 * 
 * 功能：
 * 1. 计算最优的标签排列方式（行列布局）
 * 2. 自动计算标签位置
 * 3. 控制标签间距和画布边距
 * 4. 支持水平/垂直排列方向
 */

/**
 * 计算自动布局结果
 * 
 * @param labelDesigns 要排列的标签设计列表
 * @param canvasSize 画布尺寸（mm）
 * @param options 布局选项
 * @returns 排列好的标签实例列表
 */
export function calculateAutoLayout(
  labelDesigns: LabelDesign[],
  canvasSize: { width: number; height: number },
  options: AutoLayoutOptions = {}
): PlacedLabelInstance[] {
  if (labelDesigns.length === 0) {
    return [];
  }

  const {
    spacing = 2,      // 默认间距2mm
    margins = {       // 默认边距5mm
      top: 5,
      right: 5,
      bottom: 5,
      left: 5
    },
    orientation = 'horizontal' // 默认水平排列
  } = options;

  // 计算可用区域
  const availableWidth = canvasSize.width - (margins.left || 0) - (margins.right || 0);
  const availableHeight = canvasSize.height - (margins.top || 0) - (margins.bottom || 0);

  // 获取所有标签的尺寸（可能有不同尺寸）
  const getLabelWidth = (labelDesign: LabelDesign) => labelDesign.labelSize.width;
  const getLabelHeight = (labelDesign: LabelDesign) => labelDesign.labelSize.height;
  
  // 计算第一个标签的尺寸（用于计算初始网格）
  const firstLabelWidth = getLabelWidth(labelDesigns[0]);
  const firstLabelHeight = getLabelHeight(labelDesigns[0]);

  // 计算最多能放多少列和行（基于第一个标签）
  const maxColumns = Math.floor(availableWidth / (firstLabelWidth + spacing));
  const maxRows = Math.floor(availableHeight / (firstLabelHeight + spacing));

  // 如果只有一个标签，特殊处理
  if (labelDesigns.length === 1) {
    const labelDesign = labelDesigns[0];
    const startX = (margins.left || 0) + (availableWidth - getLabelWidth(labelDesign)) / 2;
    const startY = (margins.top || 0) + (availableHeight - getLabelHeight(labelDesign)) / 2;
    
    return [{
      id: `instance_${Date.now()}_0`,
      labelDesign,
      position: { x: startX, y: startY },
      isSelected: false
    }];
  }

  // 计算实际需要的列数和行数
  const columns = orientation === 'horizontal' 
    ? Math.min(maxColumns, labelDesigns.length)
    : Math.floor(Math.sqrt(labelDesigns.length * availableWidth / availableHeight));
  const rows = Math.ceil(labelDesigns.length / columns);

  // 如果标签过大，至少保证能放1个
  const actualColumns = Math.max(1, columns);
  const actualRows = Math.max(1, rows);

  // 使用简单的流式布局：从左到右、从上到下，自动换行
  const instances: PlacedLabelInstance[] = [];
  
  let currentX = margins.left || 0;
  let currentY = margins.top || 0;
  let currentRowHeight = 0; // 当前行的最大高度
  
  labelDesigns.forEach((labelDesign, index) => {
    const labelWidth = getLabelWidth(labelDesign);
    const labelHeight = getLabelHeight(labelDesign);
    
    // 检查是否需要换行（当前行放不下）
    if (currentX + labelWidth > availableWidth + (margins.left || 0)) {
      // 换到下一行
      currentX = margins.left || 0;
      currentY += currentRowHeight + spacing;
      currentRowHeight = 0;
    }
    
    // 检查是否会超出画布
    if (currentY + labelHeight > availableHeight + (margins.top || 0)) {
      console.warn(`标签 ${index} 超出画布范围，跳过放置`);
      return; // 跳过这个标签
    }
    
    // 更新当前行的最大高度
    currentRowHeight = Math.max(currentRowHeight, labelHeight);
    
    instances.push({
      id: `instance_${Date.now()}_${index}`,
      labelDesign,
      position: { x: currentX, y: currentY },
      isSelected: false
    });
    
    // 移动到下一列
    currentX += labelWidth + spacing;
  });

  return instances;
}

/**
 * 计算在画布上可以放置的最大标签数量
 * 
 * @param labelSize 标签尺寸（mm）
 * @param canvasSize 画布尺寸（mm）
 * @param spacing 标签间距（mm）
 * @param margins 画布边距（mm）
 * @returns 可以放置的最大标签数量
 */
export function calculateMaxLabels(
  labelSize: { width: number; height: number },
  canvasSize: { width: number; height: number },
  spacing: number = 2,
  margins: { top: number; right: number; bottom: number; left: number } = { top: 5, right: 5, bottom: 5, left: 5 }
): number {
  const availableWidth = canvasSize.width - margins.left - margins.right;
  const availableHeight = canvasSize.height - margins.top - margins.bottom;

  const maxColumns = Math.floor(availableWidth / (labelSize.width + spacing));
  const maxRows = Math.floor(availableHeight / (labelSize.height + spacing));

  return Math.max(1, maxColumns * maxRows);
}

/**
 * 检查标签实例是否在画布范围内
 * 
 * @param instance 标签实例
 * @param canvasSize 画布尺寸
 * @returns 是否在范围内
 */
export function isInstanceInBounds(
  instance: PlacedLabelInstance,
  canvasSize: { width: number; height: number }
): boolean {
  const { position } = instance;
  const { labelSize } = instance.labelDesign;
  
  return (
    position.x >= 0 &&
    position.y >= 0 &&
    position.x + labelSize.width <= canvasSize.width &&
    position.y + labelSize.height <= canvasSize.height
  );
}

/**
 * 计算标签实例的边界（用于碰撞检测）
 * 
 * @param instance 标签实例
 * @returns 边界矩形
 */
export function getInstanceBounds(instance: PlacedLabelInstance) {
  const { position } = instance;
  const { labelSize } = instance.labelDesign;

  return {
    x: position.x,
    y: position.y,
    width: labelSize.width,
    height: labelSize.height,
    right: position.x + labelSize.width,
    bottom: position.y + labelSize.height
  };
}

/**
 * 检测两个标签实例是否碰撞
 * 
 * @param instance1 标签实例1
 * @param instance2 标签实例2
 * @returns 是否碰撞
 */
export function doInstancesCollide(
  instance1: PlacedLabelInstance,
  instance2: PlacedLabelInstance
): boolean {
  const bounds1 = getInstanceBounds(instance1);
  const bounds2 = getInstanceBounds(instance2);

  return !(
    bounds1.right <= bounds2.x ||
    bounds2.right <= bounds1.x ||
    bounds1.bottom <= bounds2.y ||
    bounds2.bottom <= bounds1.y
  );
}
