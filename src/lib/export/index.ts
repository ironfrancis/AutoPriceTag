import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export interface ExportOptions {
  format: 'png' | 'jpg' | 'pdf';
  quality?: number;
  dpi?: number;
  filename?: string;
}

export interface CanvasExportOptions extends ExportOptions {
  canvas: HTMLCanvasElement;
}

// 从原生HTML5 Canvas导出图片
export async function exportCanvasAsImage(options: CanvasExportOptions): Promise<Blob> {
  const { canvas, format = 'png', quality = 1, dpi = 300 } = options;
  
  // 设置画布导出参数
  const multiplier = dpi / 96; // 96 DPI 是标准屏幕 DPI
  
  // 创建高质量画布
  const exportCanvas = document.createElement('canvas');
  const exportCtx = exportCanvas.getContext('2d');
  
  if (!exportCtx) {
    throw new Error('Failed to get canvas context');
  }
  
  // 设置导出画布尺寸
  exportCanvas.width = canvas.width * multiplier;
  exportCanvas.height = canvas.height * multiplier;
  
  // 设置高质量渲染
  exportCtx.imageSmoothingEnabled = true;
  exportCtx.imageSmoothingQuality = 'high';
  
  // 绘制到导出画布
  exportCtx.drawImage(canvas, 0, 0, exportCanvas.width, exportCanvas.height);
  
  // 转换为 Blob
  return new Promise((resolve, reject) => {
    exportCanvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
      } else {
        reject(new Error('Failed to create blob'));
      }
    }, `image/${format}`, quality);
  });
}

// 从原生HTML5 Canvas导出PDF
export async function exportCanvasAsPDF(options: CanvasExportOptions): Promise<Blob> {
  const { canvas, dpi = 300, filename = 'price-tag.pdf' } = options;
  
  // 获取画布尺寸（转换为毫米）
  const canvasWidth = canvas.width;
  const canvasHeight = canvas.height;
  
  // 转换为毫米 (1 inch = 25.4mm, 96 DPI)
  const widthMM = (canvasWidth / 96) * 25.4;
  const heightMM = (canvasHeight / 96) * 25.4;
  
  // 创建 PDF
  const pdf = new jsPDF({
    orientation: widthMM > heightMM ? 'landscape' : 'portrait',
    unit: 'mm',
    format: [widthMM, heightMM],
  });
  
  // 获取画布数据 URL
  const dataURL = canvas.toDataURL('image/png', 1);
  
  // 添加图片到 PDF
  pdf.addImage(dataURL, 'PNG', 0, 0, widthMM, heightMM);
  
  // 生成 Blob
  const pdfBlob = pdf.output('blob');
  return pdfBlob;
}

// 从 HTML 元素导出图片
export async function exportElementAsImage(
  element: HTMLElement, 
  options: ExportOptions
): Promise<Blob> {
  const { format = 'png', quality = 1, dpi = 300 } = options;
  
  const canvas = await html2canvas(element, {
    scale: dpi / 96,
    useCORS: true,
    allowTaint: true,
    backgroundColor: '#ffffff',
  });
  
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
      } else {
        reject(new Error('Failed to create blob'));
      }
    }, `image/${format}`, quality);
  });
}

// 下载文件
export function downloadFile(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// 批量导出多个画布
export async function exportMultipleCanvases(
  canvases: HTMLCanvasElement[],
  options: ExportOptions
): Promise<Blob[]> {
  const exportPromises = canvases.map(canvas => {
    if (options.format === 'pdf') {
      return exportCanvasAsPDF({ ...options, canvas });
    } else {
      return exportCanvasAsImage({ ...options, canvas });
    }
  });
  
  return Promise.all(exportPromises);
}

// 生成文件名
export function generateFilename(
  productName: string, 
  format: string, 
  timestamp?: Date
): string {
  const date = timestamp || new Date();
  const dateStr = date.toISOString().split('T')[0];
  const timeStr = date.toTimeString().split(' ')[0].replace(/:/g, '-');
  
  const safeProductName = productName
    .replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '_')
    .substring(0, 20);
  
  return `${safeProductName}_${dateStr}_${timeStr}.${format}`;
}

// 导出工具类
export class ExportManager {
  private canvas: HTMLCanvasElement | null = null;
  
  setCanvas(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    console.log('Canvas set:', canvas.width, 'x', canvas.height);
  }
  
  // 强制渲染画布内容（用于导出前确保内容存在）
  forceRender() {
    if (!this.canvas) return false;
    
    const ctx = this.canvas.getContext('2d');
    if (!ctx) return false;
    
    // 检查画布是否有内容
    const imageData = ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    const hasContent = imageData.data.some(pixel => pixel !== 0);
    
    console.log('Canvas content check:', {
      hasContent,
      canvasSize: { width: this.canvas.width, height: this.canvas.height },
      imageDataSize: imageData.data.length
    });
    
    return hasContent;
  }
  
  async export(options: ExportOptions & { productName?: string }): Promise<void> {
    if (!this.canvas) {
      throw new Error('Canvas not set');
    }
    
    console.log('Starting export:', options);
    console.log('Canvas dimensions:', this.canvas.width, 'x', this.canvas.height);
    
    // 检查画布内容
    const hasContent = this.forceRender();
    if (!hasContent) {
      console.warn('Canvas appears to be empty, proceeding anyway...');
    }
    
    const { productName = 'price-tag', format, ...exportOptions } = options;
    const filename = generateFilename(productName, format);
    
    let blob: Blob;
    
    try {
      if (format === 'pdf') {
        blob = await exportCanvasAsPDF({ ...exportOptions, canvas: this.canvas, format });
      } else {
        blob = await exportCanvasAsImage({ ...exportOptions, canvas: this.canvas, format });
      }
      
      console.log('Export successful, blob size:', blob.size);
      downloadFile(blob, filename);
    } catch (error) {
      console.error('Export failed:', error);
      throw error;
    }
  }
  
  async exportHighQuality(options: Omit<ExportOptions, 'quality' | 'dpi'> & { productName?: string }): Promise<void> {
    return this.export({
      ...options,
      quality: 1,
      dpi: 300,
    });
  }
  
  async exportForPrint(options: Omit<ExportOptions, 'quality' | 'dpi'> & { productName?: string }): Promise<void> {
    return this.export({
      ...options,
      quality: 1,
      dpi: 300,
    });
  }
}