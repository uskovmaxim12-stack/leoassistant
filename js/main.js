// Leo Assistant - Минималистичная логика входа
console.log('🎯 Leo Assistant готов к работе!');

// Частицы уже инициализированы в index.html
// Все обработчики событий уже встроены в HTML

// Дополнительные функции для дашборда
if (window.location.pathname.includes('dashboard.html')) {
    console.log('📊 Загружаем панель управления...');
    
    // Проверяем авторизацию
    const userData = JSON.parse(localStorage.getItem('leoUser'));
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    
    if (!isLoggedIn || !userData) {
        alert('Сначала войди в систему! 🚀');
        window.location.href = 'index.html';
    }
}
