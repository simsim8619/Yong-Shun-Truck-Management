// api/blackOil.js - 引擎油管理接口（Vercel Serverless 函数）
const { db, checkPlateDuplicate, langMsg } = require('./common');

// 主函数：Vercel 会自动调用这个函数处理请求
// req = 请求对象（含参数、请求方式），res = 响应对象
module.exports = async (req, res) => {
  // 解决跨域（前端请求后端必备，Vercel 中需手动设置）
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // 处理 OPTIONS 预检请求
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 1. 车牌唯一性校验接口（POST 请求，参数：plate, lang）
  if (req.method === 'POST' && req.body.action === 'checkPlate') {
    const { plate, lang = 'zh' } = req.body;
    if (!plate) return res.status(400).json({ code: -1, msg: lang === 'zh' ? '请输入车牌' : 'Please enter license plate' });
    
    const isDup = await checkPlateDuplicate(plate, 'black_oil');
    if (isDup) return res.json({ code: -1, msg: langMsg[lang].plate_dup });
    return res.json({ code: 0, msg: langMsg[lang].plate_ok, valid: true });
  }

  // 2. 里程计算+预警判断（POST 请求，参数：total_mileage, consumption_mileage, lang）
  if (req.method === 'POST' && req.body.action === 'calcMileage') {
    const { total_mileage, consumption_mileage, lang = 'zh' } = req.body;
    // 数值校验
    if (isNaN(total_mileage) || isNaN(consumption_mileage)) {
      return res.status(400).json({ code: -1, msg: lang === 'zh' ? '里程必须为数字' : 'Mileage must be a number' });
    }
    const diff = Number(total_mileage) - Number(consumption_mileage);
    let alertMsg, color; // 预警信息+标色（对应原 VBA 标红/黄/白）
    // 预警规则（和原 VBA 一致，可按需调整）
    if (diff <= 0) {
      alertMsg = langMsg[lang].overdue;
      color = 'red';
    } else if (diff <= 1000) {
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

  // 3. 新增/保存引擎油数据（POST 请求，参数：plate, total_mileage, consumption_mileage, maintain_date）
  if (req.method === 'POST' && req.body.action === 'saveData') {
    const { plate, total_mileage, consumption_mileage, maintain_date } = req.body;
    // 简单校验
    if (!plate || !maintain_date) {
      return res.status(400).json({ code: -1, msg: '车牌和维护日期为必填项' });
    }
    // 插入数据库（不存在则新增，存在则更新）
    db.run(`INSERT OR REPLACE INTO black_oil (plate, total_mileage, consumption_mileage, maintain_date)
            VALUES (?, ?, ?, ?)`, [plate, total_mileage, consumption_mileage, maintain_date], (err) => {
      if (err) return res.json({ code: -1, msg: '保存失败：' + err.message });
      return res.json({ code: 0, msg: '保存成功' });
    });
    return;
  }

  // 4. 获取引擎油数据（GET 请求，可传 plate 查单条，不传查全部）
  if (req.method === 'GET') {
    const plate = req.query.plate;
    const sql = plate ? `SELECT * FROM black_oil WHERE plate = ?` : `SELECT * FROM black_oil ORDER BY create_time DESC`;
    db.all(sql, plate ? [plate] : [], (err, rows) => {
      if (err) return res.json({ code: -1, msg: '查询失败：' + err.message });
      return res.json({ code: 0, data: rows, msg: '查询成功' });
    });
    return;
  }

  // 未知请求
  res.status(404).json({ code: -1, msg: '接口不存在' });
};