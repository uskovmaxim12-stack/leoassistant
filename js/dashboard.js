// JavaScript для панели управления
document.addEventListener('DOMContentLoaded', function() {
    console.log('Dashboard загружен!');
    
    // КЛЮЧЕВАЯ ПРОВЕРКА: Если пользователь не авторизован - на страницу входа
    const userData = JSON.parse(localStorage.getItem('leoUser'));
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    
    if (!isLoggedIn || !userData) {
        console.warn('Попытка доступа без авторизации. Редирект на вход.');
        showNotification('Требуется авторизация', 'error');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);
        return; // ВАЖНО: прекращаем выполнение скрипта
    }
    
    console.log('Пользователь авторизован:', userData.name);
    
    // Скрываем загрузочный экран (если есть)
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
        setTimeout(() => {
            loadingScreen.style.display = 'none';
        }, 500);
    }
    
    // Обновляем данные пользователя в интерфейсе
    updateUserData(userData);
    
    // Навигация
    const navItems = document.querySelectorAll('.nav-item');
    const pages = document.querySelectorAll('.page');
    
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            const pageId = this.getAttribute('data-page');
            
            // Обновляем активный элемент навигации
            navItems.forEach(nav => nav.classList.remove('active'));
            this.classList.add('active');
            
            // Показываем выбранную страницу
            pages.forEach(page => {
                page.classList.remove('active');
                if (page.id === `${pageId}-page`) {
                    page.classList.add('active');
                }
            });
            
            showNotification(`Переключено на: ${this.querySelector('span').textContent}`);
        });
    });
    
    // Выход из системы
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            // Очищаем ВСЕ данные сессии
            localStorage.removeItem('leoUser');
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('userXP');
            localStorage.removeItem('userLevel');
            localStorage.removeItem('flightPoints');
            
            showNotification('Вы вышли из системы', 'success');
            
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 800);
        });
    }
    
    // Инициализация функционала дашборда
    initDashboardFeatures(userData);
    
    // Функция обновления данных пользователя в интерфейсе
    function updateUserData(user) {
        // Основная информация
        const userNameElement = document.getElementById('user-name');
        const userClassElement = document.getElementById('user-class');
        const welcomeNameElement = document.getElementById('welcome-name');
        
        if (userNameElement) userNameElement.textContent = user.name || 'Ученик';
        if (userClassElement) userClassElement.textContent = `${user.class || '7Б'} класс`;
        if (welcomeNameElement) welcomeNameElement.textContent = user.name?.split(' ')[0] || 'Ученик';
        
        // Система прогресса (очки, уровни)
        let userXP = parseInt(localStorage.getItem('userXP') || '250');
        let userLevel = parseInt(localStorage.getItem('userLevel') || '1');
        let flightPoints = parseInt(localStorage.getItem('flightPoints') || '1250');
        
        // Обновляем элементы интерфейса
        const levelElement = document.getElementById('user-level');
        const xpCurrentElement = document.getElementById('xp-current');
        const xpMaxElement = document.getElementById('xp-max');
        const xpFillElement = document.getElementById('xp-fill');
        const flightPointsElement = document.getElementById('flight-points');
        
        if (levelElement) levelElement.textContent = userLevel;
        if (xpCurrentElement) xpCurrentElement.textContent = userXP;
        if (xpMaxElement) xpMaxElement.textContent = (userLevel * 500);
        if (xpFillElement) xpFillElement.style.width = `${(userXP / (userLevel * 500)) * 100}%`;
        if (flightPointsElement) flightPointsElement.textContent = flightPoints.toLocaleString();
    }
    
    // Функция инициализации виджетов
    function initDashboardFeatures(user) {
        console.log('Инициализация функций дашборда для:', user.name);
        
        // AI помощник
        const aiInput = document.getElementById('ai-question');
        const askButton = document.getElementById('ask-ai');
        
        if (aiInput && askButton) {
            askButton.addEventListener('click', function() {
                const question = aiInput.value.trim();
                if (question) {
                    handleAIQuestion(question, askButton, aiInput);
                }
            });
            
            aiInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    const question = this.value.trim();
                    if (question) {
                        handleAIQuestion(question, askButton, aiInput);
                    }
                }
            });
        }
        
        // Быстрые вопросы к AI
        document.querySelectorAll('.quick-question').forEach(button => {
            button.addEventListener('click', function() {
                const question = this.textContent;
                if (aiInput) aiInput.value = question;
                if (question && askButton) {
                    handleAIQuestion(question, askButton, aiInput);
                }
            });
        });
        
        // Глобальный поиск
        const searchInput = document.getElementById('global-search');
        if (searchInput) {
            searchInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    const query = this.value.trim();
                    if (query) {
                        showNotification(`Поиск: "${query}" (функция в разработке)`, 'info');
                    }
                }
            });
        }
    }
    
    // Обработка вопросов к AI
    function handleAIQuestion(question, askButton, aiInput) {
        const originalText = askButton.innerHTML;
        askButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        askButton.disabled = true;
        
        // Имитация обработки AI
        setTimeout(() => {
            const answer = getAIResponse(question);
            
            showNotification(`AI: ${answer.substring(0, 50)}...`, 'success');
            
            // Добавляем XP за использование AI
            addXP(10);
            
            // Восстанавливаем кнопку
            askButton.innerHTML = originalText;
            askButton.disabled = false;
            if (aiInput) aiInput.value = '';
            
        }, 1200);
    }
    
    // База знаний AI
    function getAIResponse(question) {
        const knowledgeBase = {
            'математика': 'Для успешного изучения математики важно понимать основы. Начни с повторения формул и решения примеров.',
            'физика': 'Физика объясняет законы природы. Попробуй провести простые эксперименты для лучшего понимания.',
            'русский язык': 'Грамотность развивается через чтение и практику. Регулярно выполняй упражнения на орфографию.',
            'помоги': 'Я готов помочь! Уточни, с каким предметом или заданием у тебя трудности.',
            'привет': 'Привет! Рад тебя видеть. Как продвигается учёба?',
            'спасибо': 'Всегда пожалуйста! Обращайся, если понадобится помощь.'
        };
        
        const lowerQuestion = question.toLowerCase();
        
        for (const [key, answer] of Object.entries(knowledgeBase)) {
            if (lowerQuestion.includes(key)) {
                return answer;
            }
        }
        
        return 'Это интересный вопрос! Давай разберём его вместе на следующем уроке.';
    }
    
    // Система XP и очков
    function addXP(amount) {
        let userXP = parseInt(localStorage.getItem('userXP') || '250');
        let userLevel = parseInt(localStorage.getItem('userLevel') || '1');
        
        userXP += amount;
        
        // Проверка уровня
        const xpForNextLevel = userLevel * 500;
        if (userXP >= xpForNextLevel) {
            userXP -= xpForNextLevel;
            userLevel++;
            showNotification(`🎉 Поздравляем! Вы достигли ${userLevel} уровня!`, 'success');
        }
        
        localStorage.setItem('userXP', userXP.toString());
        localStorage.setItem('userLevel', userLevel.toString());
        
        // Добавляем очки полёта
        addFlightPoints(amount * 2);
        
        // Обновляем интерфейс
        updateUserData(userData);
    }
    
    function addFlightPoints(amount) {
        let flightPoints = parseInt(localStorage.getItem('flightPoints') || '1250');
        flightPoints += amount;
        localStorage.setItem('flightPoints', flightPoints.toString());
        
        // Обновляем интерфейс
        const flightPointsElement = document.getElementById('flight-points');
        if (flightPointsElement) {
            flightPointsElement.textContent = flightPoints.toLocaleString();
        }
    }
    
    // Функция уведомлений (для dashboard)
    function showNotification(message, type = 'info') {
        const notification = document.getElementById('notification');
        if (!notification) return;
        
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
        }, 3000);
    }
});
