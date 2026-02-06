// backend/routes/blackOil.js（引擎油管理接口）
const express = require('express');
const router = express.Router();

// 1. 车牌唯一性校验接口（对应 VBA Sheet1 车牌查重）
router.post('/check-plate', (req, res) => {
  const { plate } = req.body;
  // 从数据库查询是否存在该车牌
  const isDuplicate = checkPlateDuplicate(plate); 
  if (isDuplicate) {
    return res.status(400).json({ msg: 'License plate duplicated! Enter unique value.' });
  }
  res.json({ valid: true });
});

// 2. 里程差计算 + 预警判断（对应 VBA 标色逻辑）
router.post('/calculate-diff', (req, res) => {
  const { totalMileage, consumptionMileage } = req.body;
  const diff = totalMileage - consumptionMileage;
  let alert = 'Black Oil Safe';
  let color = 'white';
  if (diff <= 0) {
    alert = 'Need Black Oil Change (Overdue)';
    color = 'red';
  } else if (diff <= 1000) {
    alert = 'Black Oil Reminder (Low Remain)';
    color = 'yellow';
  }
  res.json({ diff, alert, color });
});

// 其他接口：数据保存、预警汇总、邮件发送...
module.exports = router;