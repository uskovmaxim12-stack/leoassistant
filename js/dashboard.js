// ===== ДОПОЛНИТЕЛЬНЫЙ КОД ДЛЯ DASHBOARD =====

class DashboardManager {
    constructor(app) {
        this.app = app;
        this.stats = {};
        this.notifications = [];
        this.init();
    }
    
    async init() {
        // Загружаем данные при инициализации
        await this.loadDashboardData();
        this.setupEventListeners();
        this.startLiveUpdates();
    }
    
    async loadDashboardData() {
        try {
            // Имитация загрузки данных
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            this.stats = {
                totalPoints: this.app.currentUser?.points || 450,
                level: this.app.currentUser?.level || 3,
                streak: this.getStreak(),
                weeklyProgress: this.calculateWeeklyProgress(),
                activeTasks: this.getActiveTasksCount(),
                onlineFriends: this.getOnlineFriendsCount(),
                recentAchievements: this.getRecentAchievements()
            };
            
            this.notifications = this.getNotifications();
            
            return this.stats;
        } catch (error) {
            console.error('Ошибка загрузки дашборда:', error);
            return null;
        }
    }
    
    setupEventListeners() {
        // Обновление данных при фокусе на вкладке
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                this.refreshData();
            }
        });
        
        // Периодическое обновление
        setInterval(() => this.refreshData(), 5 * 60 * 1000); // Каждые 5 минут
    }
    
    startLiveUpdates() {
        // Обновление времени в реальном времени
        setInterval(() => this.updateLiveData(), 1000);
    }
    
    updateLiveData() {
        // Обновление времени, таймеров и т.д.
        this.updateTaskTimers();
        this.updateStreakTimer();
    }
    
    async refreshData() {
        if (!this.app.isOnline) return;
        
        try {
            await this.loadDashboardData();
            this.updateUI();
            this.app.showToast('📊 Данные обновлены', 'success');
        } catch (error) {
            console.error('Ошибка обновления данных:', error);
        }
    }
    
    updateUI() {
        // Обновление элементов интерфейса
        this.updateStatsDisplay();
        this.updateNotifications();
        this.updateProgressBars();
    }
    
    updateStatsDisplay() {
        // Обновление отображения статистики
        const elements = {
            'pointsValue': this.stats.totalPoints,
            'levelValue': this.stats.level,
            'streakValue': this.stats.streak,
            'activeTasksCount': this.stats.activeTasks,
            'onlineFriendsCount': this.stats.onlineFriends
        };
        
        for (const [id, value] of Object.entries(elements)) {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value;
                
                // Анимация обновления
                if (element.classList) {
                    element.classList.add('pulse-animation');
                    setTimeout(() => {
                        element.classList.remove('pulse-animation');
                    }, 1000);
                }
            }
        }
    }
    
    updateNotifications() {
        const unreadCount = this.notifications.filter(n => !n.read).length;
        
        if (unreadCount > 0) {
            this.showNotificationBadge(unreadCount);
        }
    }
    
    showNotificationBadge(count) {
        let badge = document.querySelector('.notification-badge');
        
        if (!badge) {
            badge = document.createElement('div');
            badge.className = 'notification-badge';
            document.querySelector('.notification-bell')?.appendChild(badge);
        }
        
        badge.textContent = count > 99 ? '99+' : count;
        badge.style.display = 'block';
    }
    
    updateProgressBars() {
        // Анимированное обновление прогресс-баров
        const progressBars = document.querySelectorAll('.progress-fill');
        
        progressBars.forEach(bar => {
            const targetWidth = bar.style.width;
            bar.style.width = '0%';
            
            setTimeout(() => {
                bar.style.width = targetWidth;
            }, 300);
        });
    }
    
    updateTaskTimers() {
        // Обновление таймеров для заданий с дедлайнами
        const taskItems = document.querySelectorAll('.task-item');
        
        taskItems.forEach(item => {
            const dueDateElement = item.querySelector('.due-date');
            if (dueDateElement) {
                const dueDate = new Date(dueDateElement.dataset.due);
                const now = new Date();
                const diff = dueDate - now;
                
                if (diff > 0) {
                    const hours = Math.floor(diff / (1000 * 60 * 60));
                    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                    
                    dueDateElement.textContent = `Осталось: ${hours}ч ${minutes}м`;
                    
                    // Изменение цвета при приближении дедлайна
                    if (hours < 24) {
                        dueDateElement.style.color = 'var(--warning)';
                    }
                    if (hours < 6) {
                        dueDateElement.style.color = 'var(--danger)';
                    }
                } else {
                    dueDateElement.textContent = 'Просрочено';
                    dueDateElement.style.color = 'var(--danger)';
                }
            }
        });
    }
    
    updateStreakTimer() {
        // Таймер для сохранения серии дней
        const streakElement = document.getElementById('streakValue');
        if (!streakElement) return;
        
        const now = new Date();
        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);
        
        const timeLeft = endOfDay - now;
        const hoursLeft = Math.floor(timeLeft / (1000 * 60 * 60));
        const minutesLeft = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
        
        // Обновляем подсказку
        streakElement.title = `До конца дня: ${hoursLeft}ч ${minutesLeft}м`;
    }
    
    getStreak() {
        // Получение текущей серии дней
        const lastActivity = localStorage.getItem('leo_last_activity');
        if (!lastActivity) return 1;
        
        const lastDate = new Date(lastActivity);
        const today = new Date();
        
        // Сбрасываем если прошло больше 2 дней
        const diffDays = Math.floor((today - lastDate) / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) {
            return parseInt(localStorage.getItem('leo_streak') || '1');
        } else if (diffDays === 1) {
            const currentStreak = parseInt(localStorage.getItem('leo_streak') || '1');
            return currentStreak + 1;
        } else {
            return 1;
        }
    }
    
    calculateWeeklyProgress() {
        // Расчет прогресса за неделю
        const weeklyData = JSON.parse(localStorage.getItem('leo_weekly_progress') || '{}');
        const days = Object.keys(weeklyData).length;
        
        return Math.min((days / 7) * 100, 100);
    }
    
    getActiveTasksCount() {
        const tasks = JSON.parse(localStorage.getItem('leo_tasks') || '[]');
        return tasks.filter(task => !task.completed && !task.archived).length;
    }
    
    getOnlineFriendsCount() {
        const friends = JSON.parse(localStorage.getItem('leo_friends') || '[]');
        return friends.filter(friend => friend.online).length;
    }
    
    getRecentAchievements() {
        const achievements = JSON.parse(localStorage.getItem('leo_achievements') || '[]');
        return achievements.slice(-6); // Последние 6 достижений
    }
    
    getNotifications() {
        return JSON.parse(localStorage.getItem('leo_notifications') || '[]');
    }
    
    // Дополнительные методы
    
    recordActivity() {
        // Запись активности пользователя
        const now = new Date().toISOString();
        localStorage.setItem('leo_last_activity', now);
        
        // Обновление серии
        const today = new Date().toDateString();
        const lastActivityDate = localStorage.getItem('leo_last_activity_date');
        
        if (lastActivityDate !== today) {
            const currentStreak = this.getStreak();
            localStorage.setItem('leo_streak', currentStreak.toString());
            localStorage.setItem('leo_last_activity_date', today);
            
            // Добавление очков за активность
            this.addPoints(5, 'daily_activity');
        }
    }
    
    addPoints(amount, reason = '') {
        if (!this.app.currentUser) return;
        
        this.app.currentUser.points = (this.app.currentUser.points || 0) + amount;
        
        // Сохранение
        if (localStorage.getItem('leo_user')) {
            localStorage.setItem('leo_user', JSON.stringify(this.app.currentUser));
        }
        if (sessionStorage.getItem('leo_user')) {
            sessionStorage.setItem('leo_user', JSON.stringify(this.app.currentUser));
        }
        
        // Логирование
        const pointsLog = JSON.parse(localStorage.getItem('leo_points_log') || '[]');
        pointsLog.push({
            amount,
            reason,
            timestamp: new Date().toISOString(),
            total: this.app.currentUser.points
        });
        
        localStorage.setItem('leo_points_log', JSON.stringify(pointsLog));
        
        // Проверка повышения уровня
        this.checkLevelUp();
        
        return this.app.currentUser.points;
    }
    
    checkLevelUp() {
        if (!this.app.currentUser) return false;
        
        const currentLevel = this.app.currentUser.level || 1;
        const pointsForNextLevel = currentLevel * 500; // 500 очков за уровень
        
        if (this.app.currentUser.points >= pointsForNextLevel) {
            this.app.currentUser.level = currentLevel + 1;
            
            // Сохранение
            if (localStorage.getItem('leo_user')) {
                localStorage.setItem('leo_user', JSON.stringify(this.app.currentUser));
            }
            
            // Показ уведомления
            this.app.showToast(
                `🎉 Поздравляем! Вы достигли уровня ${this.app.currentUser.level}!`,
                'success',
                5000
            );
            
            // Добавление достижения
            this.addAchievement(`level_${this.app.currentUser.level}`, `Достигнут уровень ${this.app.currentUser.level}`);
            
            return true;
        }
        
        return false;
    }
    
    addAchievement(id, name, description = '') {
        const achievements = JSON.parse(localStorage.getItem('leo_achievements') || '[]');
        
        if (!achievements.some(a => a.id === id)) {
            const newAchievement = {
                id,
                name,
                description,
                unlockedAt: new Date().toISOString(),
                icon: this.getAchievementIcon(id)
            };
            
            achievements.push(newAchievement);
            localStorage.setItem('leo_achievements', JSON.stringify(achievements));
            
            // Показ уведомления
            this.app.showToast(`🏆 Новое достижение: ${name}`, 'success', 5000);
            
            return true;
        }
        
        return false;
    }
    
    getAchievementIcon(achievementId) {
        const iconMap = {
            'first_login': 'fa-sign-in-alt',
            'ai_master': 'fa-brain',
            'homework_pro': 'fa-book',
            'social_butterfly': 'fa-users',
            'streak_master': 'fa-fire',
            'level_': 'fa-layer-group'
        };
        
        for (const [key, icon] of Object.entries(iconMap)) {
            if (achievementId.includes(key)) {
                return icon;
            }
        }
        
        return 'fa-trophy';
    }
    
    addNotification(title, message, type = 'info', action = null) {
        const notifications = JSON.parse(localStorage.getItem('leo_notifications') || '[]');
        
        const notification = {
            id: Date.now(),
            title,
            message,
            type,
            action,
            timestamp: new Date().toISOString(),
            read: false
        };
        
        notifications.unshift(notification);
        
        // Ограничиваем количество
        if (notifications.length > 50) {
            notifications.pop();
        }
        
        localStorage.setItem('leo_notifications', JSON.stringify(notifications));
        
        // Обновление UI
        this.updateNotifications();
        
        return notification;
    }
    
    markNotificationAsRead(notificationId) {
        const notifications = JSON.parse(localStorage.getItem('leo_notifications') || '[]');
        const notification = notifications.find(n => n.id === notificationId);
        
        if (notification) {
            notification.read = true;
            localStorage.setItem('leo_notifications', JSON.stringify(notifications));
            return true;
        }
        
        return false;
    }
    
    clearAllNotifications() {
        localStorage.setItem('leo_notifications', '[]');
        this.updateNotifications();
    }
    
    // Экспорт данных
    exportDashboardData() {
        const exportData = {
            user: this.app.currentUser,
            stats: this.stats,
            achievements: JSON.parse(localStorage.getItem('leo_achievements') || '[]'),
            pointsLog: JSON.parse(localStorage.getItem('leo_points_log') || '[]'),
            exportDate: new Date().toISOString()
        };
        
        return JSON.stringify(exportData, null, 2);
    }
    
    // Импорт данных
    importDashboardData(jsonData) {
        try {
            const data = JSON.parse(jsonData);
            
            // Валидация данных
            if (data.user && data.stats) {
                // Импорт пользователя
                localStorage.setItem('leo_user', JSON.stringify(data.user));
                
                // Импорт достижений
                if (data.achievements) {
                    localStorage.setItem('leo_achievements', JSON.stringify(data.achievements));
                }
                
                // Импорт лога очков
                if (data.pointsLog) {
                    localStorage.setItem('leo_points_log', JSON.stringify(data.pointsLog));
                }
                
                this.app.showToast('✅ Данные успешно импортированы', 'success');
                return true;
            }
        } catch (error) {
            console.error('Ошибка импорта данных:', error);
            this.app.showToast('❌ Ошибка импорта данных', 'error');
            return false;
        }
    }
}

// Глобальный экземпляр
let dashboardManager;

function initDashboardManager(app) {
    if (!dashboardManager && app) {
        dashboardManager = new DashboardManager(app);
    }
    return dashboardManager;
}

// Глобальные функции
function refreshDashboard() {
    if (dashboardManager) {
        dashboardManager.refreshData();
    }
}

function addPoints(amount, reason) {
    if (dashboardManager) {
        return dashboardManager.addPoints(amount, reason);
    }
    return 0;
}

function addAchievement(id, name, description) {
    if (dashboardManager) {
        return dashboardManager.addAchievement(id, name, description);
    }
    return false;
}

function exportDashboard() {
    if (dashboardManager) {
        const data = dashboardManager.exportDashboardData();
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `leo-dashboard-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        return true;
    }
    return false;
}

// Экспорт для модулей
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { DashboardManager, initDashboardManager };
}
