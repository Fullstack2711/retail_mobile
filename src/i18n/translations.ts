export type Lang = 'uz' | 'ru' | 'en'

export type BranchKey = 'center' | 'west' | 'east' | 'downtown'

const uz = {
  tabs: { stats: 'Statistika', team: 'Jamoa', profile: 'Profil' },
  login: {
    welcome: 'Xush kelibsiz!',
    login: 'Login',
    password: 'Parol',
    usernamePlaceholder: 'Foydalanuvchi nomi',
    submit: 'Kirish',
    errorTitle: 'Xato',
    errorCredentials: "Login yoki parol noto'g'ri",
    errorUnsupportedRole: "Bu rol uchun ilova mavjud emas.",
    usernameRequired: 'Login kiritilmadi',
    passwordRequired: 'Parol kiritilmadi',
    passwordMin: 'Parol kamida 6 ta belgi',
  },
  stats: {
    title: 'Umumiy ko‘rinish',
    subtitle: 'Biznes samaradorligi',
    totalCustomers: 'Jami mijozlar',
    amountSold: 'Sotilgan soni',
    trafficTitle: 'Trafik va konversiya',
    visitors: 'Tashrif buyuruvchilar',
    buyers: 'Xaridorlar',
    hotMap: 'Issiqlik xaritasi',
    channels: 'Kanallar',
    percent: 'Foiz',
    total: 'Jami',
    floor1hall1: '1-qavat, 1-zal',
    floor1hall2: '1-qavat, 2-zal',
    floor2: '2-qavat',
    periodFilterTitle: 'Davr',
    periodDaily: 'Kunlik',
    periodWeekly: 'Haftalik',
    periodMonthly: 'Oylik',
    hotMapEmpty: "Ma'lumot yo'q",
    chartScrollHint: 'Barcha kunlarni ko‘rish uchun suring →',
  },
  team: {
    title: 'Savdo jamoasi',
    subtitle: 'Xodimlaringizni boshqaring',
    empty: "Bu filialda xodim yo'q",
    sales: 'Savdo',
    purchased: 'Sotilgan',
    sold: 'Sotilgan',
    visitors: 'Kelgan mijozlar',
    branchAll: 'Barcha filiallar',
    branchCenter: 'Markaz',
    branchWest: 'G‘arb plazasi',
    branchEast: 'Sharq darvozasi',
    branchDowntown: 'Shahar markazi',
  },
  profile: {
    title: 'Profil',
    name: 'Ism',
    phone: 'Telefon',
    language: 'Til',
    appearance: 'Ko‘rinish',
    logOut: 'Chiqish',
    logOutConfirm: 'Chiqishni xohlaysizmi?',
    cancel: 'Bekor qilish',
    exit: 'Chiqish',
    langSheetTitle: 'Ilova tili',
    themeSheetTitle: 'Mavzu',
    themeLight: 'Yorug‘',
    themeDark: 'Qorong‘u',
    editNameTitle: 'Ismni tahrirlash',
    editPhoneTitle: 'Telefonni tahrirlash',
    namePlaceholder: 'Ismingiz',
    phonePlaceholder: '+998 90 123 45 67',
    save: 'Saqlash',
    saveError: 'Profilni saqlab bo‘lmadi',
  },
  seller: {
    feedTitle: 'Jonli kamera',
    feedSubtitle: 'Biznes samaradorligi',
    salesTitle: 'Mening savdolarim',
    salesSubtitle: 'Savdo tarixi',
    recordTitle: 'Faoliyatni yozish',
    editTitle: 'Savdoni tahrirlash',
    idLabel: 'ID',
    bought: 'Sotib oldi',
    notBought: 'Sotib olmadi',
    comments: 'Izohlar',
    commentPlaceholder: 'Izoh yozing...',
    save: 'Saqlash',
    feedEmpty: "Kutilayotgan tashriflar yo'q",
    historyEmpty: 'Savdo tarixi bo‘sh',
    noComment: 'Izohsiz',
    loadError: 'Ma’lumot yuklanmadi',
    saveError: 'Saqlab bo‘lmadi',
    retry: 'Qayta urinish',
    loadingMore: 'Yuklanmoqda...',
    statusPending: 'Kutilmoqda',
    statusPurchased: 'Sotib olgan',
    statusNotPurchased: 'Sotib olmagan',
  },
}

