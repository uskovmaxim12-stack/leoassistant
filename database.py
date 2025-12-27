"""
База данных для Leo Assistant
"""
from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime, JSON, Boolean, Float
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime
import json
from config import config

# Создаем базу
engine = create_engine(config.DATABASE_URL)
Base = declarative_base()
SessionLocal = sessionmaker(bind=engine)

class User(Base):
    """Пользователи системы"""
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True)
    username = Column(String(50), unique=True, nullable=False)
    email = Column(String(100), unique=True)
    password_hash = Column(String(200))
    role = Column(String(20), default="student")  # student, teacher, admin
    created_at = Column(DateTime, default=datetime.now)
    
    # Игровые данные
    points = Column(Integer, default=0)
    level = Column(Integer, default=1)
    achievements = Column(JSON, default=json.dumps([]))
    daily_streak = Column(Integer, default=0)
    last_active = Column(DateTime, default=datetime.now)

class ChatMessage(Base):
    """Сообщения чата"""
    __tablename__ = "chat_messages"
    
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, nullable=False)
    message = Column(Text, nullable=False)
    response = Column(Text)
    is_from_ai = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.now)
    tokens_used = Column(Integer, default=0)
    neural_network_used = Column(Boolean, default=False)

class NeuralNetworkData(Base):
    """Данные для обучения нейросети"""
    __tablename__ = "neural_network_data"
    
    id = Column(Integer, primary_key=True)
    input_text = Column(Text, nullable=False)
    output_text = Column(Text, nullable=False)
    context = Column(JSON)
    source = Column(String(50))  # admin, chat, import
    created_at = Column(DateTime, default=datetime.now)
    times_used = Column(Integer, default=0)
    accuracy_score = Column(Float, default=0.0)

class Achievement(Base):
    """Достижения пользователей"""
    __tablename__ = "achievements"
    
    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)
    description = Column(Text)
    icon = Column(String(50))
    points_required = Column(Integer, default=0)
    badge_color = Column(String(20))

class SystemLog(Base):
    """Логи системы"""
    __tablename__ = "system_logs"
    
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer)
    action = Column(String(100), nullable=False)
    details = Column(JSON)
    ip_address = Column(String(50))
    created_at = Column(DateTime, default=datetime.now)

# Создаем таблицы
def init_db():
    """Инициализация базы данных"""
    Base.metadata.create_all(bind=engine)
    print("База данных создана!")

# Получение сессии базы данных
def get_db():
    """Получение сессии базы данных"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

if __name__ == "__main__":
    init_db()
