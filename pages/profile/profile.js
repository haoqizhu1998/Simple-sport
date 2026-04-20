// pages/profile/profile.js
Page({
  data: {
    userInfo: null,
    bodyStatus: {
      sleep: 7,
      fatigue: 5,
      mood: 5
    },
    currentRace: null,
    stats: {
      totalTrainings: 0,
      totalDistance: 0,
      totalDays: 0
    },
    action: ''
  },

  onLoad(options) {
    if (options.action) {
      this.setData({ action: options.action });
      // 如果是设置身体状态或赛事，直接打开设置
      if (options.action === 'bodyStatus') {
        this.showBodyStatusModal();
      } else if (options.action === 'setRace') {
        this.showRaceModal();
      }
    }
    this.loadData();
  },

  onShow() {
    this.loadData();
  },

  loadData() {
    const userInfo = wx.getStorageSync('userInfo') || {};
    const bodyStatus = wx.getStorageSync('bodyStatus') || { sleep: 7, fatigue: 5, mood: 5 };
    const currentRace = wx.getStorageSync('currentRace');
    const records = wx.getStorageSync('trainingRecords') || [];
    
    const totalDistance = records.reduce((sum, r) => sum + parseFloat(r.distance || 0), 0);
    const dates = [...new Set(records.map(r => r.date ? r.date.substring(0, 10) : ''))];
    
    this.setData({
      userInfo,
      bodyStatus,
      currentRace,
      stats: {
        totalTrainings: records.length,
        totalDistance: totalDistance.toFixed(1),
        totalDays: dates.length
      }
    });
  },

  onGotUserInfo(e) {
    if (e.detail.userInfo) {
      const userInfo = {
        ...e.detail.userInfo,
        openId: wx.getStorageSync('openId') || ''
      };
      wx.setStorageSync('userInfo', userInfo);
      this.setData({ userInfo });
    }
  },

  showBodyStatusModal() {
    this.setData({ showBodyStatus: true });
  },

  hideBodyStatusModal() {
    this.setData({ showBodyStatus: false, action: '' });
  },

  onSleepChange(e) {
    this.setData('bodyStatus.sleep', parseInt(e.detail.value));
  },

  onFatigueChange(e) {
    this.setData('bodyStatus.fatigue', parseInt(e.detail.value));
  },

  onMoodChange(e) {
    this.setData('bodyStatus.mood', parseInt(e.detail.value));
  },

  saveBodyStatus() {
    wx.setStorageSync('bodyStatus', this.data.bodyStatus);
    wx.showToast({ title: '保存成功', icon: 'success' });
    this.hideBodyStatusModal();
  },

  showRaceModal() {
    this.setData({ showRaceModal: true });
  },

  hideRaceModal() {
    this.setData({ showRaceModal: false, action: '' });
  },

  onRaceNameInput(e) {
    this.setData({ newRaceName: e.detail.value });
  },

  onRaceDateChange(e) {
    this.setData({ newRaceDate: e.detail.value });
  },

  onRaceTypeChange(e) {
    const types = ['run', 'triathlon', 'bike', 'swim'];
    this.setData({ newRaceType: types[e.detail.value] });
  },

  saveRace() {
    if (!this.data.newRaceName || !this.data.newRaceDate) {
      wx.showToast({ title: '请填写完整信息', icon: 'none' });
      return;
    }

    const typeMap = {
      'run': '马拉松',
      'triathlon': '铁人三项',
      'bike': '骑行赛',
      'swim': '游泳赛'
    };

    const race = {
      name: this.data.newRaceName,
      date: this.data.newRaceDate,
      type: this.data.newRaceType || 'run',
      typeText: typeMap[this.data.newRaceType] || '马拉松',
      preparationDays: 84
    };
    
    wx.setStorageSync('currentRace', race);
    this.setData({ currentRace: race });
    wx.showToast({ title: '赛事设置成功', icon: 'success' });
    this.hideRaceModal();
  },

  clearAllData() {
    wx.showModal({
      title: '确认清空',
      content: '确定要清空所有训练数据吗？此操作不可恢复',
      success: (res) => {
        if (res.confirm) {
          wx.removeStorageSync('trainingRecords');
          wx.showToast({ title: '已清空', icon: 'success' });
          this.loadData();
        }
      }
    });
  },

  about() {
    wx.showModal({
      title: 'Simple运动',
      content: '版本 1.0.0\n\n让健康运动变得触手可得',
      showCancel: false
    });
  }
})
