import { Link } from 'react-router-dom';
import { Mail, Github, Twitter } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* 关于我们 */}
          <div>
            <h3 className="text-lg font-semibold mb-4">关于我们</h3>
            <p className="text-gray-400 text-sm mb-4">
              申城学联是连接申城高校的综合性服务平台，为学生提供活动公告、二手交易、兴趣社群等服务。
            </p>
            <div className="flex space-x-3">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Github className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* 快速链接 */}
          <div>
            <h3 className="text-lg font-semibold mb-4">快速链接</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/campus" className="text-gray-400 hover:text-white text-sm transition-colors">
                  校园通
                </Link>
              </li>
              <li>
                <Link to="/life" className="text-gray-400 hover:text-white text-sm transition-colors">
                  生活汇
                </Link>
              </li>
              <li>
                <Link to="/social" className="text-gray-400 hover:text-white text-sm transition-colors">
                  校际圈
                </Link>
              </li>
              <li>
                <Link to="/profile" className="text-gray-400 hover:text-white text-sm transition-colors">
                  个人中心
                </Link>
              </li>
            </ul>
          </div>

          {/* 帮助中心 */}
          <div>
            <h3 className="text-lg font-semibold mb-4">帮助中心</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/help" className="text-gray-400 hover:text-white text-sm transition-colors">
                  使用指南
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-gray-400 hover:text-white text-sm transition-colors">
                  常见问题
                </Link>
              </li>
              <li>
                <Link to="/feedback" className="text-gray-400 hover:text-white text-sm transition-colors">
                  意见反馈
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-gray-400 hover:text-white text-sm transition-colors">
                  隐私政策
                </Link>
              </li>
            </ul>
          </div>

          {/* 联系我们 */}
          <div>
            <h3 className="text-lg font-semibold mb-4">联系我们</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>邮箱：contact@xuelian.edu</li>
              <li>电话：400-123-4567</li>
              <li>地址：上海市申城区学联路1号</li>
              <li className="pt-2">
                <Link
                  to="/contact"
                  className="text-primary hover:text-primary-light transition-colors"
                >
                  在线留言 →
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* 合作伙伴 */}
        <div className="border-t border-gray-700 mt-8 pt-8">
          <h3 className="text-sm font-semibold mb-4 text-gray-300">合作伙伴</h3>
          <div className="flex flex-wrap gap-4 text-xs text-gray-400">
            <span>上海海关学院</span>
            <span>申城大学</span>
            <span>上海财经大学</span>
            <span>华东师范大学</span>
            <span>上海外国语大学</span>
          </div>
        </div>

        {/* 版权声明 */}
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm text-gray-400">
          <p>© 2026 申城学联. All rights reserved.</p>
          <p className="mt-2">
            连接申城高校，共享智慧校园 ·
            <Link to="/about" className="text-primary hover:text-primary-light ml-1">
              关于我们
            </Link>
            {' '}·{' '}
            <Link to="/terms" className="text-primary hover:text-primary-light">
              服务条款
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