type Messages = {
  tabs: { stats: string; team: string; profile: string }
  login: {
    welcome: string
    login: string
    password: string
    usernamePlaceholder: string
    submit: string
    errorTitle: string
    errorCredentials: string
    errorUnsupportedRole: string
    usernameRequired: string
    passwordRequired: string
    passwordMin: string
  }
  stats: {
    title: string
    subtitle: string
    totalCustomers: string
    amountSold: string
    trafficTitle: string
    visitors: string
    buyers: string
    hotMap: string
    channels: string
    percent: string
    total: string
    floor1hall1: string
    floor1hall2: string
    floor2: string
    periodFilterTitle: string
    periodDaily: string
    periodWeekly: string
    periodMonthly: string
    hotMapEmpty: string
    chartScrollHint: string
  }
  team: {
    title: string
    subtitle: string
    empty: string
    sales: string
    purchased: string
    sold: string
    visitors: string
    branchAll: string
    branchCenter: string
    branchWest: string
    branchEast: string
    branchDowntown: string
  }
  profile: {
    title: string
    name: string
    phone: string
    language: string
    appearance: string
    logOut: string
    logOutConfirm: string
    cancel: string
    exit: string
    langSheetTitle: string
    themeSheetTitle: string
    themeLight: string
    themeDark: string
    editNameTitle: string
    editPhoneTitle: string
    namePlaceholder: string
    phonePlaceholder: string
    save: string
    saveError: string
  }
  seller: {
    feedTitle: string
    feedSubtitle: string
    salesTitle: string
    salesSubtitle: string
    recordTitle: string
    editTitle: string
    idLabel: string
    bought: string
    notBought: string
    comments: string
    commentPlaceholder: string
    save: string
    feedEmpty: string
    historyEmpty: string
    noComment: string
    loadError: string
    saveError: string
    retry: string
    loadingMore: string
    statusPending: string
    statusPurchased: string
    statusNotPurchased: string
  }
}

const ru: Messages = {
  tabs: { stats: 'Статистика', team: 'Команда', profile: 'Профиль' },
  login: {
    welcome: 'С возвращением!',
    login: 'Логин',
    password: 'Пароль',
    usernamePlaceholder: 'Имя пользователя',
    submit: 'Войти',
    errorTitle: 'Ошибка',
    errorCredentials: 'Неверный логин или пароль',
    errorUnsupportedRole: 'Приложение недоступно для этой роли.',
    usernameRequired: 'Введите логин',
    passwordRequired: 'Введите пароль',
    passwordMin: 'Пароль минимум 6 символов',
  },
  stats: {
    title: 'Обзор',
    subtitle: 'Эффективность бизнеса',
    totalCustomers: 'Всего клиентов',
    amountSold: 'Количество продаж',
    trafficTitle: 'Трафик и конверсии',
    visitors: 'Посетители',
    buyers: 'Покупатели',
    hotMap: 'Тепловая карта',
    channels: 'Каналы',
    percent: 'Процент',
    total: 'Итого',
    floor1hall1: '1 этаж, зал 1',
    floor1hall2: '1 этаж, зал 2',
    floor2: '2 этаж',
    periodFilterTitle: 'Период',
    periodDaily: 'День',
    periodWeekly: 'Неделя',
    periodMonthly: 'Месяц',
    hotMapEmpty: 'Нет данных',
    chartScrollHint: 'Проведите влево/вправо для всех дней →',
  },
  team: {
    title: 'Команда продаж',
    subtitle: 'Управление персоналом',
    empty: 'В этом филиале нет сотрудников',
    sales: 'Продажи',
    purchased: 'Куплено',
    sold: 'Продано',
    visitors: 'Посетители',
    branchAll: 'Все филиалы',
    branchCenter: 'Центр',
    branchWest: 'West Plaza',
    branchEast: 'East Gate',
    branchDowntown: 'Downtown',
  },
  profile: {
    title: 'Профиль',
    name: 'Имя',
    phone: 'Телефон',
    language: 'Язык',
    appearance: 'Оформление',
    logOut: 'Выйти',
    logOutConfirm: 'Выйти из системы?',
    cancel: 'Отмена',
    exit: 'Выйти',
    langSheetTitle: 'Язык приложения',
    themeSheetTitle: 'Тема',
    themeLight: 'Светлая',
    themeDark: 'Тёмная',
    editNameTitle: 'Изменить имя',
    editPhoneTitle: 'Изменить телефон',
    namePlaceholder: 'Ваше имя',
    phonePlaceholder: '+998 90 123 45 67',
    save: 'Сохранить',
    saveError: 'Не удалось сохранить профиль',
  },
  seller: {
    feedTitle: 'Прямая трансляция',
    feedSubtitle: 'Эффективность бизнеса',
    salesTitle: 'Мои продажи',
    salesSubtitle: 'История продаж',
    recordTitle: 'Запись активности',
    editTitle: 'Редактировать продажу',
    idLabel: 'ID',
    bought: 'Купил',
    notBought: 'Не купил',
    comments: 'Комментарии',
    commentPlaceholder: 'Введите комментарий...',
    save: 'Сохранить',
    feedEmpty: 'Нет ожидающих визитов',
    historyEmpty: 'История продаж пуста',
    noComment: 'Без комментария',
    loadError: 'Не удалось загрузить данные',
    saveError: 'Не удалось сохранить',
    retry: 'Повторить',
    loadingMore: 'Загрузка...',
    statusPending: 'Ожидает',
    statusPurchased: 'Купил',
    statusNotPurchased: 'Не купил',
  },
}

