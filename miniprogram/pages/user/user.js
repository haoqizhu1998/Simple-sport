const app = getApp();
// pages/user/user.js - 个人中心页面
const app = getApp();

Page({
  data: {
    isLoggedIn: false,
    userInfo: {
      id: '',
      nickname: '',
      avatarUrl: '',
      phone: '',
      gender: '',
      birthday: '',
      region: '',
      level: 1,
      expPoints: 0,
      totalTrainings: 0,
      totalDistance: 0,
      streakDays: 0
    },
    healthProfile: {
      age: null,
      gender: '',
      height: null,
      weight: null,
      body_type: '',
      symptoms: [],
      injuries: [],
      health_goals: [],
      exercise_frequency: ''
    },
    currentTab: 'profile',
    showProfileEdit: false,
    showHealthEdit: false,
    editForm: {},
    editHealth: {},
    
    // 选项数据
    genderOptions: ['未设置', '男', '女', '其他'],
    bodyTypeOptions: ['偏瘦', '标准', '偏胖', '肥胖'],
    frequencyOptions: [
      { key: 'rarely', name: '偶尔' },
      { key: '1_2_per_week', name: '每周1-2次' },
      { key: '3_4_per_week', name: '每周3-4次' },
      { key: 'daily', name: '每天' }
    ],
    symptomsOptions: ['失眠', '焦虑', '肥胖', '体虚', '无不适'],
    injuriesOptions: ['膝关节', '腰椎', '颈椎', '踝关节', '无'],
    healthGoalsOptions: ['减脂', '增肌', '提升耐力', '改善睡眠', '增强体质'],
    
    // 数据源
    dataSources: [
      { platform: 'garmin', name: 'Garmin Connect', icon: '/assets/icons/garmin.png', status: 'disconnected', lastSyncTime: '' },
      { platform: 'coros', name: 'COROS', icon: '/assets/icons/coros.png', status: 'disconnected', lastSyncTime: '' },
      { platform: 'keep', name: 'Keep', icon: '/assets/icons/keep.png', status: 'disconnected', lastSyncTime: '' },
      { platform: 'ypq', name: '悦跑圈', icon: '/assets/icons/ypq.png', status: 'disconnected', lastSyncTime: '' },
      { platform: 'codoon', name: '咕咚', icon: '/assets/icons/codoon.png', status: 'disconnected', lastSyncTime: '' },
      { platform: 'nike', name: 'Nike Run Club', icon: '/assets/icons/nike.png', status: 'disconnected', lastSyncTime: '' }
    ],
    
    // 勋章
    medals: []
  },

  onLoad() {
    this.checkLoginStatus();
    this.loadUserData();
  },

  onShow() {
    if (this.data.isLoggedIn) {
      this.loadUserData();
    }
  },

  // 检查登录状态
  checkLoginStatus() {
    const userData = wx.getStorageSync('userData');
    if (userData && userData.isLoggedIn) {
      this.setData({ isLoggedIn: true });
    }
  },

  // 加载用户数据
  loadUserData() {
    const userData = wx.getStorageSync('userData') || {};
    const healthData = wx.getStorageSync('healthProfile') || {};
    const medalsData = wx.getStorageSync('medals') || [];
    const connectionsData = wx.getStorageSync('dataConnections') || [];
    
    // 更新用户信息
    const userInfo = {
      ...this.data.userInfo,
      ...userData
    };
    
    // 如果有云数据库，同步获取数据
    if (wx.cloud) {
      this.loadFromCloud();
    }
    
    // 处理数据连接状态
    const dataSources = this.data.dataSources.map(source => {
      const conn = connectionsData.find(c => c.platform === source.platform);
      if (conn) {
        return {
          ...source,
          status: conn.status,
          lastSyncTime: conn.lastSyncTime ? this.formatTime(conn.lastSyncTime) : ''
        };
      }
      return source;
    });
    
    this.setData({
      userInfo,
      healthProfile: healthData,
      medals: medalsData,
      dataSources
    });
  },

  // 从云数据库加载
  loadFromCloud() {
    if (!wx.cloud) return;
    
    const db = wx.cloud.database();
    const openid = wx.getStorageSync('openid');
    
    // 获取用户信息
    db.collection('users').where({
      _id: openid
    }).get().then(res => {
      if (res.data && res.data.length > 0) {
        const cloudUser = res.data[0];
        this.setData({
          'userInfo.nickname': cloudUser.nickname || '',
          'userInfo.avatarUrl': cloudUser.avatar_url || '',
          'userInfo.phone': cloudUser.phone || '',
          'userInfo.gender': cloudUser.gender || '',
          'userInfo.birthday': cloudUser.birthday || '',
          'userInfo.region': cloudUser.region || '',
          'userInfo.level': cloudUser.level || 1,
          'userInfo.expPoints': cloudUser.exp_points || 0
        });
      }
    }).catch(err => {
      console.log('云数据库获取失败，使用本地数据');
    });
    
    // 获取健康档案
    db.collection('health_profiles').where({
      user_id: openid
    }).get().then(res => {
      if (res.data && res.data.length > 0) {
        const health = res.data[0];
        this.setData({
          healthProfile: {
            age: health.age,
            gender: health.gender,
            height: health.height,
            weight: health.weight,
            body_type: health.body_type,
            symptoms: health.symptoms || [],
            injuries: health.injuries || [],
            health_goals: health.health_goals || [],
            exercise_frequency: health.exercise_frequency
          }
        });
      }
    });
    
    // 获取勋章
    db.collection('medals').where({
      user_id: openid
    }).get().then(res => {
      if (res.data && res.data.length > 0) {
        this.setData({ medals: res.data });
      }
    });
    
    // 获取数据连接
    db.collection('data_connections').where({
      user_id: openid
    }).get().then(res => {
      if (res.data && res.data.length > 0) {
        wx.setStorageSync('dataConnections', res.data);
        this.loadUserData(); // 重新加载以更新状态
      }
    });
  },

  // 微信手机号登录
  onGetPhoneNumber(e) {
    // 调试模式直接用测试手机号登录
    this.doLogin({ phone: e.detail.code || '13800138000' });
  },

  doLogin(loginData) {
    const token = wx.getStorageSync('token');
    const openid = wx.getStorageSync('openid') || 'test_openid_debug';
    const data = { ...loginData, openid };
    
    wx.showLoading({ title: '登录中...' });
    
    wx.request({
      url: 'http://47.111.170.178:3000/api/auth/login',
      method: 'POST',
      data: data,
      header: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
      },
      success: (res) => {
        wx.hideLoading();
        if (res.data.code === 0) {
          wx.setStorageSync('token', res.data.data.token);
          this.setData({ isLoggedIn: true });
          this.loadUserData();
        } else {
          wx.showToast({ title: res.data.msg || '登录失败', icon: 'none' });
        }
      },
      fail: (err) => {
        wx.hideLoading();
        wx.showToast({ title: '网络错误', icon: 'none' });
      }
    });
  },


