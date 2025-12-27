// ===== СИСТЕМА АВТОРИЗАЦИИ =====

class AuthManager {
    constructor(app) {
        this.app = app;
        this.demoUsers = this.createDemoUsers();
        this.initAuthListeners();
    }
    
    createDemoUsers() {
        return {
            'student': {
                id: '30683',
                name: 'Максим Усков',
                role: 'student',
                class: '7Б',
                avatar: 'МУ',
                email: 'maxim@7b-class.ru',
                points: 450,
                level: 3,
                achievements: ['first_login', 'ai_master', 'homework_pro']
            },
            'teacher': {
                id: 't001',
                name: 'Анна Иванова',
                role: 'teacher',
                class: '7Б',
                avatar: 'АИ',
                email: 'teacher@7b-class.ru',
                points: 1200,
                level: 8,
                subjects: ['Математика', 'Физика']
            },
            'parent': {
                id: 'p001',
                name: 'Ольга Ускова',
                role: 'parent',
                avatar: 'ОУ',
                email: 'parent@7b-class.ru',
                children: ['30683']
            },
            'admin': {
                id: 'admin',
                name: 'Администратор',
                role: 'admin',
                avatar: 'A',
                email: 'admin@leo-assistant.ru',
                permissions: ['all']
            }
        };
    }
    
