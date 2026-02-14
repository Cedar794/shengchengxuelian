import { Link, useLocation } from 'react-router-dom';
import { Bell, User, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Header = () => {
  const location = useLocation();
  const { user, logout, isAuthenticated } = useAuth();

  const navItems = [
    { path: '/', label: '首页' },
    { path: '/campus', label: '校园通' },
    { path: '/life', label: '生活汇' },
    { path: '/social', label: '校际圈' },
  ];

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-14 bg-white shadow-sm z-50">
      <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
        {/* Logo + Navigation */}
        <div className="flex items-center space-x-8">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary-light rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">学</span>
            </div>
            <span className="text-xl font-semibold text-gray-700">申城学联</span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`relative py-4 text-sm font-medium transition-colors ${
                  isActive(item.path)
                    ? 'text-primary'
                    : 'text-gray-600 hover:text-primary'
                }`}
              >
                {item.label}
                {isActive(item.path) && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                )}
              </Link>
            ))}
          </nav>
        </div>

        {/* User Actions */}
        <div className="flex items-center space-x-4">
          {isAuthenticated ? (
            <>
              <button className="p-2 hover:bg-gray-100 rounded-full transition-colors relative">
                <Bell className="w-5 h-5 text-gray-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-error rounded-full" />
              </button>
              <Link
                to="/profile"
                className="flex items-center space-x-2 px-3 py-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <div className="w-7 h-7 bg-primary-light rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm text-gray-700 hidden sm:inline">
                  {user?.nickname || '用户'}
                </span>
              </Link>
              <button
                onClick={logout}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                title="退出登录"
              >
                <LogOut className="w-5 h-5 text-gray-600" />
              </button>
            </>
          ) : (
            <div className="flex items-center space-x-3">
              <Link
                to="/login"
                className="text-sm text-gray-600 hover:text-primary transition-colors"
              >
                登录
              </Link>
              <Link
                to="/register"
                className="px-4 py-1.5 bg-primary text-white text-sm rounded-lg hover:bg-primary-dark transition-colors"
              >
                注册
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
