import type { FulfillmentMethod, PurchaseStatus, Role, ShopCategory, SprintStatus, TaskPriority, TaskStatus } from '@/types/api';

export const roleLabels: Record<Role, string> = {
  ADMIN: 'Администратор',
  PROJECT_MANAGER: 'Quest Master',
  EMPLOYEE: 'Сотрудник',
};

export const roleDescriptions: Record<Role, string> = {
  ADMIN: 'Полные права: управление ролями, проектами, квестами, магазином и всеми сущностями системы.',
  PROJECT_MANAGER: 'Руководитель квестов: может создавать, редактировать, запускать, завершать и удалять квесты-спринты, а также собирать party.',
  EMPLOYEE: 'Обычный участник: выполняет задачи, получает монеты, пишет в чат команды и покупает товары в магазине.',
};

export const sprintStatusLabels: Record<SprintStatus, string> = {
  PLANNED: 'Запланирован',
  ACTIVE: 'Активен',
  COMPLETED: 'Завершён',
  CANCELLED: 'Отменён',
};

export const taskStatusLabels: Record<TaskStatus, string> = {
  BACKLOG: 'Бэклог',
  TODO: 'К выполнению',
  IN_PROGRESS: 'В работе',
  REVIEW: 'На проверке',
  DONE: 'Выполнено',
};

export const taskPriorityLabels: Record<TaskPriority, string> = {
  LOW: 'низкий',
  MEDIUM: 'средний',
  HIGH: 'высокий',
  CRITICAL: 'критический',
};

export const shopCategoryLabels: Record<ShopCategory, string> = {
  MERCH: 'Мерч',
  VACATION_HOURS: 'Отгулы',
  PROFILE_CUSTOMIZATION: 'Оформление профиля',
  BADGE: 'Бейджи',
};

export const fulfillmentMethodLabels: Record<FulfillmentMethod, string> = {
  NOT_SELECTED: 'Не выбран',
  PICKUP: 'Самовывоз',
  DELIVERY: 'Доставка',
  TIME_OFF_ACTIVATION: 'Отгул активирован',
  PROFILE_CUSTOMIZATION_ACTIVATION: 'Оформление профиля активировано',
};

export const purchaseStatusLabels: Record<PurchaseStatus, string> = {
  OWNED: 'В инвентаре',
  FULFILLMENT_REQUESTED: 'Ожидает выдачи',
  TIME_OFF_ACTIVATED: 'Отгул активирован',
  PROFILE_FRAME_ACTIVATED: 'Золотая рамка активирована',
};

const achievementTitleByCode: Record<string, string> = {
  FIRST_TASK: 'Первая задача',
  COINS_100: '100 монет',
  COINS_500: '500 монет',
  SPRINT_HERO: 'Герой спринта',
  LEVEL_5: '5 уровень',
  LEVEL_10: '10 уровень',
  TASKS_10: '10 выполненных задач',
  TASKS_50: '50 выполненных задач',
  SHOP_FIRST_PURCHASE: 'Первая покупка',
};

const achievementDescriptionByCode: Record<string, string> = {
  FIRST_TASK: 'Выполните первую миссию',
  COINS_100: 'Накопите 100 монет',
  COINS_500: 'Накопите 500 монет',
  SPRINT_HERO: 'Завершите все задачи активного квеста',
  LEVEL_5: 'Достигните 5 уровня',
  LEVEL_10: 'Достигните 10 уровня',
  TASKS_10: 'Выполните 10 миссий',
  TASKS_50: 'Выполните 50 миссий',
  SHOP_FIRST_PURCHASE: 'Купите любой предмет в магазине',
};