    initAuthListeners() {
        // Переключение видимости пароля
        const toggleBtn = document.getElementById('togglePassword');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => {
                const passwordInput = document.getElementById('password');
                const icon = toggleBtn.querySelector('i');
                
                if (passwordInput.type === 'password') {
                    passwordInput.type = 'text';
                    icon.classList.remove('fa-eye');
                    icon.classList.add('fa-eye-slash');
                } else {
                    passwordInput.type = 'password';
                    icon.classList.remove('fa-eye-slash');
                    icon.classList.add('fa-eye');
                }
                
                passwordInput.focus();
            });
        }
        
        // Автозаполнение для демо
        const loginInput = document.getElementById('login-input');
        if (loginInput) {
            loginInput.addEventListener('input', this.handleLoginInput.bind(this));
            loginInput.addEventListener('focus', this.showLoginSuggestions.bind(this));
        }
    }
    
    handleLoginInput(event) {
        const value = event.target.value.toLowerCase().trim();
        
        // Автодополнение для демо-пользователей
        if (value === 'максим' || value === 'усков' || value === '30683') {
            document.getElementById('password').value = '12345';
        } else if (value === 'учитель' || value === 'анна') {
            document.getElementById('password').value = 'teacher123';
        } else if (value === 'родитель' || value === 'ольга') {
            document.getElementById('password').value = 'parent123';
        } else if (value === 'админ' || value === 'admin') {
            document.getElementById('password').value = 'admin123';
        }
    }
    
    showLoginSuggestions() {
        if (document.getElementById('login-suggestions')) return;
        
        const suggestions = document.createElement('div');
        suggestions.id = 'login-suggestions';
        suggestions.className = 'login-suggestions';
        suggestions.innerHTML = `
            <div class="suggestions-header">
                <i class="fas fa-lightbulb"></i>
                <span>Демо-доступы:</span>
            </div>
            <div class="suggestion" onclick="fillDemoLogin('Максим Усков')">
                <div class="suggestion-avatar">МУ</div>
                <div class="suggestion-info">
                    <strong>Максим Усков</strong>
                    <small>Ученик 7Б • Пароль: 12345</small>
                </div>
            </div>
            <div class="suggestion" onclick="fillDemoLogin('Анна Иванова')">
                <div class="suggestion-avatar">АИ</div>
                <div class="suggestion-info">
                    <strong>Анна Иванова</strong>
                    <small>Учитель • Пароль: teacher123</small>
                </div>
            </div>
        `;
        
        const input = document.getElementById('login-input');
        input.parentNode.appendChild(suggestions);
    }
    
    async performLogin() {
        const loginInput = document.getElementById('login-input');
        const passwordInput = document.getElementById('password');
        const rememberCheckbox = document.getElementById('remember');
        
        if (!loginInput || !passwordInput) {
            this.app.showToast('❌ Ошибка формы авторизации', 'error');
            return;
        }
        
        const login = loginInput.value.trim();
        const password = passwordInput.value;
        
        // Валидация
        if (!login) {
            this.app.showToast('📝 Введите логин или имя', 'warning');
            loginInput.focus();
            return;
        }
        
        if (!password) {
            this.app.showToast('🔒 Введите пароль', 'warning');
            passwordInput.focus();
            return;
        }
        
        // Показываем индикатор загрузки
        const loginBtn = document.querySelector('.login-btn');
        const originalText = loginBtn.innerHTML;
        loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Вход...';
        loginBtn.disabled = true;
        
        try {
            // Имитация задержки сети
            await new Promise(resolve => setTimeout(resolve, 800));
            
            // Поиск пользователя
            let user = this.findUser(login, password);
            
            if (user) {
                await this.successfulLogin(user, rememberCheckbox?.checked);
            } else {
                throw new Error('Неверный логин или пароль');
            }
        } catch (error) {
            console.error('Ошибка авторизации:', error);
            this.app.showToast(error.message || 'Ошибка авторизации', 'error');
            
            // Анимация ошибки
            loginInput.classList.add('shake');
            passwordInput.classList.add('shake');
            setTimeout(() => {
                loginInput.classList.remove('shake');
                passwordInput.classList.remove('shake');
            }, 500);
        } finally {
            // Восстанавливаем кнопку
            loginBtn.innerHTML = originalText;
            loginBtn.disabled = false;
        }
    }
    
    findUser(login, password) {
        const loginLower = login.toLowerCase();
        
        // Проверка демо-пользователей
        for (const [key, user] of Object.entries(this.demoUsers)) {
            const validLogins = [
                user.name.toLowerCase(),
                user.id.toLowerCase(),
                user.email.toLowerCase(),
                key.toLowerCase()
            ];
            
            const validPasswords = {
                'student': '12345',
                'teacher': 'teacher123',
                'parent': 'parent123',
                'admin': 'admin123'
            };
            
            if (validLogins.includes(loginLower) && password === validPasswords[key]) {
                return user;
            }
        }
        
        // Проверка в localStorage (для пользовательских аккаунтов)
        const users = JSON.parse(localStorage.getItem('leo_users') || '[]');
        const foundUser = users.find(u => 
            (u.email === login || u.username === login || u.id === login) && 
            u.password === password
        );
        
        if (foundUser) {
            return foundUser;
        }
        
        return null;
    }
    
    async successfulLogin(user, remember) {
        // Сохраняем сессию
        this.app.currentUser = user;
        
        if (remember) {
            const expires = Date.now() + (30 * 24 * 60 * 60 * 1000); // 30 дней
            localStorage.setItem('leo_user', JSON.stringify(user));
            localStorage.setItem('leo_token', this.generateToken(user.id));
            localStorage.setItem('leo_expires', expires.toString());
        } else {
            // Сессия только на время работы вкладки
            sessionStorage.setItem('leo_user', JSON.stringify(user));
        }
        
        // Трек события
        this.app.trackEvent('user_login', { user_id: user.id, role: user.role });
        
        // Показываем приветствие
        this.app.showToast(`🎉 Добро пожаловать, ${user.name}!`, 'success');
        
        // Перенаправляем на дашборд
        setTimeout(() => {
            this.app.showPage('dashboard');
        }, 1000);
        
        // Синхронизируем данные
        if (this.app.isOnline) {
            this.app.syncData();
        }
        
        // Обновляем время последнего входа
        this.updateLastLogin(user.id);
    }
    
    generateToken(userId) {
        return btoa(`${userId}:${Date.now()}:${Math.random().toString(36).substr(2)}`);
    }
    
    updateLastLogin(userId) {
        const users = JSON.parse(localStorage.getItem('leo_users') || '[]');
        const userIndex = users.findIndex(u => u.id === userId);
        
        if (userIndex !== -1) {
            users[userIndex].lastLogin = new Date().toISOString();
            localStorage.setItem('leo_users', JSON.stringify(users));
        }
    }
    
    quickLogin(role) {
        const users = {
            'student': { login: 'Максим Усков', password: '12345' },
            'teacher': { login: 'Анна Иванова', password: 'teacher123' },
            'parent': { login: 'Ольга Ускова', password: 'parent123' },
            'admin': { login: 'admin', password: 'admin123' }
        };
        
        const user = users[role];
        if (user) {
            document.getElementById('login-input').value = user.login;
            document.getElementById('password').value = user.password;
            
            // Небольшая задержка для визуальной обратной связи
            const btn = event.target;
            const originalBg = btn.style.background;
            btn.style.background = 'var(--primary)';
            btn.style.color = 'white';
            
            setTimeout(() => {
                btn.style.background = originalBg;
                btn.style.color = '';
                this.performLogin();
            }, 300);
        }
    }
    
    logout() {
        // Подтверждение
        if (!confirm('Вы уверены, что хотите выйти?')) return;
        
        // Очистка данных
        localStorage.removeItem('leo_token');
        localStorage.removeItem('leo_expires');
        sessionStorage.removeItem('leo_user');
        
        // Если не "запомнить меня", удаляем пользователя
        if (!document.getElementById('remember')?.checked) {
            localStorage.removeItem('leo_user');
        }
        
        // Трек события
        this.app.trackEvent('user_logout');
        
        // Показываем сообщение
        this.app.showToast('👋 До новых встреч!', 'info');
        
        // Возврат на страницу входа
        setTimeout(() => {
            this.app.currentUser = null;
            this.app.showPage('login');
            
            // Очистка полей ввода
            const loginInput = document.getElementById('login-input');
            const passwordInput = document.getElementById('password');
            
            if (loginInput) loginInput.value = '';
            if (passwordInput) passwordInput.value = '';
            
            if (loginInput) loginInput.focus();
        }, 1000);
    }
    
    async registerUser(userData) {
        // Валидация
        if (!userData.email || !userData.password || !userData.name) {
            throw new Error('Заполните все обязательные поля');
        }
        
        if (userData.password.length < 6) {
            throw new Error('Пароль должен содержать минимум 6 символов');
        }
        
        // Проверка email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(userData.email)) {
            throw new Error('Введите корректный email');
        }
        
        // Проверка существующего пользователя
        const users = JSON.parse(localStorage.getItem('leo_users') || '[]');
        if (users.some(u => u.email === userData.email)) {
            throw new Error('Пользователь с таким email уже существует');
        }
        
        // Создание нового пользователя
        const newUser = {
            id: 'u' + Date.now(),
            ...userData,
            role: 'student',
            class: '7Б',
            avatar: userData.name.split(' ').map(n => n[0]).join('').toUpperCase(),
            points: 100,
            level: 1,
            achievements: ['first_login'],
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString()
        };
        
        // Сохранение
        users.push(newUser);
        localStorage.setItem('leo_users', JSON.stringify(users));
        
        // Автоматический вход
        await this.successfulLogin(newUser, true);
        
        return newUser;
    }
    
    async resetPassword(email) {
        // Имитация отправки письма
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // В реальном проекте здесь была бы отправка email
        this.app.showToast(`📧 Инструкция отправлена на ${email}`, 'info');
        
        return true;
    }
}

// Глобальные функции
function performLogin() {
    if (window.authManager) {
        window.authManager.performLogin();
    }
}

function quickLogin(role) {
    if (window.authManager) {
        window.authManager.quickLogin(role);
    }
}

function fillDemoLogin(name) {
    document.getElementById('login-input').value = name;
    document.getElementById('password').value = 
        name.includes('Максим') ? '12345' : 
        name.includes('Анна') ? 'teacher123' : '12345';
    
    const suggestions = document.getElementById('login-suggestions');
    if (suggestions) {
        suggestions.remove();
    }
}

function showForgotPassword() {
    const email = prompt('Введите ваш email для восстановления пароля:');
    if (email && window.authManager) {
        window.authManager.resetPassword(email);
    }
}

// Инициализация после загрузки приложения
function initAuth() {
    if (window.leoApp) {
        window.authManager = new AuthManager(window.leoApp);
    }
}

// Экспорт
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AuthManager, initAuth };
}
