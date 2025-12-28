// Функционал, которого НЕТ в вашем файле:

// 1. Система достижений
const achievements = [
    { id: 1, icon: "🏆", title: "Первое задание", earned: true },
    { id: 2, icon: "🚀", title: "Неделя активности", earned: true },
    { id: 3, icon: "📚", title: "5 выполненных ДЗ", earned: false },
    { id: 4, icon: "💬", title: "10 сообщений Лео", earned: true },
    { id: 5, icon: "⭐", title: "Отличник", earned: false },
    { id: 6, icon: "👑", title: "Лидер класса", earned: false }
];

// 2. Игровая статистика
const gameStats = {
    level: 7,
    points: 1245,
    streak: 14,
    rank: 3
};

// 3. Инициализация прогресс-баров
function initProgressBars() {
    const skills = [
        { name: "Математика", progress: 85 },
        { name: "Русский язык", progress: 72 },
        { name: "Биология", progress: 63 },
        { name: "Английский", progress: 91 }
    ];
    
    skills.forEach(skill => {
        const bar = document.querySelector(`.${skill.name.toLowerCase().replace(' ', '-')}-progress`);
        if (bar) {
            bar.style.width = `${skill.progress}%`;
        }
    });
}

// 4. Обновление игровых карточек
function updateGameStats() {
    document.querySelectorAll('.game-stat-card').forEach(card => {
        const type = card.dataset.stat;
        if (type === 'level') card.querySelector('.stat-main').textContent = gameStats.level;
        if (type === 'points') card.querySelector('.stat-main').textContent = gameStats.points;
        if (type === 'streak') card.querySelector('.stat-main').textContent = gameStats.streak + ' дней';
        if (type === 'rank') card.querySelector('.stat-main').textContent = '#' + gameStats.rank;
    });
}

// 5. Отправка сообщения в AI-чат (исправленная версия)
function sendMessageToAI() {
    const input = document.getElementById('ai-chat-input');
    const messages = document.getElementById('ai-chat-messages');
    
    if (!input || !messages) return;
    
    const message = input.value.trim();
    if (!message) return;
    
    // Добавляем сообщение пользователя
    const userMsg = document.createElement('div');
    userMsg.className = 'message user';
    userMsg.innerHTML = `<div class="message-content">${message}</div>`;
    messages.appendChild(userMsg);
    
    input.value = '';
    
    // Прокрутка вниз
    messages.scrollTop = messages.scrollHeight;
    
    // Имитация ответа AI
    setTimeout(() => {
        const responses = [
            "Отличный вопрос! Сейчас подумаю...",
            "По моим данным, это связано с...",
            "Давай я помогу тебе с этим!",
            "Интересно! Хочешь узнать подробнее?",
            "Я добавил это в твои учебные материалы."
        ];
        
        const botMsg = document.createElement('div');
        botMsg.className = 'message bot';
        botMsg.innerHTML = `
            <div class="message-sender">Лео</div>
            <div class="message-content">${responses[Math.floor(Math.random() * responses.length)]}</div>
        `;
        messages.appendChild(botMsg);
        
        messages.scrollTop = messages.scrollHeight;
    }, 1000);
}

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', function() {
    console.log('Dashboard улучшения загружены');
    
    // Только то, чего нет в вашем коде
    initProgressBars();
    updateGameStats();
    
    // Обработчик для чата
    const sendBtn = document.getElementById('ai-send-btn');
    const chatInput = document.getElementById('ai-chat-input');
    
    if (sendBtn) {
        sendBtn.addEventListener('click', sendMessageToAI);
    }
    
    if (chatInput) {
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') sendMessageToAI();
        });
    }
});
