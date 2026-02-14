import { Link } from 'react-router-dom';
import { ArrowRight, Calendar, Users, ShoppingCart, MessageSquare, Plus } from 'lucide-react';
import { ActivityCard, CommunityCard, ResourceCard } from '../components/common/Card';
import Footer from '../components/layout/Footer';
import EditModal from '../components/common/EditModal';
import DeleteConfirmDialog from '../components/common/DeleteConfirmDialog';
import PublishContentModal from '../components/common/PublishContentModal';
import { useState, useEffect } from 'react';
import { campusAPI } from '../api';
import { useAuth } from '../contexts/AuthContext';

const Home = () => {
  const { user } = useAuth();
  const [activities, setActivities] = useState([]);
  const [communities, setCommunities] = useState([]);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);

  // Admin state
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [selectedCommunity, setSelectedCommunity] = useState(null);
  const [selectedResource, setSelectedResource] = useState(null);
  const [showActivityEditModal, setShowActivityEditModal] = useState(false);
  const [showActivityDeleteDialog, setShowActivityDeleteDialog] = useState(false);
  const [showCommunityEditModal, setShowCommunityEditModal] = useState(false);
  const [showCommunityDeleteDialog, setShowCommunityDeleteDialog] = useState(false);
  const [showResourceEditModal, setShowResourceEditModal] = useState(false);
  const [showResourceDeleteDialog, setShowResourceDeleteDialog] = useState(false);

  // Publish modal state
  const [showActivityPublishModal, setShowActivityPublishModal] = useState(false);
  const [showMaterialPublishModal, setShowMaterialPublishModal] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch activities/announcements
        const activitiesData = await campusAPI.getAnnouncements();
        const activities = activitiesData.activities || [];

        // Transform activity data to match frontend expectations
        const transformedActivities = activities.map(activity => ({
          ...activity,
          category: activity.type === 'general' ? '活动' :
                    activity.type === 'academic' ? '学术' :
                    activity.type === 'sports' ? '体育' :
                    activity.type === 'culture' ? '文化' : '活动',
          publisher: {
            nickname: activity.publisher_name || '管理员'
          },
          viewCount: activity.registration_count || 0
        }));

        setActivities(transformedActivities);

        // Fetch communities
        const communitiesData = await campusAPI.getCommunities();
        const communities = communitiesData.groups || [];

        // Transform community data to match frontend expectations
        const transformedCommunities = communities.map(community => ({
          ...community,
          category: community.type || '社群',
          memberCount: community.member_count || 0
        }));

        setCommunities(transformedCommunities);

        // Fetch resources/materials
        const resourcesData = await campusAPI.getMaterials();
        const materials = resourcesData.materials || [];
        setResources(materials);
      } catch (error) {
        console.error('Failed to fetch data:', error);
        // Use empty arrays as fallback
        setActivities([]);
        setCommunities([]);
        setResources([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Admin handlers
  const handleEditActivity = (activity) => {
    setSelectedActivity(activity);
    setShowActivityEditModal(true);
  };

  const handleDeleteActivity = (activity) => {
    setSelectedActivity(activity);
    setShowActivityDeleteDialog(true);
  };

  const handleEditCommunity = (community) => {
    setSelectedCommunity(community);
    setShowCommunityEditModal(true);
  };

  const handleDeleteCommunity = (community) => {
    setSelectedCommunity(community);
    setShowCommunityDeleteDialog(true);
  };

  const handleUpdateActivity = async (data) => {
    try {
      // Only send the fields that are editable
      const editableData = {
        title: data.title,
        description: data.description,
        type: data.type,
        location: data.location,
        event_time: data.event_time,
        max_participants: data.max_participants,
      };

      await campusAPI.updateAnnouncement(selectedActivity.id, editableData);
      // Refresh activities
      const activitiesData = await campusAPI.getAnnouncements();
      const activities = activitiesData.activities || [];
      const transformedActivities = activities.map(activity => ({
        ...activity,
        category: activity.type === 'general' ? '活动' :
                  activity.type === 'academic' ? '学术' :
                  activity.type === 'sports' ? '体育' :
                  activity.type === 'culture' ? '文化' : '活动',
        publisher: { nickname: activity.publisher_name || '管理员' },
        viewCount: activity.registration_count || 0
      }));
      setActivities(transformedActivities);
      setShowActivityEditModal(false);
    } catch (error) {
      console.error('更新失败:', error);
      alert('更新失败：' + (error.message || '未知错误'));
    }
  };

  const handleDeleteActivityConfirm = async () => {
    await campusAPI.deleteAnnouncement(selectedActivity.id);
    // Refresh activities
    const activitiesData = await campusAPI.getAnnouncements();
    const activities = activitiesData.activities || [];
    const transformedActivities = activities.map(activity => ({
      ...activity,
      category: activity.type === 'general' ? '活动' :
                activity.type === 'academic' ? '学术' :
                activity.type === 'sports' ? '体育' :
                activity.type === 'culture' ? '文化' : '活动',
      publisher: { nickname: activity.publisher_name || '管理员' },
      viewCount: activity.registration_count || 0
    }));
    setActivities(transformedActivities);
    setShowActivityDeleteDialog(false);
  };

  const handleUpdateCommunity = async (data) => {
    try {
      // Only send the fields that are editable
      const editableData = {
        name: data.name,
        description: data.description,
        type: data.type,
      };

      await campusAPI.updateCommunity(selectedCommunity.id, editableData);
      // Refresh communities
      const communitiesData = await campusAPI.getCommunities();
      const communities = communitiesData.groups || [];
      const transformedCommunities = communities.map(community => ({
        ...community,
        category: community.type || '社群',
        memberCount: community.member_count || 0
      }));
      setCommunities(transformedCommunities);
      setShowCommunityEditModal(false);
    } catch (error) {
      console.error('更新失败:', error);
      alert('更新失败：' + (error.message || '未知错误'));
    }
  };

  const handleDeleteCommunityConfirm = async () => {
    try {
      await campusAPI.deleteCommunity(selectedCommunity.id);
      // Refresh communities
      const communitiesData = await campusAPI.getCommunities();
      const communities = communitiesData.groups || [];
      const transformedCommunities = communities.map(community => ({
        ...community,
        category: community.type || '社群',
        memberCount: community.member_count || 0
      }));
      setCommunities(transformedCommunities);
      setShowCommunityDeleteDialog(false);
    } catch (error) {
      console.error('删除失败:', error);
      alert('删除失败：' + (error.message || '未知错误'));
    }
  };

  // Resource handlers
  const handleEditResource = (resource) => {
    setSelectedResource(resource);
    setShowResourceEditModal(true);
  };

  const handleDeleteResource = (resource) => {
    setSelectedResource(resource);
    setShowResourceDeleteDialog(true);
  };

  const handleUpdateResource = async (data) => {
    try {
      // Only send the fields that are editable
      const editableData = {
        title: data.title,
        description: data.description,
        category: data.category,
        tags: data.tags,
        download_count: data.download_count,
      };

      await campusAPI.updateMaterial(selectedResource.id, editableData);
      // Refresh resources
      const resourcesData = await campusAPI.getMaterials();
      const materials = resourcesData.materials || [];
      setResources(materials);
      setShowResourceEditModal(false);
    } catch (error) {
      console.error('更新失败:', error);
      alert('更新失败：' + (error.message || '未知错误'));
    }
  };

  const handleDeleteResourceConfirm = async () => {
    try {
      await campusAPI.deleteMaterial(selectedResource.id);
      // Refresh resources
      const resourcesData = await campusAPI.getMaterials();
      const materials = resourcesData.materials || [];
      setResources(materials);
      setShowResourceDeleteDialog(false);
    } catch (error) {
      console.error('删除失败:', error);
      alert('删除失败：' + (error.message || '未知错误'));
    }
  };

  // Publish handlers
  const handlePublishActivity = async (data) => {
    try {
      await campusAPI.createAnnouncement(data);
      // Refresh activities
      const activitiesData = await campusAPI.getAnnouncements();
      const activities = activitiesData.activities || [];
      const transformedActivities = activities.map(activity => ({
        ...activity,
        category: activity.type === 'general' ? '活动' :
                  activity.type === 'academic' ? '学术' :
                  activity.type === 'sports' ? '体育' :
                  activity.type === 'culture' ? '文化' : '活动',
        publisher: { nickname: activity.publisher_name || '管理员' },
        viewCount: activity.registration_count || 0
      }));
      setActivities(transformedActivities);
      setShowActivityPublishModal(false);
    } catch (error) {
      console.error('发布失败:', error);
      alert('发布失败：' + (error.message || '未知错误'));
    }
  };

  const handlePublishMaterial = async (data) => {
    try {
      await campusAPI.uploadMaterial(data);
      // Refresh resources
      const resourcesData = await campusAPI.getMaterials();
      const materials = resourcesData.materials || [];
      setResources(materials);
      setShowMaterialPublishModal(false);
    } catch (error) {
      console.error('发布失败:', error);
      alert('发布失败：' + (error.message || '未知错误'));
    }
  };

  // Use real activities data or empty array
  const announcements = activities.slice(0, 3);

  const sections = [
    {
      title: '热门活动',
      icon: Calendar,
      link: '/campus/announcements',
      items: announcements,
      cardComponent: ActivityCard,
    },
    {
      title: '资料分享',
      icon: null,
      link: '/campus/resources',
      items: resources,
      cardComponent: ResourceCard,
      onEdit: user?.role === 'admin' ? handleEditResource : undefined,
      onDelete: user?.role === 'admin' ? handleDeleteResource : undefined,
    },
    {
      title: '热门社群',
      icon: Users,
      link: '/social/communities',
      items: communities,
      cardComponent: CommunityCard,
    },
  ];

  const features = [
    {
      name: '校园通',
      icon: Calendar,
      description: '活动公告、部门协作、场馆预约',
      color: 'from-primary to-primary-light',
      link: '/campus',
    },
    {
      name: '生活汇',
      icon: ShoppingCart,
      description: '二手交易、失物招领、兼职平台',
      color: 'from-success to-emerald-400',
      link: '/life',
    },
    {
      name: '校际圈',
      icon: MessageSquare,
      description: '主题社群、跨校协作、匿名私聊',
      color: 'from-warning to-amber-400',
      link: '/social',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Loading State */}
      {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-50 z-50">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600">加载中...</p>
          </div>
        </div>
      )}

      {/* Hero Section with Image */}
      <section className="relative">
        {/* Hero Image */}
        <div className="w-full h-[500px] overflow-hidden">
          <img
            src="/hero-banner.png"
            alt="申城学联"
            className="w-full h-full object-cover"
          />
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/80 via-primary/60 to-transparent" />
        </div>

        {/* Hero Content */}
        <div className="absolute inset-0 flex items-center">
          <div className="max-w-7xl mx-auto px-4 w-full">
            <div className="max-w-2xl">
              <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
                申城学联
              </h1>
              <p className="text-xl md:text-2xl text-white/90 mb-4">
                连接申城高校，共享智慧校园
              </p>
              <p className="text-lg text-white/80 mb-8">
                活动公告 · 二手交易 · 兴趣社群 · 跨校协作
              </p>

              {/* Feature Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {features.map((feature) => (
                  <Link
                    key={feature.name}
                    to={feature.link}
                    className="bg-white/95 backdrop-blur rounded-xl p-5 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
                  >
                    <div className={`w-12 h-12 bg-gradient-to-br ${feature.color} rounded-lg flex items-center justify-center mb-3`}>
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-1">
                      {feature.name}
                    </h3>
                    <p className="text-sm text-gray-600">{feature.description}</p>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content Sections - Two Column Layout */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Row 1: 活动公告 + 资料分享 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* 活动公告 */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-2">
                <Calendar className="w-6 h-6 text-primary" />
                <h2 className="text-2xl font-semibold text-gray-800">
                  活动公告
                </h2>
              </div>
              <div className="flex items-center gap-3">
                {user?.role === 'admin' && (
                  <button
                    onClick={() => setShowActivityPublishModal(true)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-primary text-white text-sm rounded-lg hover:bg-primary-dark transition-colors"
                  >
                    <Plus size={16} />
                    发布活动
                  </button>
                )}
                <Link
                  to="/campus/announcements"
                  className="flex items-center text-primary hover:text-primary-dark transition-colors"
                >
                  查看更多 <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </div>
            </div>
            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-8 text-gray-500">加载中...</div>
              ) : announcements.length === 0 ? (
                <div className="text-center py-8 text-gray-500">暂无活动</div>
              ) : (
                announcements.map((item) => (
                  <ActivityCard
                    key={item.id}
                    activity={item}
                    onEdit={user?.role === 'admin' ? handleEditActivity : undefined}
                    onDelete={user?.role === 'admin' ? handleDeleteActivity : undefined}
                  />
                ))
              )}
            </div>
          </section>

          {/* 资料分享 */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-gray-800">
                资料分享
              </h2>
              <div className="flex items-center gap-3">
                {user?.role === 'admin' && (
                  <button
                    onClick={() => setShowMaterialPublishModal(true)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-primary text-white text-sm rounded-lg hover:bg-primary-dark transition-colors"
                  >
                    <Plus size={16} />
                    发布资料
                  </button>
                )}
                <Link
                  to="/campus/resources"
                  className="flex items-center text-primary hover:text-primary-dark transition-colors"
                >
                  查看更多 <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </div>
            </div>
            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-8 text-gray-500">加载中...</div>
              ) : resources.length === 0 ? (
                <div className="text-center py-8 text-gray-500">暂无资料</div>
              ) : (
                resources.slice(0, 3).map((resource) => (
                  <ResourceCard
                    key={resource.id}
                    resource={resource}
                    onEdit={user?.role === 'admin' ? handleEditResource : undefined}
                    onDelete={user?.role === 'admin' ? handleDeleteResource : undefined}
                  />
                ))
              )}
            </div>
          </section>
        </div>

        {/* 热门社群 */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <Users className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-semibold text-gray-800">
                热门社群
              </h2>
            </div>
            <Link
              to="/social/communities"
              className="flex items-center text-primary hover:text-primary-dark transition-colors"
            >
              查看更多 <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {loading ? (
              <div className="text-center py-8 text-gray-500 col-span-3">加载中...</div>
            ) : communities.length === 0 ? (
              <div className="text-center py-8 text-gray-500 col-span-3">暂无社群</div>
            ) : (
              communities.slice(0, 3).map((community) => (
                <CommunityCard
                  key={community.id}
                  community={community}
                  onEdit={user?.role === 'admin' ? handleEditCommunity : undefined}
                  onDelete={user?.role === 'admin' ? handleDeleteCommunity : undefined}
                />
              ))
            )}
          </div>
        </section>
      </div>

      {/* CTA Section */}
      <section className="bg-white py-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            开启智慧校园生活
          </h2>
          <p className="text-gray-600 mb-8">
            加入申城学联，连接30+高校，发现更多可能
          </p>
          <div className="flex justify-center space-x-4">
            <Link
              to="/register"
              className="px-8 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-medium"
            >
              立即加入
            </Link>
            <Link
              to="/campus"
              className="px-8 py-3 bg-white text-primary border border-primary rounded-lg hover:bg-primary-lighter transition-colors font-medium"
            >
              探索功能
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />

      {/* Edit Modals */}
      {showActivityEditModal && selectedActivity && (
        <EditModal
          isOpen={showActivityEditModal}
          onClose={() => setShowActivityEditModal(false)}
          onSubmit={handleUpdateActivity}
          title="编辑活动公告"
          initialData={selectedActivity}
          fields={[
            { name: 'title', label: '标题', type: 'text', required: true },
            { name: 'description', label: '描述', type: 'textarea', required: true },
            { name: 'type', label: '类型', type: 'select', required: true, options: [
              { value: 'sports', label: '体育活动' },
              { value: 'academic', label: '学术讲座' },
              { value: 'general', label: '综合活动' },
              { value: 'culture', label: '文化活动' },
              { value: 'volunteer', label: '志愿活动' },
            ]},
            { name: 'location', label: '地点', type: 'text', required: false },
            { name: 'event_time', label: '活动时间', type: 'text', required: false },
            { name: 'max_participants', label: '最大参与人数', type: 'number', required: false, helperText: '留空表示不限制' },
          ]}
        />
      )}

      {showCommunityEditModal && selectedCommunity && (
        <EditModal
          isOpen={showCommunityEditModal}
          onClose={() => setShowCommunityEditModal(false)}
          onSubmit={handleUpdateCommunity}
          title="编辑社群"
          initialData={selectedCommunity}
          fields={[
            { name: 'name', label: '社群名称', type: 'text', required: true },
            { name: 'description', label: '描述', type: 'textarea', required: true },
            { name: 'type', label: '类型', type: 'text', required: false },
          ]}
        />
      )}

      {showResourceEditModal && selectedResource && (
        <EditModal
          isOpen={showResourceEditModal}
          onClose={() => setShowResourceEditModal(false)}
          onSubmit={handleUpdateResource}
          title="编辑资料"
          initialData={selectedResource}
          fields={[
            { name: 'title', label: '标题', type: 'text', required: true },
            { name: 'description', label: '描述', type: 'textarea', required: true },
            { name: 'category', label: '分类', type: 'text', required: false },
            { name: 'tags', label: '标签', type: 'text', required: false, helperText: '多个标签用逗号分隔' },
            { name: 'download_count', label: '下载量', type: 'number', required: false, helperText: '当前下载次数' },
          ]}
        />
      )}

      {/* Delete Confirm Dialogs */}
      {showActivityDeleteDialog && selectedActivity && (
        <DeleteConfirmDialog
          isOpen={showActivityDeleteDialog}
          onClose={() => setShowActivityDeleteDialog(false)}
          onConfirm={handleDeleteActivityConfirm}
          title="确认删除活动"
          itemName={selectedActivity.title}
        />
      )}

      {showCommunityDeleteDialog && selectedCommunity && (
        <DeleteConfirmDialog
          isOpen={showCommunityDeleteDialog}
          onClose={() => setShowCommunityDeleteDialog(false)}
          onConfirm={handleDeleteCommunityConfirm}
          title="确认删除社群"
          itemName={selectedCommunity.name}
        />
      )}

      {showResourceDeleteDialog && selectedResource && (
        <DeleteConfirmDialog
          isOpen={showResourceDeleteDialog}
          onClose={() => setShowResourceDeleteDialog(false)}
          onConfirm={handleDeleteResourceConfirm}
          title="确认删除资料"
          itemName={selectedResource.title}
        />
      )}

      {/* Publish Modals */}
      {showActivityPublishModal && (
        <PublishContentModal
          isOpen={showActivityPublishModal}
          onClose={() => setShowActivityPublishModal(false)}
          onSubmit={handlePublishActivity}
          contentType="activity"
        />
      )}

      {showMaterialPublishModal && (
        <PublishContentModal
          isOpen={showMaterialPublishModal}
          onClose={() => setShowMaterialPublishModal(false)}
          onSubmit={handlePublishMaterial}
          contentType="material"
        />
      )}
    </div>
  );
};

export default Home;
