/**
 * Promise封装wx.request
 */

const baseUrl = 'https://api.simple-sport.com'; // 模拟API地址

const request = (options) => {
  return new Promise((resolve, reject) => {
    wx.showLoading({
      title: options.loadingText || '加载中...',
      mask: true
    });

    wx.request({
      url: baseUrl + options.url,
      method: options.method || 'GET',
      data: options.data || {},
      header: {
        'content-type': 'application/json',
        'Authorization': wx.getStorageSync('token') || '',
        ...options.header
      },
      success: (res) => {
        wx.hideLoading();
        if (res.statusCode === 200) {
          if (res.data.code === 0) {
            resolve(res.data.data);
          } else {
            wx.showToast({
              title: res.data.message || '请求失败',
              icon: 'none'
            });
            reject(res.data);
          }
        } else if (res.statusCode === 401) {
          wx.showToast({
            title: '请先登录',
            icon: 'none'
          });
          reject(res.data);
        } else {
          reject(res.data);
        }
      },
      fail: (err) => {
        wx.hideLoading();
        wx.showToast({
          title: '网络请求失败',
          icon: 'none'
        });
        reject(err);
      }
    });
  });
};

// 模拟AI分析请求（实际项目中替换为真实API）
const analyzeTraining = (data) => {
  return new Promise((resolve) => {
    wx.showLoading({
      title: 'AI分析中...',
      mask: true
    });

    // 模拟API延迟
    setTimeout(() => {
      wx.hideLoading();
      
      // 模拟AI分析结果
      const result = generateMockAnalysis(data);
      resolve(result);
    }, 2000);
  });
};

// 生成模拟AI分析结果
const generateMockAnalysis = (data) => {
  const { distance, pace, heartRate, rpe } = data;
  
  // 根据数据计算训练类型
  let trainingType = '有氧训练';
  let trainingTypeEn = 'Aerobic';
  
  if (pace < 4.5 && rpe >= 7) {
    trainingType = '间歇训练';
    trainingTypeEn = 'Interval';
  } else if (rpe <= 3 || (distance < 3 && heartRate < 120)) {
    trainingType = '恢复训练';
    trainingTypeEn = 'Recovery';
  } else if (pace >= 6 || distance > 20) {
    trainingType = '长距离训练';
    trainingTypeEn = 'Long Run';
  }

  // 计算效果评分
  let score = 70;
  if (rpe >= 5 && rpe <= 7) score += 15;
  else if (rpe >= 4 && rpe <= 8) score += 10;
  else if (rpe < 3 || rpe > 9) score -= 20;
  
  if (heartRate >= 120 && heartRate <= 160) score += 10;
  else if (heartRate >= 100 && heartRate <= 170) score += 5;
  
  if (distance >= 5 && distance <= 15) score += 5;
  
  score = Math.min(100, Math.max(0, score));

  // 训练质量评估
  let quality = '一般';
  let qualityDesc = '训练量和强度适中，可以继续坚持';
  if (score >= 85) {
    quality = '高效';
    qualityDesc = '这是一次高质量的训练，各项指标配合完美';
  } else if (score >= 70) {
    quality = '良好';
    qualityDesc = '训练状态不错，继续保持';
  } else if (score < 50) {
    quality = '不足';
    qualityDesc = '训练强度偏低，建议适当增加运动量';
  }

  // 能力影响分析
  const abilities = [];
  if (trainingType === '间歇训练') {
    abilities.push({ name: '速度', change: '+', value: '显著提升' });
    abilities.push({ name: '耐力', change: '-', value: '略有消耗' });
  } else if (trainingType === '长距离训练') {
    abilities.push({ name: '耐力', change: '+', value: '显著提升' });
    abilities.push({ name: '速度', change: '-', value: '略有下降' });
  } else if (trainingType === '恢复训练') {
    abilities.push({ name: '恢复', change: '+', value: '明显加快' });
  } else {
    abilities.push({ name: '耐力', change: '+', value: '稳步提升' });
    abilities.push({ name: '心肺', change: '+', value: '持续改善' });
  }

  // 明日建议
  const suggestions = [
    { type: 'suggestion', text: '保证7-8小时充足睡眠' },
    { type: 'suggestion', text: '训练后及时补充蛋白质和碳水化合物' },
    { type: 'suggestion', text: '注意拉伸和泡沫轴放松' }
  ];

  if (score >= 80) {
    suggestions.unshift({ type: 'action', text: '建议：明天可以进行低强度交叉训练，如游泳或骑行' });
  } else if (score < 50) {
    suggestions.unshift({ type: 'action', text: '建议：明天可以适当提高训练强度，增加间歇内容' });
  } else {
    suggestions.unshift({ type: 'action', text: '建议：明天保持常规训练，注意控制运动量' });
  }

  return {
    trainingType,
    trainingTypeEn,
    score,
    quality,
    qualityDesc,
    abilities,
    suggestions,
    data
  };
};

module.exports = {
  request,
  analyzeTraining
};
