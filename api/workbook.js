// 全局配置和主控制逻辑
const TO_EMAIL = "yongshun272@gmail.com";

class WorkbookManager {
    constructor(blackOilSheet, gearOilSheet) {
        this.blackOil = blackOilSheet;
        this.gearOil = gearOilSheet;
    }

    async onWorkbookOpen() {
        const brakeAlert = this.blackOil.getBrakeOilChangeAlert();
        const gearAlert = this.gearOil.getGearOilChangeAlert();
        const brakeUpdate = this.blackOil.getBrakeOilUpdateAlert();
        const gearUpdate = this.gearOil.getGearOilUpdateAlert();
        
        // 弹出警告
        if (brakeAlert) alert(`BLACK OIL CHANGE ALERT\n${brakeAlert}`);
        if (gearAlert) alert(`GEAR OIL CHANGE ALERT\n${gearAlert}`);
        if (brakeUpdate) alert(`BLACK OIL UPDATE ALERT\n${brakeUpdate}`);
        if (gearUpdate) alert(`GEAR OIL UPDATE ALERT\n${gearUpdate}`);
        
        // 发送邮件
        if (brakeAlert || gearAlert || brakeUpdate || gearUpdate) {
            await this.sendAlertEmail(brakeAlert, gearAlert, brakeUpdate, gearUpdate);
        }
    }

    manualCheckAlerts() {
        this.onWorkbookOpen();
        alert("Alert check completed successfully!");
    }

    async sendAlertEmail(brakeC, gearC, brakeU, gearU) {
        try {
            const emailBody = 
                (brakeC ? `=== BLACK OIL CHANGE ALERT ===\n${brakeC}\n` : '') +
                (gearC ? `=== GEAR OIL CHANGE ALERT ===\n${gearC}\n` : '') +
                (brakeU ? `=== BLACK OIL UPDATE ALERT ===\n${brakeU}\n` : '') +
                (gearU ? `=== GEAR OIL UPDATE ALERT ===\n${gearU}` : '');
            
            const subject = `Vehicle Oil Alert Summary - ${new Date().toLocaleDateString('en-GB')}`;
            
            // 在实际应用中，这里可以使用邮件API或window.location.href = 'mailto:...'
            console.log(`Sending email to ${TO_EMAIL}`);
            console.log(`Subject: ${subject}`);
            console.log(`Body:\n${emailBody}`);
            
            // 模拟邮件发送
            return true;
        } catch (error) {
            console.error("Email sending failed:", error);
            alert(`Email sending failed: ${error.message}`);
        }
    }
}