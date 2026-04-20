// pages/history/history.js
const app = getApp();
const utils = require('../../utils/utils.js');

Page({
  data: {
    historyList: [],
    filteredList: [],
    weekList: [],
    monthList: [],
    totalStats: {
      count: 0,
      distance: 0,
      avgScore: 0
    },
    selectedFilter: 'all',
    filterOptions: [
      { key: 'all', name: '全部' },
      { key: 'week', name: '本周' },
      { key: 'month', name: '本月' }
    ],
    trendData: {
      dates: [],
      scores: [],
      distances: []
    },
    isEmpty: true
  },

  onLoad() {
    this.loadHistory();
  },

  onShow() {
    this.loadHistory();
  },

  onPullDownRefresh() {
    this.loadHistory();
    wx.stopPullDownRefresh();
  },

  loadHistory() {
    const history = app.getTrainingHistory();
    const totalStats = this.calculateTotalStats(history);
    const trendData = this.calculateTrendData(history.slice(0, 10));

    this.setData({
      historyList: history,
      filteredList: history,
      totalStats,
      trendData,
      isEmpty: history.length === 0
    });

    this.applyFilter(this.data.selectedFilter);
  },

  calculateTotalStats(history) {
    if (history.length === 0) {
      return { count: 0, distance: 0, avgScore: 0 };
    }

    const totalDistance = history.reduce((sum, item) => sum + parseFloat(item.distance || 0), 0);
    const totalScore = history.reduce((sum, item) => sum + parseFloat(item.score || 0), 0);

    return {
      count: history.length,
      distance: totalDistance.toFixed(1),
      avgScore: Math.round(totalScore / history.length)
    };
  },

  calculateTrendData(history) {
    const dates = history.map(item => item.dateStr || '').slice().reverse();
    const scores = history.map(item => parseFloat(item.score || 0)).slice().reverse();
    const distances = history.map(item => parseFloat(item.distance || 0)).slice().reverse();

    return { dates, scores, distances };
  },

  applyFilter(filter) {
    const now = new Date();
    let filtered = [];

    switch (filter) {
      case 'week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        filtered = this.data.historyList.filter(item => new Date(item.date) >= weekAgo);
        break;
      case 'month':
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        filtered = this.data.historyList.filter(item => new Date(item.date) >= monthAgo);
        break;
      default:
        filtered = this.data.historyList;
    }

    this.setData({
      filteredList: filtered,
      selectedFilter: filter
    });
  },

  onFilterChange(e) {
    const filter = e.currentTarget.dataset.key;
    this.applyFilter(filter);
  },

  viewDetail(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/result/result?recordId=${id}`
    });
  },

  deleteRecord(e) {
    const { id, index } = e.currentTarget.dataset;
    
    wx.showModal({
      title: '删除确认',
      content: '确定要删除这条训练记录吗？',
      success: (res) => {
        if (res.confirm) {
          const history = app.getTrainingHistory();
          const newHistory = history.filter(item => item.id !== id);
          wx.setStorageSync('trainingHistory', newHistory);
          app.globalData.trainingHistory = newHistory;
          
          this.loadHistory();
          wx.showToast({
            title: '删除成功',
            icon: 'success'
          });
        }
      }
    });
  },

  goToReview() {
    wx.switchTab({
      url: '/pages/review/review'
    });
  },

  getScoreColor(score) {
    if (score >= 85) return '#00FF88';
    if (score >= 70) return '#00D9FF';
    if (score >= 50) return '#FFB800';
    return '#FF6B6B';
  },

  getTypeIcon(type) {
    const icons = {
      '有氧训练': '🌊',
      '间歇训练': '⚡',
      '恢复训练': '🌿',
      '长距离训练': '🏔️',
      '力量训练': '💪'
    };
    return icons[type] || '🏃';
  }
})
