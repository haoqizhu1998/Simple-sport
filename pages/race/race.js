// pages/race/race.js
const utils = require('../../utils/utils.js');

Page({
  data: {
    currentRace: null,
    trainingPlan: null,
    countdown: 0,
    daysUntilRace: 0,
    progress: 0
  },

  onLoad() {
    this.loadRaceData();
  },

  onShow() {
    this.loadRaceData();
  },

  loadRaceData() {
    const race = wx.getStorageSync('currentRace');
    const trainingRecords = wx.getStorageSync('trainingRecords') || [];
    
    if (race) {
      const daysUntil = this.calculateDaysUntil(race.date);
      const totalDays = race.preparationDays || 84;
      const progress = Math.round(((totalDays - daysUntil) / totalDays) * 100);
      
      this.setData({
        currentRace: race,
        daysUntilRace: daysUntil,
        progress: progress > 0 ? progress : 0,
        trainingPlan: this.generateTrainingPlan(race, daysUntil)
      });
    } else {
      this.setData({
        currentRace: null
      });
    }
  },

  calculateDaysUntil(dateStr) {
    const target = new Date(dateStr);
    const today = new Date();
    const diff = target - today;
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  },

  generateTrainingPlan(race, daysUntil) {
    if (!race) return null;
    
    // 生成简化的训练计划摘要
    const weekTraining = {
      swim: '2-3次',
      bike: '2-3次',
      run: '3-4次',
      strength: '1-2次'
    };
    
    const focusThisWeek = daysUntil <= 7 ? '减量恢复' : 
                          daysUntil <= 14 ? '保持状态' : '持续积累';
    
    return {
      weeklyTraining: weekTraining,
      focusThisWeek: focusThisWeek,
      nutrition: race.type === 'triathlon' ? '注意碳水化合物摄入' : '比赛前注意补糖',
      tips: daysUntil <= 7 ? '减少训练量，保证睡眠' : '保持训练节奏'
    };
  },

  setRace() {
    wx.navigateTo({
      url: '/pages/profile/profile?action=setRace'
    });
  },

  viewHistory() {
    wx.switchTab({
      url: '/pages/history/history'
    });
  }
})
