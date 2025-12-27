// ===== ОФЛАЙН-РЕЖИМ И СИНХРОНИЗАЦИЯ =====

class OfflineManager {
    constructor(app) {
        this.app = app;
        this.offlineData = new Map();
        this.pendingSync = [];
        this.syncQueue = [];
        this.isSyncing = false;
        this.init();
    }
    
    init() {
        this.loadOfflineData();
        this.setupEventListeners();
        this.startSyncWorker();
        
        // Проверка соединения при старте
        this.checkConnection();
    }
    
    setupEventListeners() {
        // Обработка онлайн/офлайн статуса
        window.addEventListener('online', () => this.handleOnline());
        window.addEventListener('offline', () => this.handleOffline());
        
        // Сохранение данных перед закрытием страницы
        window.addEventListener('beforeunload', () => this.saveBeforeUnload());
        
        // Периодическое автосохранение
        setInterval(() => this.autoSave(), 30 * 1000); // Каждые 30 секунд
    }
    
    startSyncWorker() {
        // Фоновый воркер для синхронизации
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.ready.then(registration => {
                if ('sync' in registration) {
                    // Регистрируем синхронизацию
                    registration.sync.register('sync-data')
                        .then(() => console.log('Синхронизация зарегистрирована'))
                        .catch(console.error);
                }
            });
        }
    }
    
    // ===== УПРАВЛЕНИЕ ДАННЫМИ =====
    
    save(key, data) {
        try {
            // Сохраняем локально
            localStorage.setItem(`leo_${key}`, JSON.stringify(data));
            
            // Добавляем в очередь синхронизации если онлайн
            if (this.app.isOnline) {
                this.addToSyncQueue(key, data);
            } else {
                this.saveOffline(key, data);
            }
            
            return true;
        } catch (error) {
            console.error(`Ошибка сохранения ${key}:`, error);
            return false;
        }
    }
    
    load(key) {
        try {
            const data = localStorage.getItem(`leo_${key}`);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error(`Ошибка загрузки ${key}:`, error);
            return null;
        }
    }
    
    saveOffline(key, data) {
        // Сохраняем во временное хранилище
        this.offlineData.set(key, {
            data,
            timestamp: Date.now(),
            synced: false
        });
        
        // Сохраняем в IndexedDB для надежности
        this.saveToIndexedDB(key, data);
        
        console.log(`📴 Данные сохранены офлайн: ${key}`);
    }
    
    async saveToIndexedDB(key, data) {
        try {
            if ('indexedDB' in window) {
                const db = await this.getDB();
                const transaction = db.transaction(['offlineData'], 'readwrite');
                const store = transaction.objectStore('offlineData');
                
                await store.put({
                    key,
                    data: JSON.stringify(data),
                    timestamp: Date.now(),
                    synced: false
                });
            }
        } catch (error) {
            console.error('Ошибка сохранения в IndexedDB:', error);
        }
    }
    
    // ===== СИНХРОНИЗАЦИЯ =====
    
    async sync() {
        if (this.isSyncing || !this.app.isOnline) return;
        
        this.isSyncing = true;
        this.app.showToast('🔄 Синхронизация данных...', 'info');
        
        try {
            // Синхронизация офлайн данных
            await this.syncOfflineData();
            
            // Синхронизация очереди
            await this.processSyncQueue();
            
            // Синхронизация с сервером
            await this.syncWithServer();
            
            this.app.showToast('✅ Данные синхронизированы', 'success');
        } catch (error) {
            console.error('Ошибка синхронизации:', error);
            this.app.showToast('❌ Ошибка синхронизации', 'error');
        } finally {
            this.isSyncing = false;
        }
    }
    
    async syncOfflineData() {
        const offlineKeys = Array.from(this.offlineData.keys());
        
        for (const key of offlineKeys) {
            const item = this.offlineData.get(key);
            
            if (!item.synced) {
                try {
                    // Отправка на сервер (имитация)
                    await this.sendToServer(key, item.data);
                    
                    // Помечаем как синхронизированное
                    item.synced = true;
                    this.offlineData.set(key, item);
                    
                    // Обновляем в localStorage
                    localStorage.setItem(`leo_${key}`, JSON.stringify(item.data));
                    
                    console.log(`✅ Синхронизировано: ${key}`);
                } catch (error) {
                    console.error(`Ошибка синхронизации ${key}:`, error);
                }
            }
        }
        
        // Очищаем синхронизированные данные
        this.cleanupSyncedData();
    }
    
    async processSyncQueue() {
        while (this.syncQueue.length > 0) {
            const item = this.syncQueue.shift();
            
            try {
                await this.sendToServer(item.key, item.data);
                console.log(`✅ Очередь: ${item.key} синхронизирован`);
            } catch (error) {
                // Возвращаем в очередь при ошибке
                this.syncQueue.unshift(item);
                throw error;
            }
        }
    }
    
    async syncWithServer() {
        // Список ключей для синхронизации
        const syncKeys = [
            'user',
            'settings',
            'tasks',
            'friends',
            'achievements',
            'notifications',
            'analytics'
        ];
        
        for (const key of syncKeys) {
            const data = this.load(key);
            if (data) {
                try {
                    await this.sendToServer(key, data);
                    console.log(`✅ Сервер: ${key} синхронизирован`);
                } catch (error) {
                    console.error(`Ошибка синхронизации ${key}:`, error);
                }
            }
        }
    }
    
    // ===== РАБОТА С СЕТЬЮ =====
    
    async sendToServer(key, data) {
        // Имитация отправки на сервер
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (Math.random() > 0.1) { // 90% успеха для демо
                    resolve();
                } else {
                    reject(new Error('Ошибка сети'));
                }
            }, 500);
        });
    }
    
    addToSyncQueue(key, data) {
        this.syncQueue.push({
            key,
            data,
            timestamp: Date.now(),
            attempts: 0
        });
        
        // Ограничиваем размер очереди
        if (this.syncQueue.length > 100) {
            this.syncQueue = this.syncQueue.slice(-100);
        }
    }
    
    // ===== УПРАВЛЕНИЕ СОЕДИНЕНИЕМ =====
    
    checkConnection() {
        this.app.isOnline = navigator.onLine;
        
        if (!this.app.isOnline) {
            this.showOfflineWarning();
        }
    }
    
    handleOnline() {
        this.app.isOnline = true;
        this.app.showToast('🔗 Соединение восстановлено', 'success');
        
        // Запускаем синхронизацию
        setTimeout(() => this.sync(), 2000);
    }
    
    handleOffline() {
        this.app.isOnline = false;
        this.showOfflineWarning();
    }
    
    showOfflineWarning() {
        this.app.showToast(
            '📶 Вы в офлайн-режиме. Данные сохраняются локально.',
            'warning',
            5000
        );
    }
    
    // ===== ИНДЕКСИРОВАННАЯ БАЗА ДАННЫХ =====
    
    async getDB() {
        if (!this.db) {
            this.db = await this.initIndexedDB();
        }
        return this.db;
    }
    
    initIndexedDB() {
        return new Promise((resolve, reject) => {
            if (!('indexedDB' in window)) {
                reject(new Error('IndexedDB не поддерживается'));
                return;
            }
            
            const request = indexedDB.open('LeoAssistantDB', 1);
            
            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result);
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                // Создаем хранилища
                if (!db.objectStoreNames.contains('offlineData')) {
                    const store = db.createObjectStore('offlineData', { keyPath: 'key' });
                    store.createIndex('timestamp', 'timestamp');
                    store.createIndex('synced', 'synced');
                }
                
                if (!db.objectStoreNames.contains('cache')) {
                    const store = db.createObjectStore('cache', { keyPath: 'url' });
                    store.createIndex('timestamp', 'timestamp');
                }
            };
        });
    }
    
    // ===== КЕШИРОВАНИЕ =====
    
    async cacheRequest(url, data) {
        try {
            const db = await this.getDB();
            const transaction = db.transaction(['cache'], 'readwrite');
            const store = transaction.objectStore('cache');
            
            await store.put({
                url,
                data: JSON.stringify(data),
                timestamp: Date.now()
            });
            
            return true;
        } catch (error) {
            console.error('Ошибка кеширования:', error);
            return false;
        }
    }
    
    async getCachedData(url) {
        try {
            const db = await this.getDB();
            const transaction = db.transaction(['cache'], 'readonly');
            const store = transaction.objectStore('cache');
            
            const request = store.get(url);
            
            return new Promise((resolve, reject) => {
                request.onsuccess = () => {
                    if (request.result) {
                        // Проверяем свежесть данных (1 час)
                        const age = Date.now() - request.result.timestamp;
                        if (age < 60 * 60 * 1000) {
                            resolve(JSON.parse(request.result.data));
                        } else {
                            resolve(null);
                        }
                    } else {
                        resolve(null);
                    }
                };
                request.onerror = () => reject(request.error);
            });
        } catch (error) {
            console.error('Ошибка получения кеша:', error);
            return null;
        }
    }
    
    // ===== УТИЛИТЫ =====
    
    loadOfflineData() {
        // Загрузка офлайн данных из localStorage
        const keys = Object.keys(localStorage).filter(key => key.startsWith('leo_'));
        
        keys.forEach(key => {
            try {
                const data = JSON.parse(localStorage.getItem(key));
                this.offlineData.set(key.replace('leo_', ''), {
                    data,
                    timestamp: Date.now(),
                    synced: true
                });
            } catch (error) {
                console.error(`Ошибка загрузки ${key}:`, error);
            }
        });
    }
    
    cleanupSyncedData() {
        // Удаляем синхронизированные данные
        for (const [key, item] of this.offlineData.entries()) {
            if (item.synced) {
                this.offlineData.delete(key);
            }
        }
    }
    
    autoSave() {
        // Автосохранение важных данных
        if (this.app.currentUser) {
            this.save('user', this.app.currentUser);
        }
        
        if (this.app.settings) {
            this.save('settings', this.app.settings);
        }
        
        console.log('💾 Автосохранение выполнено');
    }
    
    saveBeforeUnload() {
        // Экстренное сохранение перед закрытием
        this.autoSave();
        
        // Сохраняем в sessionStorage для быстрого восстановления
        if (this.app.currentUser) {
            sessionStorage.setItem('leo_user_backup', JSON.stringify(this.app.currentUser));
        }
    }
    
    // ===== ЭКСПОРТ/ИМПОРТ =====
    
    exportAllData() {
        const allData = {};
        
        // Собираем все данные из localStorage
        const keys = Object.keys(localStorage).filter(key => key.startsWith('leo_'));
        
        keys.forEach(key => {
            try {
                allData[key] = JSON.parse(localStorage.getItem(key));
            } catch (error) {
                console.error(`Ошибка экспорта ${key}:`, error);
            }
        });
        
        // Добавляем офлайн данные
        allData.offlineData = Array.from(this.offlineData.entries());
        
        return JSON.stringify(allData, null, 2);
    }
    
    async importAllData(jsonData) {
        try {
            const data = JSON.parse(jsonData);
            
            // Валидация
            if (typeof data !== 'object') {
                throw new Error('Некорректный формат данных');
            }
            
            // Импорт из localStorage
            for (const [key, value] of Object.entries(data)) {
                if (key.startsWith('leo_')) {
                    localStorage.setItem(key, JSON.stringify(value));
                }
            }
            
            // Импорт офлайн данных
            if (data.offlineData && Array.isArray(data.offlineData)) {
                data.offlineData.forEach(([key, value]) => {
                    this.offlineData.set(key, value);
                });
            }
            
            this.app.showToast('✅ Все данные успешно импортированы', 'success');
            return true;
        } catch (error) {
            console.error('Ошибка импорта данных:', error);
            this.app.showToast('❌ Ошибка импорта данных', 'error');
            return false;
        }
    }
    
    // ===== РЕЗЕРВНОЕ КОПИРОВАНИЕ =====
    
    createBackup() {
        const backup = {
            timestamp: Date.now(),
            version: this.app.version,
            data: this.exportAllData(),
            user: this.app.currentUser,
            stats: {
                localStorageSize: this.getLocalStorageSize(),
                offlineDataSize: this.offlineData.size,
                syncQueueSize: this.syncQueue.length
            }
        };
        
        // Сохраняем бэкап
        const backups = JSON.parse(localStorage.getItem('leo_backups') || '[]');
        backups.push(backup);
        
        // Ограничиваем количество бэкапов
        if (backups.length > 10) {
            backups.shift();
        }
        
        localStorage.setItem('leo_backups', JSON.stringify(backups));
        
        return backup;
    }
    
    getLocalStorageSize() {
        let total = 0;
        for (let key in localStorage) {
            if (localStorage.hasOwnProperty(key)) {
                total += localStorage[key].length * 2; // UTF-16
            }
        }
        return total; // в байтах
    }
    
    restoreBackup(backupIndex) {
        const backups = JSON.parse(localStorage.getItem('leo_backups') || '[]');
        
        if (backupIndex >= 0 && backupIndex < backups.length) {
            const backup = backups[backupIndex];
            return this.importAllData(backup.data);
        }
        
        return false;
    }
    
    // ===== ОЧИСТКА =====
    
    clearCache() {
        // Очистка кеша IndexedDB
        if ('indexedDB' in window) {
            indexedDB.deleteDatabase('LeoAssistantDB');
        }
        
        // Очистка офлайн данных
        this.offlineData.clear();
        this.syncQueue = [];
        
        // Очистка старых localStorage данных
        const preserveKeys = ['leo_user', 'leo_settings', 'leo_backups'];
        const keysToRemove = Object.keys(localStorage)
            .filter(key => key.startsWith('leo_') && !preserveKeys.includes(key));
        
        keysToRemove.forEach(key => localStorage.removeItem(key));
        
        this.app.showToast('🧹 Кеш очищен', 'success');
    }
    
    clearAllData() {
        if (confirm('ВНИМАНИЕ! Это удалит ВСЕ данные. Продолжить?')) {
            localStorage.clear();
            sessionStorage.clear();
            this.offlineData.clear();
            this.syncQueue = [];
            
            if ('indexedDB' in window) {
                indexedDB.deleteDatabase('LeoAssistantDB');
            }
            
            this.app.showToast('🗑️ Все данные удалены', 'warning');
            return true;
        }
        
        return false;
    }
}

// Глобальный экземпляр
let offlineManager;

function initOfflineManager(app) {
    if (!offlineManager && app) {
        offlineManager = new OfflineManager(app);
    }
    return offlineManager;
}

// Глобальные функции
function saveData(key, data) {
    if (offlineManager) {
        return offlineManager.save(key, data);
    }
    return false;
}

function loadData(key) {
    if (offlineManager) {
        return offlineManager.load(key);
    }
    return null;
}

function syncData() {
    if (offlineManager) {
        return offlineManager.sync();
    }
    return Promise.reject(new Error('OfflineManager не инициализирован'));
}

function exportAllData() {
    if (offlineManager) {
        return offlineManager.exportAllData();
    }
    return null;
}

function importAllData(jsonData) {
    if (offlineManager) {
        return offlineManager.importAllData(jsonData);
    }
    return false;
}

function createBackup() {
    if (offlineManager) {
        return offlineManager.createBackup();
    }
    return null;
}

function clearCache() {
    if (offlineManager) {
        offlineManager.clearCache();
        return true;
    }
    return false;
}

// Экспорт для модулей
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { OfflineManager, initOfflineManager };
}
