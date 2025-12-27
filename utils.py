"""
Вспомогательные функции для Leo Assistant
"""
import hashlib
import random
import string
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
import json
from pathlib import Path

def generate_user_id(username: str) -> str:
    """Генерация уникального ID пользователя"""
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    hash_input = f"{username}_{timestamp}"
    return hashlib.md5(hash_input.encode()).hexdigest()[:8]

def calculate_points(message_length: int, complexity: int = 1) -> int:
    """Расчет очков за сообщение"""
    base_points = min(message_length // 10, 50)  # Макс 50 очков за длину
    complexity_bonus = complexity * 20
    return base_points + complexity_bonus

def format_response(text: str, style: str = "normal") -> str:
    """Форматирование ответа"""
    if style == "code":
        return f"```\n{text}\n```"
    elif style == "quote":
        return f"> {text}"
    elif style == "important":
        return f"**{text}**"
    else:
        return text

def create_achievement(name: str, description: str, icon: str = "🏆") -> Dict:
    """Создание достижения"""
    return {
        "name": name,
        "description": description,
        "icon": icon,
        "unlocked_at": datetime.now().isoformat(),
        "id": generate_user_id(name)
    }

def get_daily_task() -> Dict:
    """Генерация ежедневного задания"""
    tasks = [
        {
            "name": "Задать 5 вопросов Лео",
            "description": "Прояви любознательность!",
            "points": 50,
            "icon": "💬"
        },
        {
            "name": "Решить математическую задачу",
            "description": "Тренируй математическое мышление",
            "points": 75,
            "icon": "🔢"
        },
        {
            "name": "Прочитать тему по русскому языку",
            "description": "Развивай грамотность",
            "points": 60,
            "icon": "📚"
        },
        {
            "name": "Помочь однокласснику",
            "description": "Объясни тему другому",
            "points": 100,
            "icon": "👥"
        }
    ]
    
    today = datetime.now().strftime("%Y-%m-%d")
    random.seed(today)  # Чтобы задание было одинаковым весь день
    return random.choice(tasks)

def check_level_up(points: int, current_level: int) -> Optional[int]:
    """Проверка повышения уровня"""
    required_points = current_level * 1000
    if points >= required_points:
        return current_level + 1
    return None

def create_game_notification(message: str, notification_type: str = "info") -> Dict:
    """Создание игрового уведомления"""
    icons = {
        "info": "ℹ️",
        "success": "✅",
        "warning": "⚠️",
        "error": "❌",
        "achievement": "🎉",
        "level_up": "⬆️"
    }
    
    return {
        "message": message,
        "type": notification_type,
        "icon": icons.get(notification_type, "📢"),
        "timestamp": datetime.now().isoformat(),
        "id": generate_user_id(message)
    }

def export_data(data: Any, filename: str = "export.json") -> str:
    """Экспорт данных в файл"""
    filepath = Path("exports") / filename
    filepath.parent.mkdir(exist_ok=True)
    
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    
    return str(filepath)

def validate_email(email: str) -> bool:
    """Простая валидация email"""
    return "@" in email and "." in email and len(email) > 5

def get_streak_bonus(streak_days: int) -> int:
    """Бонус за ежедневную активность"""
    if streak_days >= 30:
        return 100
    elif streak_days >= 7:
        return 50
    elif streak_days >= 3:
        return 20
    return 0

def generate_random_color() -> str:
    """Генерация случайного цвета"""
    colors = [
        "#4CAF50", "#2196F3", "#FF9800", "#E91E63",
        "#9C27B0", "#00BCD4", "#8BC34A", "#FF5722",
        "#3F51B5", "#009688"
    ]
    return random.choice(colors)

def format_time_ago(timestamp: str) -> str:
    """Форматирование времени (сколько прошло)"""
    if not timestamp:
        return "только что"
    
    try:
        dt = datetime.fromisoformat(timestamp.replace('Z', '+00:00'))
        now = datetime.now()
        diff = now - dt
        
        if diff.days > 365:
            return f"{diff.days // 365} год. назад"
        elif diff.days > 30:
            return f"{diff.days // 30} мес. назад"
        elif diff.days > 0:
            return f"{diff.days} дн. назад"
        elif diff.seconds > 3600:
            return f"{diff.seconds // 3600} ч. назад"
        elif diff.seconds > 60:
            return f"{diff.seconds // 60} мин. назад"
        else:
            return "только что"
    except:
        return "недавно"