const textTranslations: Record<string, string> = {
  Dashboard: 'Панель управления',
  NEW: 'Новое',
  'Internal server error': 'Внутренняя ошибка сервера',
  'Validation failed': 'Ошибка проверки данных',
  'Invalid email or password': 'Неверный email или пароль',
  'Access denied': 'Доступ запрещён',
  'User not found': 'Пользователь не найден',
  'Project not found': 'Проект не найден',
  'Quest not found': 'Квест не найден',
  'Task not found': 'Задача не найдена',
  'Item not found': 'Товар не найден',
  'Email already registered': 'Пользователь с таким email уже зарегистрирован',
  'Not enough coins': 'Недостаточно монет',
  'Not enough stock': 'Недостаточно товара на складе',
  'User already in project': 'Пользователь уже добавлен в проект',
  'User already in party': 'Пользователь уже состоит в команде квеста',
  'User must be a member of the project before joining the quest party': 'Пользователь должен быть участником проекта перед добавлением в команду квеста',
  'End date must be after start date': 'Дата окончания должна быть позже даты начала',
  'QuestParty Hoodie': 'Худи QuestParty',
  'Company merch': 'Корпоративный мерч',
  'Bonus Vacation (+4h)': 'Бонусный отгул (+4 часа)',
  'Extra time off': 'Дополнительное свободное время',
  'Golden Avatar Frame': 'Золотая рамка аватара',
  'Profile customization': 'Оформление профиля',
  'Золотая рамка активирована': 'Золотая рамка активирована',
  'Рамка отображается вокруг аватара': 'Рамка отображается вокруг аватара',
  'Sprint Hero Badge': 'Бейдж героя спринта',
  'Exclusive badge': 'Эксклюзивный бейдж',
  'Dragon Release': 'Релиз «Дракон»',
  'Main product quest line for Q2': 'Основная продуктовая квест-линия',
  'Guild Onboarding': 'Онбординг гильдии',
  'Internal HR gamification pilot': 'Пилот геймификации HR-процессов',
  'Quest: Castle Gate': 'Квест: Ворота замка',
  'First sprint — authentication & core API': 'Первый спринт: авторизация и базовый API',
  'Quest: Dragon Lair': 'Квест: Логово дракона',
  'Kanban, shop, realtime chat': 'Канбан, магазин и чат в реальном времени',
  'Quest: New Recruits': 'Квест: Новобранцы',
  'Onboarding missions': 'Онбординг-миссии',
  'Setup MySQL + Flyway': 'Настроить MySQL + Flyway',
  'Database migrations and seed': 'Миграции базы данных и тестовые данные',
  'JWT Security hardening': 'Усиление JWT-безопасности',
  'Validate tokens and roles': 'Проверка токенов и ролей',
  'Kanban move API': 'API перемещения карточек канбана',
  'PATCH /tasks/{id}/move': 'PATCH /tasks/{id}/move',
  'WebSocket chat': 'WebSocket-чат',
  'STOMP sprint chat': 'STOMP-чат спринта',
  'Achievement engine': 'Движок достижений',
  'Unlock on task complete': 'Открытие достижений после выполнения задач',
  'Welcome tour mission': 'Приветственная миссия',
  'Complete profile setup': 'Заполнить профиль',
  'Purchase successful': 'Покупка оформлена',
  'Joined quest party': 'Вы добавлены в команду квеста',
  'Quest started': 'Квест начался',
  'Quest completed': 'Квест завершён',
  'Achievement unlocked': 'Достижение открыто',
  'New mission': 'Новая миссия',
  'New mission assigned': 'Назначена новая миссия',
  'Mission completed': 'Миссия выполнена',
  'Level up!': 'Новый уровень!',
  'Нужна роль администратора или Quest Master': 'Нужна роль администратора или Quest Master',
  'Нельзя менять роль собственной учетной записи': 'Нельзя менять роль собственной учётной записи',
  'Нельзя удалить роль у последнего администратора': 'Нельзя удалить роль у последнего администратора',
};

export function translateText(value?: string | null): string {
  if (!value) return '';
  return textTranslations[value] ?? value;
}

export function translateAchievementTitle(code: string, fallback: string): string {
  return achievementTitleByCode[code] ?? translateText(fallback);
}

export function translateAchievementDescription(code: string, fallback?: string | null): string {
  return achievementDescriptionByCode[code] ?? translateText(fallback ?? '');
}

export function translateRewardMessage(message: string): string {
  const rewardMatch = message.match(/^Rewards: \+(\d+) XP, \+(\d+) coins$/);
  if (rewardMatch) {
    return `Награда: +${rewardMatch[1]} опыта, +${rewardMatch[2]} монет`;
  }
  const levelMatch = message.match(/^You reached level (\d+)$/);
  if (levelMatch) {
    return `Вы достигли уровня ${levelMatch[1]}`;
  }
  return translateText(message);
}

export function translateApiMessage(message?: string | null): string {
  if (!message) return 'Неизвестная ошибка';
  return translateText(message);
}
