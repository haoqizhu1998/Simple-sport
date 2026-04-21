// pages/user/user.js - 用户中心页面（使用后端API）
const api = require('../../utils/api.js');

Page({
  data: {
    userInfo: null,
    stats: {
      totalTrainings: 0,
      totalDistance: 0,
      totalDays: 0,
      currentStreak: 0
    },
    healthProfile: {
      height: 170,
      weight: 65,
      age: 30,
      gender: 'male',
      maxHR: 190,
      restingHR: 60
    },
    medals: [],
    connections: [],
    isLoading: true,
    showHealthModal: false,
    showConnectionModal: false
  },

  onLoad() {
    this.checkLogin();
  },

  onShow() {
    if (this.data.isLogin) {
      this.loadAllData();
    }
  },

  // 检查登录状态
  checkLogin() {
    const token = wx.getStorageSync('token');
    if (token) {
      this.setData({ isLogin: true });
      this.loadAllData();
    } else {
      this.setData({ isLogin: false, isLoading: false });
    }
  },

  // 加载所有数据
  loadAllData() {
    this.setData({ isLoading: true });
    Promise.all([
      this.loadUserInfo(),
      this.loadUserStats(),
      this.loadHealthProfile(),
      this.loadMedals(),
      this.loadConnections()
    ]).then(() => {
      this.setData({ isLoading: false });
    }).catch(err => {
      console.error('加载数据失败:', err);
      this.setData({ isLoading: false });
    });
  },

  // 登录
  doLogin() {
    wx.showLoading({ title: '登录中...' });
    
    // 获取微信登录凭证
    wx.login({
      success: (res) => {
        if (res.code) {
          api.login({ code: res.code }).then(data => {
            wx.hideLoading();
            wx.setStorageSync('token', data.token);
            this.setData({ isLogin: true });
            this.loadAllData();
            wx.showToast({ title: '登录成功', icon: 'success' });
          }).catch(err => {
            wx.hideLoading();
            console.error('登录失败:', err);
          });
        } else {
          wx.hideLoading();
          wx.showToast({ title: '获取登录凭证失败', icon: 'none' });
        }
      },
      fail: () => {
        wx.hideLoading();
        wx.showToast({ title: '微信登录失败', icon: 'none' });
      }
    });
  },

  // 登出
  doLogout() {
    wx.showModal({
      title: '确认登出',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          api.logout().catch(() => {});
          wx.removeStorageSync('token');
          this.setData({
            isLogin: false,
            userInfo: null,
            stats: {},
            healthProfile: {},
            medals: [],
            connections: []
          });
          wx.showToast({ title: '已退出登录', icon: 'success' });
        }
      }
    });
  },

  // 获取用户信息
  loadUserInfo() {
    return api.getUserInfo().then(data => {
      this.setData({ userInfo: data });
    }).catch(err => {
      console.error('获取用户信息失败:', err);
    });
  },

  // 获取用户统计
  loadUserStats() {
    return api.getUserStats().then(data => {
      this.setData({ stats: data });
    }).catch(err => {
      console.error('获取统计数据失败:', err);
    });
  },

  // 获取健康档案
  loadHealthProfile() {
    return api.getHealthProfile().then(data => {
      this.setData({ healthProfile: data });
    }).catch(err => {
      console.error('获取健康档案失败:', err);
    });
  },

  // 获取勋章
  loadMedals() {
    return api.getMedals().then(data => {
      this.setData({ medals: data || [] });
    }).catch(err => {
      console.error('获取勋章失败:', err);
    });
  },

  // 获取数据连接
  loadConnections() {
    return api.getConnections().then(data => {
      this.setData({ connections: data || [] });
    }).catch(err => {
      console.error('获取数据连接失败:', err);
    });
  },

  // 更新用户信息
  updateUserInfo(e) {
    const field = e.currentTarget.dataset.field;
    const value = e.detail.value;
    
    const updateData = { ...this.data.userInfo, [field]: value };
    
    api.updateUserInfo(updateData).then(data => {
      this.setData({ userInfo: data });
      wx.showToast({ title: '更新成功', icon: 'success' });
    }).catch(err => {
      console.error('更新失败:', err);
    });
  },

  // 显示健康档案弹窗
  showHealthModal() {
    this.setData({ showHealthModal: true });
  },

  // 隐藏健康档案弹窗
  hideHealthModal() {
    this.setData({ showHealthModal: false });
  },

  // 健康档案输入处理
  onHealthInput(e) {
    const field = e.currentTarget.dataset.field;
    let value = e.detail.value;
    
    if (['height', 'weight', 'age', 'maxHR', 'restingHR'].includes(field)) {
      value = parseFloat(value) || 0;
    }
    
    this.setData({
      [`healthProfile.${field}`]: value
    });
  },

  // 保存健康档案
  saveHealthProfile() {
    api.updateHealthProfile(this.data.healthProfile).then(data => {
      this.setData({ 
        healthProfile: data,
        showHealthModal: false 
      });
      wx.showToast({ title: '保存成功', icon: 'success' });
    }).catch(err => {
      console.error('保存健康档案失败:', err);
    });
  },

  // 显示数据连接弹窗
  showConnectionModal() {
    this.setData({ showConnectionModal: true });
  },

  // 隐藏数据连接弹窗
  hideConnectionModal() {
    this.setData({ showConnectionModal: false });
  },

  // 添加数据连接
  addConnection(e) {
    const platform = e.currentTarget.dataset.platform;
    
    wx.showModal({
      title: '授权' + this.getPlatformName(platform),
      content: `确定要连接${this.getPlatformName(platform)}数据吗？`,
      success: (res) => {
        if (res.confirm) {
          // 实际应用中这里会调起对应平台的OAuth授权流程
          api.addConnection({ platform }).then(data => {
            this.loadConnections();
            wx.showToast({ title: '连接成功', icon: 'success' });
          }).catch(err => {
            console.error('添加连接失败:', err);
          });
        }
      }
    });
  },

  // 删除数据连接
  deleteConnection(e) {
    const platform = e.currentTarget.dataset.platform;
    
    wx.showModal({
      title: '确认断开',
      content: `确定要断开${this.getPlatformName(platform)}连接吗？`,
      success: (res) => {
        if (res.confirm) {
          api.deleteConnection(platform).then(() => {
            this.loadConnections();
            wx.showToast({ title: '已断开', icon: 'success' });
          }).catch(err => {
            console.error('删除连接失败:', err);
          });
        }
      }
    });
  },

  // 获取平台名称
  getPlatformName(platform) {
    const names = {
      strava: 'Strava',
      garmin: 'Garmin',
      apple: 'Apple Health',
      fitbit: 'Fitbit',
      huawei: '华为健康'
    };
    return names[platform] || platform;
  },

  // 清除所有数据
  clearAllData() {
    wx.showModal({
      title: '确认清空',
      content: '确定要清空所有本地数据吗？此操作不可恢复',
      success: (res) => {
        if (res.confirm) {
          wx.clearStorageSync();
          this.setData({
            isLogin: false,
            userInfo: null,
            stats: {},
            healthProfile: {},
            medals: [],
            connections: []
          });
          wx.showToast({ title: '已清空', icon: 'success' });
        }
      }
    });
  },

  // 关于
  showAbout() {
    wx.showModal({
      title: 'Simple运动',
      content: '版本 1.0.0\n\n让健康运动变得触手可得',
      showCancel: false
    });
  },

  // 设置API地址
  setAPIUrl() {
    wx.showModal({
      title: '设置API地址',
      editable: true,
      placeholderText: 'http://你的服务器IP:3000/api',
      success: (res) => {
        if (res.confirm && res.content) {
          const app = getApp();
          app.setAPIUrl(res.content);
          wx.showToast({ title: '已保存，请重启小程序', icon: 'success' });
        }
      }
    });
  }
})
