import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  User,
  MapPin,
  Mail,
  Settings,
  Bell,
  FileText,
  ShoppingCart,
  MessageSquare,
  Calendar,
} from 'lucide-react';

const Profile = () => {
  const { user, logout, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    nickname: user?.nickname || '',
    email: user?.email || '',
    school: user?.school || '',
  });

  const handleSave = async () => {
    const result = await updateUser(editForm);
    if (result.success) {
      setIsEditing(false);
    } else {
      alert('更新失败：' + result.error);
    }
  };

  const menuItems = [
    {
      icon: FileText,
      label: '我的发布',
      description: '查看我发布的内容',
      link: '/profile/posts',
    },
    {
      icon: ShoppingCart,
      label: '我的订单',
      description: '查看交易订单',
      link: '/profile/orders',
    },
    {
      icon: MessageSquare,
      label: '我的消息',
      description: '查看聊天和通知',
      link: '/profile/messages',
    },
    {
      icon: Calendar,
      label: '我的预约',
      description: '查看场馆预约',
      link: '/profile/bookings',
    },
    {
      icon: Bell,
      label: '通知设置',
      description: '管理通知偏好',
      link: '/profile/notifications',
    },
    {
      icon: Settings,
      label: '账号设置',
      description: '修改密码等信息',
      link: '/profile/settings',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-14">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
          {/* Cover */}
          <div className="h-32 bg-gradient-to-r from-primary via-primary-light to-primary-lighter" />

          <div className="px-6 pb-6">
            {/* Avatar */}
            <div className="relative -mt-16 mb-4">
              <div className="w-32 h-32 bg-white rounded-full border-4 border-white shadow-lg flex items-center justify-center overflow-hidden">
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.nickname}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary to-primary-light flex items-center justify-center">
                    <User className="w-16 h-16 text-white" />
                  </div>
                )}
              </div>
            </div>

            {/* User Info */}
            <div className="mb-4">
              {isEditing ? (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={editForm.nickname}
                    onChange={(e) =>
                      setEditForm({ ...editForm, nickname: e.target.value })
                    }
                    className="text-2xl font-bold text-gray-800 border-b border-gray-300 focus:outline-none focus:border-primary"
                  />
                  <input
                    type="text"
                    value={editForm.school}
                    onChange={(e) =>
                      setEditForm({ ...editForm, school: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="学校"
                  />
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) =>
                      setEditForm({ ...editForm, email: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="邮箱"
                  />
                  <div className="flex space-x-3">
                    <button
                      onClick={handleSave}
                      className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                    >
                      保存
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      取消
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <h1 className="text-2xl font-bold text-gray-800 mb-1">
                    {user?.nickname || '用户'}
                  </h1>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    {user?.school && (
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        {user.school}
                      </div>
                    )}
                    {user?.email && (
                      <div className="flex items-center">
                        <Mail className="w-4 h-4 mr-1" />
                        {user.email}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 border border-primary text-primary rounded-lg hover:bg-primary-lighter transition-colors"
              >
                编辑资料
              </button>
            )}
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-4 text-center">
            <p className="text-2xl font-bold text-primary mb-1">12</p>
            <p className="text-sm text-gray-600">发布内容</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 text-center">
            <p className="text-2xl font-bold text-primary mb-1">5</p>
            <p className="text-sm text-gray-600">参与社群</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 text-center">
            <p className="text-2xl font-bold text-primary mb-1">28</p>
            <p className="text-sm text-gray-600">交易次数</p>
          </div>
        </div>

        {/* Menu Items */}
        <div className="bg-white rounded-xl shadow-sm divide-y divide-gray-100">
          {menuItems.map((item) => (
            <Link
              key={item.label}
              to={item.link}
              className="flex items-center p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="w-10 h-10 bg-primary-lighter rounded-lg flex items-center justify-center mr-4">
                <item.icon className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-800">{item.label}</h3>
                <p className="text-sm text-gray-500">{item.description}</p>
              </div>
              <span className="text-gray-400">›</span>
            </Link>
          ))}
        </div>

        {/* Logout Button */}
        <div className="mt-6">
          <button
            onClick={logout}
            className="w-full py-3 bg-white text-error border border-error rounded-xl hover:bg-error hover:text-white transition-colors font-medium"
          >
            退出登录
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
