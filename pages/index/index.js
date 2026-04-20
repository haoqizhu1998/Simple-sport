// pages/index/index.js - 新版首页
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
    todayStats: {
      totalDistance: 0,
      totalDuration: 0,
      calories: 0,
      running: { distance: 0, pace: '--' },
      cycling: { distance: 0, pace: '--' },
      swimming: { distance: 0, pace: '--' }
    },
    aiAdvice: {
      title: '状态良好',
      main: '今日适合中等强度训练',
      details: '根据你的身体状态，建议进行45-60分钟的有氧训练，保持在2区心率。',
      tags: ['有氧训练', '心率2区', '45-60min'],
      coachNote: '坚持训练，为目标赛事做好准备 💪'
    },
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
    // 日期和问候
    const now = new Date();
    const dateStr = `${now.getMonth() + 1}月${now.getDate()}日 周${['日', '一', '二', '三', '四', '五', '六'][now.getDay()]}`;
    const greeting = this.getGreeting();
    
    // 身体状态
    const bodyStatus = wx.getStorageSync('bodyStatus') || {
      sleep: 7,
      fatigue: 5,
      mood: 7
    };
    this.updateBodyStatusTags(bodyStatus);
    
    // 今日训练统计
    const today = utils.formatDate(now, 'YYYY-MM-DD');
    const allRecords = wx.getStorageSync('trainingRecords') || [];
    const todayRecords = allRecords.filter(item => item.date && item.date.startsWith(today));
    
    const todayStats = this.calculateTodayStats(todayRecords);
    
    // AI建议
    const aiAdvice = this.generateAIAdvice(bodyStatus, todayStats);
    
    // 本周数据
    const weekData = this.calculateWeekData(allRecords);
    const weekTotal = weekData.reduce((sum, item) => sum + item.value, 0).toFixed(1);
    
    this.setData({
      greeting,
      currentDate: dateStr,
      bodyStatus,
      todayStats,
      aiAdvice,
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

  updateBodyStatusTags(bodyStatus) {
    const score = (10 - bodyStatus.fatigue) + bodyStatus.mood + (bodyStatus.sleep >= 7 ? 2 : 0);
    if (score >= 15) {
      bodyStatus.tagClass = 'good';
      bodyStatus.tagText = '状态良好';
    } else if (score >= 10) {
      bodyStatus.tagClass = 'normal';
      bodyStatus.tagText = '状态一般';
    } else {
      bodyStatus.tagClass = 'bad';
      bodyStatus.tagText = '需要休息';
    }
  },

  calculateTodayStats(records) {
    let totalDuration = 0;
    let calories = 0;
    let running = { distance: 0, pace: '--' };
    let cycling = { distance: 0, pace: '--' };
    let swimming = { distance: 0, pace: '--' };
    
    records.forEach(item => {
      totalDuration += parseInt(item.duration) || 0;
      calories += parseInt(item.calories) || Math.round((parseFloat(item.distance) || 0) * 60);
      
      if (item.type === 'run') {
        running.distance += parseFloat(item.distance) || 0;
        if (item.avgPace) running.pace = item.avgPace;
      } else if (item.type === 'bike') {
        cycling.distance += parseFloat(item.distance) || 0;
        if (item.avgSpeed) cycling.pace = item.avgSpeed;
      } else if (item.type === 'swim') {
        swimming.distance += parseFloat(item.distance) || 0;
        if (item.avgPace) swimming.pace = item.avgPace;
      }
    });
    
    return {
      totalDistance: records.reduce((sum, item) => sum + (parseFloat(item.distance) || 0), 0).toFixed(1),
      totalDuration: totalDuration || 0,
      calories: calories || 0,
      running: {
        distance: running.distance.toFixed(1),
        pace: running.pace
      },
      cycling: {
        distance: cycling.distance.toFixed(1),
        pace: cycling.pace
      },
      swimming: {
        distance: swimming.distance.toFixed(1),
        pace: swimming.pace
      }
    };
  },

  generateAIAdvice(bodyStatus, todayStats) {
    const { fatigue, mood, sleep } = bodyStatus;
    const energy = 10 - fatigue;
    
    if (sleep < 6) {
      return {
        title: '睡眠不足',
        main: '建议休息或进行轻度活动',
        details: '昨晚睡眠不足6小时，身体恢复不够充分。今天以休息或轻松活动为主，避免高强度训练。',
        tags: ['休息日', '充足睡眠', '避免强度'],
        coachNote: '睡眠是最好的恢复方式，今天给自己放个假吧 🛏️'
      };
    }
    
    if (fatigue >= 8) {
      return {
        title: '身体疲劳',
        main: '建议休息或拉伸恢复',
        details: '疲劳程度较高，身体需要更多恢复时间。今天可以进行30分钟轻松活动或全身拉伸，帮助身体恢复。',
        tags: ['恢复训练', '拉伸放松', '30min以内'],
        coachNote: '不要忽视身体的信号，休息是为了更好地出发 💆'
      };
    }
    
    if (energy >= 8 && mood >= 7) {
      return {
        title: '状态极佳',
        main: '适合进行强度训练',
        details: '今天身体状态非常好，能量充沛。可以进行间歇训练、阈值训练或力量训练，挑战自己的极限。',
        tags: ['高强度', '间歇训练', '60-90min'],
        coachNote: '抓住状态好的日子，这样的训练会让你的水平突飞猛进 🚀'
      };
    }
    
    if (energy >= 5) {
      return {
        title: '状态良好',
        main: '适合中等强度有氧训练',
        details: '身体状态恢复良好，可以进行45-60分钟的有氧训练，保持在2区心率，帮助提升有氧基础。',
        tags: ['有氧训练', '心率2区', '45-60min'],
        coachNote: '稳扎稳打，每一步都是在为你的目标积累力量 🏃'
      };
    }
    
    return {
      title: '轻松活动',
      main: '以轻松活动为主',
      details: '今天状态一般，建议进行30-40分钟的轻松活动，不要过度消耗，保持运动习惯即可。',
      tags: ['轻松活动', '30-40min', '保持习惯'],
      coachNote: '不是每天都需要高强度，保持热爱最重要 ❤️'
    };
  },

  calculateWeekData(history) {
    const today = new Date();
    const dayOfWeek = today.getDay() || 7;
    const weekData = [];
    
    for (let i = 0; i < 7; i++) {
      const targetDate = new Date(today);
      targetDate.setDate(today.getDate() - (6 - i));
      const dateStr = utils.formatDate(targetDate, 'YYYY-MM-DD');
      
      const dayTotal = history
        .filter(item => item.date && item.date.startsWith(dateStr))
        .reduce((sum, item) => sum + (parseFloat(item.distance) || 0), 0);
      
      weekData.push({
        value: dayTotal,
        height: Math.max(8, Math.min(160, dayTotal * 8)),
        active: dayTotal > 0
      });
    }
    
    return weekData;
  },

  goToReview(e) {
    const type = e.currentTarget.dataset.type;
    wx.navigateTo({
      url: '/pages/review/review' + (type ? '?type=' + type : '')
    });
  },

  uploadScreenshot() {
    wx.showToast({
      title: '截图识别开发中',
      icon: 'none'
    });
    // TODO: 实现截图识别功能
  }
})
