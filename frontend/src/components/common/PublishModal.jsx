import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

// Field configurations for each listing type
const listingFieldsConfig = {
  'second-hand': [
    { name: 'title', label: '商品标题', type: 'text', required: true, placeholder: '请输入商品标题' },
    { name: 'price', label: '价格 (元)', type: 'number', required: true, placeholder: '请输入价格' },
    { name: 'condition', label: '商品成色', type: 'text', required: false, placeholder: '如: 全新、九成新等', helperText: '如: 全新、九成新等' },
    { name: 'description', label: '商品描述', type: 'textarea', required: true, rows: 3, placeholder: '请详细描述商品信息' },
    {
      name: 'status',
      label: '状态',
      type: 'select',
      required: true,
      options: [
        { value: 'AVAILABLE', label: '可交易' },
        { value: 'RESERVED', label: '已预订' },
        { value: 'SOLD', label: '已售出' },
        { value: 'REMOVED', label: '已下架' },
      ],
    },
  ],
  'creative': [
    { name: 'title', label: '商品标题', type: 'text', required: true, placeholder: '请输入商品标题' },
    { name: 'price', label: '价格 (元)', type: 'number', required: true, placeholder: '请输入价格' },
    { name: 'stock', label: '库存数量', type: 'number', required: false, placeholder: '商品库存', helperText: '商品库存' },
    { name: 'description', label: '商品描述', type: 'textarea', required: true, rows: 3, placeholder: '请详细描述商品信息' },
    {
      name: 'status',
      label: '状态',
      type: 'select',
      required: true,
      options: [
        { value: 'AVAILABLE', label: '可交易' },
        { value: 'RESERVED', label: '已预订' },
        { value: 'SOLD', label: '已售出' },
        { value: 'REMOVED', label: '已下架' },
      ],
    },
  ],
  'delivery': [
    { name: 'pickup_location', label: '取餐地点', type: 'text', required: true, placeholder: '如: 东区食堂' },
    { name: 'delivery_address', label: '配送地址', type: 'text', required: true, placeholder: '请输入配送地址' },
    { name: 'reward', label: '跑腿费 (元)', type: 'number', required: true, placeholder: '请输入跑腿费' },
    { name: 'description', label: '备注说明', type: 'textarea', required: false, rows: 3, placeholder: '如: 需要保温、加急等' },
    {
      name: 'status',
      label: '状态',
      type: 'select',
      required: true,
      options: [
        { value: 'AVAILABLE', label: '待接单' },
        { value: 'RESERVED', label: '已接单' },
        { value: 'SOLD', label: '已完成' },
        { value: 'REMOVED', label: '已取消' },
      ],
    },
  ],
  'lost-found': [
    { name: 'item_name', label: '物品名称', type: 'text', required: true, placeholder: '请输入物品名称' },
    { name: 'location', label: '捡到地点', type: 'text', required: true, placeholder: '请输入捡到地点' },
    { name: 'time_found', label: '捡到时间', type: 'text', required: false, placeholder: '如: 2026-02-10 14:00', helperText: '如: 2026-02-10 14:00' },
    { name: 'description', label: '详细描述', type: 'textarea', required: true, rows: 3, placeholder: '请详细描述物品特征' },
    {
      name: 'status',
      label: '状态',
      type: 'select',
      required: true,
      options: [
        { value: 'AVAILABLE', label: '招领中' },
        { value: 'SOLD', label: '已认领' },
        { value: 'REMOVED', label: '已归档' },
      ],
    },
  ],
  'part-time': [
    { name: 'title', label: '职位名称', type: 'text', required: true, placeholder: '请输入职位名称' },
    { name: 'salary', label: '薪资待遇', type: 'text', required: true, placeholder: '如: 120元/小时', helperText: '如: 120元/小时' },
    { name: 'location', label: '工作地点', type: 'text', required: false, placeholder: '如: 线上/校园内', helperText: '如: 线上/校园内' },
    { name: 'requirements', label: '职位要求', type: 'textarea', required: true, rows: 3, placeholder: '请详细描述职位要求' },
    {
      name: 'status',
      label: '状态',
      type: 'select',
      required: true,
      options: [
        { value: 'AVAILABLE', label: '招聘中' },
        { value: 'RESERVED', label: '暂停招聘' },
        { value: 'SOLD', label: '已结束' },
        { value: 'REMOVED', label: '已下架' },
      ],
    },
  ],
};

// Category options
const categoryOptions = [
  { value: 'second-hand', label: '二手交易' },
  { value: 'creative', label: '文创交易' },
  { value: 'delivery', label: '外卖代取' },
  { value: 'lost-found', label: '失物招领' },
  { value: 'part-time', label: '兼职平台' },
];

const PublishModal = ({ isOpen, onClose, onSubmit, defaultType = 'second-hand' }) => {
  const [publishType, setPublishType] = useState(defaultType);
  const [formData, setFormData] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  console.log('PublishModal render:', { isOpen, defaultType, publishType });

  // Reset form when modal opens
  useEffect(() => {
    console.log('PublishModal useEffect:', { isOpen, defaultType });
    if (isOpen) {
      setPublishType(defaultType);
      setFormData({});
      setErrors({});
    }
  }, [isOpen, defaultType]);

  // Reset form data when type changes
  useEffect(() => {
    if (isOpen) {
      setFormData({});
      setErrors({});
    }
  }, [publishType, isOpen]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    // Convert number inputs to actual numbers
    const processedValue = type === 'number' ? (value === '' ? null : Number(value)) : value;

    setFormData(prev => ({
      ...prev,
      [name]: processedValue,
    }));

    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null,
      }));
    }
  };

  const validateForm = () => {
    const fields = listingFieldsConfig[publishType] || listingFieldsConfig['second-hand'];
    const newErrors = {};

    fields.forEach(field => {
      if (field.required && (!formData[field.name] || formData[field.name].toString().trim() === '')) {
        newErrors[field.name] = `${field.label}不能为空`;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({ ...formData, type: publishType, status: formData.status || 'AVAILABLE' });
      setFormData({});
      setErrors({});
    } catch (error) {
      console.error('Publish failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentFields = listingFieldsConfig[publishType] || listingFieldsConfig['second-hand'];

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">发布信息</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Type Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              信息类型 <span className="text-error">*</span>
            </label>
            <select
              value={publishType}
              onChange={(e) => setPublishType(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              {categoryOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Dynamic Fields */}
          {currentFields.map((field) => (
            <div key={field.name}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {field.label}
                {field.required && <span className="text-error ml-1">*</span>}
              </label>

              {field.type === 'textarea' ? (
                <textarea
                  name={field.name}
                  value={formData[field.name] || ''}
                  onChange={handleChange}
                  rows={field.rows || 3}
                  placeholder={field.placeholder}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none ${
                    errors[field.name] ? 'border-error' : 'border-gray-200'
                  }`}
                />
              ) : field.type === 'select' ? (
                <select
                  name={field.name}
                  value={formData[field.name] ?? field.options[0].value}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 ${
                    errors[field.name] ? 'border-error' : 'border-gray-200'
                  }`}
                >
                  {field.options.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type={field.type || 'text'}
                  name={field.name}
                  value={formData[field.name] || ''}
                  onChange={handleChange}
                  placeholder={field.placeholder}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 ${
                    errors[field.name] ? 'border-error' : 'border-gray-200'
                  }`}
                />
              )}

              {field.helperText && !errors[field.name] && (
                <p className="text-sm text-gray-500 mt-1">{field.helperText}</p>
              )}

              {errors[field.name] && (
                <p className="text-sm text-error mt-1">{errors[field.name]}</p>
              )}
            </div>
          ))}

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
            >
              {isSubmitting ? '发布中...' : '发布'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default PublishModal;
