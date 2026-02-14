// API configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
const API_TIMEOUT = 30000; // 30 seconds timeout

// Helper function for API calls with timeout
async function apiCall(endpoint, options = {}) {
  const token = localStorage.getItem('token');

  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  // Create a timeout promise
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('API request timeout')), API_TIMEOUT);
  });

  try {
    // Race between fetch and timeout
    const response = await Promise.race([
      fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
      }),
      timeoutPromise
    ]);

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || data.error || 'API request failed');
    }

    return data;
  } catch (error) {
    if (error.message === 'API request timeout') {
      console.error('API Timeout:', endpoint);
    } else {
      console.error('API Error:', error);
    }
    throw error;
  }
}

// Auth API
export const authAPI = {
  login: (credentials) => apiCall('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  }),

  register: (userData) => apiCall('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  }),

  getProfile: () => apiCall('/auth/me'),

  updateProfile: (userData) => apiCall('/auth/profile', {
    method: 'PUT',
    body: JSON.stringify(userData),
  }),
};

// Campus API
export const campusAPI = {
  getAnnouncements: () => apiCall('/activities'),

  getAnnouncement: (id) => apiCall(`/activities/${id}`),

  createAnnouncement: (data) => apiCall('/activities', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  updateAnnouncement: (id, data) => apiCall(`/activities/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),

  deleteAnnouncement: (id) => apiCall(`/activities/${id}`, {
    method: 'DELETE',
  }),

  getActivities: () => apiCall('/activities'),

  getActivity: (id) => apiCall(`/activities/${id}`),

  getCollaborations: () => apiCall('/collaborations'),

  getVenues: () => apiCall('/venues'),

  createReservation: (bookingData) => apiCall('/venues/reservations', {
    method: 'POST',
    body: JSON.stringify(bookingData),
  }),

  getMyReservations: () => apiCall('/venues/reservations/my'),

  getMaterials: () => apiCall('/materials'),

  uploadMaterial: (resourceData) => apiCall('/materials', {
    method: 'POST',
    body: JSON.stringify(resourceData),
  }),

  updateMaterial: (id, data) => apiCall(`/materials/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),

  deleteMaterial: (id) => apiCall(`/materials/${id}`, {
    method: 'DELETE',
  }),

  getTips: () => apiCall('/tips'),

  createTip: (tipData) => apiCall('/tips', {
    method: 'POST',
    body: JSON.stringify(tipData),
  }),

  updateTip: (id, tipData) => apiCall(`/tips/${id}`, {
    method: 'PUT',
    body: JSON.stringify(tipData),
  }),

  getCommunities: () => apiCall('/groups'),

  updateCommunity: (id, data) => apiCall(`/groups/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),

  deleteCommunity: (id) => apiCall(`/groups/${id}`, {
    method: 'DELETE',
  }),
};

// Life API
export const lifeAPI = {
  getListings: (params) => apiCall(`/listings${params ? '?' + new URLSearchParams(params) : ''}`),

  getListing: (id) => apiCall(`/listings/${id}`),

  createListing: (tradeData) => apiCall('/listings', {
    method: 'POST',
    body: JSON.stringify(tradeData),
  }),

  updateListing: (id, tradeData) => apiCall(`/listings/${id}`, {
    method: 'PUT',
    body: JSON.stringify(tradeData),
  }),

  deleteListing: (id) => apiCall(`/listings/${id}`, {
    method: 'DELETE',
  }),

  getMyListings: () => apiCall('/listings/my/listings'),

  getOrders: () => apiCall('/orders/my/orders'),

  createOrder: (orderData) => apiCall('/orders', {
    method: 'POST',
    body: JSON.stringify(orderData),
  }),

  updateOrderStatus: (id, status) => apiCall(`/orders/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  }),

  cancelOrder: (id) => apiCall(`/orders/${id}`, {
    method: 'DELETE',
  }),
};

// Social API
export const socialAPI = {
  getGroups: (params) => apiCall(`/groups${params ? '?' + new URLSearchParams(params) : ''}`),

  getGroup: (id) => apiCall(`/groups/${id}`),

  createGroup: (data) => apiCall('/groups', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  joinGroup: (id) => apiCall(`/groups/${id}/join`, {
    method: 'POST',
  }),

  leaveGroup: (id) => apiCall(`/groups/${id}/leave`, {
    method: 'DELETE',
  }),

  getRecommended: () => apiCall('/groups/recommended/list'),

  createPost: (groupId, postData) => apiCall(`/groups/${groupId}/posts`, {
    method: 'POST',
    body: JSON.stringify(postData),
  }),

  getProjects: (params) => apiCall(`/projects${params ? '?' + new URLSearchParams(params) : ''}`),

  getProject: (id) => apiCall(`/projects/${id}`),

  createProject: (projectData) => apiCall('/projects', {
    method: 'POST',
    body: JSON.stringify(projectData),
  }),

  applyProject: (id, applicationData) => apiCall(`/projects/${id}/apply`, {
    method: 'POST',
    body: JSON.stringify(applicationData),
  }),

  acceptApplication: (projectId, applicationId) => apiCall(`/projects/${projectId}/applications/${applicationId}/accept`, {
    method: 'POST',
  }),

  rejectApplication: (projectId, applicationId) => apiCall(`/projects/${projectId}/applications/${applicationId}/reject`, {
    method: 'POST',
  }),

  getMyProjects: () => apiCall('/projects/my/projects'),

  randomMatch: (tags) => apiCall('/chat/random-match', {
    method: 'POST',
    body: JSON.stringify(tags),
  }),

  getChatHistory: (sessionId) => apiCall(`/chat/sessions/${sessionId}/messages`),

  sendMessage: (sessionId, messageData) => apiCall(`/chat/sessions/${sessionId}/messages`, {
    method: 'POST',
    body: JSON.stringify(messageData),
  }),

  getMyChats: () => apiCall('/chat/sessions/my'),
};

// Notification API
export const notificationAPI = {
  getNotifications: () => apiCall('/notifications'),

  getUnreadCount: () => apiCall('/notifications/unread-count'),

  markAsRead: (id) => apiCall(`/notifications/${id}/read`, {
    method: 'PUT',
  }),

  markAllAsRead: () => apiCall('/notifications/read-all', {
    method: 'PUT',
  }),
};

// AI Chat API
export const aiChatAPI = {
  sendMessage: (message, sessionId) => apiCall('/ai/chat', {
    method: 'POST',
    body: JSON.stringify({ message, sessionId }),
  }),

  getHistory: (sessionId) => {
    const url = sessionId
      ? `/ai/chat/history?sessionId=${sessionId}`
      : '/ai/chat/history';
    return apiCall(url);
  },

  getSessions: () => apiCall('/ai/chat/sessions'),

  createSession: (context) => apiCall('/ai/chat/sessions', {
    method: 'POST',
    body: JSON.stringify({ context }),
  }),

  clearHistory: (sessionId) => {
    const url = sessionId
      ? `/ai/chat/history?sessionId=${sessionId}`
      : '/ai/chat/history';
    return apiCall(url, { method: 'DELETE' });
  },

  deleteSession: (sessionId) => apiCall(`/ai/chat/sessions/${sessionId}`, {
    method: 'DELETE',
  }),

  getStatus: () => apiCall('/ai/status'),
};

export default apiCall;
