import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';

const API_URLS = {
  auth: 'https://functions.poehali.dev/d06cbbbe-85c4-47b7-b4fe-3b3eadd35afa',
  webinars: 'https://functions.poehali.dev/b6dc4885-1026-499a-b7f6-33332b53b4ad',
  homework: 'https://functions.poehali.dev/cf2a3e0a-655d-46e4-886a-4cd3ed91833a',
};

const Index = () => {
  const [user, setUser] = useState<any>(null);
  const [isLogin, setIsLogin] = useState(true);
  const [currentView, setCurrentView] = useState<'home' | 'profile' | 'webinars' | 'homework' | 'schedule' | 'admin' | 'contacts'>('home');
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  
  const [webinars, setWebinars] = useState<any[]>([]);
  const [homework, setHomework] = useState<any[]>([]);
  const [homeworkStats, setHomeworkStats] = useState<any>(null);
  const [selectedWebinar, setSelectedWebinar] = useState<any>(null);
  const [selectedHomework, setSelectedHomework] = useState<any>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [mySubmissions, setMySubmissions] = useState<any[]>([]);
  const [submissionText, setSubmissionText] = useState('');
  const [showInviteCode, setShowInviteCode] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  const [newWebinar, setNewWebinar] = useState({ title: '', description: '', video_url: '', duration: 0 });
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [newHomework, setNewHomework] = useState({
    title: '',
    description: '',
    homework_type: 'text',
    deadline: '',
    max_score: 1
  });
  const [testQuestions, setTestQuestions] = useState<any[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState({
    question: '',
    options: ['', '', '', ''],
    correct: 0
  });
  const [loadedTestQuestions, setLoadedTestQuestions] = useState<any[]>([]);
  const [testAnswers, setTestAnswers] = useState<Record<string, number>>({});

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  useEffect(() => {
    if (user) {
      loadWebinars();
      loadHomework();
      loadHomeworkStats();
      loadMySubmissions();
      if (user.is_admin) {
        generateInviteCode();
      }
    }
  }, [user]);

  const generateInviteCode = () => {
    setInviteCode(Math.random().toString(36).substring(2, 10).toUpperCase());
  };

  const loadMySubmissions = async () => {
    const res = await fetch(API_URLS.homework + `?action=my_submissions`, {
      headers: { 'X-User-Id': user?.id }
    });
    const data = await res.json();
    setMySubmissions(data);
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const action = isLogin ? 'login' : 'register';
    const body: any = { action, username, password };
    
    if (!isLogin) {
      body.email = email;
      body.full_name = fullName;
      body.invite_code = inviteCode;
    }
    
    try {
      const res = await fetch(API_URLS.auth, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setUser(data);
        localStorage.setItem('user', JSON.stringify(data));
        setUsername('');
        setPassword('');
        setEmail('');
        setFullName('');
        setInviteCode('');
      } else {
        alert(data.error || 'Ошибка авторизации');
      }
    } catch (err) {
      alert('Ошибка соединения с сервером');
      console.error(err);
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    setCurrentView('home');
  };

  const loadWebinars = async () => {
    const res = await fetch(API_URLS.webinars);
    const data = await res.json();
    setWebinars(data);
  };

  const loadHomework = async () => {
    const res = await fetch(API_URLS.homework + '?action=list');
    const data = await res.json();
    setHomework(data);
  };

  const loadHomeworkStats = async () => {
    const res = await fetch(API_URLS.homework + '?action=stats', {
      headers: { 'X-User-Id': user?.id }
    });
    const data = await res.json();
    setHomeworkStats(data);
  };

  const loadSubmissions = async (homeworkId: number) => {
    const res = await fetch(API_URLS.homework + `?action=submissions&homework_id=${homeworkId}`);
    const data = await res.json();
    setSubmissions(data);
  };

  const createWebinar = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const res = await fetch(API_URLS.webinars, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-User-Id': user?.id
      },
      body: JSON.stringify(newWebinar)
    });
    
    if (res.ok) {
      setNewWebinar({ title: '', description: '', video_url: '', duration: 0 });
      loadWebinars();
      alert('Вебинар создан!');
    }
  };

  const createHomework = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newHomework.homework_type === 'test' && testQuestions.length === 0) {
      alert('Добавьте хотя бы один вопрос для теста!');
      return;
    }
    
    const res = await fetch(API_URLS.homework, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-User-Id': user?.id
      },
      body: JSON.stringify({ 
        action: 'create', 
        ...newHomework,
        questions: newHomework.homework_type === 'test' ? testQuestions : []
      })
    });
    
    if (res.ok) {
      setNewHomework({ title: '', description: '', homework_type: 'text', deadline: '', max_score: 1 });
      setTestQuestions([]);
      setCurrentQuestion({ question: '', options: ['', '', '', ''], correct: 0 });
      loadHomework();
      alert('Домашнее задание создано!');
    }
  };

  const gradeSubmission = async (submissionId: number, score: number, feedback: string) => {
    const res = await fetch(API_URLS.homework, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-User-Id': user?.id
      },
      body: JSON.stringify({
        action: 'grade',
        submission_id: submissionId,
        score,
        feedback
      })
    });
    
    if (res.ok) {
      if (selectedHomework) {
        loadSubmissions(selectedHomework.id);
      }
      alert('Оценка выставлена! Ученик получит результат автоматически.');
    }
  };

  const loadTestQuestions = async (homeworkId: number) => {
    const res = await fetch(API_URLS.homework + `?action=get_questions&homework_id=${homeworkId}`);
    if (res.ok) {
      const questions = await res.json();
      setLoadedTestQuestions(questions);
    }
  };

  const submitHomework = async (homeworkId: number, hwType: string = 'text') => {
    if (hwType === 'test') {
      if (Object.keys(testAnswers).length !== loadedTestQuestions.length) {
        alert('Ответьте на все вопросы теста!');
        return;
      }
      
      const res = await fetch(API_URLS.homework, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': user?.id
        },
        body: JSON.stringify({
          action: 'submit',
          homework_id: homeworkId,
          submission_type: 'test',
          submission_data: testAnswers
        })
      });
      
      if (res.ok) {
        const result = await res.json();
        setTestAnswers({});
        setLoadedTestQuestions([]);
        loadMySubmissions();
        if (result.score !== null && result.score !== undefined) {
          alert(`Тест проверен автоматически! Ваш результат: ${result.score} из ${selectedHomework?.max_score || 1}`);
        } else {
          alert('Тест отправлен!');
        }
      }
      return;
    }
    
    if (!submissionText.trim()) {
      alert('Введите ответ!');
      return;
    }

    const res = await fetch(API_URLS.homework, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-User-Id': user?.id
      },
      body: JSON.stringify({
        action: 'submit',
        homework_id: homeworkId,
        submission_type: 'text',
        submission_data: submissionText
      })
    });
    
    if (res.ok) {
      setSubmissionText('');
      loadMySubmissions();
      alert('Домашняя работа отправлена! Ждите проверки.');
    }
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    return { daysInMonth, startingDayOfWeek };
  };

  const getHomeworkForDate = (date: Date) => {
    return homework.filter(hw => {
      const hwDate = new Date(hw.deadline);
      return hwDate.toDateString() === date.toDateString();
    });
  };

  const renderCalendar = () => {
    const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentMonth);
    const days = [];
    const weekDays = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
    
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="aspect-square p-2"></div>);
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      const homeworkForDay = getHomeworkForDate(date);
      const isToday = date.toDateString() === new Date().toDateString();
      
      days.push(
        <div
          key={day}
          className={`aspect-square p-2 border rounded-lg ${isToday ? 'bg-primary/10 border-primary' : 'bg-white'} hover:shadow-md transition-shadow cursor-pointer`}
        >
          <div className="text-sm font-semibold mb-1">{day}</div>
          {homeworkForDay.map(hw => (
            <div key={hw.id} className="text-xs bg-primary/20 rounded px-1 py-0.5 mb-1 truncate">
              {hw.title}
            </div>
          ))}
        </div>
      );
    }
    
    return (
      <div>
        <div className="flex items-center justify-between mb-4">
          <Button variant="outline" size="sm" onClick={() => {
            const newDate = new Date(currentMonth);
            newDate.setMonth(newDate.getMonth() - 1);
            setCurrentMonth(newDate);
          }}>
            <Icon name="ChevronLeft" size={16} />
          </Button>
          <h3 className="text-lg font-semibold">
            {currentMonth.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })}
          </h3>
          <Button variant="outline" size="sm" onClick={() => {
            const newDate = new Date(currentMonth);
            newDate.setMonth(newDate.getMonth() + 1);
            setCurrentMonth(newDate);
          }}>
            <Icon name="ChevronRight" size={16} />
          </Button>
        </div>
        
        <div className="grid grid-cols-7 gap-2 mb-2">
          {weekDays.map(day => (
            <div key={day} className="text-center text-sm font-semibold text-muted-foreground">
              {day}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-2">
          {days}
        </div>
      </div>
    );
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center mx-auto mb-4">
              <Icon name="MapPin" size={32} className="text-white" />
            </div>
            <CardTitle className="text-2xl text-primary">Ленарело</CardTitle>
            <CardDescription>ОГЭ География</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAuth} className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Логин</label>
                <Input 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Введите логин"
                  required
                />
              </div>
              
              {!isLogin && (
                <>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Код приглашения</label>
                    <Input 
                      value={inviteCode}
                      onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                      placeholder="Код от учителя"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Email</label>
                    <Input 
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Полное имя</label>
                    <Input 
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Иван Иванов"
                      required
                    />
                  </div>
                </>
              )}
              
              <div>
                <label className="text-sm font-medium mb-2 block">Пароль</label>
                <Input 
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Введите пароль"
                  required
                />
              </div>

              <Button type="submit" className="w-full">
                {isLogin ? 'Войти' : 'Зарегистрироваться'}
              </Button>
              
              <Button 
                type="button"
                variant="ghost" 
                className="w-full"
                onClick={() => setIsLogin(!isLogin)}
              >
                {isLogin ? 'Нет аккаунта? Зарегистрируйтесь' : 'Уже есть аккаунт? Войдите'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

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
                variant={currentView === 'webinars' ? 'default' : 'ghost'}
                onClick={() => setCurrentView('webinars')}
              >
                <Icon name="Video" size={18} className="mr-2" />
                Вебинары
              </Button>
              <Button 
                variant={currentView === 'homework' ? 'default' : 'ghost'}
                onClick={() => setCurrentView('homework')}
              >
                <Icon name="BookOpen" size={18} className="mr-2" />
                Домашка
              </Button>
              <Button 
                variant={currentView === 'schedule' ? 'default' : 'ghost'}
                onClick={() => setCurrentView('schedule')}
              >
                <Icon name="Calendar" size={18} className="mr-2" />
                Расписание
              </Button>
              {(user.is_admin || user.is_teacher) && (
                <Button 
                  variant={currentView === 'admin' ? 'default' : 'ghost'}
                  onClick={() => setCurrentView('admin')}
                >
                  <Icon name="Settings" size={18} className="mr-2" />
                  {user.is_teacher ? 'Управление' : 'Админ'}
                </Button>
              )}
              <Button 
                variant={currentView === 'profile' ? 'default' : 'ghost'}
                onClick={() => setCurrentView('profile')}
              >
                <Icon name="User" size={18} className="mr-2" />
                {user.full_name || user.username}
              </Button>
            </nav>

            <Button variant="outline" onClick={handleLogout}>
              <Icon name="LogOut" size={18} />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {currentView === 'home' && (
          <div className="space-y-8">
            <section className="text-center py-12">
              <h2 className="text-4xl font-bold mb-4">Добро пожаловать, {user.full_name || user.username}!</h2>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Твой персональный помощник для подготовки к ОГЭ по географии
              </p>
            </section>

            <section className="grid md:grid-cols-3 gap-6">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setCurrentView('webinars')}>
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-3">
                    <Icon name="Video" size={24} className="text-primary" />
                  </div>
                  <CardTitle>Вебинары</CardTitle>
                  <CardDescription>Обучающие видео</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{webinars.length}</p>
                  <p className="text-sm text-muted-foreground">доступных вебинаров</p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setCurrentView('homework')}>
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-3">
                    <Icon name="BookOpen" size={24} className="text-primary" />
                  </div>
                  <CardTitle>Домашние задания</CardTitle>
                  <CardDescription>Задания с дедлайном</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{homework.length}</p>
                  <p className="text-sm text-muted-foreground">активных заданий</p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-3">
                    <Icon name="Award" size={24} className="text-primary" />
                  </div>
                  <CardTitle>Прогресс</CardTitle>
                  <CardDescription>Ваша статистика</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{homeworkStats?.submitted_homework || 0}</p>
                  <p className="text-sm text-muted-foreground">выполнено работ</p>
                </CardContent>
              </Card>
            </section>
          </div>
        )}

        {currentView === 'webinars' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold mb-2">Вебинары</h2>
                <p className="text-muted-foreground">Смотрите обучающие видео</p>
              </div>
              {(user.is_teacher || user.is_admin) && (
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setCurrentView('homework')}>
                    <Icon name="BookOpen" size={18} className="mr-2" />
                    К Домашке
                  </Button>
                  <Button variant="outline" onClick={() => setCurrentView('admin')}>
                    <Icon name="BarChart3" size={18} className="mr-2" />
                    Статистика
                  </Button>
                </div>
              )}
            </div>

            {selectedWebinar ? (
              <div className="space-y-4">
                <Button variant="ghost" onClick={() => setSelectedWebinar(null)}>
                  <Icon name="ArrowLeft" size={20} className="mr-2" />
                  Назад к списку
                </Button>
                
                <Card>
                  <CardHeader>
                    <CardTitle>{selectedWebinar.title}</CardTitle>
                    <CardDescription>{selectedWebinar.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="aspect-video bg-black rounded-lg mb-4">
                      <iframe
                        src={selectedWebinar.video_url}
                        className="w-full h-full rounded-lg"
                        allowFullScreen
                        title={selectedWebinar.title}
                      />
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Icon name="Clock" size={16} />
                        {selectedWebinar.duration} мин
                      </span>
                      <span>Создал: {selectedWebinar.creator_name}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {webinars.map((webinar) => (
                  <Card key={webinar.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setSelectedWebinar(webinar)}>
                    <CardHeader>
                      <CardTitle>{webinar.title}</CardTitle>
                      <CardDescription>{webinar.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Icon name="Clock" size={16} />
                          {webinar.duration} мин
                        </span>
                        <Button>
                          Смотреть
                          <Icon name="PlayCircle" size={16} className="ml-2" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                {webinars.length === 0 && (
                  <Card className="col-span-2">
                    <CardContent className="py-12 text-center">
                      <Icon name="Video" size={48} className="mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">Вебинары пока не добавлены</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </div>
        )}

        {currentView === 'homework' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold mb-2">Домашние задания</h2>
                <p className="text-muted-foreground">Выполняйте задания в срок</p>
              </div>
              {(user.is_teacher || user.is_admin) && (
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setCurrentView('webinars')}>
                    <Icon name="Video" size={18} className="mr-2" />
                    К Вебинарам
                  </Button>
                  <Button variant="outline" onClick={() => setCurrentView('admin')}>
                    <Icon name="BarChart3" size={18} className="mr-2" />
                    Статистика
                  </Button>
                </div>
              )}
            </div>

            {homeworkStats && (
              <div className="grid md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-primary">{homeworkStats.total_homework || 0}</p>
                      <p className="text-sm text-muted-foreground">Всего заданий</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-primary">{homeworkStats.submitted_homework || 0}</p>
                      <p className="text-sm text-muted-foreground">Выполнено</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-primary">
                        {homeworkStats.average_score ? Math.round(homeworkStats.average_score) : 0}%
                      </p>
                      <p className="text-sm text-muted-foreground">Средний балл</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {selectedHomework && user.is_admin && submissions.length > 0 ? (
              <div className="space-y-4">
                <Button variant="ghost" onClick={() => {
                  setSelectedHomework(null);
                  setSubmissions([]);
                }}>
                  <Icon name="ArrowLeft" size={20} className="mr-2" />
                  Назад к списку
                </Button>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Сданные работы: {selectedHomework.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {submissions.length > 0 ? (
                      <div className="space-y-4">
                        {submissions.map((sub) => (
                          <Card key={sub.id}>
                            <CardContent className="pt-6">
                              <div className="space-y-3">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <p className="font-semibold">{sub.student_name}</p>
                                    <p className="text-sm text-muted-foreground">
                                      Сдано: {new Date(sub.submitted_at).toLocaleString('ru-RU')}
                                    </p>
                                  </div>
                                  {sub.score !== null && (
                                    <Badge variant="default">{sub.score}%</Badge>
                                  )}
                                </div>
                                
                                {!sub.score && (
                                  <div className="space-y-2">
                                    <Input 
                                      type="number"
                                      placeholder="Оценка (0-100)"
                                      id={`score-${sub.id}`}
                                      min="0"
                                      max="100"
                                    />
                                    <Textarea 
                                      placeholder="Комментарий (необязательно)"
                                      id={`feedback-${sub.id}`}
                                      rows={2}
                                    />
                                    <Button onClick={() => {
                                      const scoreInput = document.getElementById(`score-${sub.id}`) as HTMLInputElement;
                                      const feedbackInput = document.getElementById(`feedback-${sub.id}`) as HTMLTextAreaElement;
                                      gradeSubmission(sub.id, parseInt(scoreInput.value), feedbackInput.value);
                                    }}>
                                      Выставить оценку
                                    </Button>
                                  </div>
                                )}
                                
                                {sub.feedback && (
                                  <div className="bg-muted p-3 rounded-lg">
                                    <p className="text-sm font-medium mb-1">Комментарий:</p>
                                    <p className="text-sm">{sub.feedback}</p>
                                  </div>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center text-muted-foreground py-8">Работы ещё не сданы</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            ) : !selectedHomework ? (
              <div className="space-y-4">
                {homework.map((hw) => {
                  const deadline = new Date(hw.deadline);
                  const isOverdue = deadline < new Date();
                  
                  return (
                    <Card key={hw.id} className="hover:shadow-md transition-shadow">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle>{hw.title}</CardTitle>
                            <CardDescription>{hw.description}</CardDescription>
                          </div>
                          <Badge variant={isOverdue ? 'destructive' : 'default'}>
                            {isOverdue ? 'Просрочено' : 'Активно'}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <p className="text-sm text-muted-foreground flex items-center gap-2">
                              <Icon name="Calendar" size={16} />
                              Дедлайн: {deadline.toLocaleString('ru-RU')}
                            </p>
                            <p className="text-sm">
                              <Badge variant="outline">
                                {hw.homework_type === 'file' && 'Файл'}
                                {hw.homework_type === 'text' && 'Текст'}
                                {hw.homework_type === 'test' && 'Тест'}
                              </Badge>
                            </p>
                          </div>
                          {user.is_admin ? (
                            <Button onClick={() => {
                              setSelectedHomework(hw);
                              loadSubmissions(hw.id);
                            }}>
                              Посмотреть работы
                              <Icon name="ArrowRight" size={16} className="ml-2" />
                            </Button>
                          ) : (
                            <Button onClick={() => setSelectedHomework(hw)}>
                              Выполнить
                              <Icon name="ArrowRight" size={16} className="ml-2" />
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
                
                {homework.length === 0 && (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <Icon name="BookOpen" size={48} className="mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">Домашние задания пока не добавлены</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <Button variant="ghost" onClick={() => setSelectedHomework(null)}>
                  <Icon name="ArrowLeft" size={20} className="mr-2" />
                  Назад к списку
                </Button>
                
                <Card>
                  <CardHeader>
                    <CardTitle>{selectedHomework.title}</CardTitle>
                    <CardDescription>{selectedHomework.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {mySubmissions.find(s => s.homework_id === selectedHomework.id) ? (
                        <div className="space-y-3">
                          <div className="bg-primary/10 p-4 rounded-lg">
                            <p className="font-semibold mb-2">✅ Работа сдана!</p>
                            <p className="text-sm text-muted-foreground mb-2">
                              Отправлено: {new Date(mySubmissions.find(s => s.homework_id === selectedHomework.id)?.submitted_at).toLocaleString('ru-RU')}
                            </p>
                            {mySubmissions.find(s => s.homework_id === selectedHomework.id)?.score !== null && (
                              <div className="mt-3 p-3 bg-white rounded border">
                                <p className="font-semibold text-lg mb-1">
                                  Оценка: {mySubmissions.find(s => s.homework_id === selectedHomework.id)?.score} из {selectedHomework.max_score || 1}
                                </p>
                                {mySubmissions.find(s => s.homework_id === selectedHomework.id)?.is_auto_graded && (
                                  <Badge variant="secondary" className="mb-2">Автоматическая проверка</Badge>
                                )}
                                {mySubmissions.find(s => s.homework_id === selectedHomework.id)?.feedback && (
                                  <div className="mt-2">
                                    <p className="text-sm font-medium mb-1">Комментарий преподавателя:</p>
                                    <p className="text-sm">{mySubmissions.find(s => s.homework_id === selectedHomework.id)?.feedback}</p>
                                  </div>
                                )}
                              </div>
                            )}
                            {mySubmissions.find(s => s.homework_id === selectedHomework.id)?.score === null && (
                              <p className="text-sm text-muted-foreground">⏳ Ожидает проверки преподавателем</p>
                            )}
                          </div>
                        </div>
                      ) : selectedHomework.homework_type === 'test' ? (
                        <div className="space-y-4">
                          {loadedTestQuestions.length === 0 ? (
                            <Button onClick={() => loadTestQuestions(selectedHomework.id)} className="w-full">
                              Начать тест
                              <Icon name="PlayCircle" size={16} className="ml-2" />
                            </Button>
                          ) : (
                            <>
                              <div className="bg-primary/5 p-4 rounded-lg mb-4">
                                <p className="text-sm font-medium">Тест: {loadedTestQuestions.length} вопросов</p>
                                <p className="text-sm text-muted-foreground">Макс. балл: {selectedHomework.max_score}</p>
                              </div>
                              
                              {loadedTestQuestions.map((q, idx) => {
                                const options = typeof q.options === 'string' ? JSON.parse(q.options) : q.options;
                                return (
                                  <Card key={q.id} className="border-2">
                                    <CardContent className="pt-6">
                                      <p className="font-medium mb-3">{idx + 1}. {q.question_text}</p>
                                      <div className="space-y-2">
                                        {options.map((opt: string, optIdx: number) => (
                                          <label 
                                            key={optIdx}
                                            className={`flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition-all ${testAnswers[q.id] === optIdx ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}
                                          >
                                            <input 
                                              type="radio"
                                              name={`question-${q.id}`}
                                              checked={testAnswers[q.id] === optIdx}
                                              onChange={() => setTestAnswers({...testAnswers, [q.id]: optIdx})}
                                              className="w-4 h-4"
                                            />
                                            <span>{opt}</span>
                                          </label>
                                        ))}
                                      </div>
                                    </CardContent>
                                  </Card>
                                );
                              })}
                              
                              <Button 
                                onClick={() => submitHomework(selectedHomework.id, 'test')} 
                                className="w-full"
                                disabled={Object.keys(testAnswers).length !== loadedTestQuestions.length}
                              >
                                Отправить тест ({Object.keys(testAnswers).length} / {loadedTestQuestions.length})
                                <Icon name="Send" size={16} className="ml-2" />
                              </Button>
                            </>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <label className="text-sm font-medium">Ваш ответ:</label>
                          <Textarea 
                            value={submissionText}
                            onChange={(e) => setSubmissionText(e.target.value)}
                            placeholder="Введите ваш ответ здесь..."
                            rows={8}
                          />
                          <Button onClick={() => submitHomework(selectedHomework.id, 'text')} className="w-full">
                            Отправить работу
                            <Icon name="Send" size={16} className="ml-2" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        )}

        {currentView === 'schedule' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold mb-2">Расписание дедлайнов</h2>
              <p className="text-muted-foreground">Календарь домашних заданий</p>
            </div>

            <Card>
              <CardContent className="pt-6">
                {renderCalendar()}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Ближайшие дедлайны</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {homework
                    .filter(hw => new Date(hw.deadline) > new Date())
                    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
                    .slice(0, 5)
                    .map(hw => {
                      const deadline = new Date(hw.deadline);
                      const daysLeft = Math.ceil((deadline.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                      
                      return (
                        <div key={hw.id} className="flex justify-between items-center p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">{hw.title}</p>
                            <p className="text-sm text-muted-foreground">
                              {deadline.toLocaleString('ru-RU')}
                            </p>
                          </div>
                          <Badge variant={daysLeft <= 2 ? 'destructive' : 'default'}>
                            {daysLeft === 0 ? 'Сегодня' : daysLeft === 1 ? 'Завтра' : `Через ${daysLeft} дн.`}
                          </Badge>
                        </div>
                      );
                    })}
                  
                  {homework.filter(hw => new Date(hw.deadline) > new Date()).length === 0 && (
                    <p className="text-center text-muted-foreground py-4">Нет предстоящих дедлайнов</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {currentView === 'admin' && (user.is_admin || user.is_teacher) && (
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">Панель {user.is_teacher ? 'учителя' : 'администратора'}</h2>
              <p className="text-muted-foreground">Управление контентом и статистика учеников</p>
            </div>

            <div className="grid md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <Icon name="Users" size={32} className="mx-auto text-primary mb-2" />
                    <p className="text-3xl font-bold text-primary">{submissions.length}</p>
                    <p className="text-sm text-muted-foreground">Всего учеников</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <Icon name="Video" size={32} className="mx-auto text-primary mb-2" />
                    <p className="text-3xl font-bold text-primary">{webinars.length}</p>
                    <p className="text-sm text-muted-foreground">Вебинаров создано</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <Icon name="BookOpen" size={32} className="mx-auto text-primary mb-2" />
                    <p className="text-3xl font-bold text-primary">{homework.length}</p>
                    <p className="text-sm text-muted-foreground">Заданий активно</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <Icon name="CheckCircle" size={32} className="mx-auto text-primary mb-2" />
                    <p className="text-3xl font-bold text-primary">{mySubmissions.length}</p>
                    <p className="text-sm text-muted-foreground">Работ проверено</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Код приглашения для учеников</CardTitle>
                <CardDescription>Дайте этот код ученикам для регистрации</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="bg-primary/10 p-4 rounded-lg text-center">
                      <p className="text-3xl font-bold text-primary tracking-wider">{inviteCode}</p>
                    </div>
                  </div>
                  <Button onClick={generateInviteCode} variant="outline">
                    <Icon name="RefreshCw" size={16} className="mr-2" />
                    Новый код
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Создать вебинар</CardTitle>
                <CardDescription>Добавьте новое обучающее видео</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={createWebinar} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Название</label>
                    <Input 
                      value={newWebinar.title}
                      onChange={(e) => setNewWebinar({...newWebinar, title: e.target.value})}
                      placeholder="Название вебинара"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Описание</label>
                    <Textarea 
                      value={newWebinar.description}
                      onChange={(e) => setNewWebinar({...newWebinar, description: e.target.value})}
                      placeholder="Краткое описание"
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Ссылка на видео (YouTube embed) или загрузить файл</label>
                    <Input 
                      value={newWebinar.video_url}
                      onChange={(e) => setNewWebinar({...newWebinar, video_url: e.target.value})}
                      placeholder="https://www.youtube.com/embed/..."
                      disabled={videoFile !== null}
                    />
                    <div className="mt-2">
                      <label className="flex items-center gap-2 cursor-pointer border-2 border-dashed rounded-lg p-3 hover:bg-muted/50 transition-colors">
                        <Icon name="Upload" size={20} className="text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {videoFile ? videoFile.name : 'Или загрузите видео с устройства'}
                        </span>
                        <input 
                          type="file"
                          accept="video/*"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              setVideoFile(e.target.files[0]);
                              setNewWebinar({...newWebinar, video_url: ''});
                            }
                          }}
                        />
                      </label>
                      {videoFile && (
                        <Button 
                          type="button"
                          size="sm" 
                          variant="ghost" 
                          className="mt-2"
                          onClick={() => setVideoFile(null)}
                        >
                          <Icon name="X" size={14} className="mr-1" />
                          Удалить файл
                        </Button>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Длительность (минуты)</label>
                    <Input 
                      type="number"
                      value={newWebinar.duration}
                      onChange={(e) => setNewWebinar({...newWebinar, duration: parseInt(e.target.value)})}
                      placeholder="45"
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    <Icon name="Plus" size={16} className="mr-2" />
                    Создать вебинар
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Создать домашнее задание</CardTitle>
                <CardDescription>Добавьте новое задание для учеников</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={createHomework} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Название</label>
                    <Input 
                      value={newHomework.title}
                      onChange={(e) => setNewHomework({...newHomework, title: e.target.value})}
                      placeholder="Название задания"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Описание</label>
                    <Textarea 
                      value={newHomework.description}
                      onChange={(e) => setNewHomework({...newHomework, description: e.target.value})}
                      placeholder="Подробное описание задания"
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Тип задания</label>
                    <select 
                      className="w-full px-3 py-2 border rounded-lg"
                      value={newHomework.homework_type}
                      onChange={(e) => setNewHomework({...newHomework, homework_type: e.target.value})}
                    >
                      <option value="text">Текстовый ответ</option>
                      <option value="file">Загрузка файла</option>
                      <option value="test">Тест</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Дедлайн</label>
                    <Input 
                      type="datetime-local"
                      value={newHomework.deadline}
                      onChange={(e) => setNewHomework({...newHomework, deadline: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Максимальный балл</label>
                    <Input 
                      type="number"
                      min="1"
                      max="10"
                      value={newHomework.max_score}
                      onChange={(e) => setNewHomework({...newHomework, max_score: parseInt(e.target.value)})}
                      placeholder="1 или 2 балла"
                      required
                    />
                    <p className="text-xs text-muted-foreground mt-1">За какое задание: 1 или 2 балла</p>
                  </div>
                  
                  {newHomework.homework_type === 'test' && (
                    <div className="border rounded-lg p-4 space-y-4 bg-muted/30">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium">Вопросы теста ({testQuestions.length})</label>
                        <Button type="button" size="sm" variant="outline" onClick={() => {
                          if (currentQuestion.question && currentQuestion.options.every(o => o)) {
                            setTestQuestions([...testQuestions, {...currentQuestion}]);
                            setCurrentQuestion({ question: '', options: ['', '', '', ''], correct: 0 });
                          } else {
                            alert('Заполните вопрос и все варианты ответов');
                          }
                        }}>
                          <Icon name="Plus" size={14} className="mr-1" />
                          Добавить вопрос
                        </Button>
                      </div>
                      
                      <div className="space-y-3">
                        <Input 
                          placeholder="Текст вопроса"
                          value={currentQuestion.question}
                          onChange={(e) => setCurrentQuestion({...currentQuestion, question: e.target.value})}
                        />
                        {currentQuestion.options.map((opt, idx) => (
                          <div key={idx} className="flex gap-2">
                            <Input 
                              placeholder={`Вариант ${idx + 1}`}
                              value={opt}
                              onChange={(e) => {
                                const newOpts = [...currentQuestion.options];
                                newOpts[idx] = e.target.value;
                                setCurrentQuestion({...currentQuestion, options: newOpts});
                              }}
                            />
                            <Button 
                              type="button"
                              size="sm"
                              variant={currentQuestion.correct === idx ? 'default' : 'outline'}
                              onClick={() => setCurrentQuestion({...currentQuestion, correct: idx})}
                            >
                              {currentQuestion.correct === idx ? '✓ Верно' : 'Отметить'}
                            </Button>
                          </div>
                        ))}
                      </div>
                      
                      {testQuestions.length > 0 && (
                        <div className="pt-2 border-t">
                          <p className="text-sm font-medium mb-2">Добавленные вопросы:</p>
                          <div className="space-y-2">
                            {testQuestions.map((q, idx) => (
                              <div key={idx} className="text-sm bg-white p-2 rounded flex justify-between items-center">
                                <span>{idx + 1}. {q.question}</span>
                                <Button 
                                  type="button"
                                  size="sm" 
                                  variant="ghost"
                                  onClick={() => setTestQuestions(testQuestions.filter((_, i) => i !== idx))}
                                >
                                  <Icon name="X" size={14} />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  
                  <Button type="submit" className="w-full" disabled={newHomework.homework_type === 'test' && testQuestions.length === 0}>
                    <Icon name="Plus" size={16} className="mr-2" />
                    Создать задание {newHomework.homework_type === 'test' && `(${testQuestions.length} вопросов)`}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        {currentView === 'profile' && (
          <div className="max-w-2xl mx-auto space-y-6">
            <h2 className="text-3xl font-bold mb-6">Профиль</h2>
            
            <Card>
              <CardHeader>
                <CardTitle>Личные данные</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                    <Icon name="User" size={40} className="text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">{user.full_name || user.username}</h3>
                    <p className="text-muted-foreground">{user.email}</p>
                    <div className="flex gap-2 mt-2">
                      {user.is_admin && <Badge>Администратор</Badge>}
                      {user.is_teacher && <Badge variant="secondary">Учитель</Badge>}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Статистика</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-primary">{homeworkStats?.submitted_homework || 0}</p>
                    <p className="text-sm text-muted-foreground">Сдано работ</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-primary">
                      {homeworkStats?.average_score ? Math.round(homeworkStats.average_score) : 0}%
                    </p>
                    <p className="text-sm text-muted-foreground">Средний балл</p>
                  </div>
                </div>
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