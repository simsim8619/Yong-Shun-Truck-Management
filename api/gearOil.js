class GearOilSheet {
    constructor(data) {
        this.data = data;
        this.lastEFingerprint = '';
        this.autoRefreshInterval = null;
        this.startAutoRefresh();
    }

    startAutoRefresh() {
        // 每秒自动刷新
        this.autoRefreshInterval = setInterval(() => {
            const currentFingerprint = this.getEFingerprint();
            if (currentFingerprint !== this.lastEFingerprint) {
                this.fullBatchUpdate();
                this.lastEFingerprint = currentFingerprint;
            }
        }, 1000);
    }

    stopAutoRefresh() {
        if (this.autoRefreshInterval) {
            clearInterval(this.autoRefreshInterval);
        }
    }

    getEFingerprint() {
        return this.data.slice(2).map(row => row[4]).join('|');
    }

    fullBatchUpdate() {
        // 批量更新逻辑
        this.data.forEach((row, index) => {
            if (index >= 2) {
                // 重新计算G列
                // 更新行颜色
                // 更新维护日期等
            }
        });
    }

    getGearOilChangeAlert() {
        // 阈值不同: 5000和10000
    }
}