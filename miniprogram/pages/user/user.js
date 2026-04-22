// pages/user/user.js - 个人中心页面
const app = getApp();

Page({
  data: {
    isLoggedIn: false,
    userInfo: {},
    healthProfile: {},
    medals: [],
    currentTab: 'profile',
    
    // 登录表单
    loginPhone: '',
    loginPassword: '',
    
    // 注册弹窗
    showRegisterModal: false,
    regPhone: '',
    regPassword: '',
    regNickname: ''
  },

  onLoad() {
    this.checkLoginStatus();
  },

  // 检查登录状态
  checkLoginStatus() {
    const token = wx.getStorageSync('token');
    const userInfo = wx.getStorageSync('userInfo');
    if (token && userInfo) {
      this.setData({ isLoggedIn: true, userInfo });
    }
  },

  // 登录表单输入
  onPhoneInput(e) {
    this.setData({ loginPhone: e.detail.value });
  },
  onPasswordInput(e) {
    this.setData({ loginPassword: e.detail.value });
  },

  // 登录
  onLogin() {
    const { loginPhone, loginPassword } = this.data;
    
    if (!loginPhone || loginPhone.length !== 11) {
      wx.showToast({ title: '请输入正确手机号', icon: 'none' });
      return;
    }
    if (!loginPassword || loginPassword.length < 6) {
      wx.showToast({ title: '密码至少6位', icon: 'none' });
      return;
    }
    
    wx.showLoading({ title: '登录中...' });
    
    wx.request({
      url: 'http://47.111.170.178:3000/api/auth/login',
      method: 'POST',
      data: { phone: loginPhone, password: loginPassword },
      header: { 'Content-Type': 'application/json' },
      success: (res) => {
        wx.hideLoading();
        if (res.data.code === 0) {
          wx.setStorageSync('token', res.data.data.token);
          wx.setStorageSync('userInfo', res.data.data.user);
          this.setData({ 
            isLoggedIn: true, 
            userInfo: res.data.data.user,
            loginPhone: '',
            loginPassword: ''
          });
          wx.showToast({ title: '登录成功', icon: 'success' });
        } else {
          wx.showToast({ title: res.data.msg || '登录失败', icon: 'none' });
        }
      },
      fail: () => {
        wx.hideLoading();
        wx.showToast({ title: '网络错误', icon: 'none' });
      }
    });
  },

  // 显示注册弹窗
  showRegister() {
    this.setData({ showRegisterModal: true });
  },
  hideRegister() {
    this.setData({ showRegisterModal: false });
  },

  // 注册表单输入
  onRegPhone(e) { this.setData({ regPhone: e.detail.value }); },
  onRegPassword(e) { this.setData({ regPassword: e.detail.value }); },
  onRegNickname(e) { this.setData({ regNickname: e.detail.value }); },

  // 注册
  onRegister() {
    const { regPhone, regPassword, regNickname } = this.data;
    
    if (!regPhone || regPhone.length !== 11) {
      wx.showToast({ title: '请输入正确手机号', icon: 'none' });
      return;
    }
    if (!regPassword || regPassword.length < 6) {
      wx.showToast({ title: '密码至少6位', icon: 'none' });
      return;
    }
    
    wx.showLoading({ title: '注册中...' });
    
    wx.request({
      url: 'http://47.111.170.178:3000/api/auth/register',
      method: 'POST',
      data: { phone: regPhone, password: regPassword, nickname: regNickname || '用户' },
      header: { 'Content-Type': 'application/json' },
      success: (res) => {
        wx.hideLoading();
        if (res.data.code === 0) {
          wx.setStorageSync('token', res.data.data.token);
          wx.setStorageSync('userInfo', res.data.data.user);
          this.setData({ 
            isLoggedIn: true, 
            userInfo: res.data.data.user,
            showRegisterModal: false
          });
          wx.showToast({ title: '注册成功', icon: 'success' });
        } else {
          wx.showToast({ title: res.data.msg || '注册失败', icon: 'none' });
        }
      },
      fail: () => {
        wx.hideLoading();
        wx.showToast({ title: '网络错误', icon: 'none' });
      }
    });
  },

  // 退出登录
  onLogout() {
    wx.removeStorageSync('token');
    wx.removeStorageSync('userInfo');
    this.setData({ isLoggedIn: false, userInfo: {} });
  },

  // Tab切换
  switchTab(e) {
    this.setData({ currentTab: e.currentTarget.dataset.tab });
  },

  // 编辑健康档案
  editHealth() {
    wx.showToast({ title: '功能开发中', icon: 'none' });
  }
});
