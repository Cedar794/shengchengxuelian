import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  FolderKanban,
  MessageSquare,
  Search,
  Plus,
} from 'lucide-react';
import { CommunityCard, ProjectCard } from '../components/common/Card';

const tabs = [
  {
    id: 'communities',
    name: '主题社群',
    icon: Users,
    description: '发现兴趣社群，结交志同道合的朋友',
  },
  {
    id: 'projects',
    name: '跨校项目',
    icon: FolderKanban,
    description: '参与跨校协作，展示才华',
  },
  {
    id: 'chat',
    name: '匿名私聊',
    icon: MessageSquare,
    description: '匿名匹配，轻松交流',
  },
];

const communities = [
  {
    id: 1,
    name: 'Python数据分析学习小组',
    description: '一起学习数据分析，分享实战经验和项目案例。近期话题：爬虫实战、数据可视化案例分享。',
    category: '编程',
    memberCount: 127,
  },
  {
    id: 2,
    name: '跨校篮球爱好者联盟',
    description: '每周组织线上战术讨论，每月一场友谊赛',
    category: '体育',
    memberCount: 89,
  },
  {
    id: 3,
    name: '考研交流群',
    description: '考研信息分享、学习经验交流、资料互助',
    category: '学习',
    memberCount: 256,
  },
  {
    id: 4,
    name: '摄影爱好者协会',
    description: '分享摄影作品，交流拍摄技巧，组织外拍活动',
    category: '艺术',
    memberCount: 178,
  },
  {
    id: 5,
    name: '创业项目孵化群',
    description: '创业点子分享、团队招募、项目合作',
    category: '创业',
    memberCount: 92,
  },
  {
    id: 6,
    name: '英语角',
    description: '每日英语口语练习，四六级备考交流',
    category: '语言',
    memberCount: 234,
  },
];

const projects = [
  {
    id: 1,
    title: '"校园碳中和"调研项目招募团队成员',
    description: '本项目旨在调研校园碳排放现状，提出减排建议，需要环境专业、数据可视化、文案等方面的人才。',
    category: '环保',
    requiredSkills: '环境专业, 数据可视化, 文案',
    status: '招募中',
  },
  {
    id: 2,
    title: '"乡村振兴"暑期社会实践项目',
    description: '来自3所高校的6名成员，正在进行问卷设计和实地联络。欢迎有社会实践经验的同学加入。',
    category: '社会实践',
    requiredSkills: '调研能力, 沟通能力, 写作',
    status: '进行中',
  },
  {
    id: 3,
    title: '校园文创产品设计',
    description: '设计具有校园特色的文创产品，包括帆布包、明信片、书签等。需要设计、营销等方面人才。',
    category: '设计',
    requiredSkills: '平面设计, 市场营销, 供应链',
    status: '招募中',
  },
  {
    id: 4,
    title: '在线教育平台开发',
    description: '开发面向大学生的在线学习平台，共享优质课程资源。需要前后端开发、产品经理等。',
    category: '技术',
    requiredSkills: '前端开发, 后端开发, 产品经理',
    status: '招募中',
  },
];

const recentChats = [
  {
    id: 1,
    topic: '考研经验交流',
    partner: '匿名用户A',
    lastMessage: '感谢分享，很有帮助！',
    status: '已结束',
  },
  {
    id: 2,
    topic: '创业项目讨论',
    partner: '匿名用户B',
    lastMessage: '可以加个微信详细聊吗？',
    status: '进行中',
  },
];

const Social = () => {
  const [activeTab, setActiveTab] = useState('communities');

  return (
    <div className="min-h-screen bg-gray-50 pt-14">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">校际圈</h1>
          <p className="text-gray-600">
            跨越校际界限，连接申城高校学子
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-xl shadow-sm mb-8">
          <div className="flex border-b border-gray-200">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 px-6 py-4 text-left transition-colors ${
                  activeTab === tab.id
                    ? 'text-primary border-b-2 border-primary bg-primary-lighter'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <tab.icon className="w-5 h-5" />
                  <span className="font-medium">{tab.name}</span>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  {tab.description}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Content based on active tab */}
        {activeTab === 'communities' && (
          <div>
            {/* Search and Create */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex-1 max-w-md relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="搜索社群..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <Link
                to="/social/communities/create"
                className="flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                创建社群
              </Link>
            </div>

            {/* Community Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {communities.map((community) => (
                <CommunityCard key={community.id} community={community} />
              ))}
            </div>
          </div>
        )}

        {activeTab === 'projects' && (
          <div>
            {/* Search and Create */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex-1 max-w-md relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="搜索项目..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <Link
                to="/social/projects/create"
                className="flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                发布项目
              </Link>
            </div>

            {/* Project Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {projects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          </div>
        )}

        {activeTab === 'chat' && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-800">
                匿配私聊
              </h2>
              <button className="flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors">
                <Users className="w-4 h-4 mr-2" />
                随机匹配
              </button>
            </div>

            {/* Recent Chats */}
            <div className="space-y-4">
              {recentChats.map((chat) => (
                <div
                  key={chat.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary-light rounded-full flex items-center justify-center text-white">
                      <MessageSquare className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-800">
                        {chat.topic}
                      </h3>
                      <p className="text-sm text-gray-500">
                        与 {chat.partner}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500 mb-1">
                      {chat.lastMessage}
                    </p>
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        chat.status === '进行中'
                          ? 'bg-success/10 text-success'
                          : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {chat.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Features */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-primary-lighter rounded-lg">
                <h3 className="font-medium text-gray-800 mb-2">
                  匿名保护
                </h3>
                <p className="text-sm text-gray-600">
                  匹配前完全匿名，保护隐私
                </p>
              </div>
              <div className="p-4 bg-primary-lighter rounded-lg">
                <h3 className="font-medium text-gray-800 mb-2">
                  智能匹配
                </h3>
                <p className="text-sm text-gray-600">
                  基于标签和兴趣智能匹配
                </p>
              </div>
              <div className="p-4 bg-primary-lighter rounded-lg">
                <h3 className="font-medium text-gray-800 mb-2">
                  自愿联系
                </h3>
                <p className="text-sm text-gray-600">
                  双方同意后可交换联系方式
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Social;
