class BlackOilSheet {
    constructor(data) {
        this.data = data; // 表格数据数组
        this.colorCodes = {
            red: '#FF0000',
            yellow: '#FFFF00',
            cyan: '#00FFFF',
            white: '#FFFFFF'
        };
    }

    onCellChange(row, col, newValue, oldValue) {
        // 车牌号重复检查
        if (col === 0 && row >= 2) {
            if (this.isLicensePlateDuplicate(newValue, row)) {
                return { error: "License plate duplicated!" };
            }
        }
        
        // 总里程逻辑 (Column C)
        if (col === 2 && row >= 2) {
            return this.handleTotalMileageChange(row, newValue, oldValue);
        }
        
        // 消耗里程逻辑 (Column E)
        if (col === 4 && row >= 2) {
            return this.handleConsumptionMileageChange(row, newValue, oldValue);
        }
        
        // 其他列的处理...
        return this.updateRowColors();
    }

    isLicensePlateDuplicate(plate, currentRow) {
        return this.data.some((row, index) => 
            index >= 2 && index !== currentRow && row[0] === plate
        );
    }

    handleTotalMileageChange(row, newValue, oldValue) {
        // 验证和计算逻辑
        // ...
        return this.calculateAndColorRow(row);
    }

    getBrakeOilChangeAlert() {
        let alertMsg = '';
        this.data.forEach((row, index) => {
            if (index >= 2 && row[6] !== undefined) {
                const diff = row[6];
                if (diff <= 500) {
                    alertMsg += `License Plate: ${row[0]}\nLeft: ${diff} Black Oil Expiration\n\n`;
                }
            }
        });
        return alertMsg;
    }

    getBrakeOilUpdateAlert() {
        // 类似实现
    }
}