// js/neural-network.js - ВСТРОЕННАЯ НЕЙРОСЕТЬ ДЛЯ LEO

class LeoNeuralNetwork {
    constructor() {
        this.knowledgeBase = this.loadBaseKnowledge();
        this.conversationHistory = [];
        this.userPreferences = {};
    }
    
    loadBaseKnowledge() {
        return [
            {
                question: "привет",
                answer: "Привет! Я Лео, твой умный помощник в учебе! Как дела?",
                tags: ["приветствие"]
            },
            {
                question: "как дела",
                answer: "У меня отлично! Готов помогать тебе с учебой!",
                tags: ["разговор"]
            },
            {
                question: "помоги с математикой",
                answer: "Конечно! Я помогу с математикой. Какую тему проходите?",
                tags: ["математика", "помощь"]
            },
            {
                question: "что такое уравнение",
                answer: "Уравнение — это равенство с переменной. Например: 2x + 3 = 11",
                tags: ["математика", "определение"]
            },
            // Добавь больше базовых знаний
        ];
    }
    
    async processQuestion(question) {
        // 1. Ищем в базе знаний
        const found = this.searchInKnowledge(question);
        if (found) {
            this.learnFromInteraction(question, found.answer);
            return found.answer;
        }
        
        // 2. Если не нашли, генерируем ответ
        return this.generateResponse(question);
    }
    
    searchInKnowledge(question) {
        const q = question.toLowerCase();
        
        // Простой поиск по ключевым словам
        for (const item of this.knowledgeBase) {
            if (q.includes(item.question.toLowerCase())) {
                return item;
            }
            
            // Проверяем по тегам
            for (const tag of item.tags) {
                if (q.includes(tag)) {
                    return item;
                }
            }
        }
        
        return null;
    }
    
    generateResponse(question) {
        const responses = [
            "Интересный вопрос! Давай разберем его вместе.",
            "Хм, мне нужно подумать... А что именно тебя интересует?",
            "Я еще учусь, но постараюсь помочь!",
            "Это хороший вопрос для обсуждения с учителем!",
            "Давай поищем ответ вместе в учебнике?"
        ];
        
        // Возвращаем случайный ответ
        return responses[Math.floor(Math.random() * responses.length)];
    }
    
    learnFromInteraction(question, answer) {
        // Сохраняем в историю
        this.conversationHistory.push({
            question,
            answer,
            timestamp: new Date().toISOString()
        });
        
        // Ограничиваем историю 100 сообщениями
        if (this.conversationHistory.length > 100) {
            this.conversationHistory.shift();
        }
        
        // Периодически обновляем знания
        if (this.conversationHistory.length % 10 === 0) {
            this.updateKnowledgeBase();
        }
    }
    
    updateKnowledgeBase() {
        // Здесь можно добавить логику самообучения
        console.log("Нейросеть обновляет знания...");
    }
    
    exportKnowledge() {
        return {
            knowledgeBase: this.knowledgeBase,
            conversationHistory: this.conversationHistory,
            userPreferences: this.userPreferences
        };
    }
    
    importKnowledge(data) {
        if (data.knowledgeBase) {
            this.knowledgeBase = [...this.knowledgeBase, ...data.knowledgeBase];
        }
    }
}

// Экспорт глобального инстанса
window.LeoAI = new LeoNeuralNetwork();
