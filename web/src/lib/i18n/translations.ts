export type Language = "ky" | "ru" | "en";

export interface Translations {
  nav: {
    home: string;
    catalog: string;
    aitu: string;
    aituBadge: string;
    bookmarks: string;
    profile: string;
    login: string;
    logout: string;
    searchPlaceholder: string;
    searchHint: string;
  };
  home: {
    heroBadge: string;
    heroTitle: string;
    heroTitleHighlight: string;
    heroDesc: string;
    startReading: string;
    talkToAitu: string;
    bestCollections: string;
    recommended: string;
    genresTitle: string;
    viewAll: string;
    aituBannerTitle: string;
    aituBannerDesc: string;
    aituBannerFeature1: string;
    aituBannerFeature2: string;
    aituBannerBtn: string;
    manasTitle: string;
    manasDesc: string;
  };
  catalog: {
    title: string;
    subtitle: string;
    searchPlaceholder: string;
    allGenres: string;
    noBooksFound: string;
    noBooksHint: string;
  };
  book: {
    startReading: string;
    discussAitu: string;
    synopsis: string;
    chapters: string;
    chapterNumber: string;
    otherWorks: string;
    unknownAuthor: string;
    notFound: string;
    backToCatalog: string;
  };
  author: {
    title: string;
    birthYear: string;
    moreWiki: string;
    booksByAuthor: string;
    noBooks: string;
    read: string;
  };
  aitu: {
    title: string;
    welcomeTitle: string;
    welcomeDesc: string;
    quickPrompts: string[];
    inputPlaceholder: string;
    copy: string;
    copied: string;
    newChat: string;
    history: string;
    noHistory: string;
    context: string;
  };
  bookmarks: {
    title: string;
    subtitle: string;
    loginPrompt: string;
    loginPromptDesc: string;
    loginBtn: string;
    continueReading: string;
    noBookmarks: string;
    noBookmarksDesc: string;
    chooseBook: string;
  };
  profile: {
    title: string;
    subtitle: string;
    loginPrompt: string;
    loginPromptDesc: string;
    readerRole: string;
    email: string;
    notSpecified: string;
    security: string;
    jwtProtected: string;
    logout: string;
  };
  auth: {
    welcomeBack: string;
    welcomeBackDesc: string;
    newRegister: string;
    newRegisterDesc: string;
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
    loginBtn: string;
    registerBtn: string;
    noAccount: string;
    haveAccount: string;
    loginLink: string;
    registerLink: string;
    passwordsDoNotMatch: string;
    passwordMinLength: string;
    fillAllFields: string;
  };
  reader: {
    back: string;
    chapter: string;
    of: string;
    toc: string;
    typography: string;
    theme: string;
    fontSize: string;
    lineHeight: string;
    fontFamily: string;
    fullscreen: string;
    saveBookmark: string;
    readPercent: string;
    prevChapter: string;
    nextChapter: string;
    themes: {
      light: string;
      sepia: string;
      dark: string;
      oled: string;
    };
  };
}

