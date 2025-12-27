// ===== PWA ФУНКЦИОНАЛ =====

class PWAManager {
    constructor(app) {
        this.app = app;
        this.deferredPrompt = null;
        this.isStandalone = window.matchMedia('(display-mode: standalone)').matches;
        this.init();
    }
    
    init() {
        this.registerServiceWorker();
        this.setupInstallPrompt();
        this.checkStandaloneMode();
        this.setupAppShortcuts();
        
        // Периодическая проверка обновлений
        setInterval(() => this.checkForUpdates(), 12 * 60 * 60 * 1000); // Каждые 12 часов
    }
    
    // ===== РЕГИСТРАЦИЯ SERVICE WORKER =====
    
    async registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.register('../sw.js', {
                    scope: '/leoassistant/'
                });
                
                console.log('✅ Service Worker зарегистрирован:', registration);
                
                // Проверка обновлений
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            this.showUpdateNotification();
                        }
                    });
                });
                
                return registration;
            } catch (error) {
                console.error('❌ Ошибка регистрации Service Worker:', error);
                return null;
            }
        }
        return null;
    }
    
    // ===== УСТАНОВКА ПРИЛОЖЕНИЯ =====
    
    setupInstallPrompt() {
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            this.deferredPrompt = e;
            
            // Показываем кнопку установки
            this.showInstallButton();
        });
        
        window.addEventListener('appinstalled', () => {
            console.log('✅ Приложение установлено');
            this.deferredPrompt = null;
            this.hideInstallButton();
            this.app.showToast('🎉 Приложение установлено!', 'success');
        });
    }
    
    showInstallButton() {
        // Создаем или показываем кнопку установки
        let installBtn = document.getElementById('installButton');
        
        if (!installBtn) {
            installBtn = document.createElement('button');
            installBtn.id = 'installButton';
            installBtn.className = 'install-button';
            installBtn.innerHTML = '<i class="fas fa-download"></i> Установить Leo Assistant';
            installBtn.onclick = () => this.promptInstall();
            
            // Добавляем на страницу
            const container = document.querySelector('.app-container') || document.body;
            container.appendChild(installBtn);
            
            // Анимация появления
            setTimeout(() => {
                installBtn.classList.add('show');
            }, 1000);
        }
    }
    
    hideInstallButton() {
        const installBtn = document.getElementById('installButton');
        if (installBtn) {
            installBtn.classList.remove('show');
            setTimeout(() => {
                if (installBtn.parentNode) {
                    installBtn.parentNode.removeChild(installBtn);
                }
            }, 300);
        }
    }
    
    async promptInstall() {
        if (!this.deferredPrompt) {
            this.app.showToast('Приложение уже установлено или установка недоступна', 'info');
            return;
        }
        
        this.deferredPrompt.prompt();
        
        const { outcome } = await this.deferredPrompt.userChoice;
        console.log(`Пользователь ${outcome} установку`);
        
        this.deferredPrompt = null;
        this.hideInstallButton();
    }
    
    // ===== РЕЖИМ STANDALONE =====
    
    checkStandaloneMode() {
        // Проверяем режим отображения
        const displayMode = this.getDisplayMode();
        
        if (displayMode === 'standalone' || displayMode === 'fullscreen') {
            this.isStandalone = true;
            this.onStandaloneMode();
        }
        
        // Отслеживаем изменения режима
        window.matchMedia('(display-mode: standalone)').addEventListener('change', (e) => {
            this.isStandalone = e.matches;
            if (e.matches) this.onStandaloneMode();
        });
    }
    
    getDisplayMode() {
        if (window.matchMedia('(display-mode: standalone)').matches) return 'standalone';
        if (window.matchMedia('(display-mode: fullscreen)').matches) return 'fullscreen';
        if (window.matchMedia('(display-mode: minimal-ui)').matches) return 'minimal-ui';
        return 'browser';
    }
    
    onStandaloneMode() {
        console.log('📱 Приложение запущено в standalone режиме');
        
        // Показываем сообщение
        this.app.showToast('📱 Приложение установлено на устройство', 'success');
        
        // Активируем дополнительные функции
        this.activateStandaloneFeatures();
    }
    
    activateStandaloneFeatures() {
        // Включаем дополнительные функции для standalone режима
        if ('getInstalledRelatedApps' in navigator) {
            this.checkRelatedApps();
        }
        
        // Активируем периодическую синхронизацию
        if ('periodicSync' in navigator && 'serviceWorker' in navigator) {
            this.registerPeriodicSync();
        }
    }
    
    // ===== ЯРЛЫКИ ПРИЛОЖЕНИЯ =====
    
    setupAppShortcuts() {
        if ('launchQueue' in window && 'LaunchParams' in window) {
            // Обработка запуска по ярлыку
            window.launchQueue.setConsumer((launchParams) => {
                if (launchParams.targetURL) {
                    this.handleShortcutLaunch(launchParams.targetURL);
                }
            });
        }
    }
    
    handleShortcutLaunch(url) {
        const urlObj = new URL(url);
        const action = urlObj.searchParams.get('action');
        
        switch (action) {
            case 'ask':
                // Открыть чат с AI
                this.app.showPage('neuro-assistant');
                break;
                
            case 'homework':
                // Открыть задания
                this.app.showPage('homework');
                break;
                
            case 'schedule':
                // Открыть расписание
                this.app.showPage('schedule');
                break;
        }
    }
    
    // ===== УВЕДОМЛЕНИЯ =====
    
    async requestNotificationPermission() {
        if (!('Notification' in window)) {
            console.log('Уведомления не поддерживаются');
            return false;
        }
        
        if (Notification.permission === 'granted') {
            return true;
        }
        
        if (Notification.permission === 'denied') {
            this.app.showToast('Разрешите уведомления в настройках браузера', 'warning');
            return false;
        }
        
        const permission = await Notification.requestPermission();
        return permission === 'granted';
    }
    
    showNotification(title, options = {}) {
        if (!('Notification' in window) || Notification.permission !== 'granted') {
            return null;
        }
        
        const notificationOptions = {
            body: options.body || 'Новое уведомление от Leo Assistant',
            icon: '../icons/icon-192.png',
            badge: '../icons/icon-192.png',
            vibrate: [100, 50, 100],
            data: {
                url: options.url || '/leoassistant/',
                timestamp: Date.now()
            },
            actions: options.actions || [],
            tag: options.tag || 'default',
            ...options
        };
        
        const notification = new Notification(title, notificationOptions);
        
        notification.onclick = () => {
            window.focus();
            notification.close();
            
            if (notificationOptions.data.url) {
                window.location.href = notificationOptions.data.url;
            }
        };
        
        return notification;
    }
    
    showPushNotification(payload) {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.ready.then(registration => {
                registration.showNotification(payload.title || 'Leo Assistant', {
                    body: payload.body || 'Новое уведомление',
                    icon: '../icons/icon-192.png',
                    badge: '../icons/icon-192.png',
                    vibrate: [100, 50, 100],
                    data: {
                        url: payload.url || '/leoassistant/',
                        action: payload.action
                    }
                });
            });
        }
    }
    
    // ===== ПЕРИОДИЧЕСКАЯ СИНХРОНИЗАЦИЯ =====
    
    async registerPeriodicSync() {
        if ('periodicSync' in navigator && 'serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.ready;
                
                // Регистрируем периодическую синхронизацию
                await registration.periodicSync.register('sync-data', {
                    minInterval: 24 * 60 * 60 * 1000 // 1 день
                });
                
                console.log('✅ Периодическая синхронизация зарегистрирована');
            } catch (error) {
                console.error('❌ Ошибка регистрации периодической синхронизации:', error);
            }
        }
    }
    
    // ===== ОБНОВЛЕНИЯ =====
    
    async checkForUpdates() {
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.ready;
                await registration.update();
                console.log('✅ Проверка обновлений выполнена');
            } catch (error) {
                console.error('❌ Ошибка проверки обновлений:', error);
            }
        }
    }
    
    showUpdateNotification() {
        // Показываем уведомление об обновлении
        if (confirm('Доступна новая версия Leo Assistant. Обновить сейчас?')) {
            window.location.reload();
        }
    }
    
    // ===== СОХРАНЕНИЕ НА РАБОЧИЙ СТОЛ =====
    
    async addToHomeScreen() {
        if (this.isStandalone) {
            this.app.showToast('Приложение уже установлено', 'info');
            return;
        }
        
        if (!this.deferredPrompt) {
            this.app.showToast('Установка недоступна. Добавьте сайт через меню браузера', 'info');
            return;
        }
        
        await this.promptInstall();
    }
    
    // ===== РАБОТА С ФАЙЛАМИ =====
    
    async shareContent(title, text, url) {
        if (navigator.share) {
            try {
                await navigator.share({
                    title,
                    text,
                    url: url || window.location.href
                });
                console.log('✅ Контент успешно отправлен');
            } catch (error) {
                console.error('❌ Ошибка отправки:', error);
            }
        } else {
            // Fallback для браузеров без Web Share API
            this.copyToClipboard(url || window.location.href);
            this.app.showToast('Ссылка скопирована в буфер обмена', 'success');
        }
    }
    
    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (error) {
            // Fallback для старых браузеров
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            return true;
        }
    }
    
    // ===== ОФФЛАЙН-РАБОТА =====
    
    checkOfflineCapabilities() {
        const capabilities = {
            serviceWorker: 'serviceWorker' in navigator,
            cacheStorage: 'caches' in window,
            indexedDB: 'indexedDB' in window,
            backgroundSync: 'SyncManager' in window,
            periodicSync: 'PeriodicSyncManager' in window,
            pushNotifications: 'PushManager' in window,
            installPrompt: 'BeforeInstallPromptEvent' in window,
            share: 'share' in navigator,
            clipboard: 'clipboard' in navigator,
            badge: 'setAppBadge' in navigator,
            wakeLock: 'wakeLock' in navigator
        };
        
        return capabilities;
    }
    
    // ===== УСТАНОВКА БЕЙДЖЕЙ =====
    
    async setAppBadge(count) {
        if ('setAppBadge' in navigator) {
            try {
                if (count === 0 || count === null) {
                    await navigator.clearAppBadge();
                } else {
                    await navigator.setAppBadge(count);
                }
                return true;
            } catch (error) {
                console.error('Ошибка установки бейджа:', error);
                return false;
            }
        }
        return false;
    }
    
    // ===== БЛОКИРОВКА ЭКРАНА =====
    
    async requestWakeLock() {
        if ('wakeLock' in navigator) {
            try {
                this.wakeLock = await navigator.wakeLock.request('screen');
                
                this.wakeLock.addEventListener('release', () => {
                    console.log('Блокировка экрана снята');
                });
                
                console.log('✅ Блокировка экрана активирована');
                return true;
            } catch (error) {
                console.error('❌ Ошибка блокировки экрана:', error);
                return false;
            }
        }
        return false;
    }
    
    releaseWakeLock() {
        if (this.wakeLock) {
            this.wakeLock.release();
            this.wakeLock = null;
        }
    }
    
    // ===== СВЯЗАННЫЕ ПРИЛОЖЕНИЯ =====
    
    async checkRelatedApps() {
        if ('getInstalledRelatedApps' in navigator) {
            try {
                const relatedApps = await navigator.getInstalledRelatedApps();
                console.log('Связанные приложения:', relatedApps);
                return relatedApps;
            } catch (error) {
                console.error('Ошибка проверки связанных приложений:', error);
                return [];
            }
        }
        return [];
    }
    
    // ===== ЭКСПОРТ ДАННЫХ =====
    
    async exportToFile(filename, content, type = 'application/json') {
        try {
            const blob = new Blob([content], { type });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            
            URL.revokeObjectURL(url);
            return true;
        } catch (error) {
            console.error('Ошибка экспорта файла:', error);
            return false;
        }
    }
    
    // ===== СОХРАНЕНИЕ СОСТОЯНИЯ =====
    
    saveAppState() {
        const state = {
            currentPage: this.app.currentPage,
            user: this.app.currentUser,
            settings: this.app.settings,
            timestamp: Date.now()
        };
        
        localStorage.setItem('leo_app_state', JSON.stringify(state));
    }
    
    restoreAppState() {
        const saved = localStorage.getItem('leo_app_state');
        if (saved) {
            try {
                const state = JSON.parse(saved);
                
                // Проверяем свежесть сохранения (не старше 1 дня)
                const age = Date.now() - state.timestamp;
                if (age < 24 * 60 * 60 * 1000) {
                    return state;
                }
            } catch (error) {
                console.error('Ошибка восстановления состояния:', error);
            }
        }
        return null;
    }
}

