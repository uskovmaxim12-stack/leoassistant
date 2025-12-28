// =============================
// LEO NEURAL NETWORK v2.0
// Самообучаемая нейросеть для образовательного ассистента
// =============================

class LeoNeuralNetwork {
    constructor() {
        // База знаний (ядро нейросети)
        this.knowledgeBase = {
            'математика': {
                'уравнение': 'Уравнение — это равенство с переменной. Решить уравнение — найти значение переменной.',
                'алгебра': 'Алгебра изучает операции над числами и переменными. Основные темы: уравнения, функции, системы.',
                'геометрия': 'Геометрия изучает пространственные фигуры. Важные формулы: площадь, периметр, объем.',
                'дроби': 'Дробь — часть целого. Сложение дробей: общий знаменатель.',
                'проценты': 'Процент — сотая часть числа. 1% = 1/100.',
                'степень': 'Степень показывает, сколько раз число умножается само на себя: aⁿ = a × a × ... × a (n раз).'
            },
            'физика': {
                'закон ньютона': 'Первый: тело сохраняет движение, если нет сил. Второй: F=ma. Третий: действие равно противодействию.',
                'электричество': 'Электрический ток — движение зарядов. Закон Ома: I = U/R.',
                'оптика': 'Оптика изучает свет. Закон отражения: угол падения равен углу отражения.',
                'механика': 'Механика изучает движение. Скорость: v = s/t.',
                'энергия': 'Энергия не создается и не уничтожается, а превращается из одного вида в другой.'
            },
            'русский язык': {
                'орфография': 'Проверяй безударные гласные, непроизносимые согласные, правописание приставок.',
                'пунктуация': 'Запятые ставятся между однородными членами, в сложных предложениях, при обращениях.',
                'сочинение': 'План: введение (тезис), основная часть (аргументы), заключение (вывод).',
                'грамматика': 'Изучает строение слов и предложений. Части речи: существительное, глагол, прилагательное...',
                'синтаксис': 'Раздел грамматики, изучающий строение предложений.'
            },
            'английский язык': {
                'времена': 'Present Simple: регулярные действия. Past Simple: завершенные действия в прошлом.',
                'глаголы': 'To be: am/is/are/was/were. To have: have/has/had.',
                'лексика': 'Учи слова по темам: семья, школа, хобби, путешествия.',
                'грамматика': 'Артикли: a/an — неопределенные, the — определенный.'
            },
            'биология': {
                'клетка': 'Клетка — основная единица жизни. Состоит из ядра, цитоплазмы, мембраны.',
                'растения': 'Растения производят кислород через фотосинтез.',
                'животные': 'Классификация: млекопитающие, птицы, рыбы, рептилии, амфибии.',
                'человек': 'Системы организма: пищеварительная, дыхательная, кровеносная, нервная.'
            },
            'история': {
                'древний мир': 'Первые цивилизации: Месопотамия, Египет, Китай, Индия.',
                'средневековье': 'Период с V по XV век. Рыцари, замки, феодализм.',
                'новая история': 'Великие географические открытия, Возрождение, Просвещение.',
                'россия': 'Киевская Русь, Московское царство, Российская империя, СССР, РФ.'
            },
            'общее': {
                'привет': 'Привет! Я Leo Assistant, твой AI-помощник в учебе. Чем могу помочь?',
                'как дела': 'У меня всё отлично! Готов помогать тебе с учебой. Как твои успехи?',
                'помоги': 'Конечно! Расскажи, с каким предметом или заданием у тебя трудности.',
                'спасибо': 'Всегда пожалуйста! Обращайся, если будут ещё вопросы.',
                'что ты умеешь': 'Я могу: объяснять темы, помогать с заданиями, проверять знания, играть в обучающие игры!',
                'кто ты': 'Я — Leo Assistant, искусственный интеллект, созданный помогать ученикам 7Б класса в учебе.'
            }
        };
        
        // Статистика использования
        this.stats = {
            totalRequests: 0,
            successfulMatches: 0,
            learnedPhrases: 0,
            lastLearning: null,
            accuracy: 0.85 // начальная точность 85%
        };
        
        // История диалогов
        this.conversationHistory = [];
        
        // Настройки обучения
        this.learningSettings = {
            autoLearn: true, // Автообучение на новых вопросах
            learningRate: 0.7, // Скорость обучения (0-1)
            minConfidence: 0.3 // Минимальная уверенность для автообучения
        };
        
        // Загружаем сохраненные данные
        this.loadFromStorage();
        
        console.log('🧠 Нейросеть Leo инициализирована. База знаний:', Object.keys(this.knowledgeBase).length + ' категорий');
    }
    
    // ================= ОСНОВНЫЕ МЕТОДЫ =================
    
