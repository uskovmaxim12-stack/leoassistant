"""
Игровые элементы Leo Assistant
"""
import random
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
import json
from pathlib import Path

class GameSystem:
    """Система игровых элементов"""
    
    def __init__(self):
        self.achievements = self.load_achievements()
        self.quests = self.load_quests()
        self.leaderboard = {}
    
    def load_achievements(self) -> List[Dict]:
        """Загрузка списка достижений"""
        achievements = [
            {
                "id": "welcome",
                "name": "Добро пожаловать!",
                "description": "Впервые вошли в систему",
                "icon": "👋",
                "points": 50,
                "condition": {"type": "login", "count": 1}
            },
            {
                "id": "curious",
                "name": "Любознательный",
                "description": "Задал 10 вопросов Лео",
                "icon": "❓",
                "points": 100,
                "condition": {"type": "questions", "count": 10}
            },
            {
                "id": "math_master",
                "name": "Мастер математики",
                "description": "Решил 20 математических задач",
                "icon": "🔢",
                "points": 200,
                "condition": {"type": "math_tasks", "count": 20}
            },
            {
                "id": "language_expert",
                "name": "Эксперт языка",
                "description": "Изучил 15 тем по русскому языку",
                "icon": "📚",
                "points": 200,
                "condition": {"type": "language_topics", "count": 15}
            },
            {
                "id": "helper",
                "name": "Помощник",
                "description": "Помог 5 одноклассникам",
                "icon": "👥",
                "points": 150,
                "condition": {"type": "help_others", "count": 5}
            },
            {
                "id": "streak_7",
                "name": "Неделя активности",
                "description": "Заходил в систему 7 дней подряд",
                "icon": "🔥",
                "points": 300,
                "condition": {"type": "daily_streak", "count": 7}
            },
            {
                "id": "streak_30",
                "name": "Месяц активности",
                "description": "Заходил в систему 30 дней подряд",
                "icon": "🌟",
                "points": 1000,
                "condition": {"type": "daily_streak", "count": 30}
            },
            {
                "id": "level_5",
                "name": "Опытный ученик",
                "description": "Достиг 5 уровня",
                "icon": "⭐",
                "points": 500,
                "condition": {"type": "level", "count": 5}
            },
            {
                "id": "level_10",
                "name": "Мастер обучения",
                "description": "Достиг 10 уровня",
                "icon": "🏆",
                "points": 2000,
                "condition": {"type": "level", "count": 10}
            },
            {
                "id": "social",
                "name": "Социальная бабочка",
                "description": "Пообщался с 3 разными учениками",
                "icon": "🦋",
                "points": 150,
                "condition": {"type": "social_interactions", "count": 3}
            }
        ]
        return achievements
    
    def load_quests(self) -> List[Dict]:
        """Загрузка квестов"""
        return [
            {
                "id": "daily_questions",
                "name": "Дневная любознательность",
                "description": "Задай 5 вопросов Лео сегодня",
                "icon": "💬",
                "points": 50,
                "type": "daily",
                "progress": 0,
                "target": 5
            },
            {
                "id": "daily_math",
                "name": "Математическая разминка",
                "description": "Реши 3 математические задачи",
                "icon": "➕",
                "points": 75,
                "type": "daily",
                "progress": 0,
                "target": 3
            },
            {
                "id": "weekly_challenge",
                "name": "Недельное испытание",
                "description": "Набери 500 очков за неделю",
                "icon": "🎯",
                "points": 200,
                "type": "weekly",
                "progress": 0,
                "target": 500
            },
            {
                "id": "help_friend",
                "name": "Помощь другу",
                "description": "Помоги однокласснику с заданием",
                "icon": "🤝",
                "points": 100,
                "type": "special",
                "progress": 0,
                "target": 1
            }
        ]
    
    def check_achievement(self, user_data: Dict, achievement_id: str) -> bool:
        """Проверка получения достижения"""
        achievement = next((a for a in self.achievements if a["id"] == achievement_id), None)
        if not achievement:
            return False
        
        condition = achievement["condition"]
        user_stats = user_data.get("stats", {})
        
        # Проверяем условие
        if condition["type"] == "login":
            return user_stats.get("login_count", 0) >= condition["count"]
        elif condition["type"] == "questions":
            return user_stats.get("questions_asked", 0) >= condition["count"]
        elif condition["type"] == "level":
            return user_data.get("level", 0) >= condition["count"]
        elif condition["type"] == "daily_streak":
            return user_stats.get("daily_streak", 0) >= condition["count"]
        
        return False
    
    def get_user_achievements(self, user_data: Dict) -> List[Dict]:
        """Получение достижений пользователя"""
        unlocked = []
        for achievement in self.achievements:
            if self.check_achievement(user_data, achievement["id"]):
                unlocked.append(achievement)
        return unlocked
    
    def update_quest_progress(self, quest_id: str, user_id: str, progress: int = 1):
        """Обновление прогресса квеста"""
        # TODO: Реализовать обновление квестов
        pass
    
    def get_daily_quests(self) -> List[Dict]:
        """Получение дневных квестов"""
        return [q for q in self.quests if q["type"] == "daily"]
    
    def get_weekly_quests(self) -> List[Dict]:
        """Получение недельных квестов"""
        return [q for q in self.quests if q["type"] == "weekly"]
    
    def generate_random_event(self) -> Optional[Dict]:
        """Генерация случайного события"""
        events = [
            {
                "type": "bonus",
                "name": "Счастливый час!",
                "description": "Получай в 2 раза больше очков в течение часа",
                "icon": "🎰",
                "duration": 3600,
                "multiplier": 2.0
            },
            {
                "type": "challenge",
                "name": "Экспресс-задание",
                "description": "Задай 3 вопроса за 10 минут",
                "icon": "⚡",
                "duration": 600,
                "reward": 100
            },
            {
                "type": "surprise",
                "name": "Сюрприз от Лео",
                "description": "Получи случайный бонус!",
                "icon": "🎁",
                "reward": random.randint(50, 200)
            }
        ]
        
        # 10% шанс на событие
        if random.random() < 0.1:
            return random.choice(events)
        return None
    
    def calculate_level(self, points: int) -> int:
        """Расчет уровня на основе очков"""
        level = 1
        required = 1000
        
        while points >= required:
            level += 1
            points -= required
            required = int(required * 1.5)  # С каждым уровнем нужно больше очков
        
        return min(level, 50)  # Макс 50 уровень
    
    def get_level_progress(self, points: int, current_level: int) -> Dict:
        """Получение прогресса уровня"""
        required_for_current = self.get_points_for_level(current_level)
        required_for_next = self.get_points_for_level(current_level + 1)
        
        points_in_level = points - required_for_current
        points_needed = required_for_next - required_for_current
        
        return {
            "current_level": current_level,
            "next_level": current_level + 1,
            "points": points,
            "points_in_level": points_in_level,
            "points_needed": points_needed,
            "progress_percentage": min(100, int((points_in_level / points_needed) * 100))
        }
    
    def get_points_for_level(self, level: int) -> int:
        """Получение необходимых очков для уровня"""
        if level <= 1:
            return 0
        
        points = 0
        for lvl in range(2, level + 1):
            points += int(1000 * (1.5 ** (lvl - 2)))
        return points
    
    def update_leaderboard(self, user_id: str, username: str, points: int, level: int):
        """Обновление таблицы лидеров"""
        self.leaderboard[user_id] = {
            "username": username,
            "points": points,
            "level": level,
            "last_updated": datetime.now().isoformat()
        }
        
        # Сортируем по очкам
        sorted_leaderboard = dict(sorted(
            self.leaderboard.items(),
            key=lambda x: x[1]["points"],
            reverse=True
        ))
        
        # Ограничиваем топ-50
        self.leaderboard = dict(list(sorted_leaderboard.items())[:50])
    
    def get_top_players(self, limit: int = 10) -> List[Dict]:
        """Получение топ игроков"""
        sorted_players = sorted(
            self.leaderboard.values(),
            key=lambda x: x["points"],
            reverse=True
        )
        return sorted_players[:limit]
    
    def generate_motivation_message(self, user_data: Dict) -> str:
        """Генерация мотивационного сообщения"""
        messages = [
            "Ты молодец! Продолжай в том же духе! 🚀",
            "Каждый вопрос делает тебя умнее! 💡",
            "Ты на верном пути к успеху! ⭐",
            "Учеба — это суперсила! 🦸",
            "Твои старания обязательно окупятся! 💪",
            "Сегодня ты стал лучше, чем вчера! 🌟",
            "Знания — это твоё самое ценное сокровище! 💎",
            "Ты создаёшь своё блестящее будущее! ✨",
            "Каждая решённая задача приближает тебя к цели! 🎯",
            "Ты способен на большее, чем думаешь! 🚀"
        ]
        
        # Персонализированные сообщения
        if user_data.get("daily_streak", 0) >= 7:
            messages.append(f"Уже {user_data['daily_streak']} дней подряд! Ты неудержим! 🔥")
        
        if user_data.get("level", 0) >= 5:
            messages.append(f"Уровень {user_data['level']}! Ты настоящий профи! ⭐")
        
        return random.choice(messages)


# Синглтон инстанс игровой системы
_game_system = None

def get_game_system():
    """Получение инстанса игровой системы"""
    global _game_system
    if _game_system is None:
        _game_system = GameSystem()
    return _game_system
