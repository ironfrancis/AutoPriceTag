'use client';

import React, { useState } from 'react';
import { X, Download, Palette, Type, Image as ImageIcon, Copy, Trash2 } from 'lucide-react';

type Element = {
  id: string;
  type: 'text' | 'image' | 'price';
  content: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize?: number;
  fontFamily?: string;
  color?: string;
  fontWeight?: string;
  textAlign?: 'left' | 'center' | 'right';
};

const DesignerPage = () => {
  const [elements, setElements] = useState<Element[]>([
    {
      id: '1',
      type: 'text',
      content: '商品名称',
      x: 50,
      y: 50,
      width: 200,
      height: 40,
      fontSize: 16,
      fontFamily: 'Arial',
      color: '#000',
      fontWeight: 'bold',
      textAlign: 'left',
    },
    {
      id: '2',
      type: 'text',
      content: '商品规格',
      x: 50,
      y: 100,
      width: 200,
      height: 30,
      fontSize: 12,
      fontFamily: 'Arial',
      color: '#666',
      fontWeight: 'normal',
      textAlign: 'left',
    },
    {
      id: '3',
      type: 'price',
      content: '¥99.00',
      x: 50,
      y: 140,
      width: 200,
      height: 40,
      fontSize: 24,
      fontFamily: 'Arial',
      color: '#e53e3e',
      fontWeight: 'bold',
      textAlign: 'left',
    },
  ]);
  
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 300, height: 200 });
  const [showExportModal, setShowExportModal] = useState(false);

  const selectedElement = elements.find(el => el.id === selectedElementId);

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setSelectedElementId(null);
    }
  };

  const handleElementClick = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedElementId(id);
  };

  const updateSelectedElement = (updates: Partial<Element>) => {
    if (!selectedElementId) return;
    
    setElements(elements.map(el => 
      el.id === selectedElementId ? { ...el, ...updates } : el
    ));
  };

  const addElement = (type: 'text' | 'image' | 'price') => {
    const newElement: Element = {
      id: Date.now().toString(),
      type,
      content: type === 'text' ? '新文本' : type === 'price' ? '¥0.00' : '图片',
      x: 100,
      y: 100,
      width: type === 'image' ? 80 : 120,
      height: type === 'image' ? 80 : 30,
      fontSize: 14,
      fontFamily: 'Arial',
      color: '#000',
      fontWeight: 'normal',
      textAlign: 'left',
    };
    
    setElements([...elements, newElement]);
    setSelectedElementId(newElement.id);
  };

  const duplicateElement = () => {
    if (!selectedElement) return;
    
    const duplicatedElement = {
      ...selectedElement,
      id: Date.now().toString(),
      x: selectedElement.x + 20,
      y: selectedElement.y + 20,
    };
    
    setElements([...elements, duplicatedElement]);
    setSelectedElementId(duplicatedElement.id);
  };

  const deleteElement = () => {
    if (!selectedElementId) return;
    
    setElements(elements.filter(el => el.id !== selectedElementId));
    setSelectedElementId(null);
  };

  const exportDesign = (format: 'png' | 'pdf') => {
    alert(`导出为 ${format.toUpperCase()} 格式`);
    setShowExportModal(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50">
      {/* 导航栏 */}
      <nav className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <a href="/" className="flex items-center space-x-3">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-orange-500 flex items-center justify-center">
                <span className="text-white font-bold text-sm">APT</span>
              </div>
              <span className="text-xl font-semibold text-gray-900">AutoPriceTag 设计器</span>
            </a>
            
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => setShowExportModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center"
              >
                <Download className="mr-2 h-4 w-4" />
                导出设计
              </button>
              <a 
                href="/"
                className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors flex items-center"
              >
                <X className="mr-1 h-4 w-4" />
                退出
              </a>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex flex-col lg:flex-row h-[calc(100vh-4rem)]">
        {/* 左侧工具栏 */}
        <div className="w-full lg:w-64 bg-white p-4 border-r border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <Palette className="mr-2 h-5 w-5" />
            组件库
          </h2>
          
          <div className="space-y-2">
            <button
              onClick={() => addElement('text')}
              className="w-full flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Type className="mr-2 h-5 w-5 text-gray-600" />
              <span>文本</span>
            </button>
            
            <button
              onClick={() => addElement('price')}
              className="w-full flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Type className="mr-2 h-5 w-5 text-red-500" />
              <span>价格</span>
            </button>
            
            <button
              onClick={() => addElement('image')}
              className="w-full flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <ImageIcon className="mr-2 h-5 w-5 text-gray-600" />
              <span>图片</span>
            </button>
          </div>

          <div className="mt-8">
            <h3 className="text-md font-medium text-gray-800 mb-3">画布尺寸</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-600 mb-1">宽度 (mm)</label>
                <input
                  type="number"
                  value={canvasSize.width}
                  onChange={(e) => setCanvasSize({...canvasSize, width: Number(e.target.value)})}
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">高度 (mm)</label>
                <input
                  type="number"
                  value={canvasSize.height}
                  onChange={(e) => setCanvasSize({...canvasSize, height: Number(e.target.value)})}
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>
            </div>
          </div>

          {selectedElement && (
            <div className="mt-8">
              <h3 className="text-md font-medium text-gray-800 mb-3">属性设置</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">内容</label>
                  <input
                    type="text"
                    value={selectedElement.content}
                    onChange={(e) => updateSelectedElement({ content: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                </div>
                
                {selectedElement.type !== 'image' && (
                  <>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">字体大小</label>
                      <input
                        type="number"
                        value={selectedElement.fontSize}
                        onChange={(e) => updateSelectedElement({ fontSize: Number(e.target.value) })}
                        className="w-full p-2 border border-gray-300 rounded"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">颜色</label>
                      <input
                        type="color"
                        value={selectedElement.color}
                        onChange={(e) => updateSelectedElement({ color: e.target.value })}
                        className="w-full h-10 border border-gray-300 rounded"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">对齐方式</label>
                      <select
                        value={selectedElement.textAlign}
                        onChange={(e) => updateSelectedElement({ textAlign: e.target.value as any })}
                        className="w-full p-2 border border-gray-300 rounded"
                      >
                        <option value="left">左对齐</option>
                        <option value="center">居中</option>
                        <option value="right">右对齐</option>
                      </select>
                    </div>
                  </>
                )}
                
                <div className="flex space-x-2 pt-2">
                  <button
                    onClick={duplicateElement}
                    className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300 transition-colors flex items-center justify-center"
                  >
                    <Copy className="mr-1 h-4 w-4" />
                    复制
                  </button>
                  <button
                    onClick={deleteElement}
                    className="flex-1 bg-red-100 text-red-700 py-2 rounded-lg hover:bg-red-200 transition-colors flex items-center justify-center"
                  >
                    <Trash2 className="mr-1 h-4 w-4" />
                    删除
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 主画布区域 */}
        <div className="flex-1 p-6 overflow-auto">
          <div className="flex justify-center">
            <div 
              className="relative bg-white border border-gray-300 shadow-lg"
              style={{ 
                width: `${canvasSize.width * 3.78}px`, // Convert mm to px (assuming 96 DPI)
                height: `${canvasSize.height * 3.78}px`,
                minWidth: '200px',
                minHeight: '150px'
              }}
              onClick={handleCanvasClick}
            >
              {elements.map((element) => (
                <div
                  key={element.id}
                  className={`absolute border ${selectedElementId === element.id ? 'border-blue-500 ring-2 ring-blue-200' : 'border-transparent'} cursor-move`}
                  style={{
                    left: `${element.x}px`,
                    top: `${element.y}px`,
                    width: `${element.width}px`,
                    height: `${element.height}px`,
                    fontSize: `${element.fontSize}px`,
                    fontFamily: element.fontFamily,
                    color: element.color,
                    fontWeight: element.fontWeight,
                    textAlign: element.textAlign,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: element.textAlign === 'center' ? 'center' : 
                                  element.textAlign === 'right' ? 'flex-end' : 'flex-start',
                    padding: '4px',
                    boxSizing: 'border-box',
                  }}
                  onClick={(e) => handleElementClick(element.id, e)}
                >
                  {element.type === 'image' ? (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center border border-dashed border-gray-400">
                      <ImageIcon className="h-6 w-6 text-gray-500" />
                    </div>
                  ) : (
                    element.content
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 导出模态框 */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">导出设计</h3>
            <div className="space-y-3">
              <button
                onClick={() => exportDesign('png')}
                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                导出 PNG
              </button>
              <button
                onClick={() => exportDesign('pdf')}
                className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                导出 PDF
              </button>
            </div>
            <button
              onClick={() => setShowExportModal(false)}
              className="mt-4 w-full bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300 transition-colors"
            >
              取消
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DesignerPage;