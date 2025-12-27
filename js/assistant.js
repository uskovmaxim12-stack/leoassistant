// js/assistant.js - ЧАТ С АССИСТЕНТОМ
document.addEventListener('DOMContentLoaded', function() {
    const chatInput = document.getElementById('chatInput');
    const sendBtn = document.getElementById('sendBtn');
    const chatMessages = document.getElementById('chatMessages');
    
    if (!chatInput || !sendBtn) return;
    
    // Загрузка истории чата
    loadChatHistory();
    
    // Отправка сообщения
    sendBtn.addEventListener('click', sendMessage);
    chatInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') sendMessage();
    });
    
    function sendMessage() {
        const message = chatInput.value.trim();
        if (!message) return;
        
        // Добавляем сообщение пользователя
        addMessage(message, 'user');
        chatInput.value = '';
        
        // Показываем индикатор "печатает"
        showTypingIndicator();
        
        // Получаем ответ от нейросети
        setTimeout(() => {
            removeTypingIndicator();
            const response = window.LeoAI.processQuestion(message);
            addMessage(response, 'assistant');
            
            // Добавляем очки
            if (window.GameSystem) {
                window.GameSystem.addPoints(10, 'Разговор с Лео');
            }
            
            // Сохраняем историю
            saveChatHistory();
        }, 1000 + Math.random() * 1000);
    }
    
    function addMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${sender}`;
        
        const time = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        
        messageDiv.innerHTML = `
            <div class="message-content">
                <div class="message-text">${text}</div>
                <div class="message-time">${time}</div>
            </div>
        `;
        
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    function showTypingIndicator() {
        const typingDiv = document.createElement('div');
        typingDiv.className = 'chat-message assistant typing';
        typingDiv.id = 'typingIndicator';
        typingDiv.innerHTML = `
            <div class="message-content">
                <div class="typing-dots">
                    <span></span><span></span><span></span>
                </div>
            </div>
        `;
        chatMessages.appendChild(typingDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    function removeTypingIndicator() {
        const indicator = document.getElementById('typingIndicator');
        if (indicator) indicator.remove();
    }
    
    function saveChatHistory() {
        const messages = Array.from(chatMessages.children)
            .filter(el => el.classList.contains('chat-message') && !el.classList.contains('typing'))
            .map(el => ({
                text: el.querySelector('.message-text').textContent,
                sender: el.classList.contains('user') ? 'user' : 'assistant',
                time: el.querySelector('.message-time').textContent
            }));
        
        localStorage.setItem('leoChatHistory', JSON.stringify(messages.slice(-50)));
    }
    
    function loadChatHistory() {
        const history = JSON.parse(localStorage.getItem('leoChatHistory') || '[]');
        chatMessages.innerHTML = '';
        
        history.forEach(msg => {
            addMessage(msg.text, msg.sender);
        });
    }
});
