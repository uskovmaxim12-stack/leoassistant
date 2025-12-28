// =============================
// DASHBOARD WITH AI INTEGRATION
// =============================

// Инициализация нейросети
let leoAI = null;

document.addEventListener('DOMContentLoaded', function() {
    console.log('📊 Панель управления загружается...');
    
    // Проверка авторизации
    const userData = JSON.parse(localStorage.getItem('leoUser'));
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    
    if (!isLoggedIn || !userData) {
        showNotification('Сначала войди в систему! 🚀', 'error');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);
        return;
    }
    
    // Инициализация нейросети
    if (typeof LeoAI !== 'undefined') {
        leoAI = LeoAI;
        console.log('🧠 Нейросеть подключена:', leoAI.getStats());
        
        // Обновляем статистику AI на дашборде
        updateAIStats();
    } else {
        console.warn('⚠️ Нейросеть не загружена. Загружаем базовую версию...');
        loadFallbackAI();
    }
    
    // Остальной код дашборда...
    // [Ваш существующий код остается здесь]
    
    // ================= AI ИНТЕГРАЦИЯ =================
    
    // Обработчик вопросов к AI
    document.getElementById('ask-ai')?.addEventListener('click', handleAIQuestion);
    document.getElementById('ai-question')?.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') handleAIQuestion();
    });
    
    // Быстрые вопросы
    document.querySelectorAll('.quick-question').forEach(btn => {
        btn.addEventListener('click', function() {
            const question = this.textContent;
            document.getElementById('ai-question').value = question;
            handleAIQuestion();
        });
    });
    
    // Кнопка обучения AI
    document.getElementById('train-ai-btn')?.addEventListener('click', function() {
        trainAIWithNewData();
    });
});

// ================= AI ФУНКЦИИ =================

// Обработка вопроса
function handleAIQuestion() {
    const questionInput = document.getElementById('ai-question');
    const askButton = document.getElementById('ask-ai');
    const question = questionInput.value.trim();
    
    if (!question) {
        showNotification('Введите вопрос для AI! 🤖', 'warning');
        return;
    }
    
    // Показываем загрузку
    const originalText = askButton.innerHTML;
    askButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    askButton.disabled = true;
    
    // Имитация "мышления" AI
    showTypingIndicator();
    
    setTimeout(() => {
        // Получаем ответ от нейросети
        let answer;
        
        if (leoAI) {
            answer = leoAI.getResponse(question);
            
            // Добавляем очки за использование AI
            addXP(15);
            addFlightPoints(30);
            
            // Обновляем статистику
            updateAIStats();
        } else {
            answer = fallbackAIResponse(question);
        }
        
        // Показываем ответ
        displayAIResponse(question, answer);
        
        // Очищаем поле и восстанавливаем кнопку
        questionInput.value = '';
        askButton.innerHTML = originalText;
        askButton.disabled = false;
        hideTypingIndicator();
        
        // Показываем уведомление
        showNotification('AI ответил на твой вопрос! 🧠', 'success');
        
    }, 1000 + Math.random() * 1000); // Случайная задержка 1-2 секунды
}

// Показать индикатор набора текста
function showTypingIndicator() {
    const aiChat = document.querySelector('.ai-chat-container') || createAIChatContainer();
    const typingIndicator = document.createElement('div');
    typingIndicator.className = 'typing-indicator';
    typingIndicator.innerHTML = `
        <div class="typing-dots">
            <span></span>
            <span></span>
            <span></span>
        </div>
        <span class="typing-text">Leo думает...</span>
    `;
    aiChat.appendChild(typingIndicator);
    aiChat.scrollTop = aiChat.scrollHeight;
}

