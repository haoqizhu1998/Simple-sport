// pages/index/index.js - Sigma风格
const app = getApp();
const utils = require('../../utils/utils.js');

Page({
  data: {
    greeting: '',
    currentDate: '',
    bodyStatus: {
      sleep: 7,
      fatigue: 5,
      mood: 7,
      tagClass: 'good',
      tagText: '状态良好'
    },
    trainingSuggestion: {
      main: '今日适合中等强度训练',
      sub: '根据你的身体状态，建议进行45-60分钟的有氧训练，保持在2区心率',
      tags: ['有氧训练', '心率2区', '45-60min']
    },
    todayStats: {
      distance: 0,
      count: 0
    },
    todayTrainings: [],
    weekData: [],
    weekLabels: ['一', '二', '三', '四', '五', '六', '日'],
    weekTotal: 0
  },

  onLoad() {
    this.loadData();
  },

  onShow() {
    this.loadData();
  },

  loadData() {
    // 当前日期
    const now = new Date();
    const dateStr = `${now.getMonth() + 1}月${now.getDate()}日 周${['日', '一', '二', '三', '四', '五', '六'][now.getDay()]}`;
    
    // 问候语
    const greeting = this.getGreeting();
    
    // 身体状态
    const bodyStatus = wx.getStorageSync('bodyStatus') || {
      sleep: 7,
      fatigue: 5,
      mood: 7
    };
    bodyStatus.tagClass = this.getStatusTag(bodyStatus);
    bodyStatus.tagText = this.getStatusText(bodyStatus);
    
    // 训练建议
    const suggestion = this.generateSuggestion(bodyStatus);
    
    // 今日训练
    const today = utils.formatDate(now, 'YYYY-MM-DD');
    const allRecords = wx.getStorageSync('trainingRecords') || [];
    const todayTrainings = allRecords
      .filter(item => item.date && item.date.startsWith(today))
      .map(item => this.formatTrainingItem(item));
    
    const todayStats = {
      distance: todayTrainings.reduce((sum, item) => sum + parseFloat(item.distance || 0), 0).toFixed(1),
      count: todayTrainings.length
    };
    
    // 本周数据
    const weekData = this.calculateWeekData(allRecords);
    const weekTotal = weekData.reduce((sum, item) => sum + item.value, 0).toFixed(1);
    
    this.setData({
      greeting,
      currentDate: dateStr,
      bodyStatus,
      trainingSuggestion: suggestion,
      todayStats,
      todayTrainings,
      weekData,
      weekTotal
    });
  },

  getGreeting() {
    const hour = new Date().getHours();
    if (hour < 6) return '还在熬夜';
    if (hour < 9) return '早上好';
    if (hour < 12) return '上午好';
    if (hour < 14) return '中午好';
    if (hour < 18) return '下午好';
    if (hour < 22) return '晚上好';
    return '夜深了';
  },

  getStatusTag(bodyStatus) {
    const { fatigue, mood, sleep } = bodyStatus;
    const score = (10 - fatigue) + mood + (sleep >= 7 ? 2 : 0);
    if (score >= 15) return 'good';
    if (score >= 10) return 'normal';
    return 'bad';
  },

  getStatusText(bodyStatus) {
    const tag = this.getStatusTag(bodyStatus);
    if (tag === 'good') return '状态良好';
    if (tag === 'normal') return '状态一般';
    return '需要休息';
  },

  generateSuggestion(bodyStatus) {
    const { fatigue, mood, sleep } = bodyStatus;
    const energy = 10 - fatigue;
    
    if (sleep < 6) {
      return {
        main: '睡眠不足，建议休息',
        sub: '昨晚睡眠时间不足6小时，今天以休息为主，避免高强度训练',
        tags: ['休息日', '充足睡眠']
      };
    }
    
    if (fatigue >= 8) {
      return {
        main: '身体疲劳较高',
        sub: '今天以轻松活动或拉伸为主，不要勉强进行高强度训练',
        tags: ['恢复训练', '拉伸放松']
      };
    }
    
    if (energy >= 8 && mood >= 7) {
      return {
        main: '状态极佳，适合强度训练',
        sub: '今天身体状态非常好，可以进行间歇训练或力量训练',
        tags: ['高强度', '间歇训练', '60-90min']
      };
    }
    
    if (energy >= 5) {
      return {
        main: '状态良好，适合中等强度',
        sub: '可以进行45-60分钟的有氧训练，保持在2区心率',
        tags: ['有氧训练', '心率2区', '45-60min']
      };
    }
    
    return {
      main: '轻松活动即可',
      sub: '今天以轻松活动或短时训练为主，不要过度消耗',
      tags: ['轻松活动', '30min以内']
    };
  },

  formatTrainingItem(item) {
    const typeMap = {
      run: { text: '跑步', icon: '🏃', class: 'run' },
      bike: { text: '骑行', icon: '🚴', class: 'bike' },
      swim: { text: '游泳', icon: '🏊', class: 'swim' },
      strength: { text: '力量', icon: '💪', class: 'strength' }
    };
    const type = typeMap[item.type] || typeMap.run;
    
    let scoreText = '一般';
    let scoreClass = 'normal';
    if (item.score >= 85) {
      scoreText = '优秀';
      scoreClass = 'excellent';
    } else if (item.score >= 70) {
      scoreText = '良好';
      scoreClass = 'good';
    }
    
    return {
      ...item,
      typeText: type.text,
      typeIcon: type.icon,
      typeClass: type.class,
      scoreText,
      scoreClass
    };
  },

  calculateWeekData(history) {
    const today = new Date();
    const dayOfWeek = today.getDay() || 7;
    const weekData = [];
    
    for (let i = 0; i < 7; i++) {
      const targetDay = (dayOfWeek - 6 + i) % 7;
      const targetDate = new Date(today);
      targetDate.setDate(today.getDate() - (6 - i));
      const dateStr = utils.formatDate(targetDate, 'YYYY-MM-DD');
      
      const dayTotal = history
        .filter(item => item.date && item.date.startsWith(dateStr))
        .reduce((sum, item) => sum + parseFloat(item.distance || 0), 0);
      
      weekData.push({
        value: dayTotal,
        height: Math.max(8, Math.min(180, dayTotal * 10)),
        active: dayTotal > 0
      });
    }
    
    return weekData;
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

  viewDetail(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/result/result?id=${id}`
    });
  }
})
