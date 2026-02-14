import { Edit, Trash2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const AdminActions = ({ onEdit, onDelete, type = '' }) => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'admin';

  if (!isAdmin) return null;

  return (
    <div className="flex items-center space-x-2 mt-3 pt-3 border-t border-gray-100">
      <button
        onClick={onEdit}
        className="flex items-center space-x-1 px-3 py-1.5 text-sm text-primary hover:bg-primary-lighter rounded-lg transition-colors"
        title="编辑"
      >
        <Edit className="w-4 h-4" />
        <span>编辑</span>
      </button>
      <button
        onClick={onDelete}
        className="flex items-center space-x-1 px-3 py-1.5 text-sm text-error hover:bg-error/10 rounded-lg transition-colors"
        title="删除"
      >
        <Trash2 className="w-4 h-4" />
        <span>删除</span>
      </button>
    </div>
  );
};

export default AdminActions;
