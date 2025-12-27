// ===== НЕЙРОСЕТЬ NEUROLEO =====

class NeuroLeo {
    constructor() {
        this.name = "NeuroLeo";
        this.version = "1.0";
        this.personality = "helpful_teacher";
        this.emotionalState = "calm";
        this.learningRate = 0.01;
        this.knowledgeBase = new Map();
        this.memory = [];
        this.conversationHistory = [];
        this.neuralNetwork = this.initNeuralNetwork();
        this.isTraining = false;
        
        // Загружаем базовые знания
        this.loadBaseKnowledge();
        this.loadPersonality();
        
        console.log(`🧠 ${this.name} v${this.version} инициализирован`);
    }
    
    initNeuralNetwork() {
        // Простая нейронная сеть на JavaScript
        return {
            layers: [
                {
                    type: 'input',
                    neurons: 128,
                    activation: 'relu'
                },
                {
                    type: 'hidden',
                    neurons: 64,
                    activation: 'relu'
                },
                {
                    type: 'hidden',
                    neurons: 32,
                    activation: 'tanh'
                },
                {
                    type: 'output',
                    neurons: 16,
                    activation: 'softmax'
                }
            ],
            weights: [],
            biases: [],
            
            // Инициализация случайных весов
            initWeights() {
                for (let i = 0; i < this.layers.length - 1; i++) {
                    const weights = [];
                    const biases = [];
                    
                    for (let j = 0; j < this.layers[i + 1].neurons; j++) {
                        const neuronWeights = [];
                        for (let k = 0; k < this.layers[i].neurons; k++) {
                            neuronWeights.push(Math.random() * 2 - 1); // -1 до 1
                        }
                        weights.push(neuronWeights);
                        biases.push(Math.random() * 0.1);
                    }
                    
                    this.weights.push(weights);
                    this.biases.push(biases);
                }
            },
            
            // Прямое распространение
            forward(input) {
                let current = input;
                const activations = [input];
                
                for (let i = 0; i < this.weights.length; i++) {
                    const layerOutput = [];
                    
                    for (let j = 0; j < this.weights[i].length; j++) {
                        let sum = this.biases[i][j];
                        
                        for (let k = 0; k < current.length; k++) {
                            sum += current[k] * this.weights[i][j][k];
                        }
                        
                        layerOutput.push(this.activate(sum, this.layers[i + 1].activation));
                    }
                    
                    current = layerOutput;
                    activations.push(current);
                }
                
                return { output: current, activations };
            },
            
            // Функции активации
            activate(x, func) {
                switch(func) {
                    case 'relu':
                        return Math.max(0, x);
                    case 'tanh':
                        return Math.tanh(x);
                    case 'sigmoid':
                        return 1 / (1 + Math.exp(-x));
                    case 'softmax':
                        // Для простоты вернем сигмоиду
                        return 1 / (1 + Math.exp(-x));
                    default:
                        return x;
                }
            },
            
            // Производные функций активации
            activateDerivative(x, func) {
                switch(func) {
                    case 'relu':
                        return x > 0 ? 1 : 0.01; // Leaky ReLU
                    case 'tanh':
                        return 1 - x * x;
                    case 'sigmoid':
                        return x * (1 - x);
                    default:
                        return 1;
                }
            }
        };
    }
    
    loadBaseKnowledge() {
        // Базовая образовательная база знаний
        const baseKnowledge = {
            // Математика
            'теорема пифагора': 'В прямоугольном треугольнике квадрат гипотенузы равен сумме квадратов катетов: a² + b² = c²',
            'квадратное уравнение': 'Уравнение вида ax² + bx + c = 0. Решается через дискриминант: D = b² - 4ac',
            'дроби': 'Дробь состоит из числителя и знаменателя. Чтобы сложить дроби, приведите к общему знаменателю',
            
            // Русский язык
            'существительное': 'Часть речи, обозначающая предмет и отвечающая на вопросы кто? что?',
            'глагол': 'Часть речи, обозначающая действие и отвечающая на вопросы что делать? что сделать?',
            'прилагательное': 'Часть речи, обозначающая признак предмета и отвечающая на вопросы какой? какая? какое?',
            
            // История
            'петр i': 'Пётр I Великий — последний царь всея Руси и первый Император Всероссийский. Провёл масштабные реформы',
            'великая отечественная война': '1941-1945 гг. Война СССР против нацистской Германии. Важнейшие битвы: Москва, Сталинград, Курск',
            
            // Физика
            'закон ньютона': 'Первый закон: тело сохраняет состояние покоя или движения, пока на него не действуют силы',
            'электричество': 'Движение заряженных частиц. Измеряется в вольтах (напряжение), амперах (сила тока), омах (сопротивление)',
            
            // Общие
            'привет': 'Привет! Я NeuroLeo, твой умный помощник в учёбе. Чем могу помочь?',
            'как дела': 'У меня всё отлично! Готов помогать тебе с учебой. А у тебя как дела?',
            'спасибо': 'Всегда рад помочь! Если будут ещё вопросы — обращайся 😊'
        };
        
        for (const [key, value] of Object.entries(baseKnowledge)) {
            this.knowledgeBase.set(key.toLowerCase(), {
                answer: value,
                category: this.detectCategory(key),
                confidence: 0.9,
                usageCount: 0,
                lastUsed: Date.now()
            });
        }
    }
    
    loadPersonality() {
        // Личности AI
        this.personalities = {
            helpful_teacher: {
                name: "Помощный учитель",
                traits: ["терпеливый", "объясняющий", "поддерживающий"],
                responseStyle: "formal",
                emoji: "👨‍🏫",
                greeting: "Здравствуйте! Я готов помочь с учебными вопросами."
            },
            funny_friend: {
                name: "Веселый друг",
                traits: ["дружелюбный", "юмористический", "неформальный"],
                responseStyle: "casual",
                emoji: "😄",
                greeting: "Привет! Давай учиться весело! Что хочешь узнать?"
            },
            strict_professor: {
                name: "Строгий профессор",
                traits: ["точный", "требовательный", "академический"],
                responseStyle: "academic",
                emoji: "👓",
                greeting: "Добрый день. Задавайте вопросы, я дам точные ответы."
            },
            motivator: {
                name: "Мотиватор",
                traits: ["вдохновляющий", "позитивный", "энергичный"],
                responseStyle: "inspirational",
                emoji: "🚀",
                greeting: "Привет, чемпион! Готов покорять новые знания?"
            }
        };
        
        // Эмоциональные состояния
        this.emotions = {
            calm: { emoji: "😌", color: "#3b82f6" },
            happy: { emoji: "😊", color: "#10b981" },
            excited: { emoji: "🤩", color: "#f59e0b" },
            thoughtful: { emoji: "🤔", color: "#8b5cf6" },
            concerned: { emoji: "😟", color: "#ef4444" }
        };
        
        // Устанавливаем текущую личность
        this.setPersonality(this.personality);
    }
    
    setPersonality(personalityType) {
        if (this.personalities[personalityType]) {
            this.personality = personalityType;
            this.currentPersonality = this.personalities[personalityType];
            console.log(`🎭 Установлена личность: ${this.currentPersonality.name}`);
        }
    }
    
    detectCategory(text) {
        const categories = {
            'математик': 'Математика',
            'алгебр': 'Алгебра',
            'геометр': 'Геометрия',
            'числ': 'Математика',
            'уравнен': 'Математика',
            'теорем': 'Математика',
            
            'русск': 'Русский язык',
            'язык': 'Русский язык',
            'граммат': 'Русский язык',
            'орфограф': 'Русский язык',
            'пунктуац': 'Русский язык',
            
            'истори': 'История',
            'войн': 'История',
            'цар': 'История',
            'древн': 'История',
            
            'физик': 'Физика',
            'хими': 'Химия',
            'биолог': 'Биология',
            'географ': 'География',
            
            'английск': 'Английский язык',
            'иностр': 'Иностранный язык',
            
            'программир': 'Информатика',
            'компьютер': 'Информатика',
            'код': 'Информатика'
        };
        
        text = text.toLowerCase();
        for (const [key, category] of Object.entries(categories)) {
            if (text.includes(key)) {
                return category;
            }
        }
        
        return 'Общее';
    }
    
    // Обработка вопроса пользователя
    async processQuestion(question, context = {}) {
        if (!question || question.trim() === '') {
            return this.generateResponse("Пожалуйста, задайте вопрос!");
        }
        
        // Очистка вопроса
        const cleanQuestion = question.toLowerCase().trim();
        
        // Добавляем в историю
        this.conversationHistory.push({
            type: 'user',
            content: question,
            timestamp: Date.now()
        });
        
        // Обновляем эмоциональное состояние на основе вопроса
        this.updateEmotionalState(question);
        
        // Поиск в базе знаний
        let bestMatch = this.findInKnowledgeBase(cleanQuestion);
        
        if (bestMatch.confidence > 0.7) {
            // Нашли хороший ответ в базе знаний
            bestMatch.usageCount++;
            bestMatch.lastUsed = Date.now();
            
            return this.generateResponse(bestMatch.answer, {
                confidence: bestMatch.confidence,
                category: bestMatch.category,
                source: 'knowledge_base'
            });
        } else {
            // Генерируем интеллектуальный ответ
            return this.generateIntelligentResponse(question, context);
        }
    }
    
    findInKnowledgeBase(question) {
        let bestMatch = { answer: '', confidence: 0, category: 'Общее' };
        
        // Поиск по ключевым словам
        const keywords = question.split(' ').filter(word => word.length > 3);
        
        for (const [key, knowledge] of this.knowledgeBase.entries()) {
            let confidence = 0;
            
            // Проверка точного совпадения
            if (question.includes(key)) {
                confidence = 0.9;
            }
            
            // Проверка по ключевым словам
            for (const keyword of keywords) {
                if (key.includes(keyword) || knowledge.answer.toLowerCase().includes(keyword)) {
                    confidence += 0.2;
                }
            }
            
            // Проверка по категории
            const category = this.detectCategory(question);
            if (knowledge.category === category) {
                confidence += 0.1;
            }
            
            if (confidence > bestMatch.confidence) {
                bestMatch = {
                    answer: knowledge.answer,
                    confidence: Math.min(confidence, 1),
                    category: knowledge.category,
                    usageCount: knowledge.usageCount
                };
            }
        }
        
        return bestMatch;
    }
    
    generateIntelligentResponse(question, context) {
        // Анализ вопроса
        const questionType = this.analyzeQuestionType(question);
        const category = this.detectCategory(question);
        
        // Шаблоны ответов в зависимости от типа вопроса
        const responseTemplates = {
            definition: [
                `Насколько я понимаю, ${question.toLowerCase()} — это...`,
                `Если говорить простыми словами, ${this.extractMainTerm(question)} — это...`,
                `В учебнике обычно пишут, что ${this.extractMainTerm(question)} означает...`
            ],
            how_to: [
                `Чтобы ${question.toLowerCase().replace('как', '')}, нужно...`,
                `Процесс ${this.extractMainTerm(question)} состоит из нескольких шагов...`,
                `Давайте разберем по порядку, как ${question.toLowerCase().replace('как', '')}...`
            ],
            why: [
                `Причина в том, что...`,
                `Это происходит потому, что...`,
                `Если объяснять научно, то...`
            ],
            example: [
                `Приведу пример: ...`,
                `Например, можно рассмотреть такой случай...`,
                `Хороший пример этого — ...`
            ],
            general: [
                `Интересный вопрос! Давайте разберемся...`,
                `Хм, хороший вопрос. Я думаю...`,
                `На эту тему можно говорить долго, но если кратко...`
            ]
        };
        
        // Выбор шаблона
        const templateType = responseTemplates[questionType] ? questionType : 'general';
        const template = responseTemplates[templateType][
            Math.floor(Math.random() * responseTemplates[templateType].length)
        ];
        
        // Генерация ответа с личностью
        let response = template;
        
        // Добавляем личностные особенности
        if (this.currentPersonality.responseStyle === 'casual') {
            response = response.replace('Давайте', 'Давай');
            response = response.replace('Нужно', 'Надо');
        }
        
        if (this.currentPersonality.responseStyle === 'academic') {
            response = `Согласно общепринятой точке зрения, ${response.toLowerCase()}`;
        }
        
        // Добавляем эмоциональную окраску
        response = this.addEmotionalColor(response);
        
        // Добавляем эмодзи
        response = `${this.emotions[this.emotionalState].emoji} ${response}`;
        
        return {
            answer: response,
            confidence: 0.6,
            category: category,
            source: 'generated',
            personality: this.currentPersonality.name,
            emotion: this.emotionalState
        };
    }
    
    analyzeQuestionType(question) {
        question = question.toLowerCase();
        
        if (question.startsWith('что такое') || question.startsWith('кто такой')) {
            return 'definition';
        } else if (question.startsWith('как') || question.includes('как сделать')) {
            return 'how_to';
        } else if (question.startsWith('почему') || question.startsWith('зачем')) {
            return 'why';
        } else if (question.includes('пример') || question.includes('например')) {
            return 'example';
        } else {
            return 'general';
        }
    }
    
    extractMainTerm(question) {
        // Извлекаем главный термин из вопроса
        const words = question.toLowerCase().split(' ');
        const stopWords = ['что', 'такое', 'как', 'почему', 'зачем', 'пример', 'для', 'на', 'в'];
        
        for (const word of words) {
            if (word.length > 3 && !stopWords.includes(word)) {
                return word;
            }
        }
        
        return 'это';
    }
    
    updateEmotionalState(question) {
        // Анализируем тон вопроса
        const positiveWords = ['спасибо', 'отлично', 'хорошо', 'понятно', 'круто'];
        const negativeWords = ['плохо', 'сложно', 'непонятно', 'тупо', 'глупо'];
        const urgentWords = ['срочно', 'быстро', 'помоги', 'важно'];
        
        let emotionScore = 0;
        
        question = question.toLowerCase();
        
        for (const word of positiveWords) {
            if (question.includes(word)) emotionScore += 1;
        }
        
        for (const word of negativeWords) {
            if (question.includes(word)) emotionScore -= 1;
        }
        
        for (const word of urgentWords) {
            if (question.includes(word)) emotionScore += 0.5;
        }
        
        // Определяем эмоцию
        if (emotionScore >= 2) {
            this.emotionalState = 'excited';
        } else if (emotionScore >= 1) {
            this.emotionalState = 'happy';
        } else if (emotionScore <= -2) {
            this.emotionalState = 'concerned';
        } else if (emotionScore <= -1) {
            this.emotionalState = 'thoughtful';
        } else {
            this.emotionalState = 'calm';
        }
    }
    
    addEmotionalColor(response) {
        const emotionalPhrases = {
            calm: ['', 'Давайте разберем спокойно.', 'Я внимательно слушаю.'],
            happy: ['Отлично! ', 'Здорово, что вы спрашиваете! ', 'Рад помочь! '],
            excited: ['Вот это да! ', 'О, интересный вопрос! ', 'Отличный вопрос! '],
            thoughtful: ['Хм, давайте подумаем... ', 'Интересный момент... ', 'Это требует размышлений... '],
            concerned: ['Понимаю ваше беспокойство. ', 'Давайте разберемся вместе. ', 'Не волнуйтесь, мы справимся. ']
        };
        
        const phrases = emotionalPhrases[this.emotionalState];
        if (phrases && Math.random() > 0.5) {
            return phrases[Math.floor(Math.random() * phrases.length)] + response;
        }
        
        return response;
    }
    
    generateResponse(answer, metadata = {}) {
        const fullResponse = {
            text: answer,
            timestamp: Date.now(),
            personality: this.currentPersonality.name,
            emotion: this.emotionalState,
            emoji: this.emotions[this.emotionalState].emoji,
            ...metadata
        };
        
        // Добавляем в историю
        this.conversationHistory.push({
            type: 'ai',
            content: fullResponse,
            timestamp: Date.now()
        });
        
        // Ограничиваем историю
        if (this.conversationHistory.length > 50) {
            this.conversationHistory = this.conversationHistory.slice(-50);
        }
        
        return fullResponse;
    }
    
    // Обучение на новых данных
    async learnFromInteraction(question, userFeedback) {
        if (!this.isTraining) {
            this.isTraining = true;
            
            try {
                // Извлекаем суть вопроса
                const mainTerm = this.extractMainTerm(question);
                const category = this.detectCategory(question);
                
                // Если пользователь дал фидбек (например, "это правильно")
                if (userFeedback && userFeedback.positive) {
                    // Увеличиваем уверенность в ответе
                    const existingKnowledge = this.knowledgeBase.get(mainTerm);
                    if (existingKnowledge) {
                        existingKnowledge.confidence = Math.min(existingKnowledge.confidence + 0.1, 1);
                        existingKnowledge.lastUsed = Date.now();
                    } else {
                        // Добавляем новое знание
                        this.knowledgeBase.set(mainTerm, {
                            answer: question, // В реальности здесь был бы ответ AI
                            category: category,
                            confidence: 0.7,
                            usageCount: 1,
                            lastUsed: Date.now()
                        });
                    }
                }
                
                // Сохраняем в память для обучения
                this.memory.push({
                    input: question,
                    feedback: userFeedback,
                    timestamp: Date.now()
                });
                
                // Ограничиваем память
                if (this.memory.length > 100) {
                    this.memory = this.memory.slice(-100);
                }
                
                // Периодическое обучение нейросети
                if (this.memory.length % 10 === 0) {
                    await this.trainNeuralNetwork();
                }
                
                console.log(`📚 NeuroLeo выучил: "${mainTerm}" (${category})`);
                
            } catch (error) {
                console.error('Ошибка обучения:', error);
            } finally {
                this.isTraining = false;
            }
        }
    }
    
    async trainNeuralNetwork() {
        // Простое обучение на основе обратной связи
        console.log('🧠 Обучение нейросети...');
        
        // В реальной реализации здесь было бы обучение весов
        // Для демо просто имитируем обучение
        
        await new Promise(resolve => setTimeout(resolve, 500));
        console.log('✅ Обучение завершено');
    }
    
    // Экспорт/импорт знаний
    exportKnowledge() {
        const exportData = {
            version: this.version,
            knowledgeBase: Array.from(this.knowledgeBase.entries()),
            memory: this.memory,
            conversationHistory: this.conversationHistory,
            personality: this.personality,
            emotionalState: this.emotionalState
        };
        
        return JSON.stringify(exportData, null, 2);
    }
    
    importKnowledge(jsonData) {
        try {
            const data = JSON.parse(jsonData);
            
            if (data.version && data.knowledgeBase) {
                this.knowledgeBase = new Map(data.knowledgeBase);
                this.memory = data.memory || [];
                this.conversationHistory = data.conversationHistory || [];
                
                if (data.personality) {
                    this.setPersonality(data.personality);
                }
                
                if (data.emotionalState) {
                    this.emotionalState = data.emotionalState;
                }
                
                console.log('📥 База знаний успешно загружена');
                return true;
            }
        } catch (error) {
            console.error('Ошибка импорта знаний:', error);
            return false;
        }
    }
    
    // Статистика
    getStatistics() {
        return {
            totalKnowledge: this.knowledgeBase.size,
            totalConversations: this.conversationHistory.length,
            memorySize: this.memory.length,
            personality: this.currentPersonality.name,
            emotion: this.emotionalState,
            categories: this.getCategoryStats()
        };
    }
    
    getCategoryStats() {
        const stats = {};
        
        for (const knowledge of this.knowledgeBase.values()) {
            const category = knowledge.category;
            stats[category] = (stats[category] || 0) + 1;
        }
        
        return stats;
    }
    
    // Очистка
    clearMemory() {
        this.memory = [];
        this.conversationHistory = [];
        console.log('🧹 Память очищена');
    }
    
    resetKnowledge() {
        this.knowledgeBase.clear();
        this.loadBaseKnowledge();
        console.log('🔄 База знаний сброшена к базовой');
    }
}

// Глобальный экземпляр нейросети
let neuroLeo;

function initNeuroLeo() {
    if (!neuroLeo) {
        neuroLeo = new NeuroLeo();
        
        // Автосохранение каждые 5 минут
        setInterval(() => {
            if (neuroLeo.knowledgeBase.size > 0) {
                localStorage.setItem('neuroleo_knowledge', neuroLeo.exportKnowledge());
            }
        }, 5 * 60 * 1000);
        
        // Загрузка сохраненных знаний
        const savedKnowledge = localStorage.getItem('neuroleo_knowledge');
        if (savedKnowledge) {
            neuroLeo.importKnowledge(savedKnowledge);
        }
    }
    
    return neuroLeo;
}

// Глобальные функции
async function askNeuroLeo(question, context) {
    if (!neuroLeo) {
        initNeuroLeo();
    }
    
    return await neuroLeo.processQuestion(question, context);
}

function changeNeuroPersonality(personalityType) {
    if (neuroLeo) {
        neuroLeo.setPersonality(personalityType);
        return neuroLeo.currentPersonality;
    }
}

function getNeuroStatistics() {
    if (neuroLeo) {
        return neuroLeo.getStatistics();
    }
    return null;
}

function exportNeuroKnowledge() {
    if (neuroLeo) {
        return neuroLeo.exportKnowledge();
    }
    return null;
}

function importNeuroKnowledge(jsonData) {
    if (neuroLeo) {
        return neuroLeo.importKnowledge(jsonData);
    }
    return false;
}

// Экспорт для модулей
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { NeuroLeo, initNeuroLeo, askNeuroLeo };
}
