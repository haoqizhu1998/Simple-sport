// pages/index/index.js
const app = getApp();
const utils = require('../../utils/utils.js');

Page({
  data: {
    userInfo: null,
    hasUserInfo: false,
    todayStats: {
      distance: 0,
      duration: '00:00:00',
      count: 0
    },
    todayTraining: null,
    bodyStatus: {
      sleep: 0,
      fatigue: 5,
      mood: 5
    },
    trainingSuggestion: '今日建议：休息或进行轻松有氧训练',
    greeting: '',
    weekData: [0, 0, 0, 0, 0, 0, 0],
    weekLabels: ['一', '二', '三', '四', '五', '六', '日']
  },

  onLoad() {
    this.checkLogin();
  },

  onShow() {
    if (this.data.hasUserInfo) {
      this.loadData();
    }
  },

  checkLogin() {
    const userInfo = wx.getStorageSync('userInfo');
    if (userInfo) {
      this.setData({
        userInfo,
        hasUserInfo: true
      });
      this.loadData();
    } else {
      this.setData({
        hasUserInfo: false
      });
    }
  },

  onGotUserInfo(e) {
    if (e.detail.userInfo) {
      const userInfo = {
        ...e.detail.userInfo,
        openId: 'user_' + Date.now()
      };
      wx.setStorageSync('userInfo', userInfo);
      this.setData({
        userInfo,
        hasUserInfo: true
      });
      this.loadData();
    }
  },

  loadData() {
    // 获取身体状态
    const bodyStatus = wx.getStorageSync('bodyStatus') || {
      sleep: 7,
      fatigue: 5,
      mood: 5
    };
    
    // 根据身体状态生成训练建议
    const suggestion = this.generateSuggestion(bodyStatus);

    // 获取今日训练
    const today = utils.formatDate(new Date(), 'YYYY-MM-DD');
    const history = wx.getStorageSync('trainingRecords') || [];
    const todayTrainings = history.filter(item => 
      item.date && item.date.startsWith(today)
    );

    // 计算今日统计
    const todayStats = {
      distance: todayTrainings.reduce((sum, item) => sum + parseFloat(item.distance || 0), 0).toFixed(1),
      count: todayTrainings.length
    };

    // 计算本周数据
    const weekData = this.calculateWeekData(history);

    // 生成问候语
    const greeting = this.getGreeting();

    this.setData({
      bodyStatus,
      trainingSuggestion: suggestion,
      todayStats,
      todayTraining: todayTrainings[0] || null,
      weekData,
      greeting
    });
  },

  generateSuggestion(bodyStatus) {
    const { sleep, fatigue, mood } = bodyStatus;
    
    if (sleep < 6) {
      return '睡眠不足，建议休息或进行轻度活动';
    }
    if (fatigue >= 8) {
      return '身体疲劳较高，建议休息或拉伸恢复';
    }
    if (fatigue <= 3 && mood >= 7) {
      return '状态良好，适合进行强度训练';
    }
    if (fatigue <= 5) {
      return '状态一般，建议进行中等强度有氧训练';
    }
    return '今日建议：轻松活动或休息';
  },

  calculateWeekData(history) {
    const today = new Date();
    const dayOfWeek = today.getDay() || 7;
    const weekData = [0, 0, 0, 0, 0, 0, 0];

    history.forEach(item => {
      if (!item.date) return;
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

  goToBodyStatus() {
    wx.navigateTo({
      url: '/pages/profile/profile?action=bodyStatus'
    });
  },

  viewTrainingDetail(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/result/result?id=${id}`
    });
  }
})
