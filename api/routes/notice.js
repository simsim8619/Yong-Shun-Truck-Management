// api/notice.js - 通知/邮件告警接口（对应原 ThisWorkbook）
const { db } = require('./common');
const nodemailer = require('nodemailer');

// 邮件配置（替换成你的邮箱信息，这里用 Gmail 示例，其他邮箱同理）
const EMAIL_CONFIG = {
  service: 'gmail', // 邮箱服务商，比如 qq、163
  auth: {
    user: 'yongshun272@gmail.com', // 你的发件邮箱
    pass: 'your-app-password' // 邮箱授权码，不是登录密码！
  }
};

// 创建邮件发送器
const transporter = nodemailer.createTransport(EMAIL_CONFIG);

module.exports = async (req, res) => {
  // 跨域配置
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 核心：获取所有预警并发送邮件（GET 请求）
  if (req.method === 'GET') {
    const lang = req.query.lang || 'zh';
    let alertMsg = '';

    // 1. 获取引擎油预警数据
    const blackOilAlerts = await new Promise((resolve) => {
      db.all(`SELECT plate, total_mileage - consumption_mileage AS remain FROM black_oil WHERE (total_mileage - consumption_mileage) <= 1000`, (err, rows) => {
        resolve(rows || []);
      });
    });

    // 2. 获取齿轮油预警数据
    const gearOilAlerts = await new Promise((resolve) => {
      db.all(`SELECT plate, total_mileage - consumption_mileage AS remain FROM gear_oil WHERE (total_mileage - consumption_mileage) <= 10000`, (err, rows) => {
        resolve(rows || []);
      });
    });

    // 3. 拼接预警信息
    if (blackOilAlerts.length > 0) {
      alertMsg += lang === 'zh' ? '=== 引擎油更换预警 ===\n' : '=== BLACK OIL CHANGE ALERT ===\n';
      blackOilAlerts.forEach(item => {
        alertMsg += `${lang === 'zh' ? '车牌：' : 'License Plate: '}${item.plate}\n`;
        alertMsg += `${lang === 'zh' ? '剩余里程：' : 'Left: '}${item.remain}\n\n`;
      });
    }

    if (gearOilAlerts.length > 0) {
      alertMsg += lang === 'zh' ? '=== 齿轮油更换预警 ===\n' : '=== GEAR OIL CHANGE ALERT ===\n';
      gearOilAlerts.forEach(item => {
        alertMsg += `${lang === 'zh' ? '车牌：' : 'License Plate: '}${item.plate}\n`;
        alertMsg += `${lang === 'zh' ? '剩余里程：' : 'Left: '}${item.remain}\n\n`;
      });
    }

    // 4. 无预警则返回
    if (alertMsg === '') {
      return res.json({ code: 0, msg: lang === 'zh' ? '暂无预警信息' : 'No alert messages' });
    }

    // 5. 发送邮件（和原 VBA 逻辑一致）
    try {
      await transporter.sendMail({
        from: EMAIL_CONFIG.user,
        to: EMAIL_CONFIG.user, // 收件邮箱，和发件箱一致
        subject: lang === 'zh' ? `卡车油液预警汇总 - ${new Date().toLocaleDateString()}` : `Vehicle Oil Alert Summary - ${new Date().toLocaleDateString()}`,
        text: alertMsg
      });
      return res.json({ code: 0, msg: lang === 'zh' ? '预警邮件发送成功' : 'Alert email sent successfully', data: alertMsg });
    } catch (err) {
      return res.json({ code: -1, msg: lang === 'zh' ? '邮件发送失败：' + err.message : 'Email send failed: ' + err.message });
    }
  }

  res.status(404).json({ code: -1, msg: '接口不存在' });
};