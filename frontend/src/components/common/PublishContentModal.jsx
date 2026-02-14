import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

// Field configurations for each content type
const publishFieldsConfig = {
  activity: [
    { name: 'title', label: '活动标题', type: 'text', required: true, placeholder: '请输入活动标题' },
    { name: 'description', label: '活动描述', type: 'textarea', required: true, rows: 3, placeholder: '请详细描述活动内容' },
    {
      name: 'type',
      label: '活动类型',
      type: 'select',
      required: true,
      options: [
        { value: 'sports', label: '体育活动' },
        { value: 'academic', label: '学术讲座' },
        { value: 'general', label: '综合活动' },
        { value: 'culture', label: '文化活动' },
        { value: 'volunteer', label: '志愿活动' },
      ],
    },
    { name: 'location', label: '活动地点', type: 'text', required: false, placeholder: '如: 图书馆报告厅' },
    { name: 'event_time', label: '活动时间', type: 'text', required: false, placeholder: '如: 2026-02-15 14:00' },
    { name: 'max_participants', label: '最大参与人数', type: 'number', required: false, placeholder: '留空表示不限制', helperText: '留空表示不限制' },
  ],
  material: [
    { name: 'title', label: '资料标题', type: 'text', required: true, placeholder: '请输入资料标题' },
    { name: 'description', label: '资料描述', type: 'textarea', required: true, rows: 3, placeholder: '请详细描述资料内容' },
    {
      name: 'type',
      label: '文件类型',
      type: 'select',
      required: false,
      options: [
        { value: 'PDF', label: 'PDF' },
        { value: 'ZIP', label: 'ZIP' },
        { value: 'DOC', label: 'Word文档' },
        { value: 'PPT', label: 'PPT演示文稿' },
        { value: 'OTHER', label: '其他' },
      ],
    },
    { name: 'category', label: '分类', type: 'text', required: false, placeholder: '如: 考研资料' },
    { name: 'tags', label: '标签', type: 'text', required: false, placeholder: '多个标签用逗号分隔', helperText: '多个标签用逗号分隔' },
    { name: 'file_url', label: '文件链接', type: 'text', required: false, placeholder: '文件的URL地址', helperText: '文件的URL地址' },
  ],
  tip: [
    { name: 'title', label: '贴士标题', type: 'text', required: true, placeholder: '请输入贴士标题' },
    { name: 'content', label: '贴士内容', type: 'textarea', required: true, rows: 4, placeholder: '请详细描述贴士内容' },
    {
      name: 'category',
      label: '分类',
      type: 'select',
      required: true,
      options: [
        { value: 'study', label: '学习指南' },
        { value: 'life', label: '生活贴士' },
        { value: 'course', label: '选课攻略' },
        { value: 'facility', label: '设施使用' },
        { value: 'activity', label: '活动指南' },
        { value: 'other', label: '其他' },
      ],
    },
  ],
};

const PublishContentModal = ({ isOpen, onClose, onSubmit, contentType = 'activity' }) => {
  const [formData, setFormData] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // Reset form when modal opens or content type changes
  useEffect(() => {
    if (isOpen) {
      setFormData({});
      setErrors({});
    }
  }, [isOpen, contentType]);

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
    const fields = publishFieldsConfig[contentType] || [];
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
      await onSubmit(formData);
      setFormData({});
      setErrors({});
    } catch (error) {
      console.error('Publish failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentFields = publishFieldsConfig[contentType] || [];
  const titleMap = {
    activity: '发布活动',
    material: '发布资料',
    tip: '发布贴士',
  };

  if (!isOpen) return null;

  return (
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
          <h2 className="text-xl font-semibold text-gray-800">{titleMap[contentType]}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
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
                  value={formData[field.name] || ''}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 ${
                    errors[field.name] ? 'border-error' : 'border-gray-200'
                  }`}
                >
                  <option value="">请选择...</option>
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
    </div>
  );
};

export default PublishContentModal;
