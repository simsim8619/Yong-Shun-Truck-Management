class PredictedChangeSheet {
    constructor(blackOil, gearOil) {
        this.blackOil = blackOil;
        this.gearOil = gearOil;
    }

    onPlannedMileageChange(row, plannedMileage) {
        const licensePlate = this.data[row][0];
        
        // 从黑油表获取数据
        const blackData = this.getBlackOilData(licensePlate);
        // 从齿轮油表获取数据
        const gearData = this.getGearOilData(licensePlate);
        
        // 计算剩余里程
        const blackRemaining = blackData.nextODO - blackData.currentODO - plannedMileage;
        const gearRemaining = gearData.nextODO - gearData.currentODO - plannedMileage;
        
        // 生成警报
        return {
            blackRemaining,
            gearRemaining,
            blackAlert: this.generateAlert('black', blackRemaining),
            gearAlert: this.generateAlert('gear', gearRemaining)
        };
    }
}