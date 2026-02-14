import { Link } from 'react-router-dom';
import AdminActions from './AdminActions';

const Card = ({ children, className = '', hover = true, onClick }) => {
  return (
    <div
      className={`bg-white rounded-xl border border-gray-200 shadow-sm p-4 ${
        hover ? 'hover:shadow-md transition-shadow cursor-pointer' : ''
      } ${onClick ? 'cursor-pointer' : ''} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export const ActivityCard = ({ activity, onEdit, onDelete }) => {
  if (!activity) {
    return (
      <Card>
        <div className="text-center text-gray-500 py-8">加载中...</div>
      </Card>
    );
  }

  // Map API response fields to component expectations
  const category = activity.category || activity.type || '活动';
  const content = activity.content || activity.description || '';
  const coverImage = activity.coverImage || activity.cover_image;
  const publisherName = activity.publisher?.nickname || activity.publisher_name || '管理员';
  const maxParticipants = activity.max_participants;
  const currentParticipants = activity.registration_count || activity.current_participants || 0;

  const categoryLabels = {
    sports: '体育活动',
    academic: '学术讲座',
    general: '综合活动',
    culture: '文化活动',
    volunteer: '志愿活动',
  };

  return (
    <Card hover={!onEdit}>
      <div onClick={() => !onEdit && window.location.assign(`/campus/announcements/${activity.id}`)}>
        {coverImage && (
          <img
            src={coverImage}
            alt={activity.title}
            className="w-full h-40 object-cover rounded-lg mb-3"
          />
        )}
        <div className="flex items-center justify-between mb-2">
          <span className="px-2 py-1 bg-primary-lighter text-primary text-xs rounded">
            {categoryLabels[category] || category}
          </span>
          {activity.isPinned && (
            <span className="px-2 py-1 bg-error/10 text-error text-xs rounded">
              置顶
            </span>
          )}
        </div>
        <h3 className="font-medium text-gray-700 mb-2 line-clamp-2">
          {activity.title}
        </h3>
        <p className="text-sm text-gray-500 line-clamp-2 mb-2">
          {content}
        </p>
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>{publisherName}</span>
          <span>
            {maxParticipants ? `${maxParticipants}人` : '不限'}
            {currentParticipants > 0 && ` (${currentParticipants}人已报名)`}
          </span>
        </div>
      </div>

      {/* Admin Actions */}
      {(onEdit || onDelete) && (
        <AdminActions
          onEdit={() => onEdit(activity)}
          onDelete={() => onDelete(activity)}
          type="activity"
        />
      )}
    </Card>
  );
};

export const TradeCard = ({ trade, onEdit, onDelete }) => {
  if (!trade) {
    return (
      <Card>
        <div className="text-center text-gray-500 py-8">加载中...</div>
      </Card>
    );
  }

  const statusColors = {
    AVAILABLE: 'bg-success/10 text-success',
    RESERVED: 'bg-warning/10 text-warning',
    SOLD: 'bg-gray-100 text-gray-500',
    REMOVED: 'bg-error/10 text-error',
  };

  const statusLabels = {
    AVAILABLE: '可交易',
    RESERVED: '已预订',
    SOLD: '已售出',
    REMOVED: '已下架',
  };

  return (
    <Card hover={!onEdit}>
      <div onClick={() => !onEdit && window.location.assign(`/life/trades/${trade.id}`)}>
        {trade.images && trade.images.length > 0 && (
          <img
            src={JSON.parse(trade.images)[0]}
            alt={trade.title}
            className="w-full h-40 object-cover rounded-lg mb-3"
          />
        )}
        <div className="flex items-center justify-between mb-2">
          <span className="text-lg font-semibold text-primary">
            ¥{trade.price}
          </span>
          <span className={`px-2 py-1 text-xs rounded ${statusColors[trade.status]}`}>
            {statusLabels[trade.status]}
          </span>
        </div>
        <h3 className="font-medium text-gray-700 mb-2 line-clamp-2">
          {trade.title}
        </h3>
        <p className="text-sm text-gray-500 line-clamp-2 mb-2">
          {trade.description}
        </p>
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>{trade.condition}</span>
          <span>{trade.viewCount} 浏览</span>
        </div>
      </div>

      {/* Admin Actions */}
      {(onEdit || onDelete) && (
        <AdminActions
          onEdit={() => onEdit(trade)}
          onDelete={() => onDelete(trade)}
          type="listing"
        />
      )}
    </Card>
  );
};

export const CommunityCard = ({ community, onEdit, onDelete }) => {
  if (!community) {
    return (
      <Card>
        <div className="text-center text-gray-500 py-8">加载中...</div>
      </Card>
    );
  }

  // Map API response fields to component expectations
  const category = community.category || community.type || '社群';
  const memberCount = community.memberCount || community.member_count || 0;

  return (
    <Card hover={!onEdit}>
      <div onClick={() => !onEdit && window.location.assign(`/social/communities/${community.id}`)}>
        <div className="flex items-center space-x-3 mb-3">
          <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary-light rounded-full flex items-center justify-center text-white font-bold">
            {community.name.charAt(0)}
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-gray-700">{community.name}</h3>
            <p className="text-xs text-gray-500">{category}</p>
          </div>
        </div>
        <p className="text-sm text-gray-500 line-clamp-2 mb-3">
          {community.description}
        </p>
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>{memberCount} 成员</span>
          <span>加入社群 →</span>
        </div>
      </div>

      {/* Admin Actions */}
      {(onEdit || onDelete) && (
        <AdminActions
          onEdit={() => onEdit(community)}
          onDelete={() => onDelete(community)}
          type="community"
        />
      )}
    </Card>
  );
};

export const JobCard = ({ job, onEdit, onDelete }) => {
  if (!job) {
    return (
      <Card>
        <div className="text-center text-gray-500 py-8">加载中...</div>
      </Card>
    );
  }

  return (
    <Card hover={!onEdit}>
      <div onClick={() => !onEdit && window.location.assign(`/life/jobs/${job.id}`)}>
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-medium text-gray-700">{job.title}</h3>
          <span className="text-lg font-semibold text-primary">{job.salary}</span>
        </div>
        <p className="text-sm text-gray-500 mb-2">{job.company}</p>
        <p className="text-sm text-gray-500 line-clamp-2 mb-3">
          {job.description}
        </p>
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>{job.location}</span>
          <span>{job.workTime}</span>
        </div>
      </div>

      {/* Admin Actions */}
      {(onEdit || onDelete) && (
        <AdminActions
          onEdit={() => onEdit(job)}
          onDelete={() => onDelete(job)}
          type="job"
        />
      )}
    </Card>
  );
};

// ListingCard for Life listings from API
export const ListingCard = ({ listing, onEdit, onDelete }) => {
  if (!listing) {
    return (
      <Card>
        <div className="text-center text-gray-500 py-8">加载中...</div>
      </Card>
    );
  }

  const statusColors = {
    AVAILABLE: 'bg-success/10 text-success',
    RESERVED: 'bg-warning/10 text-warning',
    SOLD: 'bg-gray-100 text-gray-500',
    REMOVED: 'bg-error/10 text-error',
    PENDING: 'bg-info/10 text-info',
  };

  const statusLabels = {
    AVAILABLE: '可交易',
    RESERVED: '已预订',
    SOLD: '已售出',
    REMOVED: '已下架',
    PENDING: '待审核',
  };

  // Get display title based on listing type
  const getDisplayTitle = () => {
    if (listing.type === 'delivery') {
      // Use title first, then fallback to pickup_location
      return listing.title || (listing.pickup_location ? `代取: ${listing.pickup_location}` : '外卖代取');
    }
    if (listing.type === 'lost-found') {
      // Use title first, then fallback to item_name
      return listing.title || listing.item_name || '失物招领';
    }
    if (listing.type === 'part-time') {
      return listing.title || '兼职信息';
    }
    return listing.title || '商品信息';
  };

  // Get display price/reward based on listing type
  const getDisplayPrice = () => {
    if (listing.type === 'delivery' && listing.reward !== undefined) {
      return `¥${listing.reward}`;
    }
    if (listing.type === 'part-time' && listing.salary) {
      return listing.salary;
    }
    if (listing.price !== undefined) {
      return `¥${listing.price}`;
    }
    return null;
  };

  // Parse description if it's a JSON string (for certain types stored as JSON by backend)
  const parseDescription = () => {
    if (!listing.description) return null;

    // Try to parse as JSON
    try {
      const parsed = JSON.parse(listing.description);
      // If it's an object with description property, return that
      if (parsed && typeof parsed === 'object' && parsed.description) {
        return parsed.description;
      }
    } catch (e) {
      // Not JSON, return as-is
    }
    return listing.description;
  };

  // Get display description
  const getDisplayDescription = () => {
    const parsedDesc = parseDescription();

    if (listing.type === 'delivery') {
      // Use description first, then fallback to delivery_address
      return parsedDesc || listing.delivery_address || '';
    }
    if (listing.type === 'lost-found') {
      // Use description first, then fallback to location
      return parsedDesc || listing.location || '';
    }
    if (listing.type === 'part-time') {
      // Use description first, then fallback to requirements
      return parsedDesc || listing.requirements || '';
    }
    return parsedDesc || '';
  };

  const displayTitle = getDisplayTitle();
  const displayPrice = getDisplayPrice();
  const displayDescription = getDisplayDescription();

  return (
    <Card hover={!onEdit}>
      <div onClick={() => !onEdit && window.location.assign(`/life/listings/${listing.id}`)}>
        {listing.images && listing.images.length > 0 && (
          <img
            src={typeof listing.images === 'string' ? JSON.parse(listing.images)[0] : listing.images[0]}
            alt={displayTitle}
            className="w-full h-40 object-cover rounded-lg mb-3"
          />
        )}
        <div className="flex items-center justify-between mb-2">
          {displayPrice && (
            <span className="text-lg font-semibold text-primary">
              {displayPrice}
            </span>
          )}
          <span className={`px-2 py-1 text-xs rounded ${statusColors[listing.status] || statusColors.AVAILABLE}`}>
            {statusLabels[listing.status] || listing.status}
          </span>
        </div>
        <h3 className="font-medium text-gray-700 mb-2 line-clamp-2">
          {displayTitle}
        </h3>
        <p className="text-sm text-gray-500 line-clamp-2 mb-2">
          {displayDescription}
        </p>
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>{listing.type === 'second-hand' ? (listing.condition || '二手') : listing.type}</span>
          {listing.view_count !== undefined && <span>{listing.view_count} 浏览</span>}
        </div>
      </div>

      {/* Admin Actions */}
      {(onEdit || onDelete) && (
        <AdminActions
          onEdit={() => onEdit(listing)}
          onDelete={() => onDelete(listing)}
          type="listing"
        />
      )}
    </Card>
  );
};

export const ProjectCard = ({ project }) => {
  if (!project) {
    return (
      <Card>
        <div className="text-center text-gray-500 py-8">加载中...</div>
      </Card>
    );
  }

  return (
    <Card hover>
      <Link to={`/social/projects/${project.id}`}>
        <div className="flex items-center justify-between mb-2">
          <span className="px-2 py-1 bg-primary-lighter text-primary text-xs rounded">
            {project.category}
          </span>
          <span className="px-2 py-1 bg-warning/10 text-warning text-xs rounded">
            {project.status}
          </span>
        </div>
        <h3 className="font-medium text-gray-700 mb-2">{project.title}</h3>
        <p className="text-sm text-gray-500 line-clamp-3 mb-3">
          {project.description}
        </p>
        <div className="flex flex-wrap gap-1 mb-2">
          {project.requiredSkills.split(',').slice(0, 3).map((skill, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
            >
              {skill.trim()}
            </span>
          ))}
        </div>
      </Link>
    </Card>
  );
};

export const ResourceCard = ({ resource, onEdit, onDelete }) => {
  if (!resource) {
    return (
      <Card>
        <div className="text-center text-gray-500 py-8">加载中...</div>
      </Card>
    );
  }

  // Map API response fields to component expectations
  const category = resource.category || resource.type || '资料';
  const downloadCount = resource.download_count || resource.downloadCount || 0;

  return (
    <Card hover={!onEdit}>
      <div onClick={() => !onEdit && window.location.assign(`/campus/resources/${resource.id}`)}>
        <div className="flex items-start space-x-3">
          <div className="w-12 h-12 bg-primary-lighter rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-primary font-bold text-xs">
              {category === 'PDF' ? 'PDF' : category.slice(0, 4)}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-gray-700 mb-1 line-clamp-2">
              {resource.title}
            </h3>
            <p className="text-sm text-gray-500 line-clamp-1 mb-1">
              {resource.description}
            </p>
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span>{category}</span>
              <span>{downloadCount} 下载</span>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Actions */}
      {(onEdit || onDelete) && (
        <AdminActions
          onEdit={() => onEdit(resource)}
          onDelete={() => onDelete(resource)}
          type="resource"
        />
      )}
    </Card>
  );
};

// CollaborationCard for department collaborations
export const CollaborationCard = ({ collaboration, onEdit, onDelete }) => {
  if (!collaboration) {
    return (
      <Card>
        <div className="text-center text-gray-500 py-8">加载中...</div>
      </Card>
    );
  }

  // Map API response fields
  const creatorName = collaboration.creator_name || collaboration.creator?.nickname || '管理员';
  const progress = collaboration.progress || Math.round((collaboration.completed_tasks || 0) / (collaboration.total_tasks || 1) * 100);

  const priorityColors = {
    low: 'bg-green-100 text-green-700',
    medium: 'bg-yellow-100 text-yellow-700',
    high: 'bg-red-100 text-red-700',
  };

  const priorityLabels = {
    low: '低优先级',
    medium: '中优先级',
    high: '高优先级',
  };

  return (
    <Card hover={!onEdit}>
      <div onClick={() => !onEdit && window.location.assign(`/campus/collaboration/${collaboration.id}`)}>
        <div className="flex items-center justify-between mb-2">
          <span className={`px-2 py-1 text-xs rounded ${priorityColors[collaboration.priority] || priorityColors.medium}`}>
            {priorityLabels[collaboration.priority] || '中优先级'}
          </span>
          {collaboration.department && (
            <span className="px-2 py-1 bg-primary-lighter text-primary text-xs rounded">
              {collaboration.department}
            </span>
          )}
        </div>
        <h3 className="font-medium text-gray-700 mb-2 line-clamp-2">
          {collaboration.title}
        </h3>
        <p className="text-sm text-gray-500 line-clamp-2 mb-3">
          {collaboration.description}
        </p>
        <div className="mb-2">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
            <span>进度</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>{creatorName}</span>
          <span>{collaboration.completed_tasks || 0}/{collaboration.total_tasks || 0} 任务</span>
        </div>
      </div>

      {/* Admin Actions */}
      {(onEdit || onDelete) && (
        <AdminActions
          onEdit={() => onEdit(collaboration)}
          onDelete={() => onDelete(collaboration)}
          type="collaboration"
        />
      )}
    </Card>
  );
};

// VenueCard for venue reservations
export const VenueCard = ({ venue, onEdit, onDelete }) => {
  if (!venue) {
    return (
      <Card>
        <div className="text-center text-gray-500 py-8">加载中...</div>
      </Card>
    );
  }

  const typeColors = {
    sports: 'bg-blue-100 text-blue-700',
    study: 'bg-purple-100 text-purple-700',
    meeting: 'bg-green-100 text-green-700',
    performance: 'bg-orange-100 text-orange-700',
  };

  const typeLabels = {
    sports: '体育场馆',
    study: '学习空间',
    meeting: '会议室',
    performance: '演出场所',
  };

  return (
    <Card hover={!onEdit}>
      <div onClick={() => !onEdit && window.location.assign(`/campus/venues/${venue.id}`)}>
        <div className="flex items-center justify-between mb-2">
          <span className={`px-2 py-1 text-xs rounded ${typeColors[venue.type] || typeColors.study}`}>
            {typeLabels[venue.type] || venue.type}
          </span>
          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
            {venue.capacity || '-'} 人
          </span>
        </div>
        <h3 className="font-medium text-gray-700 mb-2">
          {venue.name}
        </h3>
        <p className="text-sm text-gray-500 mb-3 flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {venue.location}
        </p>
        {venue.facilities && Array.isArray(venue.facilities) && venue.facilities.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {venue.facilities.slice(0, 3).map((facility, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
              >
                {facility}
              </span>
            ))}
            {venue.facilities.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                +{venue.facilities.length - 3}
              </span>
            )}
          </div>
        )}
        <div className="text-xs text-gray-400">
          {venue.available_time_start || '-'} - {venue.available_time_end || '-'}
        </div>
      </div>

      {/* Admin Actions */}
      {(onEdit || onDelete) && (
        <AdminActions
          onEdit={() => onEdit(venue)}
          onDelete={() => onDelete(venue)}
          type="venue"
        />
      )}
    </Card>
  );
};

// TipCard for campus tips
export const TipCard = ({ tip, onEdit, onDelete }) => {
  if (!tip) {
    return (
      <Card>
        <div className="text-center text-gray-500 py-8">加载中...</div>
      </Card>
    );
  }

  const categoryColors = {
    study: 'bg-blue-100 text-blue-700',
    life: 'bg-green-100 text-green-700',
    course: 'bg-purple-100 text-purple-700',
    facility: 'bg-orange-100 text-orange-700',
    activity: 'bg-pink-100 text-pink-700',
    other: 'bg-gray-100 text-gray-700',
    // Support Chinese category names
    '学习': 'bg-blue-100 text-blue-700',
    '学习指南': 'bg-blue-100 text-blue-700',
    '生活贴士': 'bg-green-100 text-green-700',
    '选课攻略': 'bg-purple-100 text-purple-700',
    '选课指导': 'bg-purple-100 text-purple-700',
    '设施使用': 'bg-orange-100 text-orange-700',
    '活动指南': 'bg-pink-100 text-pink-700',
    '其他': 'bg-gray-100 text-gray-700',
  };

  const categoryLabels = {
    study: '学习指南',
    life: '生活贴士',
    course: '选课攻略',
    facility: '设施使用',
    activity: '活动指南',
    other: '其他',
  };

  const editorName = tip.editor_name || tip.editor?.nickname || '管理员';

  // Get category display - use Chinese directly if available
  const getCategoryDisplay = () => {
    return tip.category || '其他';
  };

  // Get category color
  const getCategoryColor = () => {
    return categoryColors[tip.category] || categoryColors.other;
  };

  return (
    <Card hover={!onEdit}>
      <div onClick={() => !onEdit && window.location.assign(`/campus/tips/${tip.id}`)}>
        <div className="flex items-center justify-between mb-2">
          <span className={`px-2 py-1 text-xs rounded ${getCategoryColor()}`}>
            {getCategoryDisplay()}
          </span>
          {tip.version && tip.version > 1 && (
            <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded">
              v{tip.version}
            </span>
          )}
        </div>
        <h3 className="font-medium text-gray-700 mb-2 line-clamp-2">
          {tip.title}
        </h3>
        <p className="text-sm text-gray-500 line-clamp-3 mb-3">
          {tip.content}
        </p>
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>{editorName}</span>
          {tip.updated_at && (
            <span>{new Date(tip.updated_at).toLocaleDateString()}</span>
          )}
        </div>
      </div>

      {/* Admin Actions */}
      {(onEdit || onDelete) && (
        <AdminActions
          onEdit={() => onEdit(tip)}
          onDelete={() => onDelete(tip)}
          type="tip"
        />
      )}
    </Card>
  );
};

export default Card;
