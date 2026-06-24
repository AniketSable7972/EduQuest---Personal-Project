import api from './axios';

export const authApi = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
};

export const userApi = {
  getProfile: () => api.get('/users/me'),
  updateProfile: (data) => api.put('/users/me', data),
  uploadPhoto: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/users/me/photo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

export const contestApi = {
  create: (data) => api.post('/contests', data),
  getHostContests: () => api.get('/contests/host'),
  getByRoom: (roomId) => api.get(`/contests/room/${roomId}`),
  join: (roomId) => api.post(`/contests/room/${roomId}/join`),
  start: (roomId) => api.post(`/contests/room/${roomId}/start`),
  end: (roomId) => api.post(`/contests/room/${roomId}/end`),
  submitAnswer: (roomId, data) => api.post(`/contests/room/${roomId}/answer`, data),
  getLeaderboard: (roomId) => api.get(`/contests/room/${roomId}/leaderboard`),
  getAnalytics: (roomId) => api.get(`/contests/room/${roomId}/analytics`),
  addQuestions: (roomId, questions) => api.post(`/contests/room/${roomId}/questions`, questions),
  generateQuestions: (data) => api.post('/contests/generate-questions', data),
};

export const analyticsApi = {
  getHistory: () => api.get('/analytics/history'),
  getStats: () => api.get('/analytics/stats'),
};
