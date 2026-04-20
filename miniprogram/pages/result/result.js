// pages/result/result.js
const app = getApp();
const utils = require('../../utils/utils.js');

Page({
  data: {
    recordId: '',
    result: null,
    trainingData: null,
    scoreClass: '',
    abilityIcons: {
      '耐力': '🏃',
      '速度': '⚡',
      '心肺': '💨',
      '恢复': '🔄',
      '力量': '💪'
    }
  },

  onLoad(options) {
    if (options.recordId) {
      this.setData({ recordId: options.recordId });
      this.loadResult(options.recordId);
    }
  },

  onShareAppMessage() {
    const { result, trainingData } = this.data;
    if (result && trainingData) {
      return {
        title: `我的训练评分${result.score}分，来看看！`,
        path: `/pages/result/result?recordId=${this.data.recordId}`,
        imageUrl: '/assets/share-result.png'
      };
    }
  },

  loadResult(recordId) {
    const history = app.getTrainingHistory();
    const record = history.find(item => item.id === recordId);
    
    if (record) {
      const scoreClass = this.getScoreClass(record.score);
      
      this.setData({
        result: record,
        trainingData: {
          distance: record.distance,
          pace: record.paceStr || record.pace,
          paceNum: record.pace,
          heartRate: record.heartRate || '--',
          rpe: record.rpe,
          rpeDesc: record.rpeDesc,
          duration: record.duration
        },
        scoreClass
      });
    } else {
      wx.showToast({
        title: '未找到训练记录',
        icon: 'none'
      });
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    }
  },

  getScoreClass(score) {
    if (score >= 85) return 'excellent';
    if (score >= 70) return 'good';
    if (score >= 50) return 'normal';
    return 'poor';
  },

  getScoreColor(score) {
    if (score >= 85) return '#00FF88';
    if (score >= 70) return '#00D9FF';
    if (score >= 50) return '#FFB800';
    return '#FF6B6B';
  },

  getScoreText(score) {
    if (score >= 85) return '优秀';
    if (score >= 70) return '良好';
    if (score >= 50) return '一般';
    return '不足';
  },

  getTrainingTypeIcon(type) {
    const icons = {
      '有氧训练': '🌊',
      '间歇训练': '⚡',
      '恢复训练': '🌿',
      '长距离训练': '🏔️',
      '力量训练': '💪'
    };
    return icons[type] || '🏃';
  },

  // 分享结果
  onShare() {
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    });
  },

  // 保存到相册
  saveToAlbum() {
    wx.showToast({
      title: '功能开发中',
      icon: 'none'
    });
  },

  // 继续添加
  addMore() {
    wx.navigateBack();
  },

  // 查看历史
  viewHistory() {
    wx.switchTab({
      url: '/pages/history/history'
    });
  }
})
