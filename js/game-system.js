// js/game-system.js - СИСТЕМА ИГРОВЫХ ЭЛЕМЕНТОВ

class GameSystem {
    constructor() {
        this.points = parseInt(localStorage.getItem('userPoints')) || 100;
        this.level = parseInt(localStorage.getItem('userLevel')) || 1;
        this.achievements = JSON.parse(localStorage.getItem('achievements')) || [];
        this.dailyStreak = parseInt(localStorage.getItem('dailyStreak')) || 1;
    }
    
    addPoints(amount, reason) {
        this.points += amount;
        this.save();
        
        // Проверка уровня
        const newLevel = Math.floor(this.points / 1000) + 1;
        if (newLevel > this.level) {
            this.levelUp(newLevel);
        }
        
        // Создание уведомления
        this.createNotification(`+${amount} очков! ${reason}`, 'success');
        return this.points;
    }
    
    levelUp(newLevel) {
        this.level = newLevel;
        this.createNotification(`🎉 Новый уровень! Теперь ты ${newLevel} уровня!`, 'level');
        
        // Выдача достижения за уровень
        if (newLevel >= 5) this.unlockAchievement('Опытный ученик', 'Достиг 5 уровня', '⭐');
        if (newLevel >= 10) this.unlockAchievement('Мастер обучения', 'Достиг 10 уровня', '🏆');
        
        this.save();
    }
    
    unlockAchievement(name, description, icon = '🏆') {
        if (!this.achievements.find(a => a.name === name)) {
            const achievement = {
                name,
                description,
                icon,
                date: new Date().toLocaleDateString(),
                points: 100
            };
            
            this.achievements.push(achievement);
            this.points += 100;
            
            this.createNotification(`🏆 Новое достижение: ${name}! +100 очков`, 'achievement');
            this.save();
        }
    }
    
    checkDailyLogin() {
        const lastLogin = localStorage.getItem('lastLogin');
        const today = new Date().toDateString();
        
        if (lastLogin !== today) {
            this.dailyStreak = lastLogin ? this.dailyStreak + 1 : 1;
            localStorage.setItem('lastLogin', today);
            
            // Награда за серию
            if (this.dailyStreak % 7 === 0) {
                this.addPoints(200, 'Еженедельная серия!');
                this.unlockAchievement('Неделя активности', '7 дней подряд', '🔥');
            }
            
            this.save();
        }
        
        return this.dailyStreak;
    }
    
    createNotification(message, type = 'info') {
        // Создаем элемент уведомления
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <span class="notification-icon">${this.getIcon(type)}</span>
            <span class="notification-text">${message}</span>
            <span class="notification-close">&times;</span>
        `;
        
        // Добавляем в контейнер уведомлений
        let container = document.getElementById('notifications');
        if (!container) {
            container = document.createElement('div');
            container.id = 'notifications';
            container.className = 'notifications-container';
            document.body.appendChild(container);
        }
        
        container.appendChild(notification);
        
        // Автоудаление через 5 секунд
        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => notification.remove(), 300);
        }, 5000);
        
        // Закрытие по клику
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.remove();
        });
    }
    
    getIcon(type) {
        const icons = {
            'success': '✅',
            'error': '❌',
            'info': 'ℹ️',
            'warning': '⚠️',
            'achievement': '🏆',
            'level': '⭐'
        };
        return icons[type] || '📢';
    }
    
    save() {
        localStorage.setItem('userPoints', this.points);
        localStorage.setItem('userLevel', this.level);
        localStorage.setItem('achievements', JSON.stringify(this.achievements));
        localStorage.setItem('dailyStreak', this.dailyStreak);
    }
    
    getStats() {
        return {
            points: this.points,
            level: this.level,
            achievements: this.achievements,
            dailyStreak: this.dailyStreak,
            nextLevelPoints: this.level * 1000
        };
    }
}

// Экспорт глобального инстанса
window.GameSystem = new GameSystem();
