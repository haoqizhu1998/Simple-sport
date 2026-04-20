# Simple运动 微信小程序

> AI训练复盘助手 - V1.0 MVP

## 项目简介

Simple运动是一款面向跑步爱好者和铁三运动员的微信小程序，通过AI技术帮助用户分析训练效果、提供个性化建议，科学提升运动表现。

### 核心功能

- 📝 **训练记录** - 快速记录跑步数据（距离、配速、心率、RPE）
- 🤖 **AI复盘** - 智能分析训练类型、效果评分、能力影响
- 📊 **数据统计** - 训练次数、里程、效果趋势一览
- 🎯 **目标管理** - 设定比赛目标和训练计划

## 技术栈

- **框架**：原生微信小程序（无框架依赖）
- **开发语言**：JavaScript / WXML / WXSS
- **数据存储**：本地Storage（wx.getStorageSync / wx.setStorageSync）
- **网络请求**：Promise封装wx.request

## 目录结构

```
Simple运动小程序/
├── miniprogram/                 # 小程序主目录
│   ├── app.js                   # 应用入口
│   ├── app.json                 # 全局配置
│   ├── app.wxss                 # 全局样式
│   ├── pages/                   # 页面目录
│   │   ├── index/               # 首页
│   │   │   ├── index.js
│   │   │   ├── index.json
│   │   │   ├── index.wxml
│   │   │   └── index.wxss
│   │   ├── review/              # 训练复盘
│   │   │   ├── review.js
│   │   │   ├── review.json
│   │   │   ├── review.wxml
│   │   │   └── review.wxss
│   │   ├── result/              # 复盘结果
│   │   │   ├── result.js
│   │   │   ├── result.json
│   │   │   ├── result.wxml
│   │   │   └── result.wxss
│   │   ├── history/             # 训练历史
│   │   │   ├── history.js
│   │   │   ├── history.json
│   │   │   ├── history.wxml
│   │   │   └── history.wxss
│   │   └── profile/             # 个人中心
│   │       ├── profile.js
│   │       ├── profile.json
│   │       ├── profile.wxml
│   │       └── profile.wxss
│   ├── components/              # 公共组件（预留）
│   └── utils/                   # 工具函数
│       ├── api.js              # API请求封装
│       └── utils.js            # 通用工具函数
├── AI提示词.md                  # AI复盘提示词模板
└── README.md                   # 项目说明文档
```

## 页面说明

### 1. 首页 (index)
- 今日训练状态展示
- 快速添加训练入口
- 本周训练趋势图
- 历史训练预览

### 2. 训练复盘 (review)
- 距离输入（km）
- 配速输入（分:秒/km）
- 心率输入（可选）
- RPE选择器（1-10）
- 训练截图上传（最多3张）
- AI分析触发

### 3. 复盘结果 (result)
- 训练类型识别
- 效果评分展示（0-100）
- 训练质量评估
- 能力影响分析
- 明日训练建议
- 分享功能

### 4. 训练历史 (history)
- 全部训练记录列表
- 按时间筛选（全部/本周/本月）
- 数据统计概览
- 记录删除功能

### 5. 个人中心 (profile)
- 用户基本信息
- 运动类型选择
- 目标设置（比赛目标、完赛时间）
- 数据统计（总训练次数、总里程）

## API接口

### analyzeTraining(data)
AI分析训练数据

**请求参数：**
```javascript
{
  distance: Number,    // 距离（km）
  pace: Number,        // 配速（分钟/公里）
  heartRate: Number,    // 心率（可选）
  rpe: Number,         // 主观疲劳度（1-10）
  images: String[],    // 截图列表（可选）
  date: String         // 日期时间
}
```

**返回结果：**
```javascript
{
  trainingType: String,     // 训练类型
  trainingTypeEn: String,    // 英文类型
  score: Number,            // 效果评分
  quality: String,          // 质量评估
  qualityDesc: String,      // 质量说明
  abilities: Array,         // 能力影响
  suggestions: Array        // 明日建议
}
```

## 数据存储

### Storage Key
| Key | 说明 | 数据类型 |
|-----|------|----------|
| userProfile | 用户信息 | Object |
| trainingHistory | 训练历史 | Array |
| token | 认证Token | String |

### 数据结构

**userProfile:**
```javascript
{
  name: String,           // 用户昵称
  sportType: String,      // 运动类型
  goal: String,           // 训练目标
  targetRace: String,     // 目标赛事
  targetTime: String,     // 目标时间
  totalTrainings: Number, // 总训练次数
  totalDistance: Number   // 总里程
}
```

**trainingHistory:**
```javascript
{
  id: String,            // 记录ID
  distance: Number,       // 距离
  pace: Number,          // 配速
  paceStr: String,       // 配速字符串
  heartRate: Number,     // 心率
  rpe: Number,           // 疲劳度
  rpeDesc: String,       // 疲劳描述
  duration: String,      // 时长
  date: String,          // 日期时间
  dateStr: String,       // 显示日期
  trainingType: String,  // 训练类型
  trainingTypeEn: String,// 英文类型
  score: Number,         // 评分
  quality: String,       // 质量
  qualityDesc: String,  // 质量说明
  abilities: Array,      // 能力影响
  suggestions: Array    // 建议
}
```

## 使用说明

### 环境要求
- 微信开发者工具最新版
- 微信小程序基础库 2.20+

### 运行项目

1. 克隆项目代码
2. 打开微信开发者工具
3. 导入项目目录
4. 填入AppID（可使用测试号）
5. 编译运行

### 添加TabBar图标

在 `miniprogram/assets/icons/` 目录下添加以下图标：
- home.png / home-active.png
- review.png / review-active.png
- history.png / history-active.png
- profile.png / profile-active.png

图标尺寸：81×81 像素

## 开发指南

### 添加新页面

1. 在 `pages/` 下创建页面文件夹
2. 创建 4 个文件：.js, .json, .wxml, .wxss
3. 在 `app.json` 的 `pages` 中注册页面
4. 配置 tabBar（如果是Tab页面）

### 添加公共组件

1. 在 `components/` 下创建组件文件夹
2. 创建组件文件：.js, .json, .wxml, .wxss
3. 在页面的 `.json` 文件中配置 usingComponents

### 调用API

```javascript
const { request, analyzeTraining } = require('../../utils/api.js');

// 网络请求
request({
  url: '/api/xxx',
  method: 'GET',
  data: { id: 1 }
}).then(res => {
  console.log(res);
});

// AI分析
analyzeTraining(data).then(res => {
  console.log(res);
});
```

### 工具函数

```javascript
const utils = require('../../utils/utils.js');

// 格式化日期
utils.formatDate(new Date(), 'YYYY-MM-DD'); // "2024-01-15"

// 格式化配速
utils.formatPace(5.5); // "5'30""

// 计算时长
utils.calculateDuration(10, 5.5); // "00:55:00"

// 获取RPE描述
utils.getRPEDescription(7); // "费力"
```

## 后续迭代计划

- [ ] V1.1 接入真实AI服务
- [ ] V2.0 用户登录系统
- [ ] V2.1 训练计划功能
- [ ] V2.2 数据同步与备份
- [ ] V3.0 社区功能

## 贡献指南

欢迎提交Issue和Pull Request！

## License

MIT License © 2024 Simple运动
