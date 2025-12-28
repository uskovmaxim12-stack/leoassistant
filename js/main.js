// Основной JavaScript файл для Leo Assistant

document.addEventListener('DOMContentLoaded', function() {
    console.log('Leo Assistant загружен!');
    
    // Инициализация частиц
    if (typeof particlesJS !== 'undefined') {
        particlesJS.load('particles-js', 'js/particles-config.json', function() {
            console.log('Частицы загружены');
        });
    }
    
    // Элементы DOM
    const formSelectorBtns = document.querySelectorAll('.selector-btn');
    const forms = document.querySelectorAll('.form-container');
    const switchFormLinks = document.querySelectorAll('.switch-form');
    const demoButtons = document.querySelectorAll('.demo-btn');
    const submitButtons = {
        login: document.getElementById('login-submit'),
        register: document.getElementById('register-submit'),
        admin: document.getElementById('admin-submit')
    };
    
    // Переключение между формами
    formSelectorBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const formType = this.getAttribute('data-form');
            
            // Обновляем активные кнопки
            formSelectorBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // Показываем нужную форму
            forms.forEach(form => {
                form.classList.remove('active');
                if (form.id === `${formType}-form`) {
                    setTimeout(() => form.classList.add('active'), 10);
                }
            });
            
            showNotification(`Переключено на форму: ${formType === 'login' ? 'Вход' : formType === 'register' ? 'Регистрация' : 'Админ'}`);
        });
    });
    
    // Переключение через ссылки
    switchFormLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const formType = this.getAttribute('data-form');
            
            // Находим соответствующую кнопку и кликаем её
            formSelectorBtns.forEach(btn => {
                if (btn.getAttribute('data-form') === formType) {
                    btn.click();
                }
            });
        });
    });
    
    // Демо-доступ
    demoButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const demoType = this.getAttribute('data-demo');
            
            switch(demoType) {
                case 'student':
                    // Демо ученика
                    document.getElementById('login-email').value = 'student@7b.ru';
                    document.getElementById('login-password').value = 'student123';
                    document.getElementById('login-class').value = '7b';
                    
                    // Переключаем на форму входа
                    formSelectorBtns[0].click();
                    
                    showNotification('Демо данные ученика загружены!', 'success');
                    break;
                    
                case 'teacher':
                    // Демо учителя
                    document.getElementById('login-email').value = 'teacher@school7b.ru';
                    document.getElementById('login-password').value = 'teacher123';
                    document.getElementById('login-class').value = '7b';
                    
                    formSelectorBtns[0].click();
                    showNotification('Демо данные учителя загружены!', 'success');
                    break;
                    
                case 'admin-demo':
                    // Демо администратора
                    document.getElementById('admin-login').value = 'admin';
                    document.getElementById('admin-password').value = 'admin123';
                    document.getElementById('admin-secret').value = 'leo2024';
                    
                    formSelectorBtns[2].click();
                    showNotification('Демо данные администратора загружены!', 'success');
                    break;
            }
        });
    });
    
    // Обработка входа
    if (submitButtons.login) {
        submitButtons.login.addEventListener('click', function() {
            const email = document.getElementById('login-email').value.trim();
            const password = document.getElementById('login-password').value.trim();
            const userClass = document.getElementById('login-class').value;
            
            if (!email || !password) {
                showNotification('Заполните все поля!', 'error');
                return;
            }
            
            // Показываем загрузку
            this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Вход...';
            this.disabled = true;
            
            // Имитация задержки сервера
            setTimeout(() => {
                // Сохраняем данные пользователя
                const userData = {
                    email: email,
                    name: email.split('@')[0],
                    class: userClass,
                    role: 'student',
                    isDemo: email.includes('demo') || email.includes('student@7b.ru') || email.includes('teacher@school7b.ru')
                };
                
                localStorage.setItem('leoUser', JSON.stringify(userData));
                localStorage.setItem('isLoggedIn', 'true');
                
                showNotification('Вход выполнен успешно!', 'success');
                
                // Переход на дашборд
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1000);
                
            }, 1500);
        });
    }
    
    // Обработка регистрации
    if (submitButtons.register) {
        submitButtons.register.addEventListener('click', function() {
            const name = document.getElementById('reg-name').value.trim();
            const email = document.getElementById('reg-email').value.trim();
            const password = document.getElementById('reg-password').value.trim();
            const userClass = document.getElementById('reg-class').value;
            
            if (!name || !email || !password) {
                showNotification('Заполните все поля!', 'error');
                return;
            }
            
            if (password.length < 6) {
                showNotification('Пароль должен быть не менее 6 символов!', 'error');
                return;
            }
            
            // Показываем загрузку
            this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Регистрация...';
            this.disabled = true;
            
            setTimeout(() => {
                const userData = {
                    name: name,
                    email: email,
                    class: userClass,
                    role: 'student',
                    registeredAt: new Date().toISOString()
                };
                
                // Сохраняем пользователя
                let users = JSON.parse(localStorage.getItem('leoUsers') || '[]');
                users.push(userData);
                localStorage.setItem('leoUsers', JSON.stringify(users));
                localStorage.setItem('leoUser', JSON.stringify(userData));
                localStorage.setItem('isLoggedIn', 'true');
                
                showNotification('Регистрация успешна!', 'success');
                
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1000);
                
            }, 1500);
        });
    }
    
    // Обработка входа админа
    if (submitButtons.admin) {
        submitButtons.admin.addEventListener('click', function() {
            const login = document.getElementById('admin-login').value.trim();
            const password = document.getElementById('admin-password').value.trim();
            const secret = document.getElementById('admin-secret').value.trim();
            
            if (!login || !password || !secret) {
                showNotification('Заполните все поля!', 'error');
                return;
            }
            
            // Проверка демо-доступа
            if (login === 'admin' && password === 'admin123' && secret === 'leo2024') {
                this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Вход...';
                this.disabled = true;
                
                setTimeout(() => {
                    const adminData = {
                        login: login,
                        role: 'admin',
                        isDemo: true
                    };
                    
                    localStorage.setItem('leoAdmin', JSON.stringify(adminData));
                    localStorage.setItem('isAdmin', 'true');
                    
                    showNotification('Вход в админ-панель выполнен!', 'success');
                    
                    // Переход на админ-панель
                    setTimeout(() => {
                        window.location.href = 'admin.html';
                    }, 1000);
                }, 1500);
            } else {
                showNotification('Неверные данные администратора!', 'error');
            }
        });
    }
    
    // Функция показа уведомлений
    window.showNotification = function(message, type = 'info') {
        const notification = document.getElementById('notification');
        const icon = notification.querySelector('i');
        const text = notification.querySelector('span');
        
        // Устанавливаем иконку и цвет по типу
        switch(type) {
            case 'success':
                icon.className = 'fas fa-check-circle';
                notification.style.background = 'linear-gradient(135deg, #00ff88, #00ccff)';
                break;
            case 'error':
                icon.className = 'fas fa-exclamation-circle';
                notification.style.background = 'linear-gradient(135deg, #ff416c, #ff4b2b)';
                break;
            case 'warning':
                icon.className = 'fas fa-exclamation-triangle';
                notification.style.background = 'linear-gradient(135deg, #ff9966, #ff5e62)';
                break;
            default:
                icon.className = 'fas fa-info-circle';
                notification.style.background = 'linear-gradient(135deg, #667eea, #764ba2)';
        }
        
        text.textContent = message;
        notification.classList.add('show');
        
        // Скрываем уведомление через 3 секунды
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    };
    
    // Проверяем, есть ли сохраненная сессия
    if (localStorage.getItem('isLoggedIn') === 'true') {
        // Автоматически перенаправляем на дашборд
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 100);
    }
    
    // Добавляем интерактивность нейронам
    const neurons = document.querySelectorAll('.neuron');
    neurons.forEach((neuron, index) => {
        neuron.addEventListener('mouseenter', () => {
            neuron.style.transform = 'scale(1.5)';
            neuron.style.background = '#00ffff';
            neuron.style.boxShadow = '0 0 20px #00ffff';
        });
        
        neuron.addEventListener('mouseleave', () => {
            neuron.style.transform = 'scale(1)';
            neuron.style.background = '#00ff88';
            neuron.style.boxShadow = 'none';
        });
        
        // Добавляем задержку для эффекта волны
        setTimeout(() => {
            neuron.classList.add('neuron-glow');
        }, index * 300);
    });
    
    // Добавляем эффект печатания для подзаголовка
    const subtitle = document.querySelector('.logo-subtitle');
    if (subtitle) {
        const originalText = subtitle.textContent;
        subtitle.textContent = '';
        
        let i = 0;
        const typeWriter = () => {
            if (i < originalText.length) {
                subtitle.textContent += originalText.charAt(i);
                i++;
                setTimeout(typeWriter, 50);
            }
        };
        
        setTimeout(typeWriter, 1000);
    }
    
    // Инициализация звуковых эффектов (опционально)
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    function playClickSound() {
        try {
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = 800;
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.1);
        } catch (e) {
            console.log('Аудио контекст не поддерживается');
        }
    }
    
    // Добавляем звуки на клики
    document.querySelectorAll('button, .switch-form').forEach(element => {
        element.addEventListener('click', playClickSound);
    });
});
