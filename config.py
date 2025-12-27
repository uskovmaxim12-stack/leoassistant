"""
Конфигурация приложения Leo Assistant
"""
import os
from dotenv import load_dotenv
from pathlib import Path

# Загружаем переменные окружения
load_dotenv()

# Базовые пути
BASE_DIR = Path(__file__).parent

class Config:
    """Основные настройки"""
    
    # Безопасность
    SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-key-change-me")
    
    # База данных
    DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{BASE_DIR}/leo_assistant.db")
    
    # Внешние API (опционально)
    OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
    ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY", "")
    
    # Нейросеть
    NEURAL_NETWORK_MODEL_PATH = os.getenv("NEURAL_NETWORK_MODEL_PATH", f"{BASE_DIR}/models/leo_nn.pth")
    KNOWLEDGE_BASE_PATH = os.getenv("KNOWLEDGE_BASE_PATH", f"{BASE_DIR}/knowledge/")
    MAX_CONTEXT_LENGTH = int(os.getenv("MAX_CONTEXT_LENGTH", "4096"))
    
    # Игровые настройки
    POINTS_PER_MESSAGE = int(os.getenv("POINTS_PER_MESSAGE", "10"))
    POINTS_PER_ACHIEVEMENT = int(os.getenv("POINTS_PER_ACHIEVEMENT", "100"))
    DAILY_TASK_POINTS = int(os.getenv("DAILY_TASK_POINTS", "50"))
    
    # Настройки приложения
    DEBUG = os.getenv("DEBUG", "False").lower() == "true"
    HOST = os.getenv("HOST", "0.0.0.0")
    PORT = int(os.getenv("PORT", "8501"))

# Создаем объект конфигурации
config = Config()
