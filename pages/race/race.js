// pages/race/race.js
const app = getApp();

Page({
  data: {
    currentRace: null,
    daysUntilRace: 0,
    progress: 0,
    trainingPlan: null,
    recommendRaces: [
      { name: '北京马拉松', date: '2026年10月', icon: '🏃', type: '跑步' },
      { name: '上海铁人三项', date: '2026年5月', icon: '🏊', type: '铁三' },
      { name: '环青海湖骑行', date: '2026年7月', icon: '🚴', type: '骑行' }
    ]
  },

  onLoad() {
    this.loadCurrentRace();
  },

  onShow() {
    this.loadCurrentRace();
  },

  loadCurrentRace() {
    const race = wx.getStorageSync('currentRace');
    if (race) {
      const daysUntilRace = this.calculateDaysUntil(race.date);
      const progress = Math.round((1 - daysUntilRace / race.preparationDays) * 100);
      
      this.setData({
        currentRace: race,
        daysUntilRace,
        progress: Math.max(0, Math.min(100, progress))
      });
      
      this.loadTrainingPlan();
    }
  },

  calculateDaysUntil(dateStr) {
    const target = new Date(dateStr);
    const now = new Date();
    const diff = target - now;
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  },

  loadTrainingPlan() {
    const plan = {
      weeklyTraining: {
        run: '20km',
        bike: '60km',
        swim: '3km',
        strength: '2次'
      },
      focusThisWeek: '提升有氧耐力',
      nutrition: '增加蛋白质摄入，保持碳水化合物充足',
      tips: '注意休息，避免过度训练'
    };
    
    this.setData({ trainingPlan: plan });
  },

  setRace() {
    wx.showModal({
      title: '添加目标赛事',
      editable: true,
      placeholderText: '请输入赛事名称（如：北京马拉松）',
      success: (res) => {
        if (res.confirm && res.content) {
          const race = {
            name: res.content,
            date: '2026-10-15',
            type: '跑步',
            typeText: '🏃 跑步',
            icon: '🏃',
            target: '完赛',
            preparationDays: 180
          };
          
          wx.setStorageSync('currentRace', race);
          this.loadCurrentRace();
          
          wx.showToast({
            title: '赛事已添加',
            icon: 'success'
          });
        }
      }
    });
  },

  selectRace(e) {
    const race = e.currentTarget.dataset.race;
    const fullRace = {
      name: race.name,
      date: '2026-10-15',
      type: race.type,
      typeText: race.icon + ' ' + race.type,
      icon: race.icon,
      target: '完赛',
      preparationDays: 180
    };
    
    wx.setStorageSync('currentRace', fullRace);
    this.loadCurrentRace();
    
    wx.showToast({
      title: '赛事已选择',
      icon: 'success'
    });
  },

  viewHistory() {
    wx.switchTab({
      url: '/pages/history/history'
    });
  },

  startTraining() {
    wx.switchTab({
      url: '/pages/review/review'
    });
  }
});
