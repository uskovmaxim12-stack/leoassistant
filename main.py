"""
Главный файл Leo Assistant - полностью переписанный
"""
import streamlit as st
import time
from datetime import datetime
import json
import sys
import os

# Добавляем путь к модулям
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Импортируем наши модули
from config import config
from database import init_db, get_db, User, ChatMessage, Achievement, SystemLog
from neural_network import LeoNeuralNetwork
from admin_panel import AdminPanel
from utils import format_response, calculate_points

# Настройка страницы
st.set_page_config(
    page_title="Leo Assistant - Умный помощник",
    page_icon="🤖",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Инициализация базы данных
init_db()

# Инициализация нейросети
@st.cache_resource
def load_neural_network():
    """Загрузка нейросети"""
    try:
        nn = LeoNeuralNetwork()
        nn.load_model()
        return nn
    except Exception as e:
        st.error(f"Ошибка загрузки нейросети: {e}")
        return None

class LeoAssistantApp:
    """Главное приложение Leo Assistant"""
    
    def __init__(self):
        self.nn = load_neural_network()
        self.setup_session_state()
        
    def setup_session_state(self):
        """Настройка состояния сессии"""
        if 'user' not in st.session_state:
            st.session_state.user = None
        if 'chat_history' not in st.session_state:
            st.session_state.chat_history = []
        if 'points' not in st.session_state:
            st.session_state.points = 0
        if 'level' not in st.session_state:
            st.session_state.level = 1
        if 'achievements' not in st.session_state:
            st.session_state.achievements = []
            
    def render_login(self):
        """Страница входа"""
        st.markdown("""
        <div style="text-align: center; padding: 50px;">
            <h1 style="color: #4CAF50;">🤖 Leo Assistant</h1>
            <p style="font-size: 20px; color: #666;">Умный помощник для учеников 7Б класса</p>
        </div>
        """, unsafe_allow_html=True)
        
        col1, col2, col3 = st.columns([1, 2, 1])
        
        with col2:
            with st.container():
                st.subheader("Вход в систему")
                
                username = st.text_input("Логин")
                password = st.text_input("Пароль", type="password")
                
                col_btn1, col_btn2 = st.columns(2)
                with col_btn1:
                    if st.button("Войти", type="primary", use_container_width=True):
                        self.login_user(username, password)
                with col_btn2:
                    if st.button("Демо доступ", use_container_width=True):
                        self.demo_login()
                
                # Админ вход
                with st.expander("Администратор"):
                    admin_pass = st.text_input("Админ пароль", type="password")
                    if st.button("Войти как администратор"):
                        if admin_pass == "admin123":  # Временный пароль
                            st.session_state.user = {
                                "username": "admin",
                                "role": "admin",
                                "points": 0,
                                "level": 99
                            }
                            st.success("Вход выполнен как администратор!")
                            st.rerun()
    
    def login_user(self, username, password):
        """Авторизация пользователя"""
        # TODO: Реальная авторизация
        if username == "ученик" and password == "123":
            st.session_state.user = {
                "username": "Иван Иванов",
                "role": "student",
                "points": 350,
                "level": 3,
                "achievements": ["Новичок", "Активный"]
            }
            st.success("Вход выполнен!")
            time.sleep(1)
            st.rerun()
        else:
            st.error("Неверный логин или пароль")
    
    def demo_login(self):
        """Демо вход"""
        st.session_state.user = {
            "username": "Демо Ученик",
            "role": "student",
            "points": 150,
            "level": 2,
            "achievements": ["Новичок"]
        }
        st.success("Демо доступ активирован!")
        time.sleep(1)
        st.rerun()
    
    def render_main_interface(self):
        """Главный интерфейс"""
        # Сайдбар
        with st.sidebar:
            self.render_sidebar()
        
        # Основная область
        self.render_chat_interface()
        self.render_game_elements()
    
    def render_sidebar(self):
        """Боковая панель"""
        user = st.session_state.user
        
        st.markdown(f"""
        <div style="text-align: center; padding: 20px;">
            <h3 style="color: #4CAF50;">👋 Привет, {user['username']}!</h3>
            <p>Уровень: <strong>{user['level']}</strong></p>
        </div>
        """, unsafe_allow_html=True)
        
        # Очки и прогресс
        st.progress(user['points'] / 1000, text=f"Очки: {user['points']}")
        
        # Навигация
        st.markdown("---")
        menu_option = st.radio(
            "Меню",
            ["💬 Чат с Лео", "📚 Задания", "🏆 Достижения", "📊 Прогресс", "⚙️ Настройки"],
            index=0
        )
        
        # Быстрые действия
        st.markdown("---")
        st.markdown("### Быстрые действия")
        
        col1, col2 = st.columns(2)
        with col1:
            if st.button("🎯 Дневная цель"):
                st.session_state.points += config.DAILY_TASK_POINTS
                st.success(f"+{config.DAILY_TASK_POINTS} очков!")
                
        with col2:
            if st.button("🔄 Обновить"):
                st.rerun()
        
        # Кнопка выхода
        st.markdown("---")
        if st.button("🚪 Выйти"):
            st.session_state.clear()
            st.rerun()
    
    def render_chat_interface(self):
        """Интерфейс чата"""
        st.markdown("## 💬 Чат с Leo Assistant")
        
        # Контейнер для чата
        chat_container = st.container(height=500)
        
        with chat_container:
            for msg in st.session_state.chat_history:
                if msg['role'] == 'user':
                    st.markdown(f"""
                    <div style="background-color: #2E7D32; color: white; padding: 10px; 
                                border-radius: 10px; margin: 5px; max-width: 80%; 
                                float: right; clear: both;">
                        <strong>Вы:</strong> {msg['content']}
                    </div>
                    """, unsafe_allow_html=True)
                else:
                    st.markdown(f"""
                    <div style="background-color: #37474F; color: white; padding: 10px; 
                                border-radius: 10px; margin: 5px; max-width: 80%; 
                                float: left; clear: both;">
                        <strong>🤖 Лео:</strong> {msg['content']}
                    </div>
                    """, unsafe_allow_html=True)
        
        # Поле ввода
        col1, col2 = st.columns([5, 1])
        with col1:
            user_input = st.text_input(
                "Ваше сообщение:",
                placeholder="Задайте вопрос Лео...",
                label_visibility="collapsed"
            )
        
        with col2:
            send_button = st.button("Отправить", type="primary", use_container_width=True)
        
        if send_button and user_input:
            self.process_message(user_input)
    
    def process_message(self, message):
        """Обработка сообщения"""
        # Добавляем сообщение пользователя
        st.session_state.chat_history.append({
            'role': 'user',
            'content': message,
            'timestamp': datetime.now().isoformat()
        })
        
        # Показываем индикатор загрузки
        with st.spinner("🤖 Лео думает..."):
            # Получаем ответ от нейросети
            if self.nn:
                response = self.nn.generate_response(message, st.session_state.chat_history)
            else:
                response = "Извините, нейросеть временно недоступна."
            
            # Добавляем очки
            st.session_state.points += config.POINTS_PER_MESSAGE
            
            # Добавляем ответ в историю
            st.session_state.chat_history.append({
                'role': 'assistant',
                'content': response,
                'timestamp': datetime.now().isoformat()
            })
            
            # Проверяем достижения
            self.check_achievements()
            
            # Обновляем интерфейс
            st.rerun()
    
    def check_achievements(self):
        """Проверка достижений"""
        points = st.session_state.points
        
        if points >= 100 and "Первые 100 очков" not in st.session_state.achievements:
            st.session_state.achievements.append("Первые 100 очков")
            st.toast("🎉 Получено достижение: Первые 100 очков!")
        
        if points >= 500 and "Активный пользователь" not in st.session_state.achievements:
            st.session_state.achievements.append("Активный пользователь")
            st.toast("🎉 Получено достижение: Активный пользователь!")
    
    def render_game_elements(self):
        """Игровые элементы"""
        col1, col2, col3, col4 = st.columns(4)
        
        with col1:
            st.metric("🏆 Очки", st.session_state.points)
        
        with col2:
            st.metric("⭐ Уровень", st.session_state.level)
        
        with col3:
            st.metric("🎯 Достижения", len(st.session_state.achievements))
        
        with col4:
            st.metric("📊 Активность", "Высокая")
    
    def render_admin_panel(self):
        """Админ панель"""
        st.markdown("# ⚙️ Административная панель")
        
        tabs = st.tabs(["👥 Пользователи", "🤖 Нейросеть", "📊 Статистика", "⚙️ Настройки"])
        
        with tabs[0]:
            self.render_user_management()
        
        with tabs[1]:
            self.render_neural_network_management()
        
        with tabs[2]:
            self.render_statistics()
        
        with tabs[3]:
            self.render_system_settings()
    
    def render_user_management(self):
        """Управление пользователями"""
        st.subheader("Управление пользователями")
        
        # TODO: Реализовать управление пользователями
        st.info("Здесь будет управление пользователями")
    
    def render_neural_network_management(self):
        """Управление нейросетью"""
        st.subheader("Управление нейросетью")
        
        col1, col2 = st.columns(2)
        
        with col1:
            st.button("🔄 Переобучить нейросеть")
            st.button("📥 Экспорт знаний")
        
        with col2:
            st.button("📤 Импорт данных")
            st.button("🧹 Очистить кэш")
    
    def render_statistics(self):
        """Статистика"""
        st.subheader("Статистика использования")
        # TODO: Графики и статистика
    
    def render_system_settings(self):
        """Настройки системы"""
        st.subheader("Настройки системы")
        # TODO: Настройки
    
    def run(self):
        """Запуск приложения"""
        if st.session_state.user is None:
            self.render_login()
        else:
            if st.session_state.user['role'] == 'admin':
                self.render_admin_panel()
            else:
                self.render_main_interface()

# Запуск приложения
if __name__ == "__main__":
    app = LeoAssistantApp()
    app.run()