// Скрыть индикатор
function hideTypingIndicator() {
    const typingIndicator = document.querySelector('.typing-indicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
}

// Показать ответ AI
function displayAIResponse(question, answer) {
    const aiChat = document.querySelector('.ai-chat-container') || createAIChatContainer();
    
    // Сообщение пользователя
    const userMessage = document.createElement('div');
    userMessage.className = 'chat-message user-message';
    userMessage.innerHTML = `
        <div class="message-avatar">
            <i class="fas fa-user"></i>
        </div>
        <div class="message-content">
            <div class="message-text">${question}</div>
            <div class="message-time">${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
        </div>
    `;
    
    // Сообщение AI
    const aiMessage = document.createElement('div');
    aiMessage.className = 'chat-message ai-message';
    aiMessage.innerHTML = `
        <div class="message-avatar">
            <i class="fas fa-brain"></i>
        </div>
        <div class="message-content">
            <div class="message-text">${answer}</div>
            <div class="message-actions">
                <button class="message-action" onclick="copyToClipboard('${answer.replace(/'/g, "\\'")}')">
                    <i class="fas fa-copy"></i> Копировать
                </button>
                <button class="message-action" onclick="saveAsNote('${question.replace(/'/g, "\\'")}', '${answer.replace(/'/g, "\\'")}')">
                    <i class="fas fa-save"></i> Сохранить
                </button>
                <button class="message-action" onclick="rateResponse('${question.replace(/'/g, "\\'")}', true)">
                    <i class="fas fa-thumbs-up"></i> Полезно
                </button>
            </div>
            <div class="message-time">${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
        </div>
    `;
    
    aiChat.appendChild(userMessage);
    aiChat.appendChild(aiMessage);
    aiChat.scrollTop = aiChat.scrollHeight;
}

// Создать контейнер для чата
function createAIChatContainer() {
    const aiWidget = document.querySelector('.ai-widget');
    if (!aiWidget) return null;
    
    const chatContainer = document.createElement('div');
    chatContainer.className = 'ai-chat-container';
    chatContainer.style.cssText = `
        height: 300px;
        overflow-y: auto;
        padding: 15px;
        background: rgba(255,255,255,0.05);
        border-radius: 15px;
        margin-bottom: 15px;
        display: flex;
        flex-direction: column;
        gap: 15px;
    `;
    
    aiWidget.querySelector('.widget-body').insertBefore(chatContainer, aiWidget.querySelector('.ai-input'));
    return chatContainer;
}

// Обновить статистику AI
function updateAIStats() {
    if (!leoAI) return;
    
    const stats = leoAI.getStats();
    const statsElement = document.getElementById('ai-stats');
    
    if (statsElement) {
        statsElement.innerHTML = `
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                <span>Знаний в базе:</span>
                <span style="color: var(--primary); font-weight: bold;">${stats.totalKeywords}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                <span>Точность:</span>
                <span style="color: var(--primary); font-weight: bold;">${(stats.accuracy * 100).toFixed(1)}%</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
                <span>Обучен на:</span>
                <span style="color: var(--primary); font-weight: bold;">${stats.learnedPhrases} фразах</span>
            </div>
        `;
    }
}

// Обучение AI новыми данными
function trainAIWithNewData() {
    if (!leoAI) return;
    
    const trainingData = [
        { category: 'математика', keyword: 'квадратное уравнение', answer: 'Квадратное уравнение: ax² + bx + c = 0. Решается через дискриминант: D = b² - 4ac.' },
        { category: 'физика', keyword: 'скорость света', answer: 'Скорость света в вакууме: 299 792 458 м/с. Это максимальная скорость во Вселенной.' },
        { category: 'русский язык', keyword: 'причастие', answer: 'Причастие — часть речи, обозначающая признак предмета по действию. Отвечает на вопросы: какой? что делающий? что сделавший?' },
        { category: 'английский язык', keyword: 'present perfect', answer: 'Present Perfect используется для действий, которые завершились к настоящему моменту или имеют результат в настоящем.' },
        { category: 'биология', keyword: 'фотосинтез', answer: 'Фотосинтез — процесс превращения растениями углекислого газа и воды в глюкозу и кислород под действием света.' }
    ];
    
    let trainedCount = 0;
    
    trainingData.forEach(data => {
        if (leoAI.addKnowledge(data.category, data.keyword, data.answer)) {
            trainedCount++;
        }
    });
    
    showNotification(`AI обучен на ${trainedCount} новых примерах! 📚`, 'success');
    updateAIStats();
    
    // Анимация обучения
    const aiAvatar = document.querySelector('.ai-avatar');
    if (aiAvatar) {
        aiAvatar.style.animation = 'pulse 0.5s 3';
        setTimeout(() => {
            aiAvatar.style.animation = '';
        }, 1500);
    }
}

// Резервный AI (если основная нейросеть не загрузилась)
function loadFallbackAI() {
    console.log('Загружаем резервный AI...');
    
    leoAI = {
        getResponse: function(question) {
            const responses = [
                'Я думаю над твоим вопросом... На самом деле это интересная тема!',
                'Хм, хороший вопрос. Давай разберем его вместе.',
                'Я пока учусь, но попробую помочь. Проверь учебник по этой теме.',
                'Отличный вопрос! Рекомендую обсудить его на уроке с учителем.',
                'Моя нейросеть еще обучается, но я знаю, что это важно для учебы.',
                'Попробуй сформулировать вопрос по-другому, и я постараюсь помочь.'
            ];
            return responses[Math.floor(Math.random() * responses.length)];
        },
        getStats: function() {
            return {
                totalKeywords: 156,
                accuracy: 0.78,
                learnedPhrases: 156
            };
        }
    };
}

function fallbackAIResponse(question) {
    return leoAI ? leoAI.getResponse(question) : 'AI временно недоступен. Попробуйте позже.';
}

// ================= ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ =================

// Копировать в буфер обмена
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showNotification('Ответ скопирован! 📋', 'success');
    }).catch(() => {
        // Fallback для старых браузеров
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        showNotification('Ответ скопирован! 📋', 'success');
    });
}

