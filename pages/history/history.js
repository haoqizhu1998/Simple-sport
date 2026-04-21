// pages/history/history.js
const app = getApp();

Page({
  data: {
    currentDate: '',
    historyList: [],
    filteredList: [],
    totalStats: {
      count: 0,
      distance: '0.0',
      avgScore: 0
    },
    selectedFilter: 'all',
    filterOptions: [
      { key: 'all', name: '全部', icon: '📋' },
      { key: 'week', name: '本周', icon: '📅' },
      { key: 'month', name: '本月', icon: '🗓️' },
      { key: 'run', name: '跑步', icon: '🏃' },
      { key: 'bike', name: '骑行', icon: '🚴' },
      { key: 'swim', name: '游泳', icon: '🏊' }
    ],
    isEmpty: true
  },

  onLoad() {
    const now = new Date();
    const dateStr = `${now.getMonth() + 1}月${now.getDate()}日`;
    this.setData({ currentDate: dateStr });
  },

  onShow() {
    this.loadHistory();
  },

  onPullDownRefresh() {
    this.loadHistory();
    wx.stopPullDownRefresh();
  },

  loadHistory() {
    const history = app.getTrainingHistory ? app.getTrainingHistory() : [];
    const totalStats = this.calculateTotalStats(history);

    this.setData({
      historyList: history,
      filteredList: history,
      totalStats,
      isEmpty: history.length === 0
    });

    this.applyFilter(this.data.selectedFilter);
  },

  calculateTotalStats(history) {
    if (history.length === 0) {
      return { count: 0, distance: '0.0', avgScore: 0 };
    }

    const totalDistance = history.reduce((sum, item) => sum + parseFloat(item.distance || 0), 0);
    const totalScore = history.reduce((sum, item) => sum + parseFloat(item.score || 0), 0);

    return {
      count: history.length,
      distance: totalDistance.toFixed(1),
      avgScore: Math.round(totalScore / history.length)
    };
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
      case 'run':
      case 'bike':
      case 'swim':
        filtered = this.data.historyList.filter(item => 
          (item.trainingType || '').toLowerCase().includes(filter)
        );
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
    const { id } = e.currentTarget.dataset;
    
    wx.showModal({
      title: '删除确认',
      content: '确定要删除这条训练记录吗？',
      success: (res) => {
        if (res.confirm) {
          const history = app.getTrainingHistory ? app.getTrainingHistory() : [];
          const newHistory = history.filter(item => item.id !== id);
          wx.setStorageSync('trainingHistory', newHistory);
          if (app.globalData) {
            app.globalData.trainingHistory = newHistory;
          }
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
    if (score >= 85) return '#22c55e';
    if (score >= 70) return '#3b82f6';
    if (score >= 50) return '#fbbf24';
    return '#ef4444';
  },

  getTypeIcon(type) {
    const typeLower = (type || '').toLowerCase();
    if (typeLower.includes('run') || typeLower.includes('跑步')) return '🏃';
    if (typeLower.includes('bike') || typeLower.includes('骑行')) return '🚴';
    if (typeLower.includes('swim') || typeLower.includes('游泳')) return '🏊';
    if (typeLower.includes('有氧')) return '🌊';
    if (typeLower.includes('间歇')) return '⚡';
    if (typeLower.includes('力量')) return '💪';
    if (typeLower.includes('长距离')) return '🏔️';
    return '🏃';
  }
});
