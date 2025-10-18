# 🤖 Telegram Bot

<div align="center">

![Telegram](https://img.shields.io/badge/Telegram-2CA5E0?style=for-the-badge&logo=telegram&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)

Мощный и масштабируемый Telegram бот с современным стеком технологий

[Установка](#-установка) • [Запуск](#-запуск) • [Конфигурация](#️-конфигурация)

</div>

## ✨ Особенности

- ⚡ **Высокая производительность** на Node.js и TypeScript
- 💾 **Надежное хранение данных** с Redis
- 🐳 **Полная контейнеризация** с Docker
- 🔧 **Простая настройка** через переменные окружения
- 🛠 **TypeScript** для надежной разработки

## 🚀 Быстрый старт

### Предварительные требования

- **Node.js** 18 или выше
- **npm** или **yarn**
- **Docker** и **Docker Compose** (рекомендуется)

### Настройте окружение
```shell
# Создайте файл .env из примера
cp .env.example .env
```
### Отредактируйте файл .env
```dotenv
# Обязательные переменные
TELEGRAM_KEY=your_bot_token_here
REDIS_URL=redis://bot-redis:6379

# Опциональные переменные
NODE_ENV=development
LOG_LEVEL=info
```
### 📥 Установка

1. **Клонируйте репозиторий**
```shell
git clone <your-repo-url>
cd telegram-bot
```
###  🐳 Запуск с Docker
1. **Простой запуск (рекомендуется)**
```shell
docker-compose up -d
```

2. **Сборка с обновлениями**
```shell
docker-compose up --build -d
```

3. **Остановка**
```shell
docker-compose down
```

4**Просмотр логов**
```shell
docker-compose logs -f bot
```

### 🏃 Запуск

1. **Development режим**
```shell
npm run dev
```

2. **Production режим**
```shell
npm run build
npm start
```
## ⚙️ Конфигурация

- ⚡ Найдите @BotFather в Telegram
- 💾 Отправьте команду /newbot
- 🐳 Следуйте инструкциям для создания бота
- 🔧 Скопируйте полученный токен в файл **.env**