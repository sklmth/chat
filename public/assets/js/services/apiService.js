// HTTP API 服务
const apiService = {
  // 基础请求方法
  async request(url, options = {}) {
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        ...options
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Request failed');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },

  // GET 请求
  async get(url) {
    return this.request(url, { method: 'GET' });
  },

  // POST 请求
  async post(url, body) {
    return this.request(url, {
      method: 'POST',
      body: JSON.stringify(body)
    });
  },

  // 获取房间列表
  async getRooms() {
    return this.get('/api/rooms');
  },

  // 健康检查
  async healthCheck() {
    return this.get('/api/health');
  }
};