// Глобальный экземпляр
let pwaManager;

function initPWAManager(app) {
    if (!pwaManager && app) {
        pwaManager = new PWAManager(app);
    }
    return pwaManager;
}

// Глобальные функции
function installApp() {
    if (pwaManager) {
        return pwaManager.promptInstall();
    }
    return Promise.reject(new Error('PWA Manager не инициализирован'));
}

function requestNotifications() {
    if (pwaManager) {
        return pwaManager.requestNotificationPermission();
    }
    return Promise.resolve(false);
}

function sendNotification(title, options) {
    if (pwaManager) {
        return pwaManager.showNotification(title, options);
    }
    return null;
}

function shareContent(title, text, url) {
    if (pwaManager) {
        return pwaManager.shareContent(title, text, url);
    }
    return Promise.reject(new Error('PWA Manager не инициализирован'));
}

function checkPwaCapabilities() {
    if (pwaManager) {
        return pwaManager.checkOfflineCapabilities();
    }
    return {};
}

// Стили для установочной кнопки
const installButtonStyles = `
    .install-button {
        position: fixed;
        bottom: 90px;
        right: 20px;
        z-index: 9999;
        padding: 12px 20px;
        background: linear-gradient(135deg, var(--primary), #8b5cf6);
        color: white;
        border: none;
        border-radius: var(--radius-lg);
        font-weight: 600;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 10px;
        box-shadow: var(--shadow-xl);
        transform: translateY(100px);
        opacity: 0;
        transition: all 0.3s ease;
    }
    
    .install-button.show {
        transform: translateY(0);
        opacity: 1;
    }
    
    .install-button:hover {
        transform: translateY(-2px);
        box-shadow: 0 10px 25px rgba(59, 130, 246, 0.4);
    }
    
    @media (max-width: 768px) {
        .install-button {
            bottom: 70px;
            right: 10px;
            padding: 10px 15px;
            font-size: 0.9rem;
        }
    }
`;

// Добавляем стили в документ
if (document && !document.getElementById('pwa-styles')) {
    const style = document.createElement('style');
    style.id = 'pwa-styles';
    style.textContent = installButtonStyles;
    document.head.appendChild(style);
}

// Экспорт для модулей
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { PWAManager, initPWAManager };
}
