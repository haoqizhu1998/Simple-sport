// app.js
App({
  globalData: {
    userInfo: null,
    trainingHistory: [],
    dailyGoal: {
      targetDistance: 5, // km
      targetTime: 30, // min
    },
    userProfile: {
      name: '',
      sportType: 'running', // running, triathlon, other
      goal: '',
      targetRace: '',
      targetTime: '',
      totalTrainings: 0,
      totalDistance: 0
    }
  },

  onLaunch() {
    // 初始化本地数据
    this.initLocalData();
  },

  initLocalData() {
    // 从本地存储加载用户数据
    const userProfile = wx.getStorageSync('userProfile');
    const trainingHistory = wx.getStorageSync('trainingHistory') || [];
    
    if (userProfile) {
      this.globalData.userProfile = userProfile;
    }
    this.globalData.trainingHistory = trainingHistory;
  },

  saveUserProfile(profile) {
    this.globalData.userProfile = profile;
    wx.setStorageSync('userProfile', profile);
  },

  saveTrainingRecord(record) {
    this.globalData.trainingHistory.unshift(record);
    wx.setStorageSync('trainingHistory', this.globalData.trainingHistory);
    
    // 更新统计数据
    const profile = this.globalData.userProfile;
    profile.totalTrainings = this.globalData.trainingHistory.length;
    profile.totalDistance = this.globalData.trainingHistory.reduce((sum, item) => sum + (parseFloat(item.distance) || 0), 0);
    this.saveUserProfile(profile);
  },

  getTrainingHistory() {
    return wx.getStorageSync('trainingHistory') || [];
  }
})
