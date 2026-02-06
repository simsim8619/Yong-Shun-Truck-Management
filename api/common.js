// api/common.js - 公共工具：数据库连接、车牌校验、中英提示
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// 1. 连接 SQLite 数据库（文件存在于项目中，Vercel 会持久化）
const db = new sqlite3.Database(path.join(__dirname, '../truck_manage.db'), (err) => {
  if (err) console.error('数据库连接失败：', err);
  else console.log('SQLite 数据库连接成功（免费）');
});

// 2. 初始化表（引擎油表，齿轮油表同理，首次运行自动创建）
db.run(`CREATE TABLE IF NOT EXISTS black_oil (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  plate TEXT UNIQUE NOT NULL, -- 车牌（唯一）
  total_mileage NUMERIC NOT NULL, -- 总里程
  consumption_mileage NUMERIC NOT NULL, -- 消耗里程
  maintain_date TEXT NOT NULL, -- 维护日期
  create_time DATETIME DEFAULT CURRENT_TIMESTAMP
)`);

// 3. 车牌唯一性校验（公共函数）
function checkPlateDuplicate(plate, table) {
  return new Promise((resolve) => {
    db.get(`SELECT * FROM ${table} WHERE plate = ?`, [plate], (err, row) => {
      if (err) resolve(false);
      resolve(!!row); // 存在返回 true，不存在返回 false
    });
  });
}

// 4. 中英双语提示字典（公共）
const langMsg = {
  zh: {
    plate_dup: '车牌重复，请输入唯一车牌',
    plate_ok: '车牌可用',
    overdue: '已过期，需立即更换',
    low_remain: '剩余里程不足，即将需要更换',
    safe: '状态正常'
  },
  en: {
    plate_dup: 'License plate duplicated, enter a unique one',
    plate_ok: 'License plate is valid',
    overdue: 'Overdue, need to change immediately',
    low_remain: 'Low remaining mileage, will need to change soon',
    safe: 'Status normal'
  }
};

// 导出公共方法
module.exports = { db, checkPlateDuplicate, langMsg };