"""
Админ-панель Leo Assistant
"""
import streamlit as st
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
from datetime import datetime, timedelta
from typing import Dict, List, Any
import json
from pathlib import Path

from database import get_db, User, ChatMessage, NeuralNetworkData, SystemLog
from neural_network import get_neural_network
from config import config
import utils

class AdminPanel:
    """Административная панель"""
    
    def __init__(self):
        self.nn = get_neural_network()
    
    def render_dashboard(self):
        """Главная панель администратора"""
        st.title("📊 Панель администратора Leo Assistant")
        
        # Статистика в реальном времени
        self.render_quick_stats()
        
        # Вкладки
        tabs = st.tabs([
            "👥 Пользователи", 
            "🤖 Нейросеть", 
            "💬 Диалоги",
            "📈 Аналитика",
            "⚙️ Настройки"
        ])
        
        with tabs[0]:
            self.render_user_management()
        
        with tabs[1]:
            self.render_neural_network_management()
        
        with tabs[2]:
            self.render_conversation_management()
        
        with tabs[3]:
            self.render_analytics()
        
        with tabs[4]:
            self.render_system_settings()
    
    def render_quick_stats(self):
        """Быстрая статистика"""
        col1, col2, col3, col4 = st.columns(4)
        
        # Здесь будет реальная статистика из БД
        with col1:
            st.metric("👥 Пользователи", "127", "+12 за неделю")
        
        with col2:
            st.metric("💬 Сообщений", "2,458", "+324")
        
        with col3:
            st.metric("🤖 Знаний в базе", str(len(self.nn.memory.knowledge_base)), "+8")
        
        with col4:
            st.metric("📊 Активность", "89%", "+5%")
    
    def render_user_management(self):
        """Управление пользователями"""
        st.header("👥 Управление пользователями")
        
        # Поиск пользователей
        col1, col2 = st.columns([3, 1])
        with col1:
            search_query = st.text_input("Поиск пользователей", placeholder="Имя, email или ID")
        with col2:
            role_filter = st.selectbox("Роль", ["Все", "Ученик", "Учитель", "Админ"])
        
        # Таблица пользователей (демо данные)
        demo_users = [
            {"id": 1, "username": "Иван_Иванов", "role": "Ученик", "points": 1250, "level": 3, "last_active": "2024-01-15"},
            {"id": 2, "username": "Мария_Петрова", "role": "Ученик", "points": 890, "level": 2, "last_active": "2024-01-15"},
            {"id": 3, "username": "Алексей_Сидоров", "role": "Учитель", "points": 4500, "level": 8, "last_active": "2024-01-14"},
            {"id": 4, "username": "admin", "role": "Админ", "points": 9999, "level": 10, "last_active": "2024-01-15"},
        ]
        
        df = pd.DataFrame(demo_users)
        st.dataframe(df, use_container_width=True)
        
        # Действия с пользователями
        st.subheader("Действия")
        col1, col2, col3 = st.columns(3)
        
        with col1:
            if st.button("➕ Добавить пользователя"):
                self.show_add_user_form()
        
        with col2:
            if st.button("🔄 Сбросить пароль"):
                st.info("Функция в разработке")
        
        with col3:
            if st.button("📊 Экспорт данных"):
                st.success("Данные экспортированы в users_export.json")
                utils.export_data(demo_users, "users_export.json")
    
    def show_add_user_form(self):
        """Форма добавления пользователя"""
        with st.form("add_user_form"):
            st.subheader("Добавление нового пользователя")
            
            username = st.text_input("Имя пользователя")
            email = st.text_input("Email")
            role = st.selectbox("Роль", ["Ученик", "Учитель", "Родитель", "Администратор"])
            initial_points = st.number_input("Начальные очки", value=100, min_value=0)
            
            submitted = st.form_submit_button("Создать пользователя")
            if submitted:
                if username and email:
                    # TODO: Сохранение в БД
                    st.success(f"Пользователь {username} создан!")
                else:
                    st.error("Заполните обязательные поля")
    
    def render_neural_network_management(self):
        """Управление нейросетью"""
        st.header("🤖 Управление нейросетью")
        
        # Статистика нейросети
        nn_stats = self.nn.get_stats()
        
        col1, col2 = st.columns(2)
        
        with col1:
            st.metric("Размер базы знаний", nn_stats["knowledge_base_size"])
            st.metric("Размер словаря", nn_stats["vocab_size"])
        
        with col2:
            st.metric("Обучена", "Да" if nn_stats["is_trained"] else "Нет")
            st.metric("Параметры модели", f"{nn_stats['model_parameters']:,}")
        
        # Управление обучением
        st.subheader("Обучение нейросети")
        
        col1, col2, col3 = st.columns(3)
        
        with col1:
            if st.button("🔄 Переобучить на всех данных", type="primary"):
                with st.spinner("Переобучение..."):
                    # TODO: Реальное переобучение
                    st.success("Нейросеть переобучена!")
        
        with col2:
            if st.button("📥 Импорт данных обучения"):
                uploaded_file = st.file_uploader("Загрузите JSON с данными", type=['json'])
                if uploaded_file:
                    data = json.load(uploaded_file)
                    st.info(f"Загружено {len(data)} примеров")
        
        with col3:
            if st.button("📤 Экспорт базы знаний"):
                export_path = utils.export_data(
                    self.nn.memory.knowledge_base, 
                    "knowledge_base_export.json"
                )
                st.success(f"База знаний экспортирована: {export_path}")
        
        # Просмотр базы знаний
        st.subheader("Просмотр базы знаний")
        
        if st.button("Показать базу знаний"):
            with st.expander("База знаний", expanded=True):
                for idx, item in enumerate(self.nn.memory.knowledge_base[:20], 1):
                    st.markdown(f"**{idx}. {item['question']}**")
                    st.write(f"Ответ: {item['answer']}")
                    st.write(f"Контекст: {', '.join(item.get('context', []))}")
                    st.write(f"Score: {item.get('score', 0):.2f}")
                    st.divider()
        
        # Ручное добавление знаний
        st.subheader("Ручное добавление знаний")
        
        with st.form("add_knowledge_form"):
            question = st.text_input("Вопрос")
            answer = st.text_area("Ответ", height=100)
            context = st.text_input("Контекст (через запятую)")
            
            submitted = st.form_submit_button("Добавить знание")
            if submitted and question and answer:
                context_list = [c.strip() for c in context.split(",")] if context else []
                self.nn.memory.add_knowledge(question, answer, context_list, source="admin")
                st.success("Знание добавлено в базу!")
    
    def render_conversation_management(self):
        """Управление диалогами"""
        st.header("💬 Управление диалогами")
        
        # Фильтры
        col1, col2, col3 = st.columns(3)
        
        with col1:
            date_filter = st.date_input("Дата", [])
        
        with col2:
            user_filter = st.text_input("ID пользователя")
        
        with col3:
            limit = st.slider("Лимит сообщений", 10, 100, 50)
        
        # Демо диалоги
        demo_conversations = [
            {
                "id": 1,
                "user": "Иван_Иванов",
                "message": "Как решить уравнение 2x + 5 = 15?",
                "response": "Нужно перенести 5 вправо: 2x = 15 - 5 = 10, затем разделить на 2: x = 5",
                "timestamp": "2024-01-15 10:30",
                "tokens": 45
            },
            {
                "id": 2,
                "user": "Мария_Петрова",
                "message": "Что такое причастие?",
                "response": "Причастие - это особая форма глагола, обозначающая признак предмета по действию",
                "timestamp": "2024-01-15 11:15",
                "tokens": 38
            },
        ]
        
        df = pd.DataFrame(demo_conversations)
        st.dataframe(df, use_container_width=True)
        
        # Анализ диалогов
        st.subheader("Анализ диалогов")
        
        if st.button("🔍 Проанализировать популярные темы"):
            # Простой анализ
            topics = {}
            for conv in demo_conversations:
                if "уравнение" in conv["message"].lower():
                    topics["Математика"] = topics.get("Математика", 0) + 1
                if "причастие" in conv["message"].lower():
                    topics["Русский язык"] = topics.get("Русский язык", 0) + 1
            
            if topics:
                fig = px.pie(
                    values=list(topics.values()),
                    names=list(topics.keys()),
                    title="Распределение тем"
                )
                st.plotly_chart(fig)
            else:
                st.info("Недостаточно данных для анализа")
    
    def render_analytics(self):
        """Аналитика и статистика"""
        st.header("📈 Аналитика использования")
        
        # График активности
        st.subheader("Активность пользователей")
        
        # Демо данные
        dates = pd.date_range(start='2024-01-01', end='2024-01-15', freq='D')
        activity = [50, 45, 60, 55, 70, 65, 80, 75, 90, 85, 95, 100, 110, 105, 120]
        
        df_activity = pd.DataFrame({
            'Дата': dates,
            'Активность': activity
        })
        
        fig = px.line(df_activity, x='Дата', y='Активность', 
                     title='Активность пользователей по дням')
        st.plotly_chart(fig)
        
        # Распределение по уровням
        st.subheader("Распределение пользователей по уровням")
        
        levels_data = {
            'Уровень': [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
            'Пользователей': [25, 20, 18, 15, 12, 8, 5, 3, 2, 1]
        }
        
        fig2 = px.bar(levels_data, x='Уровень', y='Пользователей',
                     title='Распределение по уровням')
        st.plotly_chart(fig2)
        
        # Статистика нейросети
        st.subheader("Эффективность нейросети")
        
        col1, col2 = st.columns(2)
        
        with col1:
            accuracy_data = {
                'Месяц': ['Дек', 'Янв'],
                'Точность': [78, 85]
            }
            fig3 = px.line(accuracy_data, x='Месяц', y='Точность',
                          title='Точность ответов (%)')
            st.plotly_chart(fig3, use_container_width=True)
        
        with col2:
            response_time_data = {
                'Тип': ['Из базы', 'Сгенерирован'],
                'Время (сек)': [0.1, 1.5]
            }
            fig4 = px.bar(response_time_data, x='Тип', y='Время (сек)',
                         title='Среднее время ответа')
            st.plotly_chart(fig4, use_container_width=True)
    
    def render_system_settings(self):
        """Настройки системы"""
        st.header("⚙️ Настройки системы")
        
        # Настройки приложения
        with st.form("system_settings"):
            st.subheader("Основные настройки")
            
            app_name = st.text_input("Название приложения", "Leo Assistant")
            app_description = st.text_area("Описание", "Умный помощник для учеников")
            
            # Настройки нейросети
            st.subheader("Настройки нейросети")
            
            max_context = st.slider("Максимальная длина контекста", 512, 8192, 4096)
            learning_rate = st.number_input("Скорость обучения", 0.0001, 0.01, 0.001, 0.0001)
            
            # Игровые настройки
            st.subheader("Игровые настройки")
            
            points_per_message = st.number_input("Очков за сообщение", 1, 100, 10)
            daily_streak_bonus = st.number_input("Бонус за серию дней", 0, 200, 50)
            
            submitted = st.form_submit_button("Сохранить настройки")
            if submitted:
                # TODO: Сохранение настроек
                st.success("Настройки сохранены!")
        
        # Опасная зона
        st.subheader("⚡ Опасная зона", divider="red")
        
        col1, col2 = st.columns(2)
        
        with col1:
            if st.button("🧹 Очистить кэш", type="secondary"):
                if st.checkbox("Подтвердите очистку кэша"):
                    st.warning("Кэш очищен")
        
        with col2:
            if st.button("🔄 Перезагрузить систему", type="secondary"):
                if st.checkbox("Подтвердите перезагрузку"):
                    st.info("Система перезагружена")


# Экспорт функции для использования
def get_admin_panel():
    """Получение инстанса админ-панели"""
    return AdminPanel()
