/**
 * 工具函数库
 */

/**
 * 格式化日期
 * @param {Date|string|number} date 
 * @param {string} format 
 * @returns {string}
 */
const formatDate = (date, format = 'YYYY-MM-DD') => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');

  return format
    .replace('YYYY', year)
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds);
};

/**
 * 格式化配速显示
 * @param {number} pace 配速（分钟/公里）
 * @returns {string}
 */
const formatPace = (pace) => {
  if (!pace || pace <= 0) return '--:--';
  const minutes = Math.floor(pace);
  const seconds = Math.round((pace - minutes) * 60);
  return `${minutes}'${String(seconds).padStart(2, '0')}"`;
};

/**
 * 格式化距离
 * @param {number} distance 距离（公里）
 * @returns {string}
 */
const formatDistance = (distance) => {
  if (!distance) return '0';
  return distance >= 1 ? distance.toFixed(2) : distance.toFixed(2);
};

/**
 * 解析配速字符串为数字
 * @param {string} paceStr 配速字符串如 "5'30""
 * @returns {number}
 */
const parsePace = (paceStr) => {
  if (!paceStr) return 0;
  const match = paceStr.match(/(\d+)'(\d+)"/);
  if (match) {
    return parseInt(match[1]) + parseInt(match[2]) / 60;
  }
  return parseFloat(paceStr) || 0;
};

/**
 * 计算跑步用时
 * @param {number} distance 距离（公里）
 * @param {number} pace 配速（分钟/公里）
 * @returns {string}
 */
const calculateDuration = (distance, pace) => {
  if (!distance || !pace || pace <= 0) return '00:00:00';
  const totalMinutes = distance * pace;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = Math.floor(totalMinutes % 60);
  const seconds = Math.round((totalMinutes - Math.floor(totalMinutes)) * 60);
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

/**
 * 获取星期几
 * @param {Date|string} date 
 * @returns {string}
 */
const getWeekday = (date) => {
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  const d = new Date(date);
  return weekdays[d.getDay()];
};

/**
 * 获取相对时间描述
 * @param {Date|string} date 
 * @returns {string}
 */
const getRelativeTime = (date) => {
  const now = new Date();
  const d = new Date(date);
  const diff = now - d;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (days === 0) return '今天';
  if (days === 1) return '昨天';
  if (days === 2) return '前天';
  if (days < 7) return `${days}天前`;
  if (days < 30) return `${Math.floor(days / 7)}周前`;
  return formatDate(date, 'MM-DD');
};

/**
 * 获取RPE等级描述
 * @param {number} rpe 
 * @returns {string}
 */
const getRPEDescription = (rpe) => {
  const descriptions = {
    1: '非常轻松',
    2: '很轻松',
    3: '轻松',
    4: '较轻松',
    5: '中等',
    6: '较费力',
    7: '费力',
    8: '很费力',
    9: '非常费力',
    10: '极度费力/精疲力竭'
  };
  return descriptions[rpe] || '未知';
};

/**
 * 获取训练类型颜色
 * @param {string} type 
 * @returns {string}
 */
const getTrainingTypeColor = (type) => {
  const colors = {
    '有氧训练': '#00D9FF',
    '间歇训练': '#FF6B6B',
    '恢复训练': '#00FF88',
    '长距离训练': '#9B59B6',
    '力量训练': '#F39C12'
  };
  return colors[type] || '#00D9FF';
};

/**
 * 校验表单数据
 * @param {Object} data 
 * @param {Array} rules 
 * @returns {Object}
 */
const validateForm = (data, rules) => {
  for (const rule of rules) {
    const { field, label, required, type, min, max } = rule;
    const value = data[field];

    if (required && (!value && value !== 0)) {
      return { valid: false, message: `请填写${label}` };
    }

    if (value !== undefined && value !== '') {
      if (type === 'number') {
        const num = parseFloat(value);
        if (isNaN(num)) {
          return { valid: false, message: `${label}请输入数字` };
        }
        if (min !== undefined && num < min) {
          return { valid: false, message: `${label}不能小于${min}` };
        }
        if (max !== undefined && num > max) {
          return { valid: false, message: `${label}不能大于${max}` };
        }
      }
    }
  }
  return { valid: true };
};

/**
 * 防抖函数
 * @param {Function} func 
 * @param {number} wait 
 * @returns {Function}
 */
const debounce = (func, wait = 300) => {
  let timeout;
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
};

/**
 * 节流函数
 * @param {Function} func 
 * @param {number} wait 
 * @returns {Function}
 */
const throttle = (func, wait = 300) => {
  let lastTime = 0;
  return function(...args) {
    const now = Date.now();
    if (now - lastTime >= wait) {
      lastTime = now;
      func.apply(this, args);
    }
  };
};

module.exports = {
  formatDate,
  formatPace,
  formatDistance,
  parsePace,
  calculateDuration,
  getWeekday,
  getRelativeTime,
  getRPEDescription,
  getTrainingTypeColor,
  validateForm,
  debounce,
  throttle
};
