// 后端接口基础地址（替换成你的 Vercel 域名）
const BASE_URL = "https://你的项目域名.vercel.app/api";

// 语言字典
const langDict = {
  zh: {
    home: "主页",
    blackOil: "引擎油管理",
    gearOil: "齿轮油管理",
    predict: "预测管理",
    plate: "车牌",
    totalMileage: "总里程",
    consumptionMileage: "消耗里程",
    maintainDate: "维护日期",
    plannedMileage: "计划里程",
    checkPlate: "校验车牌",
    calcMileage: "计算预警",
    saveData: "保存数据",
    getAlert: "获取预警",
    sendEmail: "发送预警邮件",
    back: "返回主页",
    success: "操作成功！",
    error: "操作失败：",
    plateEmpty: "请输入车牌！",
    mileagePositive: "里程必须为正数！",
    dateEmpty: "请选择维护日期！",
    blackOilDesc: "管理卡车引擎油的里程和维护数据",
    gearOilDesc: "管理卡车齿轮油的里程和维护数据",
    predictDesc: "输入计划里程，预测油液剩余寿命"
  },
  en: {
    home: "Home",
    blackOil: "Black Oil Management",
    gearOil: "Gear Oil Management",
    predict: "Prediction Management",
    plate: "License Plate",
    totalMileage: "Total Mileage",
    consumptionMileage: "Consumption Mileage",
    maintainDate: "Maintain Date",
    plannedMileage: "Planned Mileage",
    checkPlate: "Validate Plate",
    calcMileage: "Calculate Alert",
    saveData: "Save Data",
    getAlert: "Get Alerts",
    sendEmail: "Send Alert Email",
    back: "Back to Home",
    success: "Operation Success!",
    error: "Operation Failed: ",
    plateEmpty: "Please enter license plate!",
    mileagePositive: "Mileage must be positive!",
    dateEmpty: "Please select maintain date!",
    blackOilDesc: "Manage truck black oil mileage and maintenance data",
    gearOilDesc: "Manage truck gear oil mileage and maintenance data",
    predictDesc: "Enter planned mileage to predict oil remaining life"
  }
};

// 当前语言
let currentLang = "zh";

// 初始化语言
function initLang() {
  currentLang = localStorage.getItem("lang") || "zh";
  document.querySelectorAll("[data-lang]").forEach(el => {
    el.textContent = langDict[currentLang][el.dataset.lang];
  });
}

// 切换语言
function switchLang(lang) {
  currentLang = lang;
  localStorage.setItem("lang", lang);
  initLang();
}

// 接口请求公共函数
async function requestApi(url, method = "GET", data = {}) {
  try {
    const options = {
      method: method,
      headers: {
        "Content-Type": "application/json"
      }
    };
    if (method !== "GET") {
      options.body = JSON.stringify({ ...data, lang: currentLang });
    }
    const res = await fetch(`${BASE_URL}${url}`, options);
    return await res.json();
  } catch (err) {
    alert(langDict[currentLang].error + err.message);
    return { code: -1, msg: err.message };
  }
}

// 页面加载时初始化语言
window.onload = initLang;