'use client';

import { ProductData } from '@/lib/types';
import { TemplateConfig } from './TemplateConfig';
import { FontConfig } from './FontCustomizer';
import { calculateSimpleLayout, SimpleLayoutResult } from '@/lib/layout/simpleLayout';

/**
 * 模板渲染引擎
 * 根据不同的模板配置渲染出不同风格的标签
 */
export class TemplateRenderer {
  private template: TemplateConfig;
  private labelSize: { width: number; height: number };
  private productData: ProductData;
  private fontConfigs?: Record<string, FontConfig>;

  constructor(
    template: TemplateConfig,
    labelSize: { width: number; height: number },
    productData: ProductData,
    fontConfigs?: Record<string, FontConfig>
  ) {
    this.template = template;
    this.labelSize = labelSize;
    this.productData = productData;
    this.fontConfigs = fontConfigs;
  }

  /**
   * 渲染布局
   */
  render(): SimpleLayoutResult {
    const { layoutParams } = this.template;
    
    // 使用模板配置的布局参数
    const result = calculateSimpleLayout(
      this.labelSize.width,
      this.labelSize.height,
      this.productData,
      {
        padding: layoutParams.padding || 4,
        elementSpacing: layoutParams.elementSpacing || 2,
        minFontSize: 8,
        maxFontSize: 28,
        lineHeight: layoutParams.lineHeight || 1.4,
        textAreaRatio: layoutParams.textAreaRatio || 0.65
      },
      layoutParams.textAreaRatio || 0.65
    );

    return result;
  }

  /**
   * 应用模板字体配置
   */
  applyFontConfigs(): Record<string, FontConfig> {
    if (!this.template.fontConfigs) {
      return this.fontConfigs || {};
    }

    const result: Record<string, FontConfig> = {};

    // 应用模板配置
    Object.entries(this.template.fontConfigs).forEach(([key, templateFont]) => {
      result[key] = {
        fontSize: templateFont.fontSize || 16,
        fontWeight: templateFont.fontWeight || 400,
        fontStyle: templateFont.fontStyle || 'normal',
        textAlign: templateFont.textAlign || 'left',
        color: templateFont.color || '#111827',
        fontFamily: templateFont.fontFamily || 'system-ui, -apple-system, sans-serif'
      };
    });

    // 合并用户自定义配置
    if (this.fontConfigs) {
      Object.assign(result, this.fontConfigs);
    }

    return result;
  }

  /**
   * 获取合并后的字体配置
   */
  getMergedFontConfigs(): Record<string, FontConfig> {
    return this.applyFontConfigs();
  }

  /**
   * 静态方法：渲染模板
   */
  static renderTemplate(
    template: TemplateConfig,
    labelSize: { width: number; height: number },
    productData: ProductData,
    fontConfigs?: Record<string, FontConfig>
  ): SimpleLayoutResult {
    const renderer = new TemplateRenderer(template, labelSize, productData, fontConfigs);
    return renderer.render();
  }

  /**
   * 静态方法：获取合并后的字体配置
   */
  static getMergedFontConfigs(
    template: TemplateConfig,
    fontConfigs?: Record<string, FontConfig>
  ): Record<string, FontConfig> {
    const renderer = new TemplateRenderer(
      template,
      { width: 100, height: 100 }, // 临时尺寸
      {} as ProductData,
      fontConfigs
    );
    return renderer.applyFontConfigs();
  }
}