export const translations: Record<Language, Translations> = {
  ky: {
    nav: {
      home: "Башкы",
      catalog: "Китепкана",
      aitu: "Aitu AI",
      aituBadge: "ИИ",
      bookmarks: "Сакталгандар",
      profile: "Профиль",
      login: "Кирүү",
      logout: "Чыгуу",
      searchPlaceholder: "Китеп же автор издөө…",
      searchHint: "Издөө үчүн китептин же автордун атын жазыңыз",
    },
    home: {
      heroBadge: "Кыргыз адабиятынын санарип платформасы",
      heroTitle: "Кыргыз адабиятын",
      heroTitleHighlight: "жаңы деңгээлде",
      heroDesc: "«Манас» эпосунан заманбап повесттерге чейин: бардык китептер акылдуу веб-читка, 4 ыңгайлуу түс темасы жана ИИ-ассистент Aitu менен бирге.",
      startReading: "Окууну баштоо",
      talkToAitu: "Aitu AI менен сүйлөшүү",
      bestCollections: "Эң мыкты жыйнактар",
      recommended: "Сунушталган китептер",
      genresTitle: "Жанрлар боюнча тандоо",
      viewAll: "Баарын көрүү",
      aituBannerTitle: "Кыргыз адабиятынын акылдуу жардамчысы",
      aituBannerDesc: "Aitu — каалаган чыгарманын идеясын, каармандарынын образын жана тарыхый мазмунун кыргыз тилинде заматта түшүндүрүп берет.",
      aituBannerFeature1: "Текстти терең талдоо",
      aituBannerFeature2: "Реалдуу убакытта баарлашуу",
      aituBannerBtn: "Aitu менен сүйлөшүү",
      manasTitle: "«Манас» эпосу",
      manasDesc: "Кыргыз элинин баатырдык улуу дастаны, дүйнөлүк маданий мурастын туу чокусу.",
    },
    catalog: {
      title: "Китептер каталогу",
      subtitle: "Кыргыз адабиятынын классикалык жана заманбап чыгармаларын табыңыз.",
      searchPlaceholder: "Китептин же автордун аты боюнча издөө…",
      allGenres: "Бардыгы",
      noBooksFound: "Китептер табылган жок",
      noBooksHint: "Издөө сөзүн же жанр чыпкасын өзгөртүп көрүңүз.",
    },
    book: {
      startReading: "Окууну баштоо",
      discussAitu: "Aitu менен талкуулоо",
      synopsis: "Чыгарманын баяндамасы",
      chapters: "Китептин бөлүмдөрү",
      chapterNumber: "бөлүм",
      otherWorks: "Автордун башка чыгармалары",
      unknownAuthor: "Белгисиз автор",
      notFound: "Китеп табылган жок",
      backToCatalog: "Каталогго кайтуу",
    },
    author: {
      title: "Өмүр баяны жана чыгармалары",
      birthYear: "Туулган жылы",
      moreWiki: "Википедиядан кененирээк маалымат",
      booksByAuthor: "Жарыяланган чыгармалары",
      noBooks: "Бул автордун китептери азырынча жүктөлө элек.",
      read: "Окуу",
    },
    aitu: {
      title: "Aitu AI Ассистент",
      welcomeTitle: "Aitu AI жардамчысына кош келиңиз!",
      welcomeDesc: "Кыргыз адабияты, эпостор, Чыңгыз Айтматовдун чыгармалары же каармандардын талдоосу боюнча каалаган сурооңузду бериңиз.",
      quickPrompts: [
        "«Манас» эпосунун негизги идеясы кайсы?",
        "Чыңгыз Айтматовдун «Кылым карытар бир күн» чыгармасы",
        "Курманжан Датка тууралуу чыгармалар",
        "Сүймөнкул Чокморов жөнүндө маалымат",
      ],
      inputPlaceholder: "Aitu'га кыргыз адабияты боюнча суроо бериңиз… (Enter жөнөтүү)",
      copy: "Көчүрүү",
      copied: "Көчүрүлдү",
      newChat: "Жаңы диалог",
      history: "Сүйлөшүүлөр тарыхы",
      noHistory: "Азырынча сүйлөшүүлөр жок",
      context: "Контекст",
    },
    bookmarks: {
      title: "Сакталган бетбелгилер",
      subtitle: "Сиз белгилеп койгон китептер жана акыркы токтогон жерлериңиз.",
      loginPrompt: "Сакталгандарды көрүү үчүн кириңиз",
      loginPromptDesc: "Окуу прогрессиңизди жана кыстармаларыңызды сактоо үчүн аккаунтуңузга кириңиз.",
      loginBtn: "Кирүү",
      continueReading: "Окууну улантуу",
      noBookmarks: "Азырынча сакталган бетбелгилер жок",
      noBookmarksDesc: "Китепти окуп жатканда жогорку тилкедеги бетбелги баскычын басып, каалаган баракты сактап койсоңуз болот.",
      chooseBook: "Китеп тандоо",
    },
    profile: {
      title: "Жеке кабинет",
      subtitle: "Колдонуучунун маалыматтары жана коопсуздук параметрлери.",
      loginPrompt: "Профилди көрүү үчүн кириңиз",
      loginPromptDesc: "Жеке кабинетке кирүү үчүн аккаунтуңузга кириңиз же жаңы каттоодон өтүңүз.",
      readerRole: "Okuulib Окурманы",
      email: "Электрондук почта",
      notSpecified: "көрсөтүлгөн эмес",
      security: "Коопсуздук",
      jwtProtected: "JWT Корголгон",
      logout: "Чыгуу",
    },
    auth: {
      welcomeBack: "Кайра кош келиңиз",
      welcomeBackDesc: "Окууну улантуу үчүн аккаунтуңузга кириңиз",
      newRegister: "Жаңы каттоо",
      newRegisterDesc: "Okuulib платформасына кошулуп, кыргыз адабиятын онлайн окуңуз",
      username: "Колдонуучу аты (Логин)",
      email: "Электрондук почта (Email)",
      password: "Сырсөз",
      confirmPassword: "Сырсөздү кайталаңыз",
      loginBtn: "Кирүү",
      registerBtn: "Катталуу",
      noAccount: "Аккаунтуңуз жокпу?",
      haveAccount: "Аккаунтуңуз барбы?",
      loginLink: "Кирүү",
      registerLink: "Катталуу",
      passwordsDoNotMatch: "Сырсөздөр дал келген жок.",
      passwordMinLength: "Сырсөз кеминде 6 символдон турушу керек.",
      fillAllFields: "Логин жана сырсөздү киргизиңиз.",
    },
    reader: {
      back: "Артка",
      chapter: "бөлүм",
      of: "ичинен",
      toc: "Мазмуну",
      typography: "Шрифт жана темалар",
      theme: "Түс темасы",
      fontSize: "Шрифт өлчөмү",
      lineHeight: "Сап аралыгы",
      fontFamily: "Шрифттин түрү",
      fullscreen: "Толук экран",
      saveBookmark: "Кыстарма сактоо",
      readPercent: "окулду",
      prevChapter: "Мурунку бөлүм",
      nextChapter: "Кийинки бөлүм",
      themes: {
        light: "Жарык",
        sepia: "Сепия",
        dark: "Караңгы",
        oled: "OLED",
      },
    },
  },
  ru: {
    nav: {
      home: "Главная",
      catalog: "Библиотека",
      aitu: "Aitu AI",
      aituBadge: "ИИ",
      bookmarks: "Закладки",
      profile: "Профиль",
      login: "Войти",
      logout: "Выйти",
      searchPlaceholder: "Поиск книг или авторов…",
      searchHint: "Введите название книги или имя автора для поиска",
    },
    home: {
      heroBadge: "Цифровая платформа кыргызской литературы",
      heroTitle: "Кыргызская литература на",
      heroTitleHighlight: "новом уровне",
      heroDesc: "От эпоса «Манас» до современной классики: все книги в адаптивной читалке с 4 темами оформления и интеллектуальным ИИ-ассистентом Aitu.",
      startReading: "Начать чтение",
      talkToAitu: "Общаться с Aitu AI",
      bestCollections: "Лучшие коллекции",
      recommended: "Рекомендуемые книги",
      genresTitle: "Выбор по жанрам",
      viewAll: "Смотреть все",
      aituBannerTitle: "Умный помощник по литературе",
      aituBannerDesc: "Aitu поможет глубоко понять смысл произведений, психологию персонажей и исторический контекст эпосов на кыргызском, русском и английском языках.",
      aituBannerFeature1: "Глубокий анализ текстов",
      aituBannerFeature2: "Ответы в реальном времени",
      aituBannerBtn: "Общаться с Aitu",
      manasTitle: "Эпос «Манас»",
      manasDesc: "Великий героический эпос кыргызского народа, шедевр мирового культурного наследия.",
    },
    catalog: {
      title: "Каталог книг",
      subtitle: "Откройте для себя классические и современные произведения кыргызской литературы.",
      searchPlaceholder: "Поиск по названию или автору…",
      allGenres: "Все жанры",
      noBooksFound: "Книги не найдены",
      noBooksHint: "Попробуйте изменить поисковый запрос или фильтр по жанру.",
    },
    book: {
      startReading: "Начать чтение",
      discussAitu: "Обсудить с Aitu",
      synopsis: "Аннотация произведения",
      chapters: "Оглавление и главы",
      chapterNumber: "глава",
      otherWorks: "Другие книги автора",
      unknownAuthor: "Неизвестный автор",
      notFound: "Книга не найдена",
      backToCatalog: "Вернуться в каталог",
    },
    author: {
      title: "Биография и произведения",
      birthYear: "Год рождения",
      moreWiki: "Подробнее в Википедии",
      booksByAuthor: "Опубликованные произведения",
      noBooks: "Книги этого автора пока не добавлены.",
      read: "Читать",
    },
    aitu: {
      title: "Aitu AI Ассистент",
      welcomeTitle: "Добро пожаловать в Aitu AI!",
      welcomeDesc: "Задайте любой вопрос по кыргызской литературе, эпосам, романам Чингиза Айтматова или анализу персонажей.",
      quickPrompts: [
        "В чем главная идея эпоса «Манас»?",
        "Смысл романа «И дольше века длится день»",
        "Произведения о Курманжан Датке",
        "Расскажи о Суйменкуле Чокморове",
      ],
      inputPlaceholder: "Задайте вопрос Aitu по литературе… (Enter для отправки)",
      copy: "Копировать",
      copied: "Скопировано",
      newChat: "Новый диалог",
      history: "История диалогов",
      noHistory: "Пока нет диалогов",
      context: "Контекст",
    },
    bookmarks: {
      title: "Сохраненные закладки",
      subtitle: "Отмеченные вами книги и места, где вы остановились.",
      loginPrompt: "Войдите для просмотра закладок",
      loginPromptDesc: "Авторизуйтесь, чтобы сохранять прогресс чтения и закладки на всех устройствах.",
      loginBtn: "Войти",
      continueReading: "Продолжить чтение",
      noBookmarks: "Закладок пока нет",
      noBookmarksDesc: "Во время чтения нажмите на иконку закладки в верхнем меню, чтобы сохранить нужный фрагмент.",
      chooseBook: "Выбрать книгу",
    },
    profile: {
      title: "Личный кабинет",
      subtitle: "Данные учетной записи и параметры безопасности.",
      loginPrompt: "Войдите для доступа к профилю",
      loginPromptDesc: "Войдите в свой аккаунт или зарегистрируйтесь.",
      readerRole: "Читатель Okuulib",
      email: "Электронная почта",
      notSpecified: "не указана",
      security: "Безопасность",
      jwtProtected: "JWT Защищено",
      logout: "Выйти",
    },
    auth: {
      welcomeBack: "С возвращением",
      welcomeBackDesc: "Войдите в аккаунт, чтобы продолжить чтение",
      newRegister: "Регистрация",
      newRegisterDesc: "Присоединяйтесь к платформе Okuulib и читайте книги онлайн",
      username: "Имя пользователя (Логин)",
      email: "Электронная почта (Email)",
      password: "Пароль",
      confirmPassword: "Подтвердите пароль",
      loginBtn: "Войти",
      registerBtn: "Зарегистрироваться",
      noAccount: "Нет аккаунта?",
      haveAccount: "Уже есть аккаунт?",
      loginLink: "Войти",
      registerLink: "Регистрация",
      passwordsDoNotMatch: "Пароли не совпадают.",
      passwordMinLength: "Пароль должен содержать минимум 6 символов.",
      fillAllFields: "Пожалуйста, введите логин и пароль.",
    },
    reader: {
      back: "Назад",
      chapter: "глава",
      of: "из",
      toc: "Оглавление",
      typography: "Шрифт и темы",
      theme: "Цветовая тема",
      fontSize: "Размер шрифта",
      lineHeight: "Межстрочный интервал",
      fontFamily: "Семейство шрифта",
      fullscreen: "Во весь экран",
      saveBookmark: "Сохранить закладку",
      readPercent: "прочитано",
      prevChapter: "Предыдущая глава",
      nextChapter: "Следующая глава",
      themes: {
        light: "Светлая",
        sepia: "Сепия",
        dark: "Темная",
        oled: "OLED",
      },
    },
  },
  en: {
    nav: {
      home: "Home",
      catalog: "Library",
      aitu: "Aitu AI",
      aituBadge: "AI",
      bookmarks: "Bookmarks",
      profile: "Profile",
      login: "Log In",
      logout: "Log Out",
      searchPlaceholder: "Search books or authors…",
      searchHint: "Type a book title or author name to search",
    },
    home: {
      heroBadge: "Digital Kyrgyz Literature Platform",
      heroTitle: "Experience Kyrgyz Literature on a",
      heroTitleHighlight: "New Level",
      heroDesc: "From the Epic of Manas to contemporary classics: read with smart styling, 4 ambient color themes, and the Aitu AI assistant.",
      startReading: "Start Reading",
      talkToAitu: "Talk to Aitu AI",
      bestCollections: "Featured Collections",
      recommended: "Recommended Books",
      genresTitle: "Browse by Genre",
      viewAll: "View All",
      aituBannerTitle: "Intelligent Literature Companion",
      aituBannerDesc: "Aitu provides in-depth literary analysis, character insights, and historical context for Kyrgyz epics and novels.",
      aituBannerFeature1: "Deep Contextual Analysis",
      aituBannerFeature2: "Real-Time Conversational AI",
      aituBannerBtn: "Chat with Aitu",
      manasTitle: "Epic of Manas",
      manasDesc: "The monumental heroic epic of the Kyrgyz people, a masterpiece of world intangible cultural heritage.",
    },
    catalog: {
      title: "Book Catalog",
      subtitle: "Discover classic and modern works of Kyrgyz literature.",
      searchPlaceholder: "Search by title or author…",
      allGenres: "All Genres",
      noBooksFound: "No books found",
      noBooksHint: "Try adjusting your search query or genre filter.",
    },
    book: {
      startReading: "Start Reading",
      discussAitu: "Discuss with Aitu",
      synopsis: "Book Synopsis",
      chapters: "Table of Contents",
      chapterNumber: "Chapter",
      otherWorks: "Other Works by Author",
      unknownAuthor: "Unknown Author",
      notFound: "Book Not Found",
      backToCatalog: "Back to Catalog",
    },
    author: {
      title: "Biography & Works",
      birthYear: "Year of Birth",
      moreWiki: "Learn more on Wikipedia",
      booksByAuthor: "Published Works",
      noBooks: "No works added for this author yet.",
      read: "Read",
    },
    aitu: {
      title: "Aitu AI Assistant",
      welcomeTitle: "Welcome to Aitu AI!",
      welcomeDesc: "Ask any question about Kyrgyz literature, epics, Chingiz Aitmatov's novels, or literary character analysis.",
      quickPrompts: [
        "What is the central theme of the Epic of Manas?",
        "Analysis of 'The Day Lasts More Than a Hundred Years'",
        "Historical works about Kurmanjan Datka",
        "Tell me about Suimenkul Chokmorov",
      ],
      inputPlaceholder: "Ask Aitu about literature… (Press Enter to send)",
      copy: "Copy",
      copied: "Copied",
      newChat: "New Chat",
      history: "Chat History",
      noHistory: "No chats yet",
      context: "Context",
    },
    bookmarks: {
      title: "Saved Bookmarks",
      subtitle: "Your bookmarked chapters and reading progress.",
      loginPrompt: "Log in to view bookmarks",
      loginPromptDesc: "Sign in to save your reading progress and sync bookmarks across devices.",
      loginBtn: "Log In",
      continueReading: "Continue Reading",
      noBookmarks: "No bookmarks yet",
      noBookmarksDesc: "While reading, tap the bookmark icon in the top bar to save your position.",
      chooseBook: "Explore Books",
    },
    profile: {
      title: "Account Profile",
      subtitle: "Manage your account details and security settings.",
      loginPrompt: "Log in to access your profile",
      loginPromptDesc: "Sign in to your account or create a new one.",
      readerRole: "Okuulib Reader",
      email: "Email Address",
      notSpecified: "not specified",
      security: "Security",
      jwtProtected: "JWT Protected",
      logout: "Log Out",
    },
    auth: {
      welcomeBack: "Welcome Back",
      welcomeBackDesc: "Sign in to continue your reading journey",
      newRegister: "Create Account",
      newRegisterDesc: "Join Okuulib to read Kyrgyz literature online",
      username: "Username",
      email: "Email Address",
      password: "Password",
      confirmPassword: "Confirm Password",
      loginBtn: "Sign In",
      registerBtn: "Register",
      noAccount: "Don't have an account?",
      haveAccount: "Already have an account?",
      loginLink: "Sign In",
      registerLink: "Register",
      passwordsDoNotMatch: "Passwords do not match.",
      passwordMinLength: "Password must be at least 6 characters.",
      fillAllFields: "Please enter your username and password.",
    },
    reader: {
      back: "Back",
      chapter: "Chapter",
      of: "of",
      toc: "Contents",
      typography: "Typography & Themes",
      theme: "Color Theme",
      fontSize: "Font Size",
      lineHeight: "Line Height",
      fontFamily: "Font Family",
      fullscreen: "Fullscreen",
      saveBookmark: "Save Bookmark",
      readPercent: "read",
      prevChapter: "Previous Chapter",
      nextChapter: "Next Chapter",
      themes: {
        light: "Light",
        sepia: "Sepia",
        dark: "Dark",
        oled: "OLED",
      },
    },
  },
};
