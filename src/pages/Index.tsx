import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import Icon from '@/components/ui/icon';

const Index = () => {
  const [currentView, setCurrentView] = useState<'home' | 'profile' | 'tests' | 'materials' | 'theory' | 'contacts'>('home');
  const [userProgress] = useState(35);
  const [completedTests] = useState(12);
  const [selectedTest, setSelectedTest] = useState<number | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userAnswers, setUserAnswers] = useState<string[]>([]);

  const topicProgress = [
    { name: 'Физическая география', progress: 75, tests: 8 },
    { name: 'Экономическая география', progress: 45, tests: 5 },
    { name: 'География России', progress: 60, tests: 10 },
    { name: 'Картография', progress: 30, tests: 3 },
    { name: 'Климат и погода', progress: 50, tests: 6 },
    { name: 'Население мира', progress: 20, tests: 2 },
  ];

  const tests = [
    { id: 1, title: 'Физическая география мира', questions: 15, difficulty: 'Средний', topic: 'Физическая география' },
    { id: 2, title: 'Климатические пояса', questions: 10, difficulty: 'Легкий', topic: 'Климат и погода' },
    { id: 3, title: 'География России: регионы', questions: 20, difficulty: 'Сложный', topic: 'География России' },
    { id: 4, title: 'Топографические карты', questions: 12, difficulty: 'Средний', topic: 'Картография' },
    { id: 5, title: 'Демография и миграция', questions: 8, difficulty: 'Легкий', topic: 'Население мира' },
    { id: 6, title: 'Экономические районы РФ', questions: 18, difficulty: 'Сложный', topic: 'Экономическая география' },
  ];

  const sampleQuestions = [
    {
      question: 'Какой океан является самым большим по площади?',
      options: ['Атлантический', 'Тихий', 'Индийский', 'Северный Ледовитый'],
      correct: 'Тихий'
    },
    {
      question: 'В каком климатическом поясе расположена Москва?',
      options: ['Арктический', 'Субарктический', 'Умеренный', 'Субтропический'],
      correct: 'Умеренный'
    },
    {
      question: 'Какая река является самой длинной в России?',
      options: ['Волга', 'Енисей', 'Лена', 'Обь'],
      correct: 'Лена'
    }
  ];

  const theoryTopics = [
    {
      category: 'Физическая география',
      topics: [
        { title: 'Литосфера и рельеф', duration: '15 мин' },
        { title: 'Гидросфера: океаны и моря', duration: '20 мин' },
        { title: 'Атмосфера и климат', duration: '18 мин' },
      ]
    },
    {
      category: 'Экономическая география',
      topics: [
        { title: 'Отрасли хозяйства', duration: '25 мин' },
        { title: 'Транспорт и связь', duration: '12 мин' },
        { title: 'Международная торговля', duration: '15 мин' },
      ]
    },
    {
      category: 'География России',
      topics: [
        { title: 'Географическое положение РФ', duration: '10 мин' },
        { title: 'Природные зоны России', duration: '22 мин' },
        { title: 'Федеральные округа', duration: '30 мин' },
      ]
    }
  ];

  const materials = [
    { title: 'Конспект: Тектоника и вулканизм', type: 'PDF', size: '2.4 MB', category: 'Физическая география' },
    { title: 'Справочник: Столицы стран мира', type: 'PDF', size: '1.8 MB', category: 'Политическая география' },
    { title: 'Шпаргалка: Климатические пояса', type: 'PDF', size: '0.9 MB', category: 'Климат и погода' },
    { title: 'Таблица: Численность населения', type: 'Excel', size: '0.5 MB', category: 'Население мира' },
    { title: 'Атлас: Карты России', type: 'PDF', size: '5.2 MB', category: 'Картография' },
  ];

  const handleAnswerSelect = (answer: string) => {
    const newAnswers = [...userAnswers];
    newAnswers[currentQuestion] = answer;
    setUserAnswers(newAnswers);
  };

  const handleNextQuestion = () => {
    if (currentQuestion < sampleQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      alert('Тест завершён! Ваш результат сохранён.');
      setSelectedTest(null);
      setCurrentQuestion(0);
      setUserAnswers([]);
    }
  };

  const renderTestQuestion = () => {
    if (selectedTest === null) return null;
    
    const question = sampleQuestions[currentQuestion];
    
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => {
            setSelectedTest(null);
            setCurrentQuestion(0);
            setUserAnswers([]);
          }}>
            <Icon name="ArrowLeft" size={20} className="mr-2" />
            Вернуться к списку тестов
          </Button>
          <Badge variant="outline">
            Вопрос {currentQuestion + 1} из {sampleQuestions.length}
          </Badge>
        </div>

        <Progress value={(currentQuestion / sampleQuestions.length) * 100} className="h-2" />

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">{question.question}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {question.options.map((option, idx) => (
              <Button
                key={idx}
                variant={userAnswers[currentQuestion] === option ? 'default' : 'outline'}
                className="w-full justify-start text-left h-auto py-4"
                onClick={() => handleAnswerSelect(option)}
              >
                <span className="font-semibold mr-3">{String.fromCharCode(65 + idx)}.</span>
                {option}
              </Button>
            ))}
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button 
            onClick={handleNextQuestion}
            disabled={!userAnswers[currentQuestion]}
            size="lg"
          >
            {currentQuestion < sampleQuestions.length - 1 ? 'Следующий вопрос' : 'Завершить тест'}
            <Icon name="ArrowRight" size={20} className="ml-2" />
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Icon name="MapPin" size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-primary">Ленарело</h1>
                <p className="text-xs text-muted-foreground">ОГЭ География</p>
              </div>
            </div>
            
            <nav className="hidden md:flex items-center gap-2">
              <Button 
                variant={currentView === 'home' ? 'default' : 'ghost'}
                onClick={() => setCurrentView('home')}
              >
                <Icon name="Home" size={18} className="mr-2" />
                Главная
              </Button>
              <Button 
                variant={currentView === 'profile' ? 'default' : 'ghost'}
                onClick={() => setCurrentView('profile')}
              >
                <Icon name="User" size={18} className="mr-2" />
                Профиль
              </Button>
              <Button 
                variant={currentView === 'tests' ? 'default' : 'ghost'}
                onClick={() => setCurrentView('tests')}
              >
                <Icon name="ClipboardList" size={18} className="mr-2" />
                Тесты
              </Button>
              <Button 
                variant={currentView === 'theory' ? 'default' : 'ghost'}
                onClick={() => setCurrentView('theory')}
              >
                <Icon name="BookOpen" size={18} className="mr-2" />
                Теория
              </Button>
              <Button 
                variant={currentView === 'materials' ? 'default' : 'ghost'}
                onClick={() => setCurrentView('materials')}
              >
                <Icon name="FileText" size={18} className="mr-2" />
                Материалы
              </Button>
              <Button 
                variant={currentView === 'contacts' ? 'default' : 'ghost'}
                onClick={() => setCurrentView('contacts')}
              >
                <Icon name="Mail" size={18} className="mr-2" />
                Контакты
              </Button>
            </nav>

            <Button size="icon" variant="outline" className="md:hidden">
              <Icon name="Menu" size={20} />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {currentView === 'home' && (
          <div className="space-y-8">
            <section className="text-center py-12 animate-fade-in">
              <h2 className="text-4xl font-bold mb-4">Добро пожаловать в Ленарело!</h2>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Твой персональный помощник для подготовки к ОГЭ по географии
              </p>
              <div className="flex gap-4 justify-center flex-wrap">
                <Button size="lg" onClick={() => setCurrentView('tests')}>
                  <Icon name="PlayCircle" size={20} className="mr-2" />
                  Начать тестирование
                </Button>
                <Button size="lg" variant="outline" onClick={() => setCurrentView('theory')}>
                  <Icon name="BookOpen" size={20} className="mr-2" />
                  Изучить теорию
                </Button>
              </div>
            </section>

            <section className="grid md:grid-cols-3 gap-6">
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-3">
                    <Icon name="TrendingUp" size={24} className="text-primary" />
                  </div>
                  <CardTitle>Твой прогресс</CardTitle>
                  <CardDescription>Общий прогресс подготовки</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Завершено</span>
                      <span className="font-semibold">{userProgress}%</span>
                    </div>
                    <Progress value={userProgress} className="h-3" />
                    <p className="text-xs text-muted-foreground mt-3">
                      Решено тестов: {completedTests}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-3">
                    <Icon name="Target" size={24} className="text-primary" />
                  </div>
                  <CardTitle>Цель на неделю</CardTitle>
                  <CardDescription>Осталось до выполнения</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-3xl font-bold">5 тестов</p>
                    <p className="text-sm text-muted-foreground">
                      Ты отлично справляешься! Ещё немного усилий.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-3">
                    <Icon name="Award" size={24} className="text-primary" />
                  </div>
                  <CardTitle>Достижения</CardTitle>
                  <CardDescription>Твои награды</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2 flex-wrap">
                    <Badge variant="secondary" className="text-lg">🏆</Badge>
                    <Badge variant="secondary" className="text-lg">⭐</Badge>
                    <Badge variant="secondary" className="text-lg">🎯</Badge>
                    <Badge variant="secondary" className="text-lg">📚</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-3">
                    Продолжай в том же духе!
                  </p>
                </CardContent>
              </Card>
            </section>

            <section>
              <h3 className="text-2xl font-bold mb-6">Прогресс по темам</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {topicProgress.map((topic, idx) => (
                  <Card key={idx} className="hover:shadow-md transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-semibold">{topic.name}</h4>
                          <p className="text-sm text-muted-foreground">Решено тестов: {topic.tests}</p>
                        </div>
                        <Badge variant="outline">{topic.progress}%</Badge>
                      </div>
                      <Progress value={topic.progress} className="h-2" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          </div>
        )}

        {currentView === 'profile' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <h2 className="text-3xl font-bold mb-6">Личный кабинет</h2>
            
            <Card>
              <CardHeader>
                <CardTitle>Профиль ученика</CardTitle>
                <CardDescription>Информация о твоём аккаунте</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                    <Icon name="User" size={40} className="text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">Иван Петров</h3>
                    <p className="text-muted-foreground">ivan.petrov@example.com</p>
                    <Badge className="mt-2">9 класс</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Статистика</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-primary">{completedTests}</p>
                    <p className="text-sm text-muted-foreground">Пройдено тестов</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-primary">156</p>
                    <p className="text-sm text-muted-foreground">Правильных ответов</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-primary">78%</p>
                    <p className="text-sm text-muted-foreground">Средний балл</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-primary">24</p>
                    <p className="text-sm text-muted-foreground">Дней подряд</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>История тестирования</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { test: 'Физическая география мира', score: 85, date: '15.11.2024' },
                    { test: 'Климатические пояса', score: 92, date: '14.11.2024' },
                    { test: 'География России: регионы', score: 76, date: '13.11.2024' },
                    { test: 'Топографические карты', score: 88, date: '12.11.2024' },
                  ].map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div>
                        <p className="font-medium">{item.test}</p>
                        <p className="text-sm text-muted-foreground">{item.date}</p>
                      </div>
                      <Badge variant={item.score >= 80 ? 'default' : 'secondary'}>
                        {item.score}%
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {currentView === 'tests' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold mb-2">Тесты по географии</h2>
              <p className="text-muted-foreground">Выбери тест и начни тренировку</p>
            </div>

            {selectedTest === null ? (
              <div className="grid md:grid-cols-2 gap-6">
                {tests.map((test) => (
                  <Card key={test.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{test.title}</CardTitle>
                        <Badge variant={
                          test.difficulty === 'Легкий' ? 'secondary' :
                          test.difficulty === 'Средний' ? 'default' : 'destructive'
                        }>
                          {test.difficulty}
                        </Badge>
                      </div>
                      <CardDescription>{test.topic}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Icon name="FileQuestion" size={16} />
                            {test.questions} вопросов
                          </span>
                        </div>
                        <Button onClick={() => setSelectedTest(test.id)}>
                          Начать
                          <Icon name="ArrowRight" size={16} className="ml-2" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              renderTestQuestion()
            )}
          </div>
        )}

        {currentView === 'theory' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold mb-2">Теоретические материалы</h2>
              <p className="text-muted-foreground">Изучай теорию по всем разделам географии</p>
            </div>

            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="all">Все темы</TabsTrigger>
                <TabsTrigger value="physical">Физическая</TabsTrigger>
                <TabsTrigger value="economic">Экономическая</TabsTrigger>
                <TabsTrigger value="russia">Россия</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="space-y-4 mt-6">
                {theoryTopics.map((category, idx) => (
                  <Card key={idx}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Icon name="BookOpen" size={20} className="text-primary" />
                        {category.category}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {category.topics.map((topic, topicIdx) => (
                          <div 
                            key={topicIdx}
                            className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-primary/10 rounded flex items-center justify-center">
                                <Icon name="FileText" size={16} className="text-primary" />
                              </div>
                              <span className="font-medium">{topic.title}</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <Badge variant="outline">{topic.duration}</Badge>
                              <Icon name="ChevronRight" size={16} className="text-muted-foreground" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="physical">
                <Card>
                  <CardHeader>
                    <CardTitle>Физическая география</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                      <AccordionItem value="item-1">
                        <AccordionTrigger>Литосфера и рельеф</AccordionTrigger>
                        <AccordionContent>
                          <p className="text-muted-foreground mb-4">
                            Литосфера — твёрдая оболочка Земли. Включает земную кору и верхнюю часть мантии.
                          </p>
                          <Button size="sm" variant="outline">
                            <Icon name="PlayCircle" size={16} className="mr-2" />
                            Читать полностью
                          </Button>
                        </AccordionContent>
                      </AccordionItem>
                      <AccordionItem value="item-2">
                        <AccordionTrigger>Гидросфера: океаны и моря</AccordionTrigger>
                        <AccordionContent>
                          <p className="text-muted-foreground mb-4">
                            Гидросфера — водная оболочка Земли. Океаны занимают 71% поверхности планеты.
                          </p>
                          <Button size="sm" variant="outline">
                            <Icon name="PlayCircle" size={16} className="mr-2" />
                            Читать полностью
                          </Button>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}

        {currentView === 'materials' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold mb-2">Учебные материалы</h2>
              <p className="text-muted-foreground">Конспекты, справочники и шпаргалки</p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {materials.map((material, idx) => (
                <Card key={idx} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Icon name={material.type === 'PDF' ? 'FileText' : 'FileSpreadsheet'} size={24} className="text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold mb-1">{material.title}</h4>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                          <Badge variant="outline" className="text-xs">{material.type}</Badge>
                          <span>{material.size}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mb-3">{material.category}</p>
                        <Button size="sm" variant="outline" className="w-full">
                          <Icon name="Download" size={16} className="mr-2" />
                          Скачать
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {currentView === 'contacts' && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div>
              <h2 className="text-3xl font-bold mb-2">Контакты и поддержка</h2>
              <p className="text-muted-foreground">Свяжись с нами, если возникли вопросы</p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>О проекте Ленарело</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Ленарело — это современная платформа для подготовки к ОГЭ по географии. 
                  Мы помогаем ученикам эффективно готовиться к экзаменам через интерактивные 
                  тесты, структурированные материалы и отслеживание прогресса.
                </p>
                <div className="flex gap-2 flex-wrap">
                  <Badge variant="secondary">Интерактивное обучение</Badge>
                  <Badge variant="secondary">Персональный прогресс</Badge>
                  <Badge variant="secondary">Актуальные материалы</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Служба поддержки</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icon name="Mail" size={20} className="text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Email</p>
                    <p className="text-sm text-muted-foreground">support@lenarelo.ru</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icon name="Phone" size={20} className="text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Телефон</p>
                    <p className="text-sm text-muted-foreground">+7 (999) 123-45-67</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icon name="MessageCircle" size={20} className="text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Telegram</p>
                    <p className="text-sm text-muted-foreground">@lenarelo_support</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Напиши нам</CardTitle>
                <CardDescription>Мы ответим в течение 24 часов</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Имя</label>
                  <input 
                    type="text" 
                    placeholder="Ваше имя"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Email</label>
                  <input 
                    type="email" 
                    placeholder="your@email.com"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Сообщение</label>
                  <textarea 
                    placeholder="Ваше сообщение"
                    rows={4}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  />
                </div>
                <Button className="w-full">
                  <Icon name="Send" size={16} className="mr-2" />
                  Отправить сообщение
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </main>

      <footer className="bg-white border-t mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Icon name="MapPin" size={20} className="text-white" />
              </div>
              <span className="font-semibold">Ленарело ОГЭ География</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 Ленарело. Все права защищены.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;