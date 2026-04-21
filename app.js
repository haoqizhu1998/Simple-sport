// app.js
const api = require('./utils/api.js');

App({
  globalData: {
    userInfo: null,
    trainingHistory: [],
    dailyGoal: {
      targetDistance: 5,
      targetTime: 30,
    },
    userProfile: {
      name: '',
      sportType: 'running',
      goal: '',
      targetRace: '',
      targetTime: '',
      totalTrainings: 0,
      totalDistance: 0
    },
    // API配置
    API_BASE_URL: 'http://你的服务器IP:3000/api'
  },

  onLaunch() {
    this.initLocalData();
    this.initAPI();
  },

  // 初始化API配置
  initAPI() {
    // 从本地存储读取配置的API地址
    const savedBaseUrl = wx.getStorageSync('apiBaseUrl');
    if (savedBaseUrl) {
      api.setBaseUrl(savedBaseUrl);
      this.globalData.API_BASE_URL = savedBaseUrl;
    } else {
      api.setBaseUrl(this.globalData.API_BASE_URL);
    }
  },

  // 设置API地址
  setAPIUrl(url) {
    this.globalData.API_BASE_URL = url;
    api.setBaseUrl(url);
    wx.setStorageSync('apiBaseUrl', url);
  },

  initLocalData() {
    try {
      const userProfile = wx.getStorageSync('userProfile');
      const trainingHistory = wx.getStorageSync('trainingHistory') || [];
      
      if (userProfile) {
        this.globalData.userProfile = userProfile;
      }
      this.globalData.trainingHistory = trainingHistory;
    } catch (e) {
      console.error('初始化数据失败:', e);
    }
  },

  saveUserProfile(profile) {
    this.globalData.userProfile = profile;
    try {
      wx.setStorageSync('userProfile', profile);
    } catch (e) {
      console.error('保存用户信息失败:', e);
    }
  },

  saveTrainingRecord(record) {
    this.globalData.trainingHistory.unshift(record);
    try {
      wx.setStorageSync('trainingHistory', this.globalData.trainingHistory);
      
      const profile = this.globalData.userProfile;
      profile.totalTrainings = this.globalData.trainingHistory.length;
      profile.totalDistance = this.globalData.trainingHistory.reduce((sum, item) => sum + (parseFloat(item.distance) || 0), 0);
      this.saveUserProfile(profile);
    } catch (e) {
      console.error('保存训练记录失败:', e);
    }
  },

  getTrainingHistory() {
    try {
      return wx.getStorageSync('trainingHistory') || [];
    } catch (e) {
      console.error('获取训练历史失败:', e);
      return [];
    }
  }
})
