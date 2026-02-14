import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  Calendar,
  Users,
  Building,
  FileText,
  Lightbulb,
  ChevronRight,
  Plus,
} from 'lucide-react';
import { ActivityCard, CollaborationCard, VenueCard, ResourceCard, TipCard } from '../components/common/Card';
import { campusAPI } from '../api';
import { useAuth } from '../contexts/AuthContext';
import EditModal from '../components/common/EditModal';
import DeleteConfirmDialog from '../components/common/DeleteConfirmDialog';
import PublishContentModal from '../components/common/PublishContentModal';

const subModules = [
  {
    id: 'announcements',
    name: '活动公告',
    icon: Calendar,
    description: '查看最新校园活动',
    color: 'from-blue-500 to-blue-600',
    path: '/campus/announcements',
  },
  {
    id: 'collaboration',
    name: '部门协作',
    icon: Users,
    description: '跨部门协同办公',
    color: 'from-purple-500 to-purple-600',
    path: '/campus/collaboration',
  },
  {
    id: 'venues',
    name: '场馆预约',
    icon: Building,
    description: '预约校园场馆',
    color: 'from-green-500 to-green-600',
    path: '/campus/venues',
  },
  {
    id: 'resources',
    name: '资料分享',
    icon: FileText,
    description: '共享学习资源',
    color: 'from-orange-500 to-orange-600',
    path: '/campus/resources',
  },
  {
    id: 'tips',
    name: '校园贴士',
    icon: Lightbulb,
    description: '实用校园信息',
    color: 'from-pink-500 to-pink-600',
    path: '/campus/tips',
  },
];

// Module configurations
const moduleConfig = {
  announcements: {
    title: '最新活动公告',
    viewAllPath: '/campus/announcements',
    apiKey: 'activities',
    cardComponent: 'ActivityCard',
    propKey: 'activity',
  },
  collaboration: {
    title: '部门协作',
    viewAllPath: '/campus/collaboration',
    apiKey: 'collaborations',
    cardComponent: 'CollaborationCard',
    propKey: 'collaboration',
  },
  venues: {
    title: '场馆预约',
    viewAllPath: '/campus/venues',
    apiKey: 'venues',
    cardComponent: 'VenueCard',
    propKey: 'venue',
  },
  resources: {
    title: '资料分享',
    viewAllPath: '/campus/resources',
    apiKey: 'materials',
    cardComponent: 'ResourceCard',
    propKey: 'resource',
  },
  tips: {
    title: '校园贴士',
    viewAllPath: '/campus/tips',
    apiKey: 'tips',
    cardComponent: 'TipCard',
    propKey: 'tip',
  },
};

