// Leo Assistant - Логика входа (Упрощенная и стабильная)
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Leo Assistant загружен!');
    
    // Инициализация частиц
    if (typeof particlesJS !== 'undefined') {
        particlesJS('particles-js', {
            particles: {
                number: { value: 120, density: { enable: true, value_area: 800 } },
                color: { value: ["#00ff88", "#00ccff", "#9d4edd"] },
                shape: { type: "circle" },
                opacity: { value: 0.5, random: true },
                size: { value: 4, random: true },
                line_linked: { 
                    enable: true, 
                    distance: 150, 
                    color: "#ffffff", 
                    opacity: 0.1, 
                    width: 1 
                },
                move: { 
                    enable: true, 
                    speed: 2.5,
                    direction: "none",
                    random: true,
                    out_mode: "out"
                }
            },
            interactivity: {
                events: {
                    onhover: { enable: true, mode: "repulse" },
                    onclick: { enable: true, mode: "push" }
                }
            },
            retina_detect: true
        });
    }
    
    // Переключение форм
    const formSelectorBtns = document.querySelectorAll('.selector-btn');
    const forms = document.querySelectorAll('.form-container');
    
    formSelectorBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const formType = this.getAttribute('data-form');
            
            // Активируем кнопку
            formSelectorBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // Показываем форму
            forms.forEach(form => {
                form.classList.remove('active');
                if (form.id === `${formType}-form`) {
                    form.classList.add('active');
                }
            });
            
            showNotification(`Выбрана форма: ${formType === 'login' ? 'Для ученика' : 'Для учителя'}`);
        });
    });
    
    // Показ/скрытие пароля
    document.querySelector('.toggle-password')?.addEventListener('click', function() {
        const passwordInput = document.getElementById('login-password');
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        this.classList.toggle('fa-eye');
        this.classList.toggle('fa-eye-slash');
    });
    
    // Демо-режимы
    document.querySelectorAll('.demo-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const demoType = this.getAttribute('data-demo');
            
            if (demoType === 'student') {
                document.getElementById('login-email').value = 'student@7b-school.ru';
                document.getElementById('login-password').value = 'demo123';
                document.getElementById('login-class').value = '7b';
                formSelectorBtns[0].click();
                showNotification('Демо-режим ученика активирован!', 'success');
            } else if (demoType === 'teacher') {
                document.getElementById('admin-login').value = 'teacher';
                document.getElementById('admin-password').value = 'teacher123';
                document.getElementById('admin-secret').value = 'leo2024';
                formSelectorBtns[1].click();
                showNotification('Демо-режим учителя активирован!', 'success');
            }
        });
    });
    
    // Вход ученика
    document.getElementById('login-submit')?.addEventListener('click', function() {
        const email = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value.trim();
        const userClass = document.getElementById('login-class').value;
        
        if (!email || !password) {
            showNotification('Заполни все поля, космонавт! 🚀', 'error');
            return;
        }
        
        // Показ загрузки
        const originalText = this.innerHTML;
        this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Запускаем системы...';
        this.disabled = true;
        
        // Имитация загрузки
        setTimeout(() => {
            // Сохраняем данные пользователя
            const userData = {
                id: Date.now(),
                email: email,
                name: email.split('@')[0].replace('.', ' '),
                class: userClass,
                role: 'student',
                avatar: Math.floor(Math.random() * 5) + 1,
                joinDate: new Date().toISOString(),
                flightPoints: 8425,
                level: 15,
                xp: 1250,
                xpMax: 2000
            };
            
            localStorage.setItem('leoUser', JSON.stringify(userData));
            localStorage.setItem('isLoggedIn', 'true');
            
            showNotification(`Добро пожаловать, ${userData.name}! 🎉`, 'success');
            
            // Переход на дашборд
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1200);
            
        }, 1500);
    });
    
    // Вход учителя
    document.getElementById('admin-submit')?.addEventListener('click', function() {
        const login = document.getElementById('admin-login').value.trim();
        const password = document.getElementById('admin-password').value.trim();
        const secret = document.getElementById('admin-secret').value.trim();
        
        // Проверка демо-доступа
        if (login === 'teacher' && password === 'teacher123' && secret === 'leo2024') {
            const originalText = this.innerHTML;
            this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Загружаем панель...';
            this.disabled = true;
            
            setTimeout(() => {
                const adminData = {
                    login: login,
                    role: 'admin',
                    permissions: ['users', 'content', 'stats', 'ai', 'system'],
                    lastLogin: new Date().toISOString()
                };
                
                localStorage.setItem('leoAdmin', JSON.stringify(adminData));
                localStorage.setItem('isAdmin', 'true');
                
                showNotification('Панель управления загружается...', 'success');
                
                setTimeout(() => {
                    window.location.href = 'admin.html';
                }, 1000);
            }, 1200);
        } else {
            showNotification('Неверные данные доступа', 'error');
        }
    });
    
    // Функция уведомлений
    window.showNotification = function(message, type = 'info') {
        const notification = document.getElementById('notification');
        const icon = notification.querySelector('i');
        const text = notification.querySelector('span');
        
        switch(type) {
            case 'success':
                icon.className = 'fas fa-check-circle';
                notification.style.background = 'linear-gradient(135deg, #00ff88, #00ccff)';
                break;
            case 'error':
                icon.className = 'fas fa-exclamation-circle';
                notification.style.background = 'linear-gradient(135deg, #ff416c, #ff4b2b)';
                break;
            default:
                icon.className = 'fas fa-info-circle';
                notification.style.background = 'linear-gradient(135deg, #667eea, #764ba2)';
        }
        
        text.textContent = message;
        notification.classList.add('show');
        
        setTimeout(() => {
            notification.classList.remove('show');
        }, 4000);
    };
    
    // Автопереключение через ссылки
    document.querySelectorAll('.switch-form').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const formType = this.getAttribute('data-form');
            formSelectorBtns.forEach(btn => {
                if (btn.getAttribute('data-form') === formType) {
                    btn.click();
                }
            });
        });
    });
});
