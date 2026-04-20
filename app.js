// app.js
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
    }
  },

  onLaunch() {
    this.initLocalData();
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
