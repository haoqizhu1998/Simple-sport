// pages/profile/profile.js
const app = getApp();
const utils = require('../../utils/utils.js');

Page({
  data: {
    userProfile: {
      name: '',
      sportType: 'running',
      goal: '',
      targetRace: '',
      targetTime: '',
      totalTrainings: 0,
      totalDistance: 0
    },
    sportTypeOptions: [
      { key: 'running', name: '跑步', icon: '🏃' },
      { key: 'triathlon', name: '铁三', icon: '🚴' },
      { key: 'swimming', name: '游泳', icon: '🏊' },
      { key: 'cycling', name: '骑行', icon: '🚵' },
      { key: 'other', name: '其他', icon: '⭐' }
    ],
    isEditing: false,
    editForm: {}
  },

  onLoad() {
    this.loadProfile();
  },

  onShow() {
    this.loadProfile();
  },

  loadProfile() {
    const profile = app.globalData.userProfile || {};
    this.setData({
      userProfile: {
        name: profile.name || '运动达人',
        sportType: profile.sportType || 'running',
        goal: profile.goal || '',
        targetRace: profile.targetRace || '',
        targetTime: profile.targetTime || '',
        totalTrainings: profile.totalTrainings || 0,
        totalDistance: profile.totalDistance || 0
      }
    });
  },

  // 编辑资料
  startEdit() {
    this.setData({
      isEditing: true,
      editForm: { ...this.data.userProfile }
    });
  },

  // 取消编辑
  cancelEdit() {
    this.setData({
      isEditing: false,
      editForm: {}
    });
  },

  // 输入处理
  onNameInput(e) {
    this.setData({
      'editForm.name': e.detail.value
    });
  },

  onSportTypeChange(e) {
    const index = e.detail.value;
    const sportType = this.data.sportTypeOptions[index].key;
    this.setData({
      'editForm.sportType': sportType
    });
  },

  onGoalInput(e) {
    this.setData({
      'editForm.goal': e.detail.value
    });
  },

  onTargetRaceInput(e) {
    this.setData({
      'editForm.targetRace': e.detail.value
    });
  },

  onTargetTimeInput(e) {
    this.setData({
      'editForm.targetTime': e.detail.value
    });
  },

  // 保存资料
  saveProfile() {
    const { editForm } = this.data;
    
    if (!editForm.name || editForm.name.trim() === '') {
      wx.showToast({
        title: '请输入姓名',
        icon: 'none'
      });
      return;
    }

    const profile = {
      ...app.globalData.userProfile,
      ...editForm
    };

    app.saveUserProfile(profile);

    this.setData({
      userProfile: profile,
      isEditing: false
    });

    wx.showToast({
      title: '保存成功',
      icon: 'success'
    });
  },

  // 获取运动类型名称
  getSportTypeName(key) {
    const option = this.data.sportTypeOptions.find(item => item.key === key);
    return option ? `${option.icon} ${option.name}` : '🏃 跑步';
  },

  // 清除数据
  clearAllData() {
    wx.showModal({
      title: '警告',
      content: '确定要清除所有训练数据吗？此操作不可恢复！',
      success: (res) => {
        if (res.confirm) {
          wx.showModal({
            title: '再次确认',
            content: '请再次确认，清除后数据将无法恢复',
            success: (res2) => {
              if (res2.confirm) {
                wx.clearStorageSync();
                app.globalData.userProfile = {};
                app.globalData.trainingHistory = [];
                this.loadProfile();
                wx.showToast({
                  title: '数据已清除',
                  icon: 'success'
                });
              }
            }
          });
        }
      }
    });
  },

  // 关于我们
  showAbout() {
    wx.showModal({
      title: '关于 Simple运动',
      content: 'Simple运动 V1.0\n\nAI训练复盘助手，帮助你科学分析训练效果，提升运动表现。\n\n© 2024 Simple运动',
      showCancel: false
    });
  },

  // 意见反馈
  feedback() {
    wx.showToast({
      title: '功能开发中',
      icon: 'none'
    });
  }
})
