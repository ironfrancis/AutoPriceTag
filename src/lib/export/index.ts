import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
// import { fabric } from 'fabric'; // 移除静态导入

export interface ExportOptions {
  format: 'png' | 'jpg' | 'pdf';
  quality?: number;
  dpi?: number;
  filename?: string;
}

export interface CanvasExportOptions extends ExportOptions {
  canvas: any; // fabric.Canvas
}

// 从 Fabric.js 画布导出图片
export async function exportCanvasAsImage(options: CanvasExportOptions): Promise<Blob> {
  const { canvas, format = 'png', quality = 1, dpi = 300 } = options;
  
  // 设置画布导出参数
  const multiplier = dpi / 96; // 96 DPI 是标准屏幕 DPI
  
  // 获取画布数据 URL
  const dataURL = canvas.toDataURL({
    format: format === 'jpg' ? 'jpeg' : format,
    quality: quality,
    multiplier: multiplier,
  });

  // 转换为 Blob
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to create blob'));
        }
      }, `image/${format}`, quality);
    };
    
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = dataURL;
  });
}

// 从 Fabric.js 画布导出 PDF
export async function exportCanvasAsPDF(options: CanvasExportOptions): Promise<Blob> {
  const { canvas, dpi = 300, filename = 'price-tag.pdf' } = options;
  
  // 获取画布尺寸（转换为毫米）
  const canvasWidth = canvas.getWidth();
  const canvasHeight = canvas.getHeight();
  
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
  const dataURL = canvas.toDataURL({
    format: 'png',
    quality: 1,
    multiplier: dpi / 96,
  });
  
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
  canvases: any[], // fabric.Canvas[]
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
  private canvas: any | null = null; // fabric.Canvas
  
  setCanvas(canvas: any) { // fabric.Canvas
    this.canvas = canvas;
  }
  
  async export(options: ExportOptions & { productName?: string }): Promise<void> {
    if (!this.canvas) {
      throw new Error('Canvas not set');
    }
    
    const { productName = 'price-tag', format, ...exportOptions } = options;
    const filename = generateFilename(productName, format);
    
    let blob: Blob;
    
    if (format === 'pdf') {
      blob = await exportCanvasAsPDF({ ...exportOptions, canvas: this.canvas, format });
    } else {
      blob = await exportCanvasAsImage({ ...exportOptions, canvas: this.canvas, format });
    }
    
    downloadFile(blob, filename);
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
