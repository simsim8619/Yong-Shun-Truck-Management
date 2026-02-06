// api/predict.js - 预测管理接口（对应原 Sheet3）
const { db, langMsg } = require('./common');

module.exports = async (req, res) => {
  // 跨域配置
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 核心：计划里程预测（POST 请求）
  if (req.method === 'POST') {
    const { plate, planned_mileage, lang = 'zh' } = req.body;
    // 1. 基础校验
    if (!plate) return res.status(400).json({ code: -1, msg: lang === 'zh' ? '请输入车牌' : 'Please enter license plate' });
    if (planned_mileage <= 0) return res.status(400).json({ code: -1, msg: lang === 'zh' ? '计划里程必须为正数' : 'Planned mileage must be positive' });

    // 2. 匹配引擎油数据（black_oil 表）
    const blackOilData = await new Promise((resolve) => {
      db.get(`SELECT total_mileage, consumption_mileage FROM black_oil WHERE plate = ?`, [plate], (err, row) => {
        resolve(row || null);
      });
    });

    // 3. 匹配齿轮油数据（gear_oil 表）
    const gearOilData = await new Promise((resolve) => {
      db.get(`SELECT total_mileage, consumption_mileage FROM gear_oil WHERE plate = ?`, [plate], (err, row) => {
        resolve(row || null);
      });
    });

    // 4. 无数据则返回提示
    if (!blackOilData && !gearOilData) {
      return res.json({ code: -1, msg: lang === 'zh' ? '未找到该车牌的油液数据' : 'No oil data found for this plate' });
    }

    // 5. 计算剩余里程（和原 VBA 逻辑一致）
    const result = {};
    // 引擎油剩余里程
    if (blackOilData) {
      const currentBlackODO = blackOilData.consumption_mileage;
      const nextBlackODO = blackOilData.total_mileage;
      const blackRemainOriginal = nextBlackODO - currentBlackODO;
      const blackRemainFinal = blackRemainOriginal - planned_mileage;
      // 引擎油预警
      let blackAlert, blackColor;
      if (blackRemainFinal <= 0) {
        blackAlert = lang === 'zh' ? '需要更换引擎油（已过期）' : 'Need Black Oil Change (Overdue)';
        blackColor = 'red';
      } else if (blackRemainFinal <= 1000) {
        blackAlert = lang === 'zh' ? '引擎油剩余不足（提醒）' : 'Black Oil Reminder (Low Remain)';
        blackColor = 'yellow';
      } else {
        blackAlert = lang === 'zh' ? '引擎油状态正常' : 'Black Oil Safe';
        blackColor = 'white';
      }
      result.blackOil = {
        current_mileage: currentBlackODO,
        next_maintain: nextBlackODO,
        remain_original: blackRemainOriginal,
        remain_final: blackRemainFinal,
        alert: blackAlert,
        color: blackColor
      };
    }

    // 齿轮油剩余里程
    if (gearOilData) {
      const currentGearODO = gearOilData.consumption_mileage;
      const nextGearODO = gearOilData.total_mileage;
      const gearRemainOriginal = nextGearODO - currentGearODO;
      const gearRemainFinal = gearRemainOriginal - planned_mileage;
      // 齿轮油预警
      let gearAlert, gearColor;
      if (gearRemainFinal <= 5000) {
        gearAlert = lang === 'zh' ? '需要更换齿轮油（已过期）' : 'Need Gear Oil Change (Overdue)';
        gearColor = 'red';
      } else if (gearRemainFinal <= 10000) {
        gearAlert = lang === 'zh' ? '齿轮油剩余不足（提醒）' : 'Gear Oil Reminder (Low Remain)';
        gearColor = 'yellow';
      } else {
        gearAlert = lang === 'zh' ? '齿轮油状态正常' : 'Gear Oil Safe';
        gearColor = 'white';
      }
      result.gearOil = {
        current_mileage: currentGearODO,
        next_maintain: nextGearODO,
        remain_original: gearRemainOriginal,
        remain_final: gearRemainFinal,
        alert: gearAlert,
        color: gearColor
      };
    }

    return res.json({ code: 0, data: result, msg: lang === 'zh' ? '预测计算成功' : 'Prediction calculation successful' });
  }

  res.status(404).json({ code: -1, msg: '接口不存在' });
};