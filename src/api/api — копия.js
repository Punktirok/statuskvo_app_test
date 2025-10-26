const categories = [
  { title: 'Новые уроки', iconKey: 'iconNew' },
  { title: 'Нейросети', iconKey: 'iconAI' },
  { title: 'Инструменты Figma', iconKey: 'iconFigma' },
  { title: 'Дизайн-системы', iconKey: 'iconDesignSystem' },
  { title: 'Фриланс, поиск работы', iconKey: 'iconJob' },
  { title: 'Софт скиллы', iconKey: 'iconSoftSkills' },
  { title: 'Tilda', iconKey: 'iconTilda' },
  { title: 'UX, исследования', iconKey: 'iconUX' },
  { title: 'Курс по Spline', iconKey: 'iconSpline' },
  { title: 'Челленджи', iconKey: 'iconChallenge' },
  { title: 'Дизайн-сцены', iconKey: 'iconDesignScene' },
  { title: 'Рекомендации', iconKey: 'iconRecs' },
]

const lessonsByCategory = {
  'Новые уроки': [
    {
      id: 'new-01',
      title: 'Топ-5 обновлений в UI за неделю',
      type: 'iconVideo',
    },
    {
      id: 'new-02',
      title: 'Новые паттерны анимации интерфейсов',
      type: 'iconArticle',
    },
  ],
  Нейросети: [
    {
      id: 'ai-01',
      title: 'Prompt-ы, которые экономят часы исследований',
      type: 'iconArticle',
    },
    {
      id: 'ai-02',
      title: 'Делаем прототип в Figma c помощью AI',
      type: 'iconVideo',
    },
  ],
  'Инструменты Figma': [
    {
      id: 'figma-01',
      title: 'Обзор Auto Layout 5.0 за 10 минут',
      type: 'iconVideo',
    },
    {
      id: 'figma-02',
      title: 'Плагины, ускоряющие дизайн-процесс',
      type: 'iconPodcast',
    },
  ],
  'Дизайн-системы': [
    {
      id: 'ds-01',
      title: 'Как поддерживать единую библиотеку компонентов',
      type: 'iconArticle',
    },
    {
      id: 'ds-02',
      title: 'Дискуссия: будущее дизайн-систем',
      type: 'iconPodcast',
    },
  ],
  'Фриланс, поиск работы': [
    {
      id: 'job-01',
      title: 'Готовим портфолио, которое откликает рекрутеров',
      type: 'iconVideo',
    },
    {
      id: 'job-02',
      title: 'Как вести переговоры о ставке и не прогореть',
      type: 'iconArticle',
    },
  ],
  'Софт скиллы': [
    {
      id: 'soft-01',
      title: 'Фреймворк обратной связи для команд',
      type: 'iconArticle',
    },
    { id: 'soft-02', title: 'Коммуникация с заказчиком', type: 'iconPodcast' },
  ],
  Tilda: [
    {
      id: 'tilda-01',
      title: 'Современные анимации без кода в Tilda',
      type: 'iconVideo',
    },
    {
      id: 'tilda-02',
      title: 'Чек-лист запуска лендинга',
      type: 'iconRec',
    },
  ],
  'UX, исследования': [
    {
      id: 'ux-01',
      title: 'Методы тестирования прототипа на раннем этапе',
      type: 'iconArticle',
    },
    {
      id: 'ux-02',
      title: 'Интервью с исследователем Яндекса',
      type: 'iconPodcast',
    },
  ],
  'Курс по Spline': [
    {
      id: 'spline-01',
      title: 'Разбираем 3D-сцену для веба',
      type: 'iconVideo',
    },
    {
      id: 'spline-02',
      title: 'Практический мини-бриф',
      type: 'iconChallenge',
    },
  ],
  Челленджи: [
    {
      id: 'challenge-01',
      title: '7-дневный челлендж: редизайн мобильного приложения',
      type: 'iconChallenge',
    },
    {
      id: 'challenge-02',
      title: 'Скетчинг интерфейсов в реальном времени',
      type: 'iconVideo',
    },
  ],
  'Дизайн-сцены': [
    {
      id: 'scene-01',
      title: 'Создаем сцену стартапа: от брифа до пич-дека',
      type: 'iconVideo',
    },
    {
      id: 'scene-02',
      title: 'Сценарии применения микровзаимодействий',
      type: 'iconArticle',
    },
  ],
  Рекомендации: [
    {
      id: 'recs-01',
      title: 'Лучшие книги по продуктовой разработке',
      type: 'iconRec',
    },
    {
      id: 'recs-02',
      title: 'Подборка подкастов недели',
      type: 'iconPodcast',
    },
  ],
}

export const fetchCategories = async () => categories

export const fetchLessonsByCategory = async (categoryTitle) =>
  lessonsByCategory[categoryTitle] ?? []
