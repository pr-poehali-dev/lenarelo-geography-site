import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import Icon from '@/components/ui/icon';
import { Badge } from '@/components/ui/badge';

interface HomeworkFormProps {
  newHomework: any;
  setNewHomework: (hw: any) => void;
  testQuestions: any[];
  setTestQuestions: (questions: any[]) => void;
  currentQuestion: any;
  setCurrentQuestion: (q: any) => void;
  allStudents: any[];
  selectedStudents: number[];
  setSelectedStudents: (students: number[]) => void;
  studentSearchQuery: string;
  setStudentSearchQuery: (query: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

const HomeworkForm = ({
  newHomework,
  setNewHomework,
  testQuestions,
  setTestQuestions,
  currentQuestion,
  setCurrentQuestion,
  allStudents,
  selectedStudents,
  setSelectedStudents,
  studentSearchQuery,
  setStudentSearchQuery,
  onSubmit
}: HomeworkFormProps) => {
  
  const addQuestion = () => {
    if (currentQuestion.question && currentQuestion.options.every((o: string) => o)) {
      setTestQuestions([...testQuestions, {...currentQuestion}]);
      setCurrentQuestion({ question: '', options: ['', '', '', ''], correct: 0 });
    } else {
      alert('Заполните вопрос и все варианты ответов');
    }
  };

  return (
    <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 via-white to-pink-50 relative overflow-hidden">
      <div className="absolute top-4 right-4 text-3xl animate-bounce" style={{ animationDelay: '0.2s' }}>🎁</div>
      <div className="absolute bottom-4 left-4 text-2xl animate-pulse">⭐</div>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon name="BookPlus" size={24} />
          📝 Создать домашнее задание
        </CardTitle>
        <CardDescription>Добавьте новое задание с автопроверкой и ручной частью</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-6">
          {/* Основная информация */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg flex items-center gap-2">
              <Icon name="Info" size={18} />
              Основная информация
            </h4>
            
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

            <div className="grid md:grid-cols-2 gap-4">
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
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Максимальный балл за 1 часть (автопроверка)
              </label>
              <Input 
                type="number"
                min="1"
                max="10"
                value={newHomework.max_score}
                onChange={(e) => setNewHomework({...newHomework, max_score: parseInt(e.target.value)})}
                required
              />
            </div>
          </div>

          {/* Часть 2 */}
          <div className="border-t pt-4">
            <div className="flex items-center gap-2 mb-4">
              <Checkbox
                checked={newHomework.has_part2}
                onCheckedChange={(checked) => setNewHomework({...newHomework, has_part2: checked})}
              />
              <label className="text-sm font-medium cursor-pointer">
                <Icon name="UserCheck" size={16} className="inline mr-1" />
                Добавить вторую часть (ручная проверка учителем)
              </label>
            </div>

            {newHomework.has_part2 && (
              <div className="space-y-4 pl-6 border-l-4 border-purple-200">
                <div>
                  <label className="text-sm font-medium mb-2 block">Описание 2 части</label>
                  <Textarea 
                    value={newHomework.part2_description}
                    onChange={(e) => setNewHomework({...newHomework, part2_description: e.target.value})}
                    placeholder="Что ученик должен сделать во второй части?"
                    rows={2}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Максимальный балл за 2 часть
                  </label>
                  <Input 
                    type="number"
                    min="1"
                    max="10"
                    value={newHomework.part2_max_score}
                    onChange={(e) => setNewHomework({...newHomework, part2_max_score: parseInt(e.target.value)})}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Вопросы теста */}
          {newHomework.homework_type === 'test' && (
            <div className="border rounded-lg p-4 space-y-4 bg-blue-50/50">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Вопросы теста ({testQuestions.length})</label>
                <Button type="button" size="sm" variant="outline" onClick={addQuestion}>
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
                {currentQuestion.options.map((opt: string, idx: number) => (
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
                      <div key={idx} className="bg-white p-2 rounded border text-sm">
                        <Badge variant="secondary" className="mr-2">{idx + 1}</Badge>
                        {q.question}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Выбор учеников */}
          <div className="border rounded-lg p-4 space-y-3 bg-green-50/50">
            <label className="text-sm font-medium flex items-center gap-2">
              <Icon name="Users" size={16} />
              Для кого это задание? (оставьте пустым для всех)
            </label>
            <Input 
              placeholder="Поиск учеников..."
              value={studentSearchQuery}
              onChange={(e) => setStudentSearchQuery(e.target.value)}
            />
            <div className="max-h-48 overflow-y-auto space-y-2">
              {allStudents
                .filter(s => 
                  studentSearchQuery === '' ||
                  s.full_name.toLowerCase().includes(studentSearchQuery.toLowerCase()) ||
                  s.username.toLowerCase().includes(studentSearchQuery.toLowerCase())
                )
                .map(student => (
                  <label key={student.id} className="flex items-center gap-2 cursor-pointer hover:bg-white p-2 rounded transition-colors">
                    <input 
                      type="checkbox"
                      checked={selectedStudents.includes(student.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedStudents([...selectedStudents, student.id]);
                        } else {
                          setSelectedStudents(selectedStudents.filter(id => id !== student.id));
                        }
                      }}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">{student.full_name} (@{student.username})</span>
                  </label>
                ))}
            </div>
            {selectedStudents.length > 0 && (
              <p className="text-xs text-muted-foreground">
                Выбрано учеников: {selectedStudents.length}
              </p>
            )}
          </div>
          
          <Button 
            type="submit" 
            className="w-full bg-gradient-to-r from-purple-500 to-purple-600" 
            size="lg"
            disabled={newHomework.homework_type === 'test' && testQuestions.length === 0}
          >
            <Icon name="Plus" size={18} className="mr-2" />
            Создать задание {newHomework.homework_type === 'test' && `(${testQuestions.length} вопросов)`}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default HomeworkForm;