// js/main.js - ДОБАВЬ ЭТОТ КОД

// Активация кнопок входа
document.addEventListener('DOMContentLoaded', function() {
    // Кнопка "Старт обучения"
    const startBtn = document.querySelector('.start-btn');
    if (startBtn) {
        startBtn.addEventListener('click', function() {
            window.location.href = 'dashboard.html';
        });
    }
    
    // Кнопки выбора роли
    document.querySelectorAll('.role-card').forEach(card => {
        card.addEventListener('click', function() {
            const role = this.getAttribute('data-role');
            localStorage.setItem('userRole', role);
            window.location.href = 'dashboard.html';
        });
    });
    
    // Форма входа
    const loginForm = document.querySelector('.login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const username = this.querySelector('input[type="text"]').value;
            const password = this.querySelector('input[type="password"]').value;
            
            if (username && password) {
                localStorage.setItem('isLoggedIn', 'true');
                localStorage.setItem('username', username);
                window.location.href = 'dashboard.html';
            }
        });
    }
});
