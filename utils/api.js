/**
 * API配置 - 连接Vercel部署的Web API
 */

const API_BASE_URL = 'https://training-ai-psi.vercel.app';

/**
 * Promise封装wx.request
 */
const request = (options) => {
  return new Promise((resolve, reject) => {
    if (options.showLoading !== false) {
      wx.showLoading({
        title: options.loadingText || '加载中...',
        mask: true
      });
    }

    wx.request({
      url: API_BASE_URL + options.url,
      method: options.method || 'GET',
      data: options.data || {},
      header: {
        'content-type': 'application/json',
        ...options.header
      },
      success: (res) => {
        if (options.showLoading !== false) {
          wx.hideLoading();
        }
        if (res.statusCode === 200) {
          resolve(res.data);
        } else {
          wx.showToast({
            title: res.data.error || '请求失败',
            icon: 'none'
          });
          reject(res.data);
        }
      },
      fail: (err) => {
        if (options.showLoading !== false) {
          wx.hideLoading();
        }
        wx.showToast({
          title: '网络请求失败',
          icon: 'none'
        });
        reject(err);
      }
    });
  });
};

/**
 * AI训练分析 - 调用Vercel API
 * @param {Object} data - 训练数据
 * @param {string} data.date - 日期
 * @param {string} data.type - 类型 (run/bike/swim/strength)
 * @param {number} data.distance - 距离(km)
 * @param {number} data.duration - 时长(分钟)
 * @param {number} data.avgHR - 平均心率
 * @param {number} [data.maxHR] - 最大心率
 * @param {string} [data.avgPace] - 配速 (mm:ss)
 * @param {number} data.rpe - 主观疲劳度 (1-10)
 * @param {string} [data.notes] - 备注
 * @param {number} [data.elevation] - 爬升(m)
 */
const analyzeTraining = (data) => {
  return new Promise((resolve, reject) => {
    wx.showLoading({
      title: 'AI分析中...',
      mask: true
    });

    request({
      url: '/api/analyze',
      method: 'POST',
      data: {
        date: data.date,
        type: data.type || 'run',
        distance: parseFloat(data.distance) || 0,
        duration: parseInt(data.duration) || 0,
        avgHR: parseInt(data.avgHR) || 0,
        maxHR: data.maxHR ? parseInt(data.maxHR) : undefined,
        avgPace: data.avgPace,
        rpe: parseInt(data.rpe) || 5,
        notes: data.notes,
        elevation: data.elevation ? parseInt(data.elevation) : undefined
      },
      showLoading: false
    }).then(res => {
      wx.hideLoading();
      if (res.error) {
        wx.showToast({
          title: res.error,
          icon: 'none'
        });
        reject(res);
      } else {
        resolve(res);
      }
    }).catch(err => {
      wx.hideLoading();
      wx.showToast({
        title: '分析失败，请重试',
        icon: 'none'
      });
      reject(err);
    });
  });
};

/**
 * 保存训练记录到本地
 */
const saveTrainingRecord = (record) => {
  const records = wx.getStorageSync('trainingRecords') || [];
  records.unshift({
    ...record,
    id: `training_${Date.now()}`,
    createdAt: new Date().toISOString()
  });
  wx.setStorageSync('trainingRecords', records);
  return records;
};

/**
 * 获取本地训练记录
 */
const getTrainingRecords = () => {
  return wx.getStorageSync('trainingRecords') || [];
};

/**
 * 删除训练记录
 */
const deleteTrainingRecord = (id) => {
  let records = wx.getStorageSync('trainingRecords') || [];
  records = records.filter(r => r.id !== id);
  wx.setStorageSync('trainingRecords', records);
  return records;
};

/**
 * 保存用户信息
 */
const saveUserProfile = (profile) => {
  wx.setStorageSync('userProfile', profile);
  return profile;
};

/**
 * 获取用户信息
 */
const getUserProfile = () => {
  return wx.getStorageSync('userProfile') || {};
};

module.exports = {
  API_BASE_URL,
  analyzeTraining,
  saveTrainingRecord,
  getTrainingRecords,
  deleteTrainingRecord,
  saveUserProfile,
  getUserProfile,
  request
};
