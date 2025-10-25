'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { ProductData } from '@/lib/types';

interface ProductFormProps {
  initialData?: Partial<ProductData>;
  onChange: (data: ProductData) => void;
  className?: string;
}

export default function ProductForm({ 
  initialData = {}, 
  onChange, 
  className = '' 
}: ProductFormProps) {
  const [formData, setFormData] = useState<ProductData>({
    name: '',
    price: 0,
    brand: '',
    sellingPoints: [''],
    specs: {},
    customFields: {},
    ...initialData,
  });

  const [customFields, setCustomFields] = useState<Array<{key: string, value: string}>>([]);

  useEffect(() => {
    onChange(formData);
  }, [formData, onChange]);

  const handleInputChange = (field: keyof ProductData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSellingPointChange = (index: number, value: string) => {
    const newSellingPoints = [...formData.sellingPoints];
    newSellingPoints[index] = value;
    setFormData(prev => ({
      ...prev,
      sellingPoints: newSellingPoints
    }));
  };

  const addSellingPoint = () => {
    setFormData(prev => ({
      ...prev,
      sellingPoints: [...prev.sellingPoints, '']
    }));
  };

  const removeSellingPoint = (index: number) => {
    if (formData.sellingPoints.length > 1) {
      const newSellingPoints = formData.sellingPoints.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        sellingPoints: newSellingPoints
      }));
    }
  };

  const handleSpecChange = (key: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      specs: {
        ...prev.specs,
        [key]: value
      }
    }));
  };

  const addSpec = () => {
    const key = `规格${Object.keys(formData.specs).length + 1}`;
    setFormData(prev => ({
      ...prev,
      specs: {
        ...prev.specs,
        [key]: ''
      }
    }));
  };

  const removeSpec = (key: string) => {
    const newSpecs = { ...formData.specs };
    delete newSpecs[key];
    setFormData(prev => ({
      ...prev,
      specs: newSpecs
    }));
  };

  const addCustomField = () => {
    setCustomFields(prev => [...prev, { key: '', value: '' }]);
  };

  const updateCustomField = (index: number, field: 'key' | 'value', value: string) => {
    const newFields = [...customFields];
    newFields[index][field] = value;
    setCustomFields(newFields);
    
    // 更新到 formData
    const customFieldsObj: Record<string, any> = {};
    newFields.forEach(field => {
      if (field.key && field.value) {
        customFieldsObj[field.key] = field.value;
      }
    });
    
    setFormData(prev => ({
      ...prev,
      customFields: customFieldsObj
    }));
  };

  const removeCustomField = (index: number) => {
    const newFields = customFields.filter((_, i) => i !== index);
    setCustomFields(newFields);
    
    const customFieldsObj: Record<string, any> = {};
    newFields.forEach(field => {
      if (field.key && field.value) {
        customFieldsObj[field.key] = field.value;
      }
    });
    
    setFormData(prev => ({
      ...prev,
      customFields: customFieldsObj
    }));
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center space-x-2">
        <h3 className="text-lg font-semibold text-gray-900">商品信息</h3>
      </div>

      {/* 商品名称 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          商品名称 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => handleInputChange('name', e.target.value)}
          className="input w-full"
          placeholder="请输入商品名称"
          required
        />
      </div>

      {/* 商品价格 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          商品价格 <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">¥</span>
          <input
            type="number"
            step="0.01"
            min="0"
            value={formData.price || ''}
            onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
            className="input w-full pl-8"
            placeholder="0.00"
            required
          />
        </div>
      </div>

      {/* 品牌 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">品牌</label>
        <input
          type="text"
          value={formData.brand || ''}
          onChange={(e) => handleInputChange('brand', e.target.value)}
          className="input w-full"
          placeholder="请输入品牌名称"
        />
      </div>

      {/* 卖点说明 */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-gray-700">卖点说明</label>
          <button
            onClick={addSellingPoint}
            className="text-blue-600 hover:text-blue-700 flex items-center space-x-1"
          >
            <Plus className="h-4 w-4" />
            <span className="text-sm">添加</span>
          </button>
        </div>
        {formData.sellingPoints.map((point, index) => (
          <div key={index} className="flex items-center space-x-2 mb-2">
            <input
              type="text"
              value={point}
              onChange={(e) => handleSellingPointChange(index, e.target.value)}
              className="input flex-1"
              placeholder={`卖点 ${index + 1}`}
            />
            {formData.sellingPoints.length > 1 && (
              <button
                onClick={() => removeSellingPoint(index)}
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        ))}
      </div>

      {/* 规格参数 */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-gray-700">规格参数</label>
          <button
            onClick={addSpec}
            className="text-blue-600 hover:text-blue-700 flex items-center space-x-1"
          >
            <Plus className="h-4 w-4" />
            <span className="text-sm">添加</span>
          </button>
        </div>
        {Object.entries(formData.specs).map(([key, value], index) => (
          <div key={key} className="flex items-center space-x-2 mb-2">
            <input
              type="text"
              value={key}
              onChange={(e) => {
                const newSpecs = { ...formData.specs };
                delete newSpecs[key];
                newSpecs[e.target.value] = value;
                setFormData(prev => ({ ...prev, specs: newSpecs }));
              }}
              className="input w-20 text-sm"
              placeholder="规格名"
            />
            <span className="text-gray-500">:</span>
            <input
              type="text"
              value={value}
              onChange={(e) => handleSpecChange(key, e.target.value)}
              className="input flex-1"
              placeholder="规格值"
            />
            <button
              onClick={() => removeSpec(key)}
              className="text-red-500 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      {/* 自定义字段 */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-gray-700">自定义字段</label>
          <button
            onClick={addCustomField}
            className="text-blue-600 hover:text-blue-700 flex items-center space-x-1"
          >
            <Plus className="h-4 w-4" />
            <span className="text-sm">添加</span>
          </button>
        </div>
        {customFields.map((field, index) => (
          <div key={index} className="flex items-center space-x-2 mb-2">
            <input
              type="text"
              value={field.key}
              onChange={(e) => updateCustomField(index, 'key', e.target.value)}
              className="input w-20 text-sm"
              placeholder="字段名"
            />
            <span className="text-gray-500">:</span>
            <input
              type="text"
              value={field.value}
              onChange={(e) => updateCustomField(index, 'value', e.target.value)}
              className="input flex-1"
              placeholder="字段值"
            />
            <button
              onClick={() => removeCustomField(index)}
              className="text-red-500 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}