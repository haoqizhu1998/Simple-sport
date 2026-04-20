// pages/index/index.js
const app = getApp();
const utils = require('../../utils/utils.js');

Page({
  data: {
    userName: '运动达人',
    todayStats: {
      distance: 0,
      duration: '00:00:00',
      count: 0
    },
    todayTraining: null,
    recentTraining: [],
    weekData: [0, 0, 0, 0, 0, 0, 0],
    weekLabels: ['一', '二', '三', '四', '五', '六', '日'],
    greeting: '',
    isLoading: true
  },

  onLoad() {
    this.loadData();
  },

  onShow() {
    this.loadData();
  },

  onPullDownRefresh() {
    this.loadData();
    wx.stopPullDownRefresh();
  },

  loadData() {
    this.setData({ isLoading: true });
    
    // 获取用户信息
    const userProfile = app.globalData.userProfile;
    if (userProfile && userProfile.name) {
      this.setData({ userName: userProfile.name });
    }

    // 获取今日训练统计
    const today = utils.formatDate(new Date(), 'YYYY-MM-DD');
    const history = app.getTrainingHistory();
    
    const todayTrainings = history.filter(item => 
      item.date && item.date.startsWith(today)
    );

    const todayStats = {
      distance: todayTrainings.reduce((sum, item) => sum + parseFloat(item.distance || 0), 0),
      duration: this.calculateTotalDuration(todayTrainings),
      count: todayTrainings.length
    };

    // 获取最近训练
    const recentTraining = history.slice(0, 3);

    // 计算本周数据
    const weekData = this.calculateWeekData(history);

    // 生成问候语
    const greeting = this.getGreeting();

    this.setData({
      todayStats,
      todayTraining: todayTrainings[0] || null,
      recentTraining,
      weekData,
      greeting,
      isLoading: false
    });
  },

  calculateTotalDuration(trainings) {
    let totalMinutes = 0;
    trainings.forEach(item => {
      const duration = item.duration || '00:00:00';
      const parts = duration.split(':');
      if (parts.length === 3) {
        totalMinutes += parseInt(parts[0]) * 60 + parseInt(parts[1]) + parseInt(parts[2]) / 60;
      }
    });
    const hours = Math.floor(totalMinutes / 60);
    const minutes = Math.floor(totalMinutes % 60);
    const seconds = Math.round((totalMinutes - Math.floor(totalMinutes)) * 60);
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  },

  calculateWeekData(history) {
    const today = new Date();
    const dayOfWeek = today.getDay() || 7;
    const weekData = [0, 0, 0, 0, 0, 0, 0];

    history.forEach(item => {
      const itemDate = new Date(item.date);
      const diff = Math.floor((today - itemDate) / (1000 * 60 * 60 * 24));
      if (diff >= 0 && diff < 7) {
        const index = (dayOfWeek - diff - 1 + 7) % 7;
        weekData[index] += parseFloat(item.distance || 0);
      }
    });

    return weekData;
  },

  getGreeting() {
    const hour = new Date().getHours();
    if (hour < 6) return '夜深了，注意休息';
    if (hour < 9) return '早上好，开始新的一天';
    if (hour < 12) return '上午好，保持好状态';
    if (hour < 14) return '中午好，适当休息';
    if (hour < 18) return '下午好，继续加油';
    if (hour < 22) return '晚上好，训练了吗';
    return '夜深了，早点休息';
  },

  goToReview() {
    wx.navigateTo({
      url: '/pages/review/review'
    });
  },

  goToHistory() {
    wx.switchTab({
      url: '/pages/history/history'
    });
  },

  viewTrainingDetail(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/result/result?id=${id}`
    });
  }
})
