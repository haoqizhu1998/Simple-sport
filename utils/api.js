/**
 * API请求工具 - 连接后端Node.js服务
 * 部署后请在 app.js 中配置 API_BASE_URL
 */

const API_BASE_URL = 'http://47.111.170.178:3000/api';  // 部署后修改为实际地址

/**
 * Promise封装wx.request
 */
const request = (options) => {
  return new Promise((resolve, reject) => {
    const token = wx.getStorageSync('token');

    wx.request({
      url: API_BASE_URL + options.url,
      method: options.method || 'GET',
      data: options.data,
      header: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
      },
      success: (res) => {
        if (options.showLoading !== false) {
          wx.hideLoading();
        }
        if (res.data.code === 0) {
          resolve(res.data.data);
        } else {
          wx.showToast({ title: res.data.msg || '请求失败', icon: 'none' });
          reject(res.data);
        }
      },
      fail: (err) => {
        if (options.showLoading !== false) {
          wx.hideLoading();
        }
        wx.showToast({ title: '网络错误', icon: 'none' });
        reject(err);
      }
    });
  });
};

// 导出各模块API
module.exports = {
  // 认证
  login: (data) => request({ url: '/auth/login', method: 'POST', data }),
  logout: () => request({ url: '/auth/logout', method: 'POST' }),
  
  // 用户
  getUserInfo: () => request({ url: '/user/info' }),
  updateUserInfo: (data) => request({ url: '/user/info', method: 'PUT', data }),
  getUserStats: () => request({ url: '/user/stats' }),
  
  // 健康档案
  getHealthProfile: () => request({ url: '/health' }),
  updateHealthProfile: (data) => request({ url: '/health', method: 'PUT', data }),
  
  // 数据连接
  getConnections: () => request({ url: '/connections' }),
  addConnection: (data) => request({ url: '/connections', method: 'POST', data }),
  deleteConnection: (platform) => request({ url: `/connections/${platform}`, method: 'DELETE' }),
  
  // 勋章
  getMedals: () => request({ url: '/medals' }),
  
  // 训练记录
  getTrainingHistory: () => request({ url: '/training/history' }),
  addTraining: (data) => request({ url: '/training', method: 'POST', data }),
  deleteTraining: (id) => request({ url: `/training/${id}`, method: 'DELETE' }),
  
  // AI训练分析
  analyzeTraining: (data) => request({ url: '/training/analyze', method: 'POST', data }),
  
  // 导出API_BASE_URL供外部配置
  setBaseUrl: (url) => {
    module.exports.API_BASE_URL = url;
    wx.setStorageSync('apiBaseUrl', url);
  },
  getBaseUrl: () => API_BASE_URL
};