const en: Messages = {
  tabs: { stats: 'Stats', team: 'Team', profile: 'Profile' },
  login: {
    welcome: 'Welcome back!',
    login: 'Login',
    password: 'Password',
    usernamePlaceholder: 'Username',
    submit: 'Login',
    errorTitle: 'Error',
    errorCredentials: 'Invalid username or password',
    errorUnsupportedRole: 'This app is not available for your role.',
    usernameRequired: 'Login is required',
    passwordRequired: 'Password is required',
    passwordMin: 'Password must be at least 6 characters',
  },
  stats: {
    title: 'Overview',
    subtitle: 'Business Performance',
    totalCustomers: 'Total Customers',
    amountSold: 'Sales Count',
    trafficTitle: 'Traffic & Conversions',
    visitors: 'Visitors',
    buyers: 'Buyers',
    hotMap: 'Hot Map',
    channels: 'Channels',
    percent: 'Percent',
    total: 'Total',
    floor1hall1: 'Floor 1, Hall 1',
    floor1hall2: 'Floor 1, Hall 2',
    floor2: 'Floor 2',
    periodFilterTitle: 'Period',
    periodDaily: 'Daily',
    periodWeekly: 'Weekly',
    periodMonthly: 'Monthly',
    hotMapEmpty: 'No data',
    chartScrollHint: 'Swipe to see all days →',
  },
  team: {
    title: 'Sales Team',
    subtitle: 'Manage your staff',
    empty: 'No staff in this branch',
    sales: 'Sales',
    purchased: 'Purchased',
    sold: 'Sold',
    visitors: 'Visitors',
    branchAll: 'All Branches',
    branchCenter: 'Center',
    branchWest: 'West Plaza',
    branchEast: 'East Gate',
    branchDowntown: 'Downtown',
  },
  profile: {
    title: 'Profile',
    name: 'Name',
    phone: 'Phone',
    language: 'Language',
    appearance: 'Appearance',
    logOut: 'Log Out',
    logOutConfirm: 'Do you want to log out?',
    cancel: 'Cancel',
    exit: 'Log Out',
    langSheetTitle: 'App Language',
    themeSheetTitle: 'Appearance',
    themeLight: 'Light',
    themeDark: 'Dark',
    editNameTitle: 'Edit name',
    editPhoneTitle: 'Edit phone',
    namePlaceholder: 'Your name',
    phonePlaceholder: '+998 90 123 45 67',
    save: 'Save',
    saveError: 'Failed to save profile',
  },
  seller: {
    feedTitle: 'Live Camera Feed',
    feedSubtitle: 'Business Performance',
    salesTitle: 'My Sales',
    salesSubtitle: 'My Sales History',
    recordTitle: 'Record Activity',
    editTitle: 'Edit sale',
    idLabel: 'ID',
    bought: 'Bought',
    notBought: 'Not Bought',
    comments: 'Comments',
    commentPlaceholder: 'Placeholder text...',
    save: 'Save',
    feedEmpty: 'No pending visitors',
    historyEmpty: 'Sales history is empty',
    noComment: 'No comment',
    loadError: 'Failed to load data',
    saveError: 'Failed to save',
    retry: 'Retry',
    loadingMore: 'Loading...',
    statusPending: 'Pending',
    statusPurchased: 'Purchased',
    statusNotPurchased: 'Not purchased',
  },
}

export const translations: Record<Lang, Messages> = { uz, ru, en }

export type TranslationTree = Messages

export function branchLabel(lang: Lang, key: BranchKey | 'all'): string {
  const t = translations[lang].team
  const map: Record<BranchKey | 'all', string> = {
    all: t.branchAll,
    center: t.branchCenter,
    west: t.branchWest,
    east: t.branchEast,
    downtown: t.branchDowntown,
  }
  return map[key]
}
