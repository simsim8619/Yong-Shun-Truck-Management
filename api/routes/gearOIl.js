// api/gearOil.js - 齿轮油管理接口（Vercel Serverless 函数）
const { db, checkPlateDuplicate, langMsg } = require('./common');

module.exports = async (req, res) => {
  // 跨域配置
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 1. 车牌唯一性校验
  if (req.method === 'POST' && req.body.action === 'checkPlate') {
    const { plate, lang = 'zh' } = req.body;
    if (!plate) return res.status(400).json({ code: -1, msg: lang === 'zh' ? '请输入车牌' : 'Please enter license plate' });
    
    const isDup = await checkPlateDuplicate(plate, 'gear_oil');
    if (isDup) return res.json({ code: -1, msg: langMsg[lang].plate_dup });
    return res.json({ code: 0, msg: langMsg[lang].plate_ok, valid: true });
  }

  // 2. 里程计算+预警判断（阈值：≤5000 红，≤10000 黄，>10000 白）
  if (req.method === 'POST' && req.body.action === 'calcMileage') {
    const { total_mileage, consumption_mileage, lang = 'zh' } = req.body;
    if (isNaN(total_mileage) || isNaN(consumption_mileage)) {
      return res.status(400).json({ code: -1, msg: lang === 'zh' ? '里程必须为数字' : 'Mileage must be a number' });
    }
    const diff = Number(total_mileage) - Number(consumption_mileage);
    let alertMsg, color;
    if (diff <= 5000) {
      alertMsg = langMsg[lang].overdue;
      color = 'red';
    } else if (diff <= 10000) {
      alertMsg = langMsg[lang].low_remain;
      color = 'yellow';
    } else {
      alertMsg = langMsg[lang].safe;
      color = 'white';
    }
    return res.json({
      code: 0,
      data: { diff, alertMsg, color },
      msg: '计算成功'
    });
  }

  // 3. 初始化齿轮油表（首次运行自动创建）
  db.run(`CREATE TABLE IF NOT EXISTS gear_oil (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    plate TEXT UNIQUE NOT NULL,
    total_mileage NUMERIC NOT NULL,
    consumption_mileage NUMERIC NOT NULL,
    maintain_date TEXT NOT NULL,
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // 4. 新增/保存齿轮油数据
  if (req.method === 'POST' && req.body.action === 'saveData') {
    const { plate, total_mileage, consumption_mileage, maintain_date } = req.body;
    if (!plate || !maintain_date) {
      return res.status(400).json({ code: -1, msg: '车牌和维护日期为必填项' });
    }
    db.run(`INSERT OR REPLACE INTO gear_oil (plate, total_mileage, consumption_mileage, maintain_date)
            VALUES (?, ?, ?, ?)`, [plate, total_mileage, consumption_mileage, maintain_date], (err) => {
      if (err) return res.json({ code: -1, msg: '保存失败：' + err.message });
      return res.json({ code: 0, msg: '保存成功' });
    });
    return;
  }

  // 5. 获取齿轮油数据
  if (req.method === 'GET') {
    const plate = req.query.plate;
    const sql = plate ? `SELECT * FROM gear_oil WHERE plate = ?` : `SELECT * FROM gear_oil ORDER BY create_time DESC`;
    db.all(sql, plate ? [plate] : [], (err, rows) => {
      if (err) return res.json({ code: -1, msg: '查询失败：' + err.message });
      return res.json({ code: 0, data: rows, msg: '查询成功' });
    });
    return;
  }

  res.status(404).json({ code: -1, msg: '接口不存在' });
};