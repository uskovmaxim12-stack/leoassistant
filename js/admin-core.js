// =============================
// LEO ADMIN PANEL - РЕАЛЬНЫЕ ФУНКЦИИ
// =============================

class LeoAdminPanel {
    constructor() {
        this.users = [];
        this.aiStats = null;
        this.systemStats = null;
        this.currentView = 'dashboard';
        
        this.loadData();
        this.initEventListeners();
        this.updateAllStats();
    }
    
    // Загрузить данные
    loadData() {
        // Загрузка пользователей
        this.users = JSON.parse(localStorage.getItem('leoUsers') || '[]');
        
        // Загрузка статистики AI
        if (typeof LeoAI !== 'undefined') {
            this.aiStats = LeoAI.getStats();
        }
        
        // Системная статистика
        this.systemStats = {
            totalUsers: this.users.length,
            activeToday: this.users.length, // В реальности нужно считать по логинам
            totalQueries: parseInt(localStorage.getItem('totalQueries') || '0'),
            systemUptime: '99.8%'
        };
    }
    
    // Инициализация обработчиков
    initEventListeners() {
        // Навигация
        document.querySelectorAll('.admin-menu-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const view = item.getAttribute('data-view');
                this.switchView(view);
            });
        });
        
        // Действия с пользователями
        document.getElementById('refreshUsers')?.addEventListener('click', () => this.refreshUsers());
        document.getElementById('addUserBtn')?.addEventListener('click', () => this.showAddUserModal());
        document.getElementById('exportUsers')?.addEventListener('click', () => this.exportUsers());
        
        // Действия с AI
        document.getElementById('trainAI')?.addEventListener('click', () => this.trainAI());
        document.getElementById('exportAI')?.addEventListener('click', () => this.exportAI());
        document.getElementById('importAI')?.addEventListener('click', () => document.getElementById('aiImportFile').click());
        document.getElementById('resetAI')?.addEventListener('click', () => this.resetAI());
        document.getElementById('aiImportFile')?.addEventListener('change', (e) => this.importAI(e.target.files[0]));
        
        // Добавление знаний в AI
        document.getElementById('addKnowledgeBtn')?.addEventListener('click', () => this.addKnowledge());
        
        // Системные действия
        document.getElementById('clearCache')?.addEventListener('click', () => this.clearCache());
        document.getElementById('createBackup')?.addEventListener('click', () => this.createBackup());
        document.getElementById('restoreBackup')?.addEventListener('click', () => document.getElementById('backupFile').click());
        document.getElementById('backupFile')?.addEventListener('change', (e) => this.restoreBackup(e.target.files[0]));
        
        // Выход
        document.getElementById('adminLogout')?.addEventListener('click', () => this.logout());
    }
    
    // Переключение вида
    switchView(view) {
        this.currentView = view;
        
        // Обновляем активный пункт меню
        document.querySelectorAll('.admin-menu-item').forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('data-view') === view) {
                item.classList.add('active');
            }
        });
        
        // Показываем нужную секцию
        document.querySelectorAll('.admin-section').forEach(section => {
            section.style.display = section.id === `${view}Section` ? 'block' : 'none';
        });
        
        // Обновляем данные для текущего вида
        switch(view) {
            case 'users':
                this.renderUsersTable();
                break;
            case 'ai':
                this.updateAIStats();
                break;
            case 'stats':
                this.renderCharts();
                break;
            case 'system':
                this.updateSystemInfo();
                break;
        }
    }
    
    // ================= УПРАВЛЕНИЕ ПОЛЬЗОВАТЕЛЯМИ =================
    
    // Обновить список пользователей
    refreshUsers() {
        this.loadData();
        this.renderUsersTable();
        this.showNotification('Список пользователей обновлен', 'success');
    }
    
    // Отобразить таблицу пользователей
    renderUsersTable() {
        const tbody = document.querySelector('#usersTable tbody');
        if (!tbody) return;
        
        tbody.innerHTML = '';
        
        this.users.forEach((user, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>
                    <div class="user-cell">
                        <div class="user-avatar-small">${user.name.charAt(0)}</div>
                        <span>${user.name}</span>
                    </div>
                </td>
                <td>${user.class ? user.class.toUpperCase() : '7Б'}</td>
                <td>${user.level || 1}</td>
                <td>${(user.flightPoints || 0).toLocaleString()}</td>
                <td>${user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Никогда'}</td>
                <td>
                    <button class="btn-sm btn-view" onclick="adminPanel.viewUser(${index})">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn-sm btn-edit" onclick="adminPanel.editUser(${index})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-sm btn-delete" onclick="adminPanel.deleteUser(${index})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }
    
    // Просмотр пользователя
    viewUser(index) {
        const user = this.users[index];
        alert(`
            Информация о пользователе:
            Имя: ${user.name}
            Класс: ${user.class || 'Не указан'}
            Уровень: ${user.level || 1}
            Очки полёта: ${user.flightPoints || 0}
            Достижений: ${user.achievements ? user.achievements.length : 0}
            Последний вход: ${user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Никогда'}
        `);
    }
    
    // Редактировать пользователя
    editUser(index) {
        const user = this.users[index];
        const newName = prompt('Введите новое имя:', user.name);
        const newClass = prompt('Введите новый класс (7b, 7a):', user.class);
        
        if (newName && newName.trim()) {
            this.users[index].name = newName.trim();
            if (newClass) this.users[index].class = newClass.toLowerCase();
            
            localStorage.setItem('leoUsers', JSON.stringify(this.users));
            this.renderUsersTable();
            this.showNotification('Пользователь обновлен', 'success');
        }
    }
    
    // Удалить пользователя
    deleteUser(index) {
        if (confirm(`Удалить пользователя "${this.users[index].name}"?`)) {
            this.users.splice(index, 1);
            localStorage.setItem('leoUsers', JSON.stringify(this.users));
            this.renderUsersTable();
            this.systemStats.totalUsers = this.users.length;
            this.updateDashboardStats();
            this.showNotification('Пользователь удален', 'success');
        }
    }
    
    // Добавить пользователя (модальное окно)
    showAddUserModal() {
        const modal = document.createElement('div');
        modal.className = 'admin-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <h3><i class="fas fa-user-plus"></i> Добавить пользователя</h3>
                <div class="modal-body">
                    <div class="form-group">
                        <label>Имя пользователя:</label>
                        <input type="text" id="newUserName" class="form-input" placeholder="Иван Иванов">
                    </div>
                    <div class="form-group">
                        <label>Класс:</label>
                        <select id="newUserClass" class="form-input">
                            <option value="7b">7Б класс</option>
                            <option value="7a">7А класс</option>
                        </select>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="this.closest('.admin-modal').remove()">Отмена</button>
                    <button class="btn btn-primary" onclick="adminPanel.saveNewUser()">Добавить</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }
    
    saveNewUser() {
        const name = document.getElementById('newUserName').value.trim();
        const userClass = document.getElementById('newUserClass').value;
        
        if (!name) {
            alert('Введите имя пользователя');
            return;
        }
        
        const newUser = {
            id: Date.now(),
            name: name,
            class: userClass,
            level: 1,
            flightPoints: 100,
            achievements: [],
            created: new Date().toISOString()
        };
        
        this.users.push(newUser);
        localStorage.setItem('leoUsers', JSON.stringify(this.users));
        
        this.renderUsersTable();
        this.systemStats.totalUsers = this.users.length;
        this.updateDashboardStats();
        
        document.querySelector('.admin-modal').remove();
        this.showNotification(`Пользователь "${name}" добавлен`, 'success');
    }
    
    // Экспорт пользователей
    exportUsers() {
        const data = JSON.stringify(this.users, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `leo-users-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        this.showNotification('Пользователи экспортированы', 'success');
    }
    
    // ================= УПРАВЛЕНИЕ НЕЙРОСЕТЬЮ =================
    
    // Обновить статистику AI
    updateAIStats() {
        if (!LeoAI) return;
        
        const stats = LeoAI.getStats();
        
        // Обновляем цифры
        document.querySelectorAll('.ai-stat').forEach(el => {
            const statType = el.dataset.stat;
            if (statType === 'totalKeywords') {
                el.textContent = stats.totalKeywords || 0;
            } else if (statType === 'accuracy') {
                el.textContent = `${((stats.accuracy || 0) * 100).toFixed(1)}%`;
            } else if (statType === 'learnedPhrases') {
                el.textContent = stats.learnedPhrases || 0;
            } else if (statType === 'totalRequests') {
                el.textContent = stats.totalRequests || 0;
            }
        });
        
        // Прогресс-бар точности
        const accuracyBar = document.getElementById('accuracyBar');
        if (accuracyBar) {
            accuracyBar.style.width = `${(stats.accuracy || 0) * 100}%`;
        }
        
        // Последние разговоры
        this.renderRecentConversations(stats.lastConversation || []);
    }
    
    // Показать последние разговоры
    renderRecentConversations(conversations) {
        const container = document.getElementById('recentConversations');
        if (!container) return;
        
        container.innerHTML = '';
        
        conversations.slice(-5).forEach(conv => {
            const div = document.createElement('div');
            div.className = 'conversation-item';
            div.innerHTML = `
                <div class="conversation-header">
                    <span class="conv-user">👤 ${conv.sender === 'user' ? 'Ученик' : 'AI'}</span>
                    <span class="conv-time">${new Date(conv.timestamp).toLocaleTimeString()}</span>
                </div>
                <div class="conv-text">${conv.text}</div>
            `;
            container.appendChild(div);
        });
    }
    
    // Обучение AI
    trainAI() {
        if (!LeoAI) {
            this.showNotification('Нейросеть не загружена', 'error');
            return;
        }
        
        this.showNotification('Обучение нейросети начато...', 'info');
        
        // Пример обучения
        const trainingData = [
            { category: 'математика', keyword: 'квадрат числа', answer: 'Квадрат числа - это число, умноженное само на себя. Пример: 5² = 25.' },
            { category: 'физика', keyword: 'сила тяжести', answer: 'Сила тяжести - сила, с которой Земля притягивает тела. F = mg, где g ≈ 9.8 м/с².' },
            { category: 'русский язык', keyword: 'существительное', answer: 'Существительное - часть речи, обозначающая предмет. Отвечает на вопросы кто? что?' }
        ];
        
        trainingData.forEach(data => {
            LeoAI.addKnowledge(data.category, data.keyword, data.answer);
        });
        
        this.updateAIStats();
        this.showNotification('Нейросеть обучена на 3 новых примерах', 'success');
    }
    
    // Экспорт знаний AI
    exportAI() {
        if (!LeoAI) {
            this.showNotification('Нейросеть не загружена', 'error');
            return;
        }
        
        const data = LeoAI.exportKnowledge();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `leo-ai-knowledge-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        
        this.showNotification('База знаний экспортирована', 'success');
    }
    
    // Импорт знаний AI
    importAI(file) {
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                if (LeoAI.importKnowledge(data)) {
                    this.updateAIStats();
                    this.showNotification('База знаний импортирована', 'success');
                } else {
                    this.showNotification('Ошибка импорта', 'error');
                }
            } catch (error) {
                this.showNotification('Ошибка чтения файла', 'error');
            }
        };
        reader.readAsText(file);
    }
    
    // Сброс AI
    resetAI() {
        if (confirm('Вы уверены? Это удалит все обученные знания.')) {
            if (LeoAI) {
                LeoAI.resetLearning();
                this.updateAIStats();
                this.showNotification('Нейросеть сброшена', 'success');
            }
        }
    }
    
    // Добавить знания вручную
    addKnowledge() {
        const category = document.getElementById('knowledgeCategory').value;
        const keyword = document.getElementById('knowledgeKeyword').value.trim();
        const answer = document.getElementById('knowledgeAnswer').value.trim();
        
        if (!category || !keyword || !answer) {
            this.showNotification('Заполните все поля', 'error');
            return;
        }
        
        if (LeoAI.addKnowledge(category, keyword, answer)) {
            document.getElementById('knowledgeKeyword').value = '';
            document.getElementById('knowledgeAnswer').value = '';
            this.updateAIStats();
            this.showNotification('Знание добавлено', 'success');
        }
    }
    
    // ================= СИСТЕМНЫЕ ФУНКЦИИ =================
    
    // Очистить кэш
    clearCache() {
        // Очищаем только временные данные
        localStorage.removeItem('aiConversations');
        localStorage.removeItem('gameSessions');
        
        this.showNotification('Кэш очищен', 'success');
    }
    
    // Создать бэкап
    createBackup() {
        const backupData = {
            users: this.users,
            aiKnowledge: LeoAI ? LeoAI.exportKnowledge() : null,
            systemSettings: {
                version: '2.0',
                backupDate: new Date().toISOString()
            }
        };
        
        const data = JSON.stringify(backupData, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `leo-backup-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        
        this.showNotification('Бэкап создан', 'success');
    }
    
    // Восстановить из бэкапа
    restoreBackup(file) {
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const backup = JSON.parse(e.target.result);
                
                if (backup.users) {
                    localStorage.setItem('leoUsers', JSON.stringify(backup.users));
                    this.users = backup.users;
                    this.renderUsersTable();
                }
                
                if (backup.aiKnowledge && LeoAI) {
                    LeoAI.importKnowledge(backup.aiKnowledge);
                    this.updateAIStats();
                }
                
                this.updateDashboardStats();
                this.showNotification('Бэкап восстановлен', 'success');
            } catch (error) {
                this.showNotification('Ошибка восстановления', 'error');
            }
        };
        reader.readAsText(file);
    }
    
    // Обновить системную информацию
    updateSystemInfo() {
        const infoContainer = document.getElementById('systemInfo');
        if (!infoContainer) return;
        
        infoContainer.innerHTML = `
            <div class="system-info-item">
                <i class="fas fa-users"></i>
                <span>Пользователей в системе: <strong>${this.systemStats.totalUsers}</strong></span>
            </div>
            <div class="system-info-item">
                <i class="fas fa-brain"></i>
                <span>Запросов к AI: <strong>${this.systemStats.totalQueries}</strong></span>
            </div>
            <div class="system-info-item">
                <i class="fas fa-database"></i>
                <span>Размер данных: <strong>${this.calculateStorageSize()} KB</strong></span>
            </div>
            <div class="system-info-item">
                <i class="fas fa-shield-alt"></i>
                <span>Статус: <strong class="status-good">Активен</strong></span>
            </div>
        `;
    }
    
    // Рассчитать размер хранилища
    calculateStorageSize() {
        let total = 0;
        for (let key in localStorage) {
            if (localStorage.hasOwnProperty(key)) {
                total += localStorage[key].length * 2; // UTF-16
            }
        }
        return Math.round(total / 1024);
    }
    
    // ================= ОБЩИЕ ФУНКЦИИ =================
    
    // Обновить все статистики
    updateAllStats() {
        this.updateDashboardStats();
        this.updateAIStats();
        this.updateSystemInfo();
    }
    
    // Обновить статистику дашборда
    updateDashboardStats() {
        document.getElementById('totalUsers').textContent = this.systemStats.totalUsers;
        document.getElementById('activeToday').textContent = this.systemStats.activeToday;
        document.getElementById('totalQueries').textContent = this.systemStats.totalQueries;
        
        if (this.aiStats) {
            document.getElementById('aiAccuracy').textContent = `${(this.aiStats.accuracy * 100).toFixed(1)}%`;
        }
    }
    
    // Отрисовать графики
    renderCharts() {
        // Простая реализация графиков
        const chartContainer = document.getElementById('chartsContainer');
        if (!chartContainer) return;
        
        chartContainer.innerHTML = `
            <div class="chart-box">
                <h4>Активность пользователей</h4>
                <div class="simple-chart">
                    ${this.users.map(user => `
                        <div class="chart-bar" style="height: ${(user.level || 1) * 10}px" title="${user.name}: Уровень ${user.level}">
                            <span>${user.name.split(' ')[0]}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div class="chart-box">
                <h4>Распределение по классам</h4>
                <div class="pie-chart">
                    <div class="pie-segment" style="--percentage: 80; --color: #00ff88;">7Б: 80%</div>
                    <div class="pie-segment" style="--percentage: 20; --color: #00ccff;">7А: 20%</div>
                </div>
            </div>
        `;
    }
    
    // Выход
    logout() {
        localStorage.removeItem('leoAdmin');
        localStorage.removeItem('isAdmin');
        window.location.href = 'index.html';
    }
    
    // Уведомления
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `admin-notification ${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    // Проверка прав администратора
    const adminData = JSON.parse(localStorage.getItem('leoAdmin'));
    const isAdmin = localStorage.getItem('isAdmin') === 'true';
    
    if (!isAdmin || !adminData) {
        alert('Доступ запрещен. Пожалуйста, войдите как администратор.');
        window.location.href = 'index.html';
        return;
    }
    
    // Инициализация панели
    window.adminPanel = new LeoAdminPanel();
    
    // Установка имени администратора
    document.getElementById('adminName').textContent = adminData.username || 'Администратор';
    
    console.log('⚙️ Панель управления загружена');
});
