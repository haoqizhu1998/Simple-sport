Page({
  data: { phone: '', password: '' },
  
  inputPhone(e) { this.setData({ phone: e.detail.value }); },
  inputPassword(e) { this.setData({ password: e.detail.value }); },
  
  doLogin() {
    const { phone, password } = this.data;
    if (!phone || phone.length != 11) { wx.showToast({ title: '请输入手机号', icon: 'none' }); return; }
    if (!password || password.length < 6) { wx.showToast({ title: '请输入密码', icon: 'none' }); return; }
    
    wx.showLoading({ title: '登录中...' });
    wx.request({
      url: 'http://47.111.170.178:3000/api/auth/login',
      method: 'POST',
      data: { phone, password },
      header: { 'Content-Type': 'application/json' },
      success: (res) => {
        wx.hideLoading();
        if (res.data.code === 0) {
          wx.setStorageSync('token', res.data.data.token);
          wx.setStorageSync('userInfo', res.data.data.user);
          wx.showToast({ title: '登录成功', icon: 'success' });
        } else { wx.showToast({ title: res.data.msg || '登录失败', icon: 'none' }); }
      },
      fail: () => { wx.hideLoading(); wx.showToast({ title: '网络错误', icon: 'none' }); }
    });
  },
  
  doRegister() {
    const { phone, password } = this.data;
    if (!phone || phone.length != 11) { wx.showToast({ title: '请输入手机号', icon: 'none' }); return; }
    if (!password || password.length < 6) { wx.showToast({ title: '密码至少6位', icon: 'none' }); return; }
    
    wx.showLoading({ title: '注册中...' });
    wx.request({
      url: 'http://47.111.170.178:3000/api/auth/register',
      method: 'POST',
      data: { phone, password, nickname: '用户' },
      header: { 'Content-Type': 'application/json' },
      success: (res) => {
        wx.hideLoading();
        if (res.data.code === 0) {
          wx.setStorageSync('token', res.data.data.token);
          wx.setStorageSync('userInfo', res.data.data.user);
          wx.showToast({ title: '注册成功', icon: 'success' });
        } else { wx.showToast({ title: res.data.msg || '注册失败', icon: 'none' }); }
      },
      fail: () => { wx.hideLoading(); wx.showToast({ title: '网络错误', icon: 'none' }); }
    });
  }
});
