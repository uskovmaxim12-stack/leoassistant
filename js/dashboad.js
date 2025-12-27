// js/dashboard.js - ОБНОВЛЕНИЕ ИГРОВОЙ СТАТИСТИКИ НА DASHBOARD

document.addEventListener('DOMContentLoaded', function() {
    // Загружаем игровую систему
    const game = window.GameSystem;
    
    // Обновляем статистику
    updateGameStats();
    
    // Проверяем ежедневный вход
    const streak = game.checkDailyLogin();
    if (streak > 1) {
        game.createNotification(`🔥 Серия: ${streak} дней подряд!`, 'info');
    }
    
    // Загружаем достижения
    loadAchievements();
    
    // Активация кнопок
    activateDashboardButtons();
});

function updateGameStats() {
    const game = window.GameSystem;
    const stats = game.getStats();
    
    // Обновляем DOM элементы
    const pointsEl = document.getElementById('userPoints');
    const levelEl = document.getElementById('userLevel');
    
    if (pointsEl) pointsEl.textContent = stats.points;
    if (levelEl) levelEl.textContent = stats.level;
    
    // Обновляем прогресс-бар уровня
    updateLevelProgress(stats);
}

function updateLevelProgress(stats) {
    const progressBar = document.querySelector('.level-progress');
    if (progressBar) {
        const percent = Math.min(100, (stats.points % 1000) / 10);
        progressBar.style.width = `${percent}%`;
        progressBar.textContent = `${stats.points % 1000}/1000`;
    }
}

function loadAchievements() {
    const game = window.GameSystem;
    const container = document.getElementById('achievementsList');
    
    if (!container) return;
    
    const achievements = game.achievements.slice(0, 3); // Показываем 3 последних
    
    container.innerHTML = achievements.map(ach => `
        <div class="achievement-badge">
            <span class="achievement-icon">${ach.icon}</span>
            <div class="achievement-info">
                <strong>${ach.name}</strong>
                <small>${ach.date}</small>
            </div>
        </div>
    `).join('');
}

function activateDashboardButtons() {
    // Кнопка "Получить очки"
    const getPointsBtn = document.querySelector('.get-points-btn');
    if (getPointsBtn) {
        getPointsBtn.addEventListener('click', function() {
            const game = window.GameSystem;
            game.addPoints(50, 'Активность на дашборде');
            updateGameStats();
        });
    }
    
    // Кнопки навигации
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', function() {
            const page = this.getAttribute('data-page');
            if (page) {
                window.location.href = page;
            }
        });
    });
}

// Экспорт для использования в других файлах
window.updateGameStats = updateGameStats;
