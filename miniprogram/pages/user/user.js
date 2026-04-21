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
    if (e.detail.errMsg !== 'getPhoneNumber:ok') {
      wx.showToast({ title: '授权失败', icon: 'none' });
      return;
    }

    wx.showLoading({ title: '登录中...' });

    // 云函数处理登录
    if (wx.cloud) {
      wx.cloud.callFunction({
        name: 'login',
        data: {
          phone: e.detail.code
        }
      }).then(res => {
        wx.hideLoading();
        if (res.result && res.result.success) {
          this.handleLoginSuccess(res.result.userInfo);
        } else {
          // 降级为本地存储登录
          this.handleLoginSuccess({
            id: 'local_' + Date.now(),
            nickname: '运动达人',
            level: 1,
            expPoints: 0
          });
        }
      }).catch(() => {
        wx.hideLoading();
        // 降级处理
        this.handleLoginSuccess({
          id: 'local_' + Date.now(),
          nickname: '运动达人',
          level: 1,
          expPoints: 0
        });
      });
    } else {
      // 无云能力时的本地登录
      this.handleLoginSuccess({
        id: 'local_' + Date.now(),
        nickname: '运动达人',
        level: 1,
        expPoints: 0
      });
      wx.hideLoading();
    }
  },

  // 游客登录
  onGuestLogin() {
    this.handleLoginSuccess({
      id: 'guest_' + Date.now(),
      nickname: '游客',
      level: 1,
      expPoints: 0
    });
  },

  // 登录成功处理
  handleLoginSuccess(userInfo) {
    const userData = {
      ...this.data.userInfo,
      ...userInfo,
      isLoggedIn: true
    };
    
    wx.setStorageSync('userData', userData);
    
    this.setData({
      isLoggedIn: true,
      userInfo: userData
    });
    
    // 同步到云数据库
    this.syncToCloud(userInfo);
    
    wx.showToast({ title: '登录成功', icon: 'success' });
  },

  // 同步到云数据库
  syncToCloud(userInfo) {
    if (!wx.cloud) return;
    
    const db = wx.cloud.database();
    const openid = wx.getStorageSync('openid') || userInfo.id;
    
    db.collection('users').add({
      data: {
        _id: openid,
        nickname: userInfo.nickname || '运动达人',
        avatar_url: userInfo.avatarUrl || '',
        phone: userInfo.phone || '',
        level: userInfo.level || 1,
        exp_points: userInfo.expPoints || 0,
        created_at: new Date(),
        updated_at: new Date()
      }
    }).catch(err => {
      console.log('云同步失败', err);
    });
  },

  // 退出登录
  onLogout() {
    wx.showModal({
      title: '提示',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          wx.clearStorageSync();
          this.setData({
            isLoggedIn: false,
            userInfo: this.data.userInfo,
            healthProfile: {},
            medals: [],
            currentTab: 'profile'
          });
          wx.showToast({ title: '已退出登录', icon: 'success' });
        }
      }
    });
  },

  // 切换Tab
  switchTab(e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({ currentTab: tab });
  },

  // ========== 个人资料相关 ==========
  editProfile() {
    this.setData({
      showProfileEdit: true,
      editForm: { ...this.data.userInfo }
    });
  },

  closeProfileEdit() {
    this.setData({ showProfileEdit: false });
  },

  onNicknameInput(e) {
    this.setData({ 'editForm.nickname': e.detail.value });
  },

  onGenderChange(e) {
    const genderMap = { 0: '', 1: 'male', 2: 'female', 3: 'other' };
    this.setData({ 'editForm.gender': genderMap[e.detail.value] });
  },

  onBirthdayChange(e) {
    this.setData({ 'editForm.birthday': e.detail.value });
  },

  onRegionInput(e) {
    this.setData({ 'editForm.region': e.detail.value });
  },

  saveProfileEdit() {
    const { editForm } = this.data;
    
    // 更新本地存储
    const userData = wx.getStorageSync('userData') || {};
    const updatedUserData = { ...userData, ...editForm };
    wx.setStorageSync('userData', updatedUserData);
    
    // 更新页面数据
    this.setData({
      userInfo: { ...this.data.userInfo, ...editForm },
      showProfileEdit: false
    });
    
    // 同步到云
    this.syncProfileToCloud(editForm);
    
    wx.showToast({ title: '保存成功', icon: 'success' });
  },

  syncProfileToCloud(data) {
    if (!wx.cloud) return;
    
    const db = wx.cloud.database();
    const openid = wx.getStorageSync('openid');
    
    db.collection('users').doc(openid).update({
      data: {
        nickname: data.nickname,
        gender: data.gender,
        birthday: data.birthday,
        region: data.region,
        updated_at: new Date()
      }
    });
  },

  // ========== 健康档案相关 ==========
  editHealthProfile() {
    this.setData({
      showHealthEdit: true,
      editHealth: { ...this.data.healthProfile }
    });
  },

  closeHealthEdit() {
    this.setData({ showHealthEdit: false });
  },

  onAgeInput(e) {
    this.setData({ 'editHealth.age': parseInt(e.detail.value) || null });
  },

  onHeightInput(e) {
    this.setData({ 'editHealth.height': parseFloat(e.detail.value) || null });
  },

  onWeightInput(e) {
    this.setData({ 'editHealth.weight': parseFloat(e.detail.value) || null });
  },

  onBodyTypeChange(e) {
    const bodyTypeMap = { 0: 'slim', 1: 'normal', 2: 'overweight', 3: 'obese' };
    this.setData({ 'editHealth.body_type': bodyTypeMap[e.detail.value] });
  },

  onFrequencyChange(e) {
    const freqMap = ['rarely', '1_2_per_week', '3_4_per_week', 'daily'];
    this.setData({ 'editHealth.exercise_frequency': freqMap[e.detail.value] });
  },

  toggleSymptom(e) {
    const symptom = e.currentTarget.dataset.symptom;
    const symptoms = this.data.editHealth.symptoms || [];
    const index = symptoms.indexOf(symptom);
    
    if (index > -1) {
      symptoms.splice(index, 1);
    } else {
      // 移除"无不适"选项
      const noSymptomIndex = symptoms.indexOf('无不适');
      if (noSymptomIndex > -1) {
        symptoms.splice(noSymptomIndex, 1);
      }
      symptoms.push(symptom);
    }
    
    this.setData({ 'editHealth.symptoms': symptoms });
  },

  toggleInjury(e) {
    const injury = e.currentTarget.dataset.injury;
    const injuries = this.data.editHealth.injuries || [];
    const index = injuries.indexOf(injury);
    
    if (index > -1) {
      injuries.splice(index, 1);
    } else {
      // 移除"无"选项
      const noInjuryIndex = injuries.indexOf('无');
      if (noInjuryIndex > -1) {
        injuries.splice(noInjuryIndex, 1);
      }
      injuries.push(injury);
    }
    
    this.setData({ 'editHealth.injuries': injuries });
  },

  toggleHealthGoal(e) {
    const goal = e.currentTarget.dataset.goal;
    const goals = this.data.editHealth.health_goals || [];
    const index = goals.indexOf(goal);
    
    if (index > -1) {
      goals.splice(index, 1);
    } else {
      goals.push(goal);
    }
    
    this.setData({ 'editHealth.health_goals': goals });
  },

  saveHealthEdit() {
    const { editHealth } = this.data;
    
    // 更新本地存储
    wx.setStorageSync('healthProfile', editHealth);
    
    // 更新页面数据
    this.setData({
      healthProfile: editHealth,
      showHealthEdit: false
    });
    
    // 同步到云
    this.syncHealthToCloud(editHealth);
    
    wx.showToast({ title: '保存成功', icon: 'success' });
  },

  syncHealthToCloud(data) {
    if (!wx.cloud) return;
    
    const db = wx.cloud.database();
    const openid = wx.getStorageSync('openid');
    
    db.collection('health_profiles').add({
      data: {
        user_id: openid,
        age: data.age,
        height: data.height,
        weight: data.weight,
        body_type: data.body_type,
        symptoms: data.symptoms || [],
        injuries: data.injuries || [],
        health_goals: data.health_goals || [],
        exercise_frequency: data.exercise_frequency,
        updated_at: new Date()
      }
    }).catch(err => {
      console.log('健康档案云同步失败', err);
    });
  },

  // ========== 数据连接相关 ==========
  handleDataConnection(e) {
    const { platform, status } = e.currentTarget.dataset;
    
    if (status === 'connected') {
      // 断开连接
      wx.showModal({
        title: '提示',
        content: '确定要断开该平台的连接吗？',
        success: (res) => {
          if (res.confirm) {
            this.disconnectPlatform(platform);
          }
        }
      });
    } else {
      // 连接平台（模拟，实际需要OAuth授权）
      wx.showToast({ title: '跳转授权页面...', icon: 'none' });
      setTimeout(() => {
        this.connectPlatform(platform);
      }, 1000);
    }
  },

  connectPlatform(platform) {
    const connections = wx.getStorageSync('dataConnections') || [];
    const connection = {
      platform,
      status: 'connected',
      lastSyncTime: new Date().getTime()
    };
    
    const index = connections.findIndex(c => c.platform === platform);
    if (index > -1) {
      connections[index] = connection;
    } else {
      connections.push(connection);
    }
    
    wx.setStorageSync('dataConnections', connections);
    
    // 同步到云
    if (wx.cloud) {
      const db = wx.cloud.database();
      const openid = wx.getStorageSync('openid');
      
      db.collection('data_connections').add({
        data: {
          user_id: openid,
          platform,
          status: 'connected',
          last_sync_time: new Date(),
          created_at: new Date()
        }
      });
    }
    
    // 更新UI
    const dataSources = this.data.dataSources.map(source => {
      if (source.platform === platform) {
        return {
          ...source,
          status: 'connected',
          lastSyncTime: this.formatTime(new Date())
        };
      }
      return source;
    });
    
    this.setData({ dataSources });
    wx.showToast({ title: '连接成功', icon: 'success' });
  },

  disconnectPlatform(platform) {
    let connections = wx.getStorageSync('dataConnections') || [];
    connections = connections.filter(c => c.platform !== platform);
    wx.setStorageSync('dataConnections', connections);
    
    // 从云删除
    if (wx.cloud) {
      const db = wx.cloud.database();
      const openid = wx.getStorageSync('openid');
      
      db.collection('data_connections').where({
        user_id: openid,
        platform
      }).remove();
    }
    
    // 更新UI
    const dataSources = this.data.dataSources.map(source => {
      if (source.platform === platform) {
        return {
          ...source,
          status: 'disconnected',
          lastSyncTime: ''
        };
      }
      return source;
    });
    
    this.setData({ dataSources });
    wx.showToast({ title: '已断开连接', icon: 'success' });
  },

  // ========== 辅助函数 ==========
  getGenderName(gender) {
    const map = { male: '男', female: '女', other: '其他', '': '未设置' };
    return map[gender] || '未设置';
  },

  getBodyTypeName(type) {
    const map = { slim: '偏瘦', normal: '标准', overweight: '偏胖', obese: '肥胖', '': '未设置' };
    return map[type] || '未设置';
  },

  getFrequencyName(freq) {
    const map = { rarely: '偶尔', '1_2_per_week': '每周1-2次', '3_4_per_week': '每周3-4次', daily: '每天', '': '未设置' };
    return map[freq] || '未设置';
  },

  formatTime(timestamp) {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hour = date.getHours().toString().padStart(2, '0');
    const min = date.getMinutes().toString().padStart(2, '0');
    return `${month}-${day} ${hour}:${min}`;
  },

  stopPropagation() {
    // 阻止冒泡
  }
})
