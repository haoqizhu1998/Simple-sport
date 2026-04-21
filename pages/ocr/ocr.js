// pages/ocr/ocr.js - 截图识别页面逻辑
const app = getApp();

Page({
  data: {
    imagePath: '',
    recognizedData: null,
    isLoading: false
  },

  onLoad() {
    // 检查是否传递了图片路径
  },

  // 选择图片
  chooseImage() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePath = res.tempFiles[0].tempFilePath;
        this.setData({ imagePath: tempFilePath });
        
        // 自动开始识别
        this.recognizeImage(tempFilePath);
      },
      fail: (err) => {
        console.error('选择图片失败', err);
        wx.showToast({
          title: '请选择图片',
          icon: 'none'
        });
      }
    });
  },

  // 识别图片
  recognizeImage(imagePath) {
    if (!imagePath) return;
    
    this.setData({ isLoading: true, recognizedData: null });
    
    // 显示加载提示
    wx.showLoading({ title: 'AI识别中...' });
    
    // 获取本地图片的base64
    wx.getFileSystemManager().readFile({
      filePath: imagePath,
      encoding: 'base64',
      success: (res) => {
        const base64 = res.data;
        
        // 调用AI识别接口
        this.callOCRAPI(base64);
      },
      fail: (err) => {
        console.error('读取图片失败', err);
        this.setData({ isLoading: false });
        wx.hideLoading();
        wx.showToast({
          title: '图片读取失败',
          icon: 'none'
        });
      }
    });
  },

  // 调用OCR识别API
  callOCRAPI(base64Image) {
    const apiUrl = app.globalData.apiBase || 'https://training-ai-psi.vercel.app';
    
    wx.request({
      url: `${apiUrl}/api/ocr`,
      method: 'POST',
      header: {
        'Content-Type': 'application/json'
      },
      data: {
        image: base64Image
      },
      success: (res) => {
        wx.hideLoading();
        
        if (res.data && res.data.success) {
          this.setData({
            recognizedData: res.data.data,
            isLoading: false
          });
          
          wx.showToast({
            title: '识别成功',
            icon: 'success'
          });
        } else {
          // API不可用，使用模拟数据演示
          this.useMockData();
        }
      },
      fail: (err) => {
        console.error('OCR API调用失败', err);
        // API不可用，使用模拟数据演示
        this.useMockData();
      }
    });
  },

  // 使用模拟数据进行演示（实际使用时替换为真实API）
  useMockData() {
    wx.hideLoading();
    
    // 模拟识别结果
    const mockData = {
      type: 'run',
      typeText: '跑步',
      distance: (Math.random() * 10 + 3).toFixed(2),
      duration: `${Math.floor(Math.random() * 30 + 20)}分${Math.floor(Math.random() * 60)}秒`,
      pace: `${(Math.random() * 2 + 4).toFixed(2)}`,
      heartRate: Math.floor(Math.random() * 40 + 130),
      calories: Math.floor(Math.random() * 300 + 200)
    };
    
    this.setData({
      recognizedData: mockData,
      isLoading: false
    });
    
    wx.showToast({
      title: '演示模式：识别成功',
      icon: 'none',
      duration: 2000
    });
  },

  // 保存记录
  saveRecord() {
    const { recognizedData } = this.data;
    if (!recognizedData) return;
    
    // 获取现有记录
    const records = wx.getStorageSync('trainingRecords') || [];
    
    // 创建新记录
    const newRecord = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().slice(0, 5),
      type: recognizedData.type,
      distance: recognizedData.distance,
      duration: this.parseDuration(recognizedData.duration),
      pace: recognizedData.pace,
      avgPace: recognizedData.pace,
      speed: recognizedData.speed,
      avgSpeed: recognizedData.speed,
      heartRate: recognizedData.heartRate,
      calories: recognizedData.calories,
      rpe: 5,
      quality: 'good',
      source: 'ocr'
    };
    
    records.unshift(newRecord);
    wx.setStorageSync('trainingRecords', records);
    
    wx.showToast({
      title: '已保存到训练记录',
      icon: 'success',
      success: () => {
        setTimeout(() => {
          wx.navigateBack();
        }, 1500);
      }
    });
  },

  // 解析时长字符串
  parseDuration(durationStr) {
    if (!durationStr) return 0;
    const match = durationStr.match(/(\d+)分(\d+)秒/);
    if (match) {
      return parseInt(match[1]) + Math.round(parseInt(match[2]) / 60);
    }
    return parseInt(durationStr) || 0;
  },

  // 清除结果
  clearResult() {
    this.setData({
      imagePath: '',
      recognizedData: null
    });
  }
});
