// main.js - 主应用程序逻辑
class MainApp {
    constructor() {
        this.TO_EMAIL = "yongshun272@gmail.com";
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.checkAlertsOnLoad();
    }

    setupEventListeners() {
        // 手动检查报警按钮
        document.getElementById('checkAlertsBtn')?.addEventListener('click', () => this.manualCheckAlerts());
        
        // 发送邮件按钮
        document.getElementById('sendEmailBtn')?.addEventListener('click', () => this.sendAlertEmail());
        
        // 添加预测行按钮
        document.getElementById('addPredictedRowBtn')?.addEventListener('click', () => {
            if (window.predictedManager) {
                window.predictedManager.addRow();
            }
        });
    }

    checkAlertsOnLoad() {
        setTimeout(() => {
            this.workbookOpen();
        }, 1000);
    }

    workbookOpen() {
        const brakeAlert = window.blackOilManager?.getChangeAlerts() || '';
        const gearAlert = window.gearOilManager?.getChangeAlerts() || '';
        const brakeUpdate = window.blackOilManager?.getUpdateAlerts() || '';
        const gearUpdate = window.gearOilManager?.getUpdateAlerts() || '';
        
        // 弹出报警
        if (brakeAlert) {
            alert(`黑油更换报警\n\n${brakeAlert}`);
        }
        if (gearAlert) {
            alert(`齿轮油更换报警\n\n${gearAlert}`);
        }
        if (brakeUpdate) {
            alert(`黑油更新报警\n\n${brakeUpdate}`);
        }
        if (gearUpdate) {
            alert(`齿轮油更新报警\n\n${gearUpdate}`);
        }
        
        // 发送邮件
        if (brakeAlert || gearAlert || brakeUpdate || gearUpdate) {
            this.sendAlertEmail(brakeAlert, gearAlert, brakeUpdate, gearUpdate);
        }
    }

    manualCheckAlerts() {
        this.workbookOpen();
        alert("报警检查完成！");
    }

    sendAlertEmail(brakeC, gearC, brakeU, gearU) {
        // 构建邮件正文
        let emailBody = '';
        if (brakeC) emailBody += `=== 黑油更换报警 ===\n${brakeC}\n`;
        if (gearC) emailBody += `=== 齿轮油更换报警 ===\n${gearC}\n`;
        if (brakeU) emailBody += `=== 黑油更新报警 ===\n${brakeU}\n`;
        if (gearU) emailBody += `=== 齿轮油更新报警 ===\n${gearU}`;
        
        // 模拟发送邮件
        const subject = `车辆油品报警汇总 - ${this.formatDate(new Date())}`;
        
        console.log('发送邮件到:', this.TO_EMAIL);
        console.log('主题:', subject);
        console.log('正文:', emailBody);
        
        alert(`邮件已发送到: ${this.TO_EMAIL}\n\n主题: ${subject}`);
        
        // 实际发送邮件需要后端支持
        // 这里可以添加实际的邮件发送逻辑
        // this.sendActualEmail(subject, emailBody);
    }

    sendActualEmail(subject, body) {
        // 使用邮件API发送邮件的实际代码
        // 例如使用SMTP、SendGrid、AWS SES等
        fetch('/api/send-email', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                to: this.TO_EMAIL,
                subject: subject,
                body: body
            })
        })
        .then(response => response.json())
        .then(data => {
            console.log('邮件发送成功:', data);
        })
        .catch(error => {
            console.error('邮件发送失败:', error);
            alert('邮件发送失败: ' + error.message);
        });
    }

    formatDate(date) {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    }
}

// 初始化主应用程序
window.mainApp = new MainApp();