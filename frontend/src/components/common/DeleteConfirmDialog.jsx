import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';

const DeleteConfirmDialog = ({ isOpen, onClose, onConfirm, title = '确认删除', itemName = '' }) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirm = async () => {
    setIsDeleting(true);
    try {
      await onConfirm();
      onClose();
    } catch (error) {
      console.error('Delete failed:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full p-6">
        {/* Icon */}
        <div className="w-12 h-12 bg-error/10 rounded-full flex items-center justify-center mb-4">
          <AlertTriangle className="w-6 h-6 text-error" />
        </div>

        {/* Title */}
        <h3 className="text-xl font-semibold text-gray-800 mb-2">
          {title}
        </h3>

        {/* Message */}
        <p className="text-gray-600 mb-6">
          {itemName ? `确定要删除"${itemName}"吗？` : '此操作无法撤销，确定要继续吗？'}
        </p>

        {/* Buttons */}
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            取消
          </button>
          <button
            onClick={handleConfirm}
            disabled={isDeleting}
            className="px-4 py-2 bg-error text-white rounded-lg hover:bg-error/90 transition-colors disabled:opacity-50 flex items-center"
          >
            {isDeleting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                删除中...
              </>
            ) : (
              '确认删除'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmDialog;
