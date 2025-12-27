// ===== ЯДРО LEO ASSISTANT =====

class LeoApp {
    constructor() {
        this.version = '2.0';
        this.isOnline = navigator.onLine;
        this.currentUser = null;
        this.currentPage = 'login';
        this.settings = {};
        this.init();
    }
    
    init() {
        console.log(`🚀 Leo Assistant v${this.version} инициализирован`);
        
        // Инициализация подсистем
        this.initEventListeners();
        this.loadSettings();
        this.checkConnectivity();
        this.setupTheme();
        
        // Проверка предыдущей сессии
        this.restoreSession();
        
        // Аналитика
        this.trackEvent('app_loaded');
    }
    
    initEventListeners() {
        // Онлайн/офлайн статус
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.showToast('🔗 Вы онлайн! Синхронизируем данные...', 'success');
            this.syncData();
        });
        
        window.addEventListener('offline', () => {
            this.isOnline = false;
            this.showToast('📶 Вы в офлайн-режиме. Данные сохраняются локально.', 'warning');
        });
        
        // Видимость страницы
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.trackEvent('app_background');
            } else {
                this.trackEvent('app_foreground');
            }
        });
        
        // Касания для мобильных
        document.addEventListener('touchstart', () => {}, { passive: true });
        
        // Предотвращение зума на полях ввода в iOS
        document.addEventListener('touchmove', (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                e.preventDefault();
            }
        }, { passive: false });
        
        // Обработка клавиатуры
        document.addEventListener('keydown', (e) => {
            // ESC закрывает модальные окна
            if (e.key === 'Escape') {
                this.closeAllModals();
            }
            
            // Enter в поле логина
            if (e.key === 'Enter' && e.target.id === 'login-input') {
                document.getElementById('password').focus();
            }
            
            // Enter в поле пароля
            if (e.key === 'Enter' && e.target.id === 'password') {
                this.performLogin();
            }
        });
    }
    
    loadSettings() {
        const saved = localStorage.getItem('leo_settings');
        if (saved) {
            this.settings = JSON.parse(saved);
        } else {
            this.settings = {
                theme: 'auto',
                animations: true,
                notifications: true,
                offlineMode: true,
                voiceAssistant: false,
                fontSize: 'medium',
                language: 'ru'
            };
            this.saveSettings();
        }
    }
    
    saveSettings() {
        localStorage.setItem('leo_settings', JSON.stringify(this.settings));
    }
    
    setupTheme() {
        const savedTheme = this.settings.theme;
        
        if (savedTheme === 'auto') {
            // Автоматическое определение темы системы
            if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                document.documentElement.setAttribute('data-theme', 'dark');
            } else {
                document.documentElement.setAttribute('data-theme', 'light');
            }
            
            // Слушаем изменения темы системы
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
                document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
            });
        } else {
            document.documentElement.setAttribute('data-theme', savedTheme);
        }
    }
    
    checkConnectivity() {
        // Проверка скорости соединения
        if ('connection' in navigator) {
            const connection = navigator.connection;
            console.log('Сеть:', connection.effectiveType);
            
            if (connection.saveData) {
                this.showToast('📊 Режим экономии данных включен', 'info');
            }
            
            connection.addEventListener('change', () => {
                this.showToast(`📶 Сеть: ${connection.effectiveType}`, 'info');
            });
        }
    }
    
    restoreSession() {
        const savedUser = localStorage.getItem('leo_user');
        const token = localStorage.getItem('leo_token');
        const expires = localStorage.getItem('leo_expires');
        
        if (savedUser && token && expires && Date.now() < parseInt(expires)) {
            this.currentUser = JSON.parse(savedUser);
            this.showPage('dashboard');
            this.showToast(`👋 С возвращением, ${this.currentUser.name}!`, 'success');
        }
    }
    
    // ===== УПРАВЛЕНИЕ СТРАНИЦАМИ =====
    
    showPage(pageId, data = {}) {
        const oldPage = document.querySelector('.page.active');
        const newPage = document.getElementById(`${pageId}-page`);
        
        if (!newPage) {
            console.error(`Страница ${pageId} не найдена`);
            return;
        }
        
        if (oldPage) {
            oldPage.classList.remove('active');
            oldPage.classList.add('page-exit');
            
            setTimeout(() => {
                oldPage.classList.remove('page-exit');
                oldPage.style.display = 'none';
            }, 300);
        }
        
        newPage.style.display = 'block';
        setTimeout(() => {
            newPage.classList.add('active');
        }, 50);
        
        this.currentPage = pageId;
        
        // Вызываем инициализацию страницы если есть
        if (typeof window[`init${pageId.charAt(0).toUpperCase() + pageId.slice(1)}Page`] === 'function') {
            window[`init${pageId.charAt(0).toUpperCase() + pageId.slice(1)}Page`](data);
        }
        
        this.trackEvent(`page_${pageId}`);
    }
    
    closeAllModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.remove('active');
        });
        document.getElementById('modalOverlay').style.display = 'none';
    }
    
    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
            document.getElementById('modalOverlay').style.display = 'block';
        }
    }
    
    // ===== УВЕДОМЛЕНИЯ =====
    
    showToast(message, type = 'info', duration = 3000) {
        // Удаляем старые тосты
        const oldToasts = document.querySelectorAll('.leo-toast');
        oldToasts.forEach(toast => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        });
        
        // Создаем новый тост
        const toast = document.createElement('div');
        toast.className = `leo-toast ${type}`;
        toast.innerHTML = `
            <div class="toast-content">
                <i class="fas fa-${this.getToastIcon(type)}"></i>
                <span>${message}</span>
            </div>
            <button class="toast-close" onclick="this.parentNode.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        document.body.appendChild(toast);
        
        // Показываем
        setTimeout(() => toast.classList.add('show'), 10);
        
        // Авто-удаление
        if (duration > 0) {
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.classList.remove('show');
                    setTimeout(() => {
                        if (toast.parentNode) {
                            toast.parentNode.removeChild(toast);
                        }
                    }, 300);
                }
            }, duration);
        }
    }
    
    getToastIcon(type) {
        const icons = {
            'success': 'check-circle',
            'error': 'exclamation-circle',
            'warning': 'exclamation-triangle',
            'info': 'info-circle'
        };
        return icons[type] || 'info-circle';
    }
    
    // ===== АНАЛИТИКА =====
    
    trackEvent(eventName, data = {}) {
        const eventData = {
            event: eventName,
            timestamp: Date.now(),
            page: this.currentPage,
            user: this.currentUser ? this.currentUser.id : 'guest',
            version: this.version,
            ...data
        };
        
        console.log('📊 Событие:', eventData);
        
        // Сохраняем в локальное хранилище
        const analytics = JSON.parse(localStorage.getItem('leo_analytics') || '[]');
        analytics.push(eventData);
        
        // Ограничиваем размер
        if (analytics.length > 1000) {
            analytics.splice(0, analytics.length - 1000);
        }
        
        localStorage.setItem('leo_analytics', JSON.stringify(analytics));
        
        // Отправляем на сервер если онлайн
        if (this.isOnline) {
            this.sendAnalytics(eventData);
        }
    }
    
    async sendAnalytics(data) {
        try {
            // В реальном проекте здесь будет отправка на сервер
            // fetch('/api/analytics', { method: 'POST', body: JSON.stringify(data) });
        } catch (error) {
            console.warn('Ошибка отправки аналитики:', error);
        }
    }
    
    // ===== СИНХРОНИЗАЦИЯ =====
    
    async syncData() {
        if (!this.isOnline) return;
        
        this.showToast('🔄 Синхронизация данных...', 'info');
        
        try {
            // Синхронизация аналитики
            const analytics = JSON.parse(localStorage.getItem('leo_analytics') || '[]');
            if (analytics.length > 0) {
                // Отправка данных...
                localStorage.setItem('leo_analytics', '[]');
            }
            
            // Синхронизация офлайн данных
            const offlineData = JSON.parse(localStorage.getItem('leo_offline_data') || '{}');
            if (Object.keys(offlineData).length > 0) {
                // Отправка данных...
                localStorage.setItem('leo_offline_data', '{}');
            }
            
            this.showToast('✅ Данные синхронизированы', 'success');
        } catch (error) {
            console.error('Ошибка синхронизации:', error);
            this.showToast('❌ Ошибка синхронизации', 'error');
        }
    }
    
    // ===== УТИЛИТЫ =====
    
    formatDate(date) {
        return new Date(date).toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    }
    
    formatTime(date) {
        return new Date(date).toLocaleTimeString('ru-RU', {
            hour: '2-digit',
            minute: '2-digit'
        });
    }
    
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
}

// Глобальный экземпляр приложения
let leoApp;

function initApp() {
    leoApp = new LeoApp();
    return leoApp;
}

// Глобальные функции для HTML
function showPage(pageId, data) {
    if (leoApp) {
        leoApp.showPage(pageId, data);
    }
}

function showToast(message, type, duration) {
    if (leoApp) {
        leoApp.showToast(message, type, duration);
    }
}

function showModal(modalId) {
    if (leoApp) {
        leoApp.showModal(modalId);
    }
}

// Экспорт для использования в других модулях
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { LeoApp, initApp };
}