// Сохранить как заметку
function saveAsNote(question, answer) {
    const notes = JSON.parse(localStorage.getItem('leoNotes') || '[]');
    notes.push({
        question: question,
        answer: answer,
        subject: detectSubject(question),
        date: new Date().toISOString()
    });
    
    localStorage.setItem('leoNotes', JSON.stringify(notes.slice(-100))); // Храним 100 последних
    
    showNotification('Ответ сохранен в заметки! 📝', 'success');
}

// Оценить ответ
function rateResponse(question, isHelpful) {
    const ratings = JSON.parse(localStorage.getItem('aiRatings') || '[]');
    ratings.push({
        question: question,
        helpful: isHelpful,
        date: new Date().toISOString()
    });
    
    localStorage.setItem('aiRatings', JSON.stringify(ratings.slice(-500)));
    
    if (isHelpful) {
        showNotification('Спасибо за оценку! 👍', 'success');
        addXP(5);
    } else {
        showNotification('Спасибо за обратную связь! Постараюсь стать лучше. 💪', 'info');
    }
}

// Определить предмет по вопросу
function detectSubject(question) {
    const subjects = {
        'математика': ['математик', 'уравн', 'числ', 'алгебр', 'геометр'],
        'физика': ['физик', 'сил', 'энерг', 'свет', 'электрич'],
        'русский': ['русск', 'язык', 'орфограф', 'пунктуац', 'грамматик'],
        'английский': ['английск', 'english', 'глагол', 'времен'],
        'биология': ['биолог', 'клетк', 'растен', 'животн']
    };
    
    const lowerQuestion = question.toLowerCase();
    
    for (const [subject, keywords] of Object.entries(subjects)) {
        if (keywords.some(keyword => lowerQuestion.includes(keyword))) {
            return subject;
        }
    }
    
    return 'общее';
}

// Добавить опыт
function addXP(amount) {
    let userData = JSON.parse(localStorage.getItem('leoUser'));
    if (!userData) return;
    
    userData.xp = (userData.xp || 0) + amount;
    
    // Проверка на новый уровень
    const xpForNextLevel = userData.level * 500;
    if (userData.xp >= xpForNextLevel) {
        userData.xp -= xpForNextLevel;
        userData.level++;
        showNotification(`🎉 Поздравляем! Вы достигли ${userData.level} уровня!`, 'success');
        
        // Анимация нового уровня
        const levelUp = document.createElement('div');
        levelUp.className = 'level-up-animation';
        levelUp.innerHTML = `
            <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,255,136,0.3); z-index: 9998;"></div>
            <div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: linear-gradient(135deg, #00ff88, #00ccff); color: #0f0c29; padding: 40px; border-radius: 20px; z-index: 9999; text-align: center; animation: pulse 0.5s 3;">
                <h2 style="font-size: 3rem; margin-bottom: 20px;">🎮 УРОВЕНЬ ${userData.level}!</h2>
                <p style="font-size: 1.5rem;">+50 очков полёта в подарок!</p>
            </div>
        `;
        document.body.appendChild(levelUp);
        
        setTimeout(() => {
            levelUp.remove();
        }, 3000);
        
        userData.flightPoints += 50;
    }
    
    localStorage.setItem('leoUser', JSON.stringify(userData));
    updateUserInterface();
}

// Добавить очки полёта
function addFlightPoints(amount) {
    let userData = JSON.parse(localStorage.getItem('leoUser'));
    if (!userData) return;
    
    userData.flightPoints = (userData.flightPoints || 0) + amount;
    localStorage.setItem('leoUser', JSON.stringify(userData));
    updateUserInterface();
}

// Обновить интерфейс пользователя
function updateUserInterface() {
    const userData = JSON.parse(localStorage.getItem('leoUser'));
    if (!userData) return;
    
    // Обновляем элементы интерфейса
    const levelElement = document.getElementById('user-level');
    const xpElement = document.getElementById('xp-current');
    const xpMaxElement = document.getElementById('xp-max');
    const xpFillElement = document.getElementById('xp-fill');
    const flightPointsElement = document.getElementById('flight-points');
    
    if (levelElement) levelElement.textContent = userData.level || 1;
    if (xpElement) xpElement.textContent = userData.xp || 0;
    if (xpMaxElement) xpMaxElement.textContent = (userData.level || 1) * 500;
    if (xpFillElement) {
        const xpPercent = ((userData.xp || 0) / ((userData.level || 1) * 500)) * 100;
        xpFillElement.style.width = `${Math.min(xpPercent, 100)}%`;
    }
    if (flightPointsElement) {
        flightPointsElement.textContent = (userData.flightPoints || 0).toLocaleString();
    }
}

// Функция уведомлений (убедитесь, что она есть)
function showNotification(message, type = 'info') {
    const notification = document.getElementById('notification') || createNotificationElement();
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
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 4000);
}

function createNotificationElement() {
    const notification = document.createElement('div');
    notification.id = 'notification';
    notification.className = 'notification';
    notification.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <span>Сообщение</span>
    `;
    document.body.appendChild(notification);
    return notification;
}
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
