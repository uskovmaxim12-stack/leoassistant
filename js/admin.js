// Leo Assistant - Панель управления администратора
document.addEventListener('DOMContentLoaded', function() {
    console.log('⚙️ Админ-панель загружена');
    
    // Проверка прав администратора
    const adminData = JSON.parse(localStorage.getItem('leoAdmin'));
    const isAdmin = localStorage.getItem('isAdmin') === 'true';
    
    if (!isAdmin || !adminData) {
        alert('Доступ запрещен. Пожалуйста, войдите как администратор.');
        window.location.href = 'index.html';
        return;
    }
    
    console.log('Администратор авторизован:', adminData.login);
    
    // Инициализация частиц для админки
    if (typeof particlesJS !== 'undefined') {
        particlesJS('admin-particles', {
            particles: {
                number: { value: 80, density: { enable: true, value_area: 800 } },
                color: { value: "#6366f1" }, // Админский цвет
                shape: { type: "circle" },
                opacity: { value: 0.3, random: true },
                size: { value: 3, random: true },
                line_linked: { 
                    enable: true, 
                    distance: 150, 
                    color: "#6366f1", 
                    opacity: 0.1, 
                    width: 1 
                },
                move: { enable: true, speed: 1.5 }
            }
        });
    }
    
    // Навигация по админ-панели
    const menuItems = document.querySelectorAll('.admin-menu-item');
    const sections = document.querySelectorAll('.admin-section');
    
    menuItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            
            // Обновляем активный пункт меню
            menuItems.forEach(mi => mi.classList.remove('active'));
            this.classList.add('active');
            
            // Прокручиваем к секции
            const targetSection = document.getElementById(`${targetId}-section`);
            if (targetSection) {
                targetSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
    
    // Выход из админки
    document.getElementById('admin-logout')?.addEventListener('click', function() {
        if (confirm('Выйти из панели управления?')) {
            localStorage.removeItem('leoAdmin');
            localStorage.removeItem('isAdmin');
            window.location.href = 'index.html';
        }
    });
    
    // Полноэкранный режим
    document.getElementById('admin-fullscreen')?.addEventListener('click', function() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
            this.innerHTML = '<i class="fas fa-compress"></i>';
        } else {
            document.exitFullscreen();
            this.innerHTML = '<i class="fas fa-expand"></i>';
        }
    });
    
    // Быстрые действия
    document.getElementById('backup-now')?.addEventListener('click', function() {
        showAdminNotification('Создание резервной копии...', 'info');
        setTimeout(() => {
            showAdminNotification('Резервная копия успешно создана!', 'success');
        }, 2000);
    });
    
    document.getElementById('clear-cache')?.addEventListener('click', function() {
        if (confirm('Очистить весь кэш системы?')) {
            showAdminNotification('Кэш очищается...', 'info');
            setTimeout(() => {
                showAdminNotification('Кэш успешно очищен!', 'success');
            }, 1500);
        }
    });
    
    document.getElementById('export-data')?.addEventListener('click', function() {
        showAdminNotification('Подготовка данных для экспорта...', 'info');
        setTimeout(() => {
            showAdminNotification('Данные готовы к скачиванию', 'success');
        }, 2500);
    });
    
    // Управление нейросетью
    document.querySelector('.training-btn.start')?.addEventListener('click', function() {
        showAdminNotification('Обучение нейросети начато...', 'info');
        // Здесь будет реальная логика обучения
    });
    
    document.querySelector('.training-btn.stop')?.addEventListener('click', function() {
        if (confirm('Остановить обучение нейросети?')) {
            showAdminNotification('Обучение остановлено', 'warning');
        }
    });
    
    document.querySelector('.training-btn.reset')?.addEventListener('click', function() {
        if (confirm('Сбросить все настройки нейросети?')) {
            showAdminNotification('Нейросеть сброшена к начальным настройкам', 'success');
        }
    });
    
    // Добавление знаний в базу
    document.querySelector('.knowledge-add-btn')?.addEventListener('click', function() {
        const knowledgeInput = document.querySelector('.knowledge-input');
        const text = knowledgeInput.value.trim();
        
        if (text) {
            showAdminNotification('Новые знания добавлены в базу', 'success');
            knowledgeInput.value = '';
            
            // Обновляем счетчик
            const knowledgeStats = document.querySelectorAll('.knowledge-stat span');
            if (knowledgeStats.length > 0) {
                const currentCount = parseInt(knowledgeStats[0].textContent.split(': ')[1]);
                knowledgeStats[0].textContent = `Математика: ${currentCount + 1}`;
            }
        } else {
            showAdminNotification('Введите текст для добавления', 'error');
        }
    });
    
    // Сохранение настроек системы
    document.querySelector('.system-action-btn.save')?.addEventListener('click', function() {
        showAdminNotification('Настройки сохраняются...', 'info');
        setTimeout(() => {
            showAdminNotification('Все настройки успешно сохранены!', 'success');
        }, 2000);
    });
    
    // Уведомления для админки
    function showAdminNotification(message, type = 'info') {
        // Создаем временное уведомление
        const notification = document.createElement('div');
        notification.className = 'admin-notification';
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;
        
        // Стили
        notification.style.cssText = `
            position: fixed;
            top: 30px;
            right: 30px;
            padding: 20px 30px;
            background: ${type === 'success' ? 'linear-gradient(135deg, #10b981, #059669)' : 
                         type === 'error' ? 'linear-gradient(135deg, #ef4444, #dc2626)' : 
                         'linear-gradient(135deg, #6366f1, #4f46e5)'};
            color: white;
            border-radius: 12px;
            display: flex;
            align-items: center;
            gap: 15px;
            font-weight: 600;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
            z-index: 99999;
            transform: translateX(150%);
            transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        `;
        
        document.body.appendChild(notification);
        
        // Показываем
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 10);
        
        // Скрываем через 4 секунды
        setTimeout(() => {
            notification.style.transform = 'translateX(150%)';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 400);
        }, 4000);
    }
    
    // Инициализация слайдера скорости обучения
    const trainingSlider = document.querySelector('.training-slider');
    if (trainingSlider) {
        trainingSlider.addEventListener('input', function() {
            const value = this.value;
            const speedText = value <= 3 ? 'Медленно' : value <= 7 ? 'Средне' : 'Быстро';
            showAdminNotification(`Скорость обучения: ${speedText} (${value}/10)`, 'info');
        });
    }
    
    // Загрузка статистики (имитация)
    function loadStatistics() {
        console.log('Загрузка статистики системы...');
        // Здесь будет реальная загрузка данных
    }
    
    // Автосохранение каждые 5 минут
    setInterval(() => {
        console.log('Автосохранение настроек...');
    }, 5 * 60 * 1000);
    
    // Инициализация
    loadStatistics();
    showAdminNotification(`Добро пожаловать, ${adminData.login}!`, 'success');
    
    // Обновление времени в реальном времени
    function updateServerTime() {
        const now = new Date();
        const timeString = now.toLocaleTimeString('ru-RU');
        const dateString = now.toLocaleDateString('ru-RU');
        
        const timeElement = document.querySelector('.admin-main-footer p');
        if (timeElement) {
            timeElement.innerHTML = timeElement.innerHTML.replace(
                /© 2024 Leo Assistant.*/,
                `© 2024 Leo Assistant | Панель управления | ${dateString} ${timeString} | Online: 27 users`
            );
        }
    }
    
    setInterval(updateServerTime, 1000);
    updateServerTime();
});
