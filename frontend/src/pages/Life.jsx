import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingCart,
  Package,
  Search,
  MapPin,
  Briefcase,
  ChevronRight,
  Bike,
  Plus,
} from 'lucide-react';
import { TradeCard, JobCard, ListingCard } from '../components/common/Card';
import EditModal from '../components/common/EditModal';
import DeleteConfirmDialog from '../components/common/DeleteConfirmDialog';
import PublishModal from '../components/common/PublishModal';
import { lifeAPI } from '../api';
import { useAuth } from '../contexts/AuthContext';

const categories = [
  {
    id: 'all',
    name: '全部',
    icon: null,
  },
  {
    id: 'second-hand',
    name: '二手交易',
    icon: ShoppingCart,
  },
  {
    id: 'creative',
    name: '文创交易',
    icon: Package,
  },
  {
    id: 'delivery',
    name: '外卖代取',
    icon: Bike,
  },
  {
    id: 'lost-found',
    name: '失物招领',
    icon: Search,
  },
  {
    id: 'part-time',
    name: '兼职平台',
    icon: Briefcase,
  },
];

// Field configurations for each listing type
const listingFieldsConfig = {
  'second-hand': [
    { name: 'title', label: '商品标题', type: 'text', required: true },
    { name: 'price', label: '价格 (元)', type: 'number', required: true },
    { name: 'condition', label: '商品成色', type: 'text', required: false, helperText: '如: 全新、九成新等' },
    { name: 'description', label: '商品描述', type: 'textarea', required: true, rows: 3 },
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
    { name: 'title', label: '商品标题', type: 'text', required: true },
    { name: 'price', label: '价格 (元)', type: 'number', required: true },
    { name: 'stock', label: '库存数量', type: 'number', required: false, helperText: '商品库存' },
    { name: 'description', label: '商品描述', type: 'textarea', required: true, rows: 3 },
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
    { name: 'pickup_location', label: '取餐地点', type: 'text', required: true },
    { name: 'delivery_address', label: '配送地址', type: 'text', required: true },
    { name: 'reward', label: '跑腿费 (元)', type: 'number', required: true },
    { name: 'description', label: '备注说明', type: 'textarea', required: false, rows: 3 },
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
    { name: 'item_name', label: '物品名称', type: 'text', required: true },
    { name: 'location', label: '捡到地点', type: 'text', required: true },
    { name: 'time_found', label: '捡到时间', type: 'text', required: false, helperText: '如: 2026-02-10 14:00' },
    { name: 'description', label: '详细描述', type: 'textarea', required: true, rows: 3 },
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
    { name: 'title', label: '职位名称', type: 'text', required: true },
    { name: 'salary', label: '薪资待遇', type: 'text', required: true, helperText: '如: 120元/小时' },
    { name: 'location', label: '工作地点', type: 'text', required: false, helperText: '如: 线上/校园内' },
    { name: 'requirements', label: '职位要求', type: 'textarea', required: true, rows: 3 },
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

const Life = () => {
  const { user, isAuthenticated } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Admin edit/delete states
  const [selectedListing, setSelectedListing] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Publish modal states
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [publishType, setPublishType] = useState('second-hand');

  const isAdmin = user?.role === 'ADMIN' || user?.role === 'admin';

  // Fetch listings from API
  const fetchListings = async () => {
    setLoading(true);
    try {
      const params = selectedCategory !== 'all' ? { type: selectedCategory } : {};
      const data = await lifeAPI.getListings(params);
      setListings(data.listings || data || []);
    } catch (error) {
      console.error('获取列表失败:', error);
      setListings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, [selectedCategory]);

  // Admin handlers
  const handleEditListing = (listing) => {
    setSelectedListing(listing);
    setShowEditModal(true);
  };

  const handleDeleteListing = (listing) => {
    setSelectedListing(listing);
    setShowDeleteDialog(true);
  };

  // Publish handlers
  const handleOpenPublishModal = (type = 'second-hand') => {
    setPublishType(type);
    setShowPublishModal(true);
  };

  const handlePublish = async (data) => {
    try {
      const result = await lifeAPI.createListing(data);

      // 立即将新发布的数据添加到列表开头
      const newListing = {
        ...result.listing,
        // 确保状态是大写格式
        status: result.listing?.status || 'AVAILABLE'
      };

      setListings(prev => [newListing, ...prev]);
      setShowPublishModal(false);
      alert('发布成功！');
    } catch (error) {
      console.error('发布失败:', error);
      alert('发布失败：' + (error.message || '未知错误'));
      throw error;
    }
  };

  const handleUpdateListing = async (formData) => {
    try {
      // Determine the display title for alert
      const title = selectedListing.type === 'delivery'
        ? formData.pickup_location
        : selectedListing.type === 'lost-found'
        ? formData.item_name
        : formData.title;

      await lifeAPI.updateListing(selectedListing.id, formData);
      // Refresh listings
      const params = selectedCategory !== 'all' ? { type: selectedCategory } : {};
      const data = await lifeAPI.getListings(params);
      setListings(data.listings || data || []);
      setShowEditModal(false);
      alert('更新成功！');
    } catch (error) {
      console.error('更新失败:', error);
      alert('更新失败：' + (error.message || '未知错误'));
      throw error;
    }
  };

  const handleDeleteListingConfirm = async () => {
    try {
      await lifeAPI.deleteListing(selectedListing.id);
      // Refresh listings
      const params = selectedCategory !== 'all' ? { type: selectedCategory } : {};
      const data = await lifeAPI.getListings(params);
      setListings(data.listings || data || []);
      setShowDeleteDialog(false);
      alert('删除成功！');
    } catch (error) {
      console.error('删除失败:', error);
      alert('删除失败：' + (error.message || '未知错误'));
      throw error;
    }
  };

  // Get fields for current listing type
  const getListingFields = (listingType) => {
    return listingFieldsConfig[listingType] || listingFieldsConfig['second-hand'];
  };

  // Get display title for listing
  const getListingTitle = (listing) => {
    if (listing.type === 'delivery') {
      return listing.pickup_location || '外卖代取';
    }
    if (listing.type === 'lost-found') {
      return listing.item_name || '失物招领';
    }
    return listing.title || '商品信息';
  };

  // Filter listings by category
  const filteredListings = listings.filter((listing) => {
    if (selectedCategory === 'all') return true;
    return listing.type === selectedCategory;
  });

  return (
    <div className="min-h-screen bg-gray-50 pt-14">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">生活汇</h1>
            <p className="text-gray-600">
              交易市场、失物招领、兼职信息，校园生活好帮手
            </p>
          </div>
          {isAuthenticated && (
            <button
              onClick={() => handleOpenPublishModal(selectedCategory !== 'all' ? selectedCategory : 'second-hand')}
              className="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>发布信息</span>
            </button>
          )}
        </div>

        {/* Category Tabs */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2 overflow-x-auto pb-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-primary text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
              >
                {category.icon && (
                  <category.icon className="w-4 h-4 inline mr-1" />
                )}
                {category.name}
              </button>
            ))}
          </div>
          {isAuthenticated && selectedCategory !== 'all' && (
            <button
              onClick={() => handleOpenPublishModal(selectedCategory)}
              className="flex items-center space-x-2 px-4 py-2 bg-primary-lighter text-primary rounded-lg hover:bg-primary-light transition-colors whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>发布</span>
            </button>
          )}
        </div>

        {/* Loading state */}
        {loading ? (
          <div className="text-center py-12 text-gray-500">加载中...</div>
        ) : (
          <>
            {/* Content based on category */}
            {selectedCategory === 'all' && (
              <>
                {/* Quick Links */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                  {categories.slice(1).map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all text-left"
                    >
                      {category.icon && (
                        <div className="w-10 h-10 bg-primary-lighter rounded-lg flex items-center justify-center mb-2">
                          <category.icon className="w-5 h-5 text-primary" />
                        </div>
                      )}
                      <h3 className="font-medium text-gray-800">{category.name}</h3>
                      <ChevronRight className="w-4 h-4 text-gray-400 mt-2" />
                    </button>
                  ))}
                </div>

                {/* Latest Listings */}
                <h2 className="text-xl font-semibold text-gray-800 mb-4">最新发布</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {listings.slice(0, 6).map((listing) => (
                    <ListingCard
                      key={listing.id}
                      listing={listing}
                      onEdit={isAdmin ? handleEditListing : undefined}
                      onDelete={isAdmin ? handleDeleteListing : undefined}
                    />
                  ))}
                </div>
                {listings.length === 0 && (
                  <div className="text-center py-12 text-gray-500">暂无相关内容</div>
                )}
              </>
            )}

            {/* Individual category views */}
            {selectedCategory !== 'all' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {filteredListings.map((listing) => (
                  <ListingCard
                    key={listing.id}
                    listing={listing}
                    onEdit={isAdmin ? handleEditListing : undefined}
                    onDelete={isAdmin ? handleDeleteListing : undefined}
                  />
                ))}
                {filteredListings.length === 0 && (
                  <div className="col-span-3 text-center py-12 text-gray-500">
                    暂无相关内容
                  </div>
                )}
              </div>
            )}
          </>
        )}

        </div>

      {/* Edit Modal */}
      {showEditModal && selectedListing && (
        <EditModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onSubmit={handleUpdateListing}
          title={`编辑${getListingTitle(selectedListing)}`}
          initialData={selectedListing}
          fields={getListingFields(selectedListing.type)}
        />
      )}

      {/* Delete Confirm Dialog */}
      {showDeleteDialog && selectedListing && (
        <DeleteConfirmDialog
          isOpen={showDeleteDialog}
          onClose={() => setShowDeleteDialog(false)}
          onConfirm={handleDeleteListingConfirm}
          title="确认删除"
          itemName={getListingTitle(selectedListing)}
        />
      )}

      {/* Publish Modal */}
      {showPublishModal && (
        <PublishModal
          key={`publish-modal-${publishType}`}
          isOpen={showPublishModal}
          onClose={() => setShowPublishModal(false)}
          onSubmit={handlePublish}
          defaultType={publishType}
        />
      )}
    </div>
  );
};

export default Life;