// Edit modal field configurations
const editFieldConfigs = {
  announcements: [
    { name: 'title', label: '活动标题', type: 'text', required: true },
    { name: 'content', label: '活动内容', type: 'textarea', required: true, rows: 3 },
    {
      name: 'category',
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
  ],
  collaboration: [
    { name: 'title', label: '协作标题', type: 'text', required: true },
    { name: 'description', label: '协作描述', type: 'textarea', required: true, rows: 3 },
    { name: 'department', label: '部门', type: 'text', required: false },
    {
      name: 'priority',
      label: '优先级',
      type: 'select',
      required: true,
      options: [
        { value: 'low', label: '低' },
        { value: 'medium', label: '中' },
        { value: 'high', label: '高' },
      ],
    },
  ],
  venues: [
    { name: 'name', label: '场馆名称', type: 'text', required: true },
    {
      name: 'type',
      label: '场馆类型',
      type: 'select',
      required: true,
      options: [
        { value: 'sports', label: '体育场馆' },
        { value: 'study', label: '学习空间' },
        { value: 'meeting', label: '会议室' },
        { value: 'performance', label: '演出场所' },
      ],
    },
    { name: 'location', label: '位置', type: 'text', required: true },
    { name: 'capacity', label: '容量', type: 'number', required: false },
  ],
  resources: [
    { name: 'title', label: '资料标题', type: 'text', required: true },
    { name: 'description', label: '资料描述', type: 'textarea', required: true, rows: 3 },
    { name: 'category', label: '分类', type: 'text', required: false },
  ],
  tips: [
    { name: 'title', label: '贴士标题', type: 'text', required: true },
    { name: 'content', label: '贴士内容', type: 'textarea', required: true, rows: 3 },
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

const Campus = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'admin';
  const { subpage } = useParams();
  const navigate = useNavigate();

  // Use subpage from URL or default to 'announcements'
  const [selectedModule, setSelectedModule] = useState(subpage || 'announcements');

  // Track whether to show all items or just a preview
  const [showAll, setShowAll] = useState(false);

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editModal, setEditModal] = useState({ isOpen: false, item: null });
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, item: null });
  const [showPublishModal, setShowPublishModal] = useState(false);

  // Map card components
  const cardComponents = {
    ActivityCard,
    CollaborationCard,
    VenueCard,
    ResourceCard,
    TipCard,
  };

  // Update selected module when URL subpage changes
  useEffect(() => {
    if (subpage && subpage !== selectedModule) {
      setSelectedModule(subpage);
      setShowAll(true); // Auto-show all when navigating directly to a subpage
    }
  }, [subpage, selectedModule]);

  // Reset showAll when module changes via click
  useEffect(() => {
    setShowAll(false);
  }, [selectedModule]);

  // Fetch data based on selected module
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        let result;
        switch (selectedModule) {
          case 'announcements':
            result = await campusAPI.getActivities();
            setData(result.activities || []);
            break;
          case 'collaboration':
            result = await campusAPI.getCollaborations();
            setData(result.collaborations || []);
            break;
          case 'venues':
            result = await campusAPI.getVenues();
            setData(result.venues || []);
            break;
          case 'resources':
            result = await campusAPI.getMaterials();
            setData(result.materials || []);
            break;
          case 'tips':
            result = await campusAPI.getTips();
            setData(result.tips || []);
            break;
          default:
            setData([]);
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedModule]);

  // Handle module click
  const handleModuleClick = (moduleId) => {
    setSelectedModule(moduleId);
    // Update URL to reflect the selected module
    navigate(`/campus/${moduleId}`);
  };

  // Handle edit
  const handleEdit = (item) => {
    setEditModal({ isOpen: true, item });
  };

  // Handle delete
  const handleDelete = (item) => {
    setDeleteDialog({ isOpen: true, item });
  };

  // Handle edit submit
  const handleEditSubmit = async (formData) => {
    try {
      const item = editModal.item;

      switch (selectedModule) {
        case 'announcements':
          await campusAPI.updateAnnouncement(item.id, formData);
          break;
        case 'collaboration':
          // For collaborations, we would need a dedicated update endpoint
          break;
        case 'venues':
          // Venues update would need a dedicated endpoint
          break;
        case 'resources':
          await campusAPI.updateMaterial(item.id, formData);
          break;
        case 'tips':
          await campusAPI.updateTip(item.id, formData);
          break;
      }

      // Refresh data
      const result = await fetchModuleData(selectedModule);
      setData(result);
      setEditModal({ isOpen: false, item: null });
    } catch (error) {
      console.error('Failed to update:', error);
      alert('更新失败: ' + error.message);
    }
  };

  // Handle delete confirm
  const handleDeleteConfirm = async () => {
    try {
      const item = deleteDialog.item;

      switch (selectedModule) {
        case 'announcements':
          await campusAPI.deleteAnnouncement(item.id);
          break;
        case 'collaboration':
          // Would need a dedicated delete endpoint
          break;
        case 'venues':
          // Would need a dedicated delete endpoint
          break;
        case 'resources':
          await campusAPI.deleteMaterial(item.id);
          break;
        case 'tips':
          // Tips delete requires admin role - use update to set status
          await campusAPI.updateTip(item.id, { content: item.content, status: 'deleted' });
          break;
      }

      // Refresh data
      const result = await fetchModuleData(selectedModule);
      setData(result);
      setDeleteDialog({ isOpen: false, item: null });
    } catch (error) {
      console.error('Failed to delete:', error);
      alert('删除失败: ' + error.message);
    }
  };

  // Helper to fetch module data
  const fetchModuleData = async (moduleId) => {
    let result;
    switch (moduleId) {
      case 'announcements':
        result = await campusAPI.getActivities();
        return result.activities || [];
      case 'collaboration':
        result = await campusAPI.getCollaborations();
        return result.collaborations || [];
      case 'venues':
        result = await campusAPI.getVenues();
        return result.venues || [];
      case 'resources':
        result = await campusAPI.getMaterials();
        return result.materials || [];
      case 'tips':
        result = await campusAPI.getTips();
        return result.tips || [];
      default:
        return [];
    }
  };

  // Handle publish
  const handlePublish = async (formData) => {
    try {
      switch (selectedModule) {
        case 'announcements':
          await campusAPI.createAnnouncement(formData);
          break;
        case 'resources':
          await campusAPI.uploadMaterial(formData);
          break;
        case 'tips':
          await campusAPI.createTip(formData);
          break;
        default:
          break;
      }

      // Refresh data
      const result = await fetchModuleData(selectedModule);
      setData(result);
      setShowPublishModal(false);
    } catch (error) {
      console.error('Publish failed:', error);
      alert('发布失败: ' + error.message);
    }
  };

  // Get content type for publish modal
  const getPublishContentType = () => {
    switch (selectedModule) {
      case 'announcements':
        return 'activity';
      case 'resources':
        return 'material';
      case 'tips':
        return 'tip';
      default:
        return null;
    }
  };

  const currentConfig = moduleConfig[selectedModule];
  const CardComponent = cardComponents[currentConfig.cardComponent];
  const propKey = currentConfig.propKey;

  // Prepare initial data for edit modal
  const getInitialData = () => {
    if (!editModal.item) return {};

    const item = editModal.item;
    switch (selectedModule) {
      case 'announcements':
        return {
          title: item.title,
          content: item.content || item.description,
          category: item.category || item.type,
        };
      case 'collaboration':
        return {
          title: item.title,
          description: item.description,
          department: item.department,
          priority: item.priority,
        };
      case 'venues':
        return {
          name: item.name,
          type: item.type,
          location: item.location,
          capacity: item.capacity,
        };
      case 'resources':
        return {
          title: item.title,
          description: item.description,
          category: item.category || item.type,
        };
      case 'tips':
        return {
          title: item.title,
          content: item.content,
          category: item.category,
        };
      default:
        return {};
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-14">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">校园通</h1>
          <p className="text-gray-600">一站式校园服务，让校园生活更便捷</p>
        </div>

        {/* Module Navigation */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {subModules.map((module) => (
            <div
              key={module.id}
              className={`bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer ${
                selectedModule === module.id
                  ? 'ring-2 ring-primary ring-offset-2'
                  : ''
              }`}
              onClick={() => handleModuleClick(module.id)}
            >
              <div
                className={`w-12 h-12 bg-gradient-to-br ${module.color} rounded-lg flex items-center justify-center mb-3`}
              >
                <module.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-1">
                {module.name}
              </h3>
              <p className="text-sm text-gray-500">{module.description}</p>
              <ChevronRight className="w-4 h-4 text-gray-400 mt-2" />
            </div>
          ))}
        </div>

        {/* Content Area */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-800">
              {currentConfig.title}
            </h2>
            <div className="flex items-center gap-3">
              {isAdmin && getPublishContentType() && (
                <button
                  onClick={() => setShowPublishModal(true)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-primary text-white text-sm rounded-lg hover:bg-primary-dark transition-colors"
                >
                  <Plus size={16} />
                  发布
                </button>
              )}
              <button
                onClick={() => setShowAll(!showAll)}
                className="text-primary hover:text-primary-dark text-sm"
              >
                {showAll ? '收起 ↑' : '查看全部 →'}
              </button>
            </div>
          </div>

          {loading ? (
            <div className="text-center text-gray-500 py-8">加载中...</div>
          ) : data.length === 0 ? (
            <div className="text-center text-gray-500 py-8">暂无数据</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {data.slice(0, showAll ? data.length : 6).map((item) => (
                <CardComponent
                  key={item.id}
                  {...{ [propKey]: item }}
                  onEdit={isAdmin ? handleEdit : undefined}
                  onDelete={isAdmin ? handleDelete : undefined}
                />
              ))}
            </div>
          )}
        </div>

        {/* Quick Tips - only show on announcements */}
        {selectedModule === 'announcements' && (
          <div className="mt-8 bg-gradient-to-r from-primary-lighter to-white rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              校园小贴士
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white/80 rounded-lg p-4">
                <h4 className="font-medium text-gray-700 mb-2">
                  自习室开放时间
                </h4>
                <p className="text-sm text-gray-600">
                  图书馆：7:00-22:30<br />
                  教学楼：7:00-21:00
                </p>
              </div>
              <div className="bg-white/80 rounded-lg p-4">
                <h4 className="font-medium text-gray-700 mb-2">
                  场馆预约提示
                </h4>
                <p className="text-sm text-gray-600">
                  体育馆可提前7天预约<br />
                  每人每周最多3小时
                </p>
              </div>
              <div className="bg-white/80 rounded-lg p-4">
                <h4 className="font-medium text-gray-700 mb-2">
                  资料分享须知
                </h4>
                <p className="text-sm text-gray-600">
                  支持PDF、Word等格式<br />
                  文件大小不超过10MB
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      <EditModal
        isOpen={editModal.isOpen}
        onClose={() => setEditModal({ isOpen: false, item: null })}
        onSubmit={handleEditSubmit}
        title={`编辑${currentConfig.title}`}
        fields={editFieldConfigs[selectedModule] || []}
        initialData={getInitialData()}
      />

      {/* Delete Confirm Dialog */}
      <DeleteConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, item: null })}
        onConfirm={handleDeleteConfirm}
        itemName={deleteDialog.item?.title || deleteDialog.item?.name || '此项目'}
      />

      {/* Publish Modal */}
      {showPublishModal && getPublishContentType() && (
        <PublishContentModal
          isOpen={showPublishModal}
          onClose={() => setShowPublishModal(false)}
          onSubmit={handlePublish}
          contentType={getPublishContentType()}
        />
      )}
    </div>
  );
};

export default Campus;