    // Получить ответ на вопрос
    getResponse(question) {
        this.stats.totalRequests++;
        
        const lowerQuestion = question.toLowerCase().trim();
        const questionWords = lowerQuestion.split(/\s+/);
        
        // Сохраняем вопрос в историю
        this.addToHistory('user', question);
        
        // 1. Попытка найти точный ответ
        let bestAnswer = this.findBestMatch(lowerQuestion, questionWords);
        
        // 2. Если точного ответа нет — используем общие ответы
        if (!bestAnswer) {
            bestAnswer = this.getGeneralResponse(lowerQuestion);
        }
        
        // 3. Сохраняем ответ в историю
        this.addToHistory('ai', bestAnswer);
        
        // 4. Автообучение на основе вопроса
        if (this.learningSettings.autoLearn && this.shouldLearnFromQuestion(lowerQuestion)) {
            this.learnFromQuestion(lowerQuestion, questionWords);
        }
        
        // 5. Сохраняем статистику
        this.saveToStorage();
        
        return bestAnswer;
    }
    
    // Найти лучший ответ
    findBestMatch(question, questionWords) {
        let bestCategory = null;
        let bestKeyword = null;
        let bestScore = 0;
        
        // Ищем по категориям
        for (const [category, keywords] of Object.entries(this.knowledgeBase)) {
            // Проверяем, содержит ли вопрос название категории
            if (question.includes(category)) {
                // Ищем конкретный термин в этой категории
                for (const [keyword, answer] of Object.entries(keywords)) {
                    const score = this.calculateMatchScore(question, keyword, questionWords);
                    
                    if (score > bestScore) {
                        bestScore = score;
                        bestCategory = category;
                        bestKeyword = keyword;
                        
                        if (score > 0.8) { // Хорошее совпадение
                            this.stats.successfulMatches++;
                            return answer;
                        }
                    }
                }
            }
        }
        
        // Если нашли хорошее совпадение
        if (bestScore > 0.3) {
            this.stats.successfulMatches++;
            return this.knowledgeBase[bestCategory][bestKeyword];
        }
        
        return null;
    }
    
    // Общие ответы
    getGeneralResponse(question) {
        const generalResponses = [
            'Интересный вопрос! Давайте разберем его вместе.',
            'Это важная тема. Рекомендую обратиться к учебнику или спросить у учителя.',
            'Попробуйте разбить задачу на части и решать по шагам.',
            'У меня пока нет подробной информации по этому вопросу, но я обязательно изучу его!',
            'Проверьте, правильно ли вы понимаете условие задачи.',
            'Эта тема будет подробно изучаться позже в учебном плане.',
            'Могу предложить поискать информацию в учебнике на странице...',
            'Давайте я объясню основные понятия по этой теме.',
            'Хороший вопрос! Для начала вспомним базовые определения.',
            'Попробуйте сформулировать вопрос более конкретно.'
        ];
        
        // Обновляем точность
        this.updateAccuracy();
        
        return generalResponses[Math.floor(Math.random() * generalResponses.length)];
    }
    
    // ================= ОБУЧЕНИЕ НЕЙРОСЕТИ =================
    
    // Ручное добавление знаний
    addKnowledge(category, keyword, answer) {
        if (!this.knowledgeBase[category]) {
            this.knowledgeBase[category] = {};
        }
        
        this.knowledgeBase[category][keyword] = answer;
        this.stats.learnedPhrases++;
        this.stats.lastLearning = new Date().toISOString();
        
        console.log(`📚 Добавлено знание: ${category} -> ${keyword}`);
        this.saveToStorage();
        
        return true;
    }
    
    // Автообучение на основе вопросов
    learnFromQuestion(question, questionWords) {
        // Ищем, какие категории упоминаются в вопросе
        const mentionedCategories = [];
        
        for (const category of Object.keys(this.knowledgeBase)) {
            if (question.includes(category)) {
                mentionedCategories.push(category);
            }
        }
        
        // Если упоминается конкретная категория, добавляем вопрос как ключевое слово
        if (mentionedCategories.length > 0) {
            const mainCategory = mentionedCategories[0];
            const mainWord = questionWords.find(word => word.length > 3) || questionWords[0];
            
            if (mainWord && !this.knowledgeBase[mainCategory][mainWord]) {
                // Создаем ответ на основе контекста
                const learnedAnswer = `Я узнал о "${mainWord}" в контексте ${mainCategory}. ` +
                                    `Это связано с изучением данной темы. ` +
                                    `Рекомендую обратиться к учебнику для подробной информации.`;
                
                this.addKnowledge(mainCategory, mainWord, learnedAnswer);
                console.log(`🤖 Автообучение: добавлено "${mainWord}" в категорию "${mainCategory}"`);
            }
        }
    }
    
    // Следует ли учиться на этом вопросе
    shouldLearnFromQuestion(question) {
        // Не учимся на очень коротких вопросах
        if (question.length < 5) return false;
        
        // Не учимся на одинаковых вопросах слишком часто
        const recentSimilar = this.conversationHistory
            .slice(-10)
            .filter(msg => msg.sender === 'user')
            .some(msg => this.calculateSimilarity(question, msg.text) > 0.8);
        
        return !recentSimilar && Math.random() < this.learningSettings.learningRate;
    }
    
