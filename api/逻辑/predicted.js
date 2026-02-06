// predicted.js - 里程预测和报警逻辑
class PredictedManager {
    constructor() {
        this.data = [];
        this.init();
    }

    init() {
        this.loadSampleData();
        this.setupEventListeners();
    }

    loadSampleData() {
        this.data = [
            {
                plate: "ABC123",
                plannedMileage: 1000,
                blackCurrent: 50000,
                blackNext: 55000,
                blackRemain: 4000,
                blackAlert: "Black Oil Safe",
                gearCurrent: 50000,
                gearNext: 60000,
                gearRemain: 9000,
                gearAlert: "Gear Oil Safe"
            }
        ];
        
        this.renderTable();
    }

    setupEventListeners() {
        const table = document.getElementById('predictedTable');
        if (table) {
            table.addEventListener('change', (e) => this.handleTableChange(e));
        }
    }

    handleTableChange(event) {
        const target = event.target;
        const row = target.closest('tr');
        const rowIndex = Array.from(row.parentNode.children).indexOf(row) - 1;
        
        if (rowIndex < 0 || target.column !== 1) return;
        
        this.handlePlannedMileageChange(rowIndex, target.value);
    }

    handlePlannedMileageChange(rowIndex, value) {
        const plannedMileage = parseFloat(value);
        
        // 验证
        if (isNaN(plannedMileage) || plannedMileage <= 0) {
            alert("计划里程必须是正数！");
            const cell = document.querySelector(`#predictedTable tr:nth-child(${rowIndex + 2}) td:nth-child(2) input`);
            if (cell) cell.value = '';
            return;
        }
        
        const plate = this.data[rowIndex]?.plate;
        if (!plate) {
            alert("请先在A列填写车牌！");
            return;
        }
        
        // 从黑油数据获取信息
        const blackData = this.getBlackOilData(plate);
        if (blackData) {
            this.data[rowIndex].blackCurrent = blackData.consumption || 0;
            this.data[rowIndex].blackNext = blackData.totalMileage || 0;
            
            // 计算黑油剩余里程
            const blackRemainOriginal = (this.data[rowIndex].blackNext - this.data[rowIndex].blackCurrent) || 0;
            this.data[rowIndex].blackRemain = blackRemainOriginal - plannedMileage;
            
            // 设置黑油报警
            this.data[rowIndex].blackAlert = this.getBlackOilAlert(this.data[rowIndex].blackRemain);
        }
        
        // 从齿轮油数据获取信息
        const gearData = this.getGearOilData(plate);
        if (gearData) {
            this.data[rowIndex].gearCurrent = gearData.consumption || 0;
            this.data[rowIndex].gearNext = gearData.totalMileage || 0;
            
            // 计算齿轮油剩余里程
            const gearRemainOriginal = (this.data[rowIndex].gearNext - this.data[rowIndex].gearCurrent) || 0;
            this.data[rowIndex].gearRemain = gearRemainOriginal - plannedMileage;
            
            // 设置齿轮油报警
            this.data[rowIndex].gearAlert = this.getGearOilAlert(this.data[rowIndex].gearRemain);
        }
        
        this.renderTable();
    }

    getBlackOilData(plate) {
        if (!window.blackOilManager) return null;
        
        return window.blackOilManager.data.find(item => item.plate === plate);
    }

    getGearOilData(plate) {
        if (!window.gearOilManager) return null;
        
        return window.gearOilManager.data.find(item => item.plate === plate);
    }

    getBlackOilAlert(remainMileage) {
        if (remainMileage <= 0) {
            return "需要更换黑油（已过期）";
        } else if (remainMileage <= 1000) {
            return "黑油提醒（剩余较少）";
        } else {
            return "黑油安全";
        }
    }

    getGearOilAlert(remainMileage) {
        if (remainMileage <= 0) {
            return "需要更换齿轮油（已过期）";
        } else if (remainMileage <= 1000) {
            return "齿轮油提醒（剩余较少）";
        } else {
            return "齿轮油安全";
        }
    }

    addRow() {
        this.data.push({
            plate: "",
            plannedMileage: 0,
            blackCurrent: 0,
            blackNext: 0,
            blackRemain: 0,
            blackAlert: "",
            gearCurrent: 0,
            gearNext: 0,
            gearRemain: 0,
            gearAlert: ""
        });
        
        this.renderTable();
    }

    renderTable() {
        const table = document.getElementById('predictedTable');
        if (!table) return;
        
        // 清空现有行
        while (table.rows.length > 1) {
            table.deleteRow(1);
        }
        
        // 添加数据行
        this.data.forEach((row, index) => {
            const newRow = table.insertRow();
            
            // 车牌
            const cell1 = newRow.insertCell();
            cell1.innerHTML = `<input type="text" value="${row.plate || ''}">`;
            
            // 计划里程
            const cell2 = newRow.insertCell();
            cell2.innerHTML = `<input type="number" value="${row.plannedMileage || ''}">`;
            
            // 黑油当前里程
            const cell3 = newRow.insertCell();
            cell3.innerHTML = row.blackCurrent || '';
            
            // 黑油下次保养里程
            const cell4 = newRow.insertCell();
            cell4.innerHTML = row.blackNext || '';
            
            // 黑油最终剩余里程
            const cell5 = newRow.insertCell();
            cell5.innerHTML = row.blackRemain || '';
            cell5.style.backgroundColor = this.getAlertColor(row.blackRemain, 'black');
            
            // 黑油报警
            const cell6 = newRow.insertCell();
            cell6.innerHTML = row.blackAlert || '';
            cell6.style.backgroundColor = this.getAlertColor(row.blackRemain, 'black');
            
            // 齿轮油当前里程
            const cell7 = newRow.insertCell();
            cell7.innerHTML = row.gearCurrent || '';
            
            // 齿轮油下次保养里程
            const cell8 = newRow.insertCell();
            cell8.innerHTML = row.gearNext || '';
            
            // 齿轮油最终剩余里程
            const cell9 = newRow.insertCell();
            cell9.innerHTML = row.gearRemain || '';
            cell9.style.backgroundColor = this.getAlertColor(row.gearRemain, 'gear');
            
            // 齿轮油报警
            const cell10 = newRow.insertCell();
            cell10.innerHTML = row.gearAlert || '';
            cell10.style.backgroundColor = this.getAlertColor(row.gearRemain, 'gear');
        });
    }

    getAlertColor(remainMileage, type) {
        if (remainMileage <= 0) {
            return '#ffcccc'; // 红色
        } else if (remainMileage <= 1000) {
            return '#ffffcc'; // 黄色
        } else {
            return type === 'black' ? '#ccffcc' : '#ccccff'; // 绿色或蓝色
        }
    }
}

// 初始化预测管理器
window.predictedManager = new PredictedManager();