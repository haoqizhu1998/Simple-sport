// pages/review/review.js
const app = getApp();
const utils = require('../../utils/utils.js');
const { analyzeTraining } = require('../../utils/api.js');

Page({
  data: {
    formData: {
      distance: '',
      paceMinutes: '',
      paceSeconds: '',
      heartRate: '',
      rpe: 5
    },
    imageList: [],
    isAnalyzing: false,
    rules: [
      { field: 'distance', label: '距离', required: true, type: 'number', min: 0.1, max: 200 },
      { field: 'paceMinutes', label: '配速', required: true, type: 'number', min: 1, max: 30 },
      { field: 'heartRate', label: '心率', type: 'number', min: 60, max: 220 },
      { field: 'rpe', label: '主观感受', required: true, type: 'number', min: 1, max: 10 }
    ]
  },

  onLoad(options) {
    // 如果从首页跳转带了预填数据
    if (options.distance) {
      this.setData({
        'formData.distance': options.distance
      });
    }
  },

  // 输入处理
  onDistanceInput(e) {
    this.setData({
      'formData.distance': e.detail.value
    });
  },

  onPaceMinutesInput(e) {
    this.setData({
      'formData.paceMinutes': e.detail.value
    });
  },

  onPaceSecondsInput(e) {
    this.setData({
      'formData.paceSeconds': e.detail.value
    });
  },

  onHeartRateInput(e) {
    this.setData({
      'formData.heartRate': e.detail.value
    });
  },

  onRPEChange(e) {
    this.setData({
      'formData.rpe': parseInt(e.detail.value)
    });
  },

  // 添加图片
  chooseImage() {
    wx.chooseImage({
      count: 3 - this.data.imageList.length,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        this.setData({
          imageList: [...this.data.imageList, ...res.tempFilePaths]
        });
      }
    });
  },

  // 删除图片
  deleteImage(e) {
    const index = e.currentTarget.dataset.index;
    const imageList = this.data.imageList;
    imageList.splice(index, 1);
    this.setData({ imageList });
  },

  // 预览图片
  previewImage(e) {
    const index = e.currentTarget.dataset.index;
    wx.previewImage({
      current: this.data.imageList[index],
      urls: this.data.imageList
    });
  },

  // 表单验证
  validateForm() {
    const { distance, paceMinutes, paceSeconds, heartRate, rpe } = this.data.formData;
    
    if (!distance || parseFloat(distance) <= 0) {
      wx.showToast({ title: '请输入有效距离', icon: 'none' });
      return false;
    }
    
    if (!paceMinutes && !paceSeconds) {
      wx.showToast({ title: '请输入配速', icon: 'none' });
      return false;
    }

    const pace = parseInt(paceMinutes || 0) + (parseInt(paceSeconds || 0)) / 60;
    if (pace <= 0) {
      wx.showToast({ title: '请输入有效配速', icon: 'none' });
      return false;
    }

    if (heartRate && (parseInt(heartRate) < 60 || parseInt(heartRate) > 220)) {
      wx.showToast({ title: '心率范围60-220', icon: 'none' });
      return false;
    }

    return true;
  },

  // 开始分析
  async startAnalysis() {
    if (!this.validateForm()) return;

    const { distance, paceMinutes, paceSeconds, heartRate, rpe } = this.data.formData;
    const pace = parseInt(paceMinutes || 0) + (parseInt(paceSeconds || 0)) / 60;

    const analysisData = {
      distance: parseFloat(distance),
      pace: pace,
      heartRate: heartRate ? parseInt(heartRate) : null,
      rpe: parseInt(rpe),
      images: this.data.imageList,
      date: utils.formatDate(new Date(), 'YYYY-MM-DD HH:mm:ss')
    };

    this.setData({ isAnalyzing: true });

    try {
      const result = await analyzeTraining(analysisData);
      
      // 保存训练记录
      const record = {
        id: Date.now().toString(),
        ...analysisData,
        paceStr: utils.formatPace(pace),
        duration: utils.calculateDuration(parseFloat(distance), pace),
        dateStr: utils.formatDate(new Date(), 'MM-DD HH:mm'),
        rpeDesc: utils.getRPEDescription(parseInt(rpe)),
        ...result
      };

      // 获取类型样式
      record.typeClass = this.getTypeClass(result.trainingType);
      
      // 保存到全局和本地
      app.saveTrainingRecord(record);

      // 跳转到结果页
      wx.navigateTo({
        url: `/pages/result/result?recordId=${record.id}`
      });

    } catch (error) {
      wx.showToast({
        title: '分析失败，请重试',
        icon: 'none'
      });
    } finally {
      this.setData({ isAnalyzing: false });
    }
  },

  getTypeClass(type) {
    const typeMap = {
      '有氧训练': 'aerobic',
      '间歇训练': 'interval',
      '恢复训练': 'recovery',
      '长距离训练': 'long'
    };
    return typeMap[type] || 'aerobic';
  },

  // 重置表单
  resetForm() {
    this.setData({
      formData: {
        distance: '',
        paceMinutes: '',
        paceSeconds: '',
        heartRate: '',
        rpe: 5
      },
      imageList: []
    });
  }
})
