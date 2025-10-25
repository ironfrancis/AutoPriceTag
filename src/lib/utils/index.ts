import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// 合并 Tailwind CSS 类名
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// 毫米转像素 (基于 DPI)
export function mmToPixels(mm: number, dpi: number = 300): number {
  return (mm * dpi) / 25.4;
}

// 像素转毫米 (基于 DPI)
export function pixelsToMm(pixels: number, dpi: number = 300): number {
  return (pixels * 25.4) / dpi;
}

// 生成唯一ID
export function generateId(prefix: string = 'id'): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// 格式化价格
export function formatPrice(price: number, currency: string = '¥'): string {
  return `${currency}${price.toFixed(2)}`;
}

// 计算折扣价格
export function calculateDiscountPrice(originalPrice: number, discount: number): number {
  return originalPrice * (discount / 100);
}

// 验证商品数据
export function validateProductData(data: Partial<any>): string[] {
  const errors: string[] = [];
  
  if (!data.name || data.name.trim().length === 0) {
    errors.push('商品名称不能为空');
  }
  
  if (!data.price || data.price <= 0) {
    errors.push('商品价格必须大于0');
  }
  
  if (data.originalPrice && data.originalPrice <= 0) {
    errors.push('原价必须大于0');
  }
  
  if (data.discount && (data.discount <= 0 || data.discount > 100)) {
    errors.push('折扣率必须在1-100之间');
  }
  
  return errors;
}

// 下载文件
export function downloadFile(data: Blob, filename: string): void {
  // 检查是否在浏览器环境中
  if (typeof window === 'undefined') {
    console.warn('downloadFile 只能在浏览器环境中使用');
    return;
  }
  
  const url = URL.createObjectURL(data);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// 压缩图片
export function compressImage(file: File, maxWidth: number = 800, quality: number = 0.8): Promise<string> {
  return new Promise((resolve, reject) => {
    // 检查是否在浏览器环境中
    if (typeof window === 'undefined') {
      reject(new Error('compressImage 只能在浏览器环境中使用'));
      return;
    }
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
      canvas.width = img.width * ratio;
      canvas.height = img.height * ratio;
      
      ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
      const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
      resolve(compressedDataUrl);
    };
    
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

// 防抖函数
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// 节流函数
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// 深拷贝
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime()) as any;
  if (obj instanceof Array) return obj.map(item => deepClone(item)) as any;
  if (typeof obj === 'object') {
    const clonedObj = {} as any;
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }
    return clonedObj;
  }
  return obj;
}

// 获取文件扩展名
export function getFileExtension(filename: string): string {
  return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
}

// 检查是否为图片文件
export function isImageFile(filename: string): boolean {
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'];
  const extension = getFileExtension(filename).toLowerCase();
  return imageExtensions.includes(extension);
}

// 文本宽度计算（Canvas measureText）
export function measureTextWidth(text: string, fontSize: number, fontFamily: string = 'Noto Sans SC'): number {
  // 检查是否在浏览器环境中
  if (typeof window === 'undefined') {
    // 服务端渲染时返回估算值
    return text.length * fontSize * 0.6;
  }
  
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return text.length * fontSize * 0.6;
  
  ctx.font = `${fontSize}px "${fontFamily}", sans-serif`;
  return ctx.measureText(text).width;
}

// 字体大小优化算法
export function calculateOptimalFontSize(
  text: string,
  maxWidth: number,
  maxHeight: number,
  minFontSize: number = 8,
  maxFontSize: number = 20,
  fontFamily: string = 'Noto Sans SC'
): number {
  let fontSize = maxFontSize;
  
  while (fontSize >= minFontSize) {
    const textWidth = measureTextWidth(text, fontSize, fontFamily);
    const textHeight = fontSize * 1.2; // 行高倍数
    
    if (textWidth <= maxWidth && textHeight <= maxHeight) {
      return fontSize;
    }
    
    fontSize -= 1;
  }
  
  return minFontSize;
}

// 文本换行算法
export function wrapText(
  text: string,
  maxWidth: number,
  fontSize: number,
  fontFamily: string = 'Noto Sans SC'
): { lines: string[]; totalHeight: number } {
  // 检查是否在浏览器环境中
  if (typeof window === 'undefined') {
    // 服务端渲染时使用简单换行
    const estimatedCharsPerLine = Math.floor(maxWidth / (fontSize * 0.6));
    const lines = [];
    for (let i = 0; i < text.length; i += estimatedCharsPerLine) {
      lines.push(text.slice(i, i + estimatedCharsPerLine));
    }
    return { lines: lines.slice(0, 3), totalHeight: Math.min(lines.length, 3) * fontSize * 1.2 };
  }
  
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return { lines: [text], totalHeight: fontSize * 1.2 };
  
  ctx.font = `${fontSize}px "${fontFamily}", sans-serif`;
  
  // 如果文本很短，不需要换行
  const textWidth = ctx.measureText(text).width;
  if (textWidth <= maxWidth) {
    return { lines: [text], totalHeight: fontSize * 1.2 };
  }
  
  // 需要换行
  const words = text.split('');
  const lines: string[] = [];
  let currentLine = '';
  
  for (const char of words) {
    const testLine = currentLine + char;
    const testWidth = ctx.measureText(testLine).width;
    
    if (testWidth <= maxWidth) {
      currentLine = testLine;
    } else {
      if (currentLine) {
        lines.push(currentLine);
        currentLine = char;
      } else {
        // 单个字符就超宽，强制添加
        lines.push(char);
        currentLine = '';
      }
    }
  }
  
  if (currentLine) {
    lines.push(currentLine);
  }
  
  // 限制最多3行
  if (lines.length > 3) {
    lines.splice(3);
    lines[2] = lines[2].substring(0, lines[2].length - 3) + '...';
  }
  
  return {
    lines,
    totalHeight: lines.length * fontSize * 1.2
  };
}

// 空间分配算法
export function allocateSpace(
  elements: Array<{ weight: number; minSize: number; maxSize: number }>,
  totalSpace: number
): number[] {
  const totalWeight = elements.reduce((sum, el) => sum + el.weight, 0);
  const allocations: number[] = [];
  
  // 按权重分配基础空间
  for (const element of elements) {
    const baseSize = (element.weight / totalWeight) * totalSpace;
    allocations.push(Math.max(element.minSize, Math.min(element.maxSize, baseSize)));
  }
  
  // 调整分配，确保总和不超过总空间
  const currentTotal = allocations.reduce((sum, size) => sum + size, 0);
  if (currentTotal > totalSpace) {
    const ratio = totalSpace / currentTotal;
    for (let i = 0; i < allocations.length; i++) {
      allocations[i] *= ratio;
    }
  }
  
  return allocations;
}

// 智能对齐方式选择
export function getOptimalAlignment(
  width: number,
  height: number,
  textLength: number
): 'left' | 'center' | 'right' {
  const aspectRatio = width / height;
  
  if (aspectRatio > 2) {
    // 横版标签，居中对齐
    return 'center';
  } else if (aspectRatio < 0.8) {
    // 竖版标签，左对齐
    return 'left';
  } else if (textLength > 20) {
    // 长文本，左对齐
    return 'left';
  } else {
    // 方形标签或短文本，居中对齐
    return 'center';
  }
}