    // ================= ВСПОМОГАТЕЛЬНЫЕ МЕТОДЫ =================
    
    // Расчет схожести
    calculateMatchScore(question, keyword, questionWords) {
        const keywordWords = keyword.toLowerCase().split(/\s+/);
        let score = 0;
        
        // Проверяем каждое слово ключевой фразы
        keywordWords.forEach(kw => {
            if (questionWords.some(qw => qw.includes(kw) || kw.includes(qw))) {
                score += 1;
            }
        });
        
        // Дополнительные баллы за полное совпадение
        if (question.includes(keyword)) {
            score += 2;
        }
        
        return score / (keywordWords.length + 2); // Нормализуем до 0-1
    }
    
    // Расчет схожести двух строк
    calculateSimilarity(str1, str2) {
        const words1 = str1.toLowerCase().split(/\s+/);
        const words2 = str2.toLowerCase().split(/\s+/);
        
        const intersection = words1.filter(word => words2.includes(word));
        const union = [...new Set([...words1, ...words2])];
        
        return intersection.length / union.length;
    }
    
    // Обновление точности
    updateAccuracy() {
        if (this.stats.totalRequests > 0) {
            this.stats.accuracy = this.stats.successfulMatches / this.stats.totalRequests;
        }
    }
    
    // Добавить в историю
    addToHistory(sender, text) {
        this.conversationHistory.push({
            sender: sender,
            text: text,
            timestamp: new Date().toISOString()
        });
        
        // Ограничиваем историю 100 сообщениями
        if (this.conversationHistory.length > 100) {
            this.conversationHistory = this.conversationHistory.slice(-100);
        }
    }
    
    // ================= СОХРАНЕНИЕ / ЗАГРУЗКА =================
    
    // Сохранить в localStorage
    saveToStorage() {
        try {
            const data = {
                knowledgeBase: this.knowledgeBase,
                stats: this.stats,
                conversationHistory: this.conversationHistory.slice(-50), // Сохраняем только последние 50
                learningSettings: this.learningSettings,
                lastSave: new Date().toISOString()
            };
            
            localStorage.setItem('leoNeuralNetwork', JSON.stringify(data));
            console.log('💾 Нейросеть сохранена в хранилище');
        } catch (error) {
            console.error('Ошибка сохранения нейросети:', error);
        }
    }
    
    // Загрузить из localStorage
    loadFromStorage() {
        try {
            const saved = localStorage.getItem('leoNeuralNetwork');
            if (saved) {
                const data = JSON.parse(saved);
                
                this.knowledgeBase = data.knowledgeBase || this.knowledgeBase;
                this.stats = data.stats || this.stats;
                this.conversationHistory = data.conversationHistory || this.conversationHistory;
                this.learningSettings = data.learningSettings || this.learningSettings;
                
                console.log('📂 Нейросеть загружена из хранилища');
                console.log('📊 Статистика:', this.stats);
            }
        } catch (error) {
            console.error('Ошибка загрузки нейросети:', error);
        }
    }
    
    // Экспорт знаний
    exportKnowledge() {
        return {
            knowledgeBase: this.knowledgeBase,
            stats: this.stats,
            learningSettings: this.learningSettings,
            exportedAt: new Date().toISOString()
        };
    }
    
    // Импорт знаний
    importKnowledge(data) {
        if (data.knowledgeBase) {
            this.knowledgeBase = data.knowledgeBase;
            this.stats.learnedPhrases = Object.values(this.knowledgeBase)
                .reduce((total, category) => total + Object.keys(category).length, 0);
            this.saveToStorage();
            console.log('📥 Знания успешно импортированы');
            return true;
        }
        return false;
    }
    
    // Сброс обучения
    resetLearning() {
        this.knowledgeBase = {};
        this.stats = {
            totalRequests: 0,
            successfulMatches: 0,
            learnedPhrases: 0,
            lastLearning: null,
            accuracy: 0
        };
        this.conversationHistory = [];
        localStorage.removeItem('leoNeuralNetwork');
        console.log('🔄 Нейросеть сброшена к начальному состоянию');
    }
    
    // Получить статистику
    getStats() {
        return {
            ...this.stats,
            categories: Object.keys(this.knowledgeBase).length,
            totalKeywords: Object.values(this.knowledgeBase)
                .reduce((total, category) => total + Object.keys(category).length, 0),
            lastConversation: this.conversationHistory.slice(-5)
        };
    }
}

// ================= ГЛОБАЛЬНЫЙ ЭКЗЕМПЛЯР =================
window.LeoAI = new LeoNeuralNetwork();

// Экспорт для использования в других файлах
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LeoNeuralNetwork;
}

console.log('🧠 Leo Neural Network v2.0 готов к работе!');
