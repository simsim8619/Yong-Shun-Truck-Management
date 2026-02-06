// blackoil.js - 黑油维护管理逻辑
class BlackOilManager {
    constructor() {
        this.data = [];
        this.excludedPlates = ["QM8517L", "QAA2805W", "Q2805"];
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
                nextMaintenance: this.addYears(new Date(), 1),
                totalMileage: 50000,
                entryDate: new Date(),
                consumption: 45000,
                updateDate: new Date(),
                diff: 5000,
                rowColor: "white"
            },
            {
                plate: "DEF456",
                nextMaintenance: this.addYears(new Date(), 1),
                totalMileage: 75000,
                entryDate: new Date(),
                consumption: 70000,
                updateDate: new Date(),
                diff: 5000,
                rowColor: "white"
            }
        ];
        
        this.renderTable();
    }

    setupEventListeners() {
        const table = document.getElementById('blackOilTable');
        if (table) {
            table.addEventListener('change', (e) => this.handleTableChange(e));
        }
    }

    handleTableChange(event) {
        const target = event.target;
        const row = target.closest('tr');
        const rowIndex = Array.from(row.parentNode.children).indexOf(row) - 1;
        
        if (rowIndex < 0) return;
        
        const colIndex = Array.from(row.children).indexOf(target.closest('td'));
        
        switch(colIndex) {
            case 0: this.handlePlateChange(rowIndex, target.value); break;
            case 2: this.handleTotalMileageChange(rowIndex, target.value); break;
            case 4: this.handleConsumptionChange(rowIndex, target.value); break;
            case 3: this.handleEntryDateChange(rowIndex, target.value); break;
            case 5: this.handleUpdateDateChange(rowIndex, target.value); break;
        }
        
        this.updateRowColors();
    }

    handlePlateChange(rowIndex, plate) {
        if (!plate) return;
        
        // 检查车牌重复
        for (let i = 0; i < this.data.length; i++) {
            if (i !== rowIndex && this.data[i].plate === plate) {
                alert("车牌重复！请输入唯一值。");
                const cell = document.querySelector(`#blackOilTable tr:nth-child(${rowIndex + 2}) td:nth-child(1) input`);
                if (cell) cell.value = '';
                return;
            }
        }
        
        this.data[rowIndex].plate = plate;
    }

    handleTotalMileageChange(rowIndex, value) {
        const numValue = parseFloat(value);
        
        if (isNaN(numValue) || numValue <= 0) {
            alert("里程表必须是正数！");
            const cell = document.querySelector(`#blackOilTable tr:nth-child(${rowIndex + 2}) td:nth-child(3) input`);
            if (cell) cell.value = '';
            return;
        }
        
        const oldValue = this.data[rowIndex].totalMileage;
        this.data[rowIndex].totalMileage = numValue;
        
        // 自动填充日期
        this.data[rowIndex].nextMaintenance = this.addYears(new Date(), 1);
        this.data[rowIndex].entryDate = new Date();
        
        // 计算差值
        if (this.data[rowIndex].consumption) {
            const diff = numValue - this.data[rowIndex].consumption;
            this.data[rowIndex].diff = diff;
            
            // 同步到齿轮油
            if (!this.isPlateExcluded(this.data[rowIndex].plate)) {
                window.gearOilManager?.syncFromBlackOil(rowIndex, 'consumption', this.data[rowIndex].consumption);
            }
        }
        
        this.renderTable();
    }

    handleConsumptionChange(rowIndex, value) {
        const numValue = parseFloat(value);
        
        if (isNaN(numValue) || numValue <= 0) {
            alert("消耗里程必须是正数！");
            const cell = document.querySelector(`#blackOilTable tr:nth-child(${rowIndex + 2}) td:nth-child(5) input`);
            if (cell) cell.value = '';
            return;
        }
        
        const oldValue = this.data[rowIndex].consumption;
        
        // 检查 C-E >= -2000
        if (this.data[rowIndex].totalMileage) {
            const diffCE = this.data[rowIndex].totalMileage - numValue;
            if (diffCE < -2000) {
                alert("C-E 差值不能小于 -2000! 请调整。");
                const cell = document.querySelector(`#blackOilTable tr:nth-child(${rowIndex + 2}) td:nth-child(5) input`);
                if (cell) cell.value = oldValue;
                return;
            }
        }
        
        // 减少确认
        if (numValue < oldValue) {
            if (!confirm(`消耗里程将从 ${oldValue} 减少到 ${numValue}！确认吗？`)) {
                const cell = document.querySelector(`#blackOilTable tr:nth-child(${rowIndex + 2}) td:nth-child(5) input`);
                if (cell) cell.value = oldValue;
                return;
            }
        }
        
        this.data[rowIndex].consumption = numValue;
        this.data[rowIndex].updateDate = new Date();
        
        // 计算差值
        if (this.data[rowIndex].totalMileage) {
            const diff = this.data[rowIndex].totalMileage - numValue;
            this.data[rowIndex].diff = diff;
        }
        
        // 同步到齿轮油
        if (!this.isPlateExcluded(this.data[rowIndex].plate)) {
            window.gearOilManager?.syncFromBlackOil(rowIndex, 'consumption', numValue);
        }
        
        this.renderTable();
    }

    handleEntryDateChange(rowIndex, value) {
        const dateValue = new Date(value);
        if (isNaN(dateValue.getTime())) {
            alert("录入日期必须是有效日期！");
            const cell = document.querySelector(`#blackOilTable tr:nth-child(${rowIndex + 2}) td:nth-child(4) input`);
            if (cell) cell.value = '';
            return;
        }
        
        this.data[rowIndex].entryDate = dateValue;
        this.data[rowIndex].nextMaintenance = this.addYears(dateValue, 1);
        this.renderTable();
    }

    handleUpdateDateChange(rowIndex, value) {
        const dateValue = new Date(value);
        if (isNaN(dateValue.getTime())) {
            alert("更新日期必须是有效日期！");
            const cell = document.querySelector(`#blackOilTable tr:nth-child(${rowIndex + 2}) td:nth-child(6) input`);
            if (cell) cell.value = '';
            return;
        }
        
        this.data[rowIndex].updateDate = dateValue;
    }

    updateRowColors() {
        this.data.forEach((row, index) => {
            // 过期维护日期 - 红色
            if (row.nextMaintenance && row.nextMaintenance <= new Date()) {
                row.rowColor = 'red';
            } 
            // 差值 <= 500 - 红色
            else if (row.diff <= 500) {
                row.rowColor = 'red';
            } 
            // 差值 <= 1000 - 黄色
            else if (row.diff <= 1000) {
                row.rowColor = 'yellow';
            } 
            // 超过3天未更新 - 青色
            else if (row.updateDate) {
                const daysDiff = Math.floor((new Date() - row.updateDate) / (1000 * 60 * 60 * 24));
                if (daysDiff > 3 && row.rowColor !== 'red' && row.rowColor !== 'yellow') {
                    row.rowColor = 'cyan';
                } else {
                    row.rowColor = 'white';
                }
            } else {
                row.rowColor = 'white';
            }
        });
        
        this.renderTable();
    }

    isPlateExcluded(plate) {
        return this.excludedPlates.includes(plate);
    }

    addYears(date, years) {
        const result = new Date(date);
        result.setFullYear(result.getFullYear() + years);
        return result;
    }

    renderTable() {
        const table = document.getElementById('blackOilTable');
        if (!table) return;
        
        // 清空现有行（保留表头）
        while (table.rows.length > 1) {
            table.deleteRow(1);
        }
        
        // 添加数据行
        this.data.forEach((row, index) => {
            const newRow = table.insertRow();
            newRow.style.backgroundColor = row.rowColor;
            
            // 车牌
            const cell1 = newRow.insertCell();
            cell1.innerHTML = `<input type="text" value="${row.plate || ''}">`;
            
            // 下次保养日期
            const cell2 = newRow.insertCell();
            cell2.innerHTML = row.nextMaintenance ? this.formatDate(row.nextMaintenance) : '';
            
            // 总里程
            const cell3 = newRow.insertCell();
            cell3.innerHTML = `<input type="number" value="${row.totalMileage || ''}">`;
            
            // 录入日期
            const cell4 = newRow.insertCell();
            cell4.innerHTML = `<input type="date" value="${row.entryDate ? this.formatDateForInput(row.entryDate) : ''}">`;
            
            // 消耗里程
            const cell5 = newRow.insertCell();
            cell5.innerHTML = `<input type="number" value="${row.consumption || ''}">`;
            
            // 更新日期
            const cell6 = newRow.insertCell();
            cell6.innerHTML = `<input type="date" value="${row.updateDate ? this.formatDateForInput(row.updateDate) : ''}">`;
            
            // 差值
            const cell7 = newRow.insertCell();
            cell7.innerHTML = row.diff || '';
        });
    }

    formatDate(date) {
        return date.toLocaleDateString('en-GB');
    }

    formatDateForInput(date) {
        return date.toISOString().split('T')[0];
    }

    getChangeAlerts() {
        let alertMsg = '';
        this.data.forEach(row => {
            if (row.diff <= 500) {
                alertMsg += `车牌: ${row.plate}\n剩余: ${row.diff} 黑油过期\n\n`;
            } else if (row.diff <= 1000) {
                alertMsg += `车牌: ${row.plate}\n剩余: ${row.diff} 黑油过期\n\n`;
            }
        });
        return alertMsg;
    }

    getUpdateAlerts() {
        let alertMsg = '';
        this.data.forEach(row => {
            if (row.updateDate) {
                const daysDiff = Math.floor((new Date() - row.updateDate) / (1000 * 60 * 60 * 24));
                if (daysDiff > 3) {
                    alertMsg += `车牌: ${row.plate}\n最后更新: ${this.formatDate(row.updateDate)}\n需要更新消耗数据\n\n`;
                }
            }
        });
        return alertMsg;
    }
}

// 初始化黑油管理器
window.blackOilManager = new BlackOilManager();