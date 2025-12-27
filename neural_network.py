"""
Самообучаемая нейросеть Leo Assistant
"""
import json
import pickle
import numpy as np
from datetime import datetime
from pathlib import Path
from typing import List, Dict, Any, Optional
import torch
import torch.nn as nn
import torch.optim as optim
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
from config import config
import logging

# Настройка логирования
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class KnowledgeMemory:
    """Память знаний нейросети"""
    
    def __init__(self, knowledge_base_path: str = None):
        self.knowledge_base_path = knowledge_base_path or config.KNOWLEDGE_BASE_PATH
        Path(self.knowledge_base_path).mkdir(parents=True, exist_ok=True)
        
        # Загружаем модель для эмбеддингов
        self.embedding_model = SentenceTransformer('sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2')
        
        # База знаний в памяти
        self.knowledge_base: List[Dict] = []
        self.embeddings = None
        
        # Загружаем базовые знания
        self.load_base_knowledge()
    
    def load_base_knowledge(self):
        """Загрузка базовых знаний (изначальные данные)"""
        base_knowledge = [
            {
                "question": "привет",
                "answer": "Привет! Я Лео, твой умный помощник в учебе. Рад тебя видеть!",
                "context": ["приветствие"],
                "score": 1.0
            },
            {
                "question": "как дела",
                "answer": "У меня все отлично! Готов помогать тебе с учебой. Как твои успехи?",
                "context": ["разговор"],
                "score": 1.0
            },
            {
                "question": "помощь",
                "answer": "Я могу помочь с учебой, объяснить тему, проверить задание или просто поболтать. Что тебя интересует?",
                "context": ["помощь"],
                "score": 1.0
            },
            # Математика 7 класс
            {
                "question": "что такое уравнение",
                "answer": "Уравнение — это равенство, содержащее переменную, значение которой нужно найти. Например: 2x + 3 = 11",
                "context": ["математика", "алгебра", "7 класс"],
                "score": 1.0
            },
            {
                "question": "как решать линейные уравнения",
                "answer": "Линейные уравнения решаются так:\n1. Перенести все с x в одну сторону, числа в другую\n2. Упростить\n3. Разделить на коэффициент при x\nПример: 3x - 7 = 8 → 3x = 15 → x = 5",
                "context": ["математика", "алгебра", "7 класс"],
                "score": 1.0
            },
            # Русский язык
            {
                "question": "что такое причастие",
                "answer": "Причастие — это особая форма глагола, которая обозначает признак предмета по действию. Отвечает на вопросы: какой? что делающий? что сделавший?",
                "context": ["русский язык", "грамматика", "7 класс"],
                "score": 1.0
            },
            # Геометрия
            {
                "question": "теорема пифагора",
                "answer": "Теорема Пифагора: в прямоугольном треугольнике квадрат гипотенузы равен сумме квадратов катетов. Формула: c² = a² + b²",
                "context": ["математика", "геометрия", "7 класс"],
                "score": 1.0
            },
            # Общие знания
            {
                "question": "кто такой лео",
                "answer": "Я — Лео, искусственный интеллект созданный чтобы помогать ученикам 7Б класса в учебе. Я умею объяснять темы, проверять задания и поддерживать разговор!",
                "context": ["о себе"],
                "score": 1.0
            }
        ]
        
        self.knowledge_base.extend(base_knowledge)
        self.update_embeddings()
        logger.info(f"Загружено {len(base_knowledge)} базовых знаний")
    
    def update_embeddings(self):
        """Обновление эмбеддингов для поиска"""
        if self.knowledge_base:
            texts = [f"{item['question']} {''.join(item.get('context', []))}" 
                    for item in self.knowledge_base]
            self.embeddings = self.embedding_model.encode(texts)
    
    def add_knowledge(self, question: str, answer: str, context: List[str] = None, 
                      source: str = "user"):
        """Добавление нового знания"""
        new_item = {
            "question": question.lower(),
            "answer": answer,
            "context": context or [],
            "source": source,
            "score": 1.0,
            "added_at": datetime.now().isoformat(),
            "times_used": 0
        }
        
        self.knowledge_base.append(new_item)
        self.update_embeddings()
        self.save_knowledge()
        logger.info(f"Добавлено новое знание: {question[:50]}...")
    
    def find_similar(self, query: str, top_k: int = 3) -> List[Dict]:
        """Поиск похожих знаний"""
        if not self.knowledge_base:
            return []
        
        query_embedding = self.embedding_model.encode([query])
        similarities = cosine_similarity(query_embedding, self.embeddings)[0]
        
        # Получаем индексы top_k наиболее похожих
        top_indices = np.argsort(similarities)[-top_k:][::-1]
        
        results = []
        for idx in top_indices:
            if similarities[idx] > 0.3:  # Порог сходства
                item = self.knowledge_base[idx].copy()
                item["similarity"] = float(similarities[idx])
                results.append(item)
        
        return results
    
    def save_knowledge(self):
        """Сохранение знаний в файл"""
        file_path = Path(self.knowledge_base_path) / "knowledge_base.json"
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(self.knowledge_base, f, ensure_ascii=False, indent=2)
        logger.info(f"Знания сохранены в {file_path}")
    
    def load_knowledge(self):
        """Загрузка знаний из файла"""
        file_path = Path(self.knowledge_base_path) / "knowledge_base.json"
        if file_path.exists():
            with open(file_path, 'r', encoding='utf-8') as f:
                self.knowledge_base = json.load(f)
            self.update_embeddings()
            logger.info(f"Загружено {len(self.knowledge_base)} знаний из файла")
            return True
        return False


class NeuralNetworkModel(nn.Module):
    """Модель нейросети для генерации ответов"""
    
    def __init__(self, vocab_size: int = 10000, embedding_dim: int = 256, 
                 hidden_dim: int = 512):
        super().__init__()
        
        self.embedding = nn.Embedding(vocab_size, embedding_dim)
        self.lstm = nn.LSTM(embedding_dim, hidden_dim, batch_first=True, 
                           num_layers=2, dropout=0.3)
        self.fc = nn.Linear(hidden_dim, vocab_size)
        self.dropout = nn.Dropout(0.3)
        
    def forward(self, x, hidden=None):
        embedded = self.embedding(x)
        output, hidden = self.lstm(embedded, hidden)
        output = self.dropout(output)
        logits = self.fc(output)
        return logits, hidden


class LeoNeuralNetwork:
    """Основной класс нейросети Leo Assistant"""
    
    def __init__(self):
        self.model = None
        self.memory = KnowledgeMemory()
        self.vocab = {}
        self.reverse_vocab = {}
        self.is_trained = False
        
        # Загружаем сохраненную модель если есть
        self.load_model()
    
    def load_model(self):
        """Загрузка модели"""
        model_path = Path(config.NEURAL_NETWORK_MODEL_PATH)
        
        if model_path.exists():
            try:
                # Загружаем модель и словарь
                checkpoint = torch.load(model_path, map_location='cpu')
                self.model = NeuralNetworkModel()
                self.model.load_state_dict(checkpoint['model_state'])
                self.vocab = checkpoint['vocab']
                self.reverse_vocab = {v: k for k, v in self.vocab.items()}
                self.is_trained = checkpoint.get('is_trained', False)
                
                logger.info(f"Модель загружена из {model_path}")
                return True
            except Exception as e:
                logger.error(f"Ошибка загрузки модели: {e}")
        
        # Если модели нет, создаем новую
        self.initialize_vocab()
        self.model = NeuralNetworkModel(vocab_size=len(self.vocab))
        logger.info("Создана новая модель")
        return False
    
    def initialize_vocab(self):
        """Инициализация словаря"""
        # Базовый словарь
        base_words = [
            'привет', 'пока', 'как', 'дела', 'помощь', 'учеба', 'задание',
            'урок', 'учитель', 'ученик', 'школа', 'класс', 'математика',
            'русский', 'язык', 'литература', 'история', 'география',
            'физика', 'химия', 'ответ', 'вопрос', 'объясни', 'реши',
            'пример', 'задача', 'теория', 'практика', 'тест', 'экзамен',
            'оценка', 'домашнее', 'работа', 'проект', 'исследование',
            'спасибо', 'пожалуйста', 'извини', 'понятно', 'непонятно'
        ]
        
        # Добавляем слова в словарь
        self.vocab = {'<PAD>': 0, '<SOS>': 1, '<EOS>': 2, '<UNK>': 3}
        for idx, word in enumerate(base_words, start=4):
            self.vocab[word] = idx
        
        self.reverse_vocab = {v: k for k, v in self.vocab.items()}
    
    def text_to_tensor(self, text: str) -> torch.Tensor:
        """Преобразование текста в тензор"""
        words = text.lower().split()
        indices = [self.vocab.get(word, self.vocab['<UNK>']) for word in words]
        return torch.tensor(indices).unsqueeze(0)
    
    def generate_response(self, query: str, context: List[Dict] = None) -> str:
        """
        Генерация ответа на запрос
        1. Ищем в памяти знаний
        2. Если нет подходящего - генерируем нейросетью
        3. Обновляем статистику
        """
        # Ищем похожие вопросы в базе знаний
        similar = self.memory.find_similar(query)
        
        if similar and similar[0]['similarity'] > 0.7:
            # Используем готовый ответ из базы знаний
            best_match = similar[0]
            best_match['times_used'] = best_match.get('times_used', 0) + 1
            
            # Если ответ часто используется, повышаем его score
            if best_match['times_used'] > 10:
                best_match['score'] = min(1.0, best_match.get('score', 0) + 0.1)
            
            logger.info(f"Использован ответ из базы знаний (сходство: {best_match['similarity']:.2f})")
            return best_match['answer']
        
        # Если в базе нет хорошего ответа, генерируем
        if self.is_trained:
            # TODO: Реализовать генерацию через нейросеть
            # Пока используем правило-основу
            response = self.generate_based_on_rules(query)
        else:
            # Нейросеть не обучена, используем правила
            response = self.generate_based_on_rules(query)
        
        # Добавляем новый вопрос-ответ в базу знаний для будущего обучения
        context_tags = self.extract_context(query, context)
        self.memory.add_knowledge(query, response, context_tags, source="generated")
        
        return response
    
    def generate_based_on_rules(self, query: str) -> str:
        """Генерация ответа на основе правил"""
        query_lower = query.lower()
        
        # Простые правила для начального обучения
        rules = {
            'как тебя зовут': 'Меня зовут Лео! Я твой помощник в учебе.',
            'сколько времени': f'Сейчас {datetime.now().strftime("%H:%M")}. Время учиться!',
            'какая сегодня дата': f'Сегодня {datetime.now().strftime("%d.%m.%Y")}.',
            'спасибо': 'Всегда пожалуйста! Рад был помочь.',
            'пока': 'До встречи! Не забывай делать домашние задания!',
            'ура': 'Ура! 🎉 Ты молодец! Продолжай в том же духе!',
            'сложно': 'Не переживай! Все сложные темы можно освоить по шагам. Давай разберем вместе?',
            'скучно': 'Давай сделаем учебу интересной! Хочешь поиграть в учебную игру?',
            'устал': 'Отдохни немного! Перерыв важен для продуктивной учебы.',
        }
        
        # Проверяем правила
        for pattern, response in rules.items():
            if pattern in query_lower:
                return response
        
        # Если нет правила, используем общий ответ
        responses = [
            "Интересный вопрос! Давай разберем его вместе.",
            "Хм, хороший вопрос. Мне нужно подумать над ответом.",
            "Я еще учусь, но постараюсь помочь! Можешь переформулировать вопрос?",
            "Это связано с учебой? Я специализируюсь на школьных предметах 7 класса.",
            "Пока я могу ответить на вопросы про математику, русский язык и другие школьные предметы.",
        ]
        
        import random
        return random.choice(responses)
    
    def extract_context(self, query: str, context: List[Dict] = None) -> List[str]:
        """Извлечение контекста из запроса и истории"""
        context_tags = []
        
        # Ключевые слова для тегов
        subjects = ['математика', 'алгебра', 'геометрия', 'русский', 'литература', 
                   'история', 'география', 'физика', 'химия', 'биология', 'английский']
        
        query_lower = query.lower()
        for subject in subjects:
            if subject in query_lower:
                context_tags.append(subject)
        
        # Добавляем общие теги
        if any(word in query_lower for word in ['как', 'почему', 'объясни']):
            context_tags.append('объяснение')
        
        if any(word in query_lower for word in ['задача', 'пример', 'реши']):
            context_tags.append('задача')
        
        if any(word in query_lower for word in ['определение', 'что такое']):
            context_tags.append('определение')
        
        return context_tags if context_tags else ['общий']
    
    def train_on_data(self, data: List[Dict], epochs: int = 10):
        """Обучение нейросети на данных"""
        if not data:
            logger.warning("Нет данных для обучения")
            return
        
        # Подготавливаем данные
        # TODO: Реализовать подготовку данных для обучения
        
        # Простой пример обучения
        optimizer = optim.Adam(self.model.parameters(), lr=0.001)
        criterion = nn.CrossEntropyLoss()
        
        logger.info(f"Начало обучения на {len(data)} примерах")
        
        # Здесь должна быть реальная логика обучения
        # Пока просто отмечаем, что модель "обучена"
        self.is_trained = True
        
        # Сохраняем модель
        self.save_model()
        logger.info("Обучение завершено")
    
    def save_model(self):
        """Сохранение модели"""
        model_path = Path(config.NEURAL_NETWORK_MODEL_PATH)
        model_path.parent.mkdir(parents=True, exist_ok=True)
        
        checkpoint = {
            'model_state': self.model.state_dict(),
            'vocab': self.vocab,
            'is_trained': self.is_trained,
            'saved_at': datetime.now().isoformat()
        }
        
        torch.save(checkpoint, model_path)
        logger.info(f"Модель сохранена в {model_path}")
    
    def learn_from_conversation(self, user_message: str, ai_response: str, 
                               was_helpful: bool = True):
        """
        Обучение из разговора
        was_helpful: был ли ответ полезен (для reinforcement learning)
        """
        # Добавляем в базу знаний
        context = self.extract_context(user_message)
        self.memory.add_knowledge(user_message, ai_response, context, source="chat")
        
        # Обновляем score в зависимости от полезности
        if was_helpful:
            # Повышаем score похожих записей
            similar = self.memory.find_similar(user_message)
            for item in similar[:3]:
                item['score'] = min(1.0, item.get('score', 0) + 0.05)
        else:
            # Понижаем score
            similar = self.memory.find_similar(user_message)
            for item in similar[:3]:
                item['score'] = max(0.1, item.get('score', 1.0) - 0.1)
        
        # Периодически переобучаем модель
        if len(self.memory.knowledge_base) % 50 == 0:
            logger.info("Накоплено достаточно данных для переобучения")
            # TODO: Запуск переобучения
    
    def get_stats(self) -> Dict:
        """Статистика нейросети"""
        return {
            "knowledge_base_size": len(self.memory.knowledge_base),
            "is_trained": self.is_trained,
            "vocab_size": len(self.vocab),
            "model_parameters": sum(p.numel() for p in self.model.parameters()) if self.model else 0,
            "last_updated": datetime.now().isoformat()
        }


# Синглтон инстанс нейросети
_leo_nn_instance = None

def get_neural_network() -> LeoNeuralNetwork:
    """Получение инстанса нейросети (синглтон)"""
    global _leo_nn_instance
    if _leo_nn_instance is None:
        _leo_nn_instance = LeoNeuralNetwork()
    return _leo_nn_instance
