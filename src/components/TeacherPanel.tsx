import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

interface Student {
  id: number;
  username: string;
  email: string;
  full_name: string;
  created_at: string;
}

interface TeacherPanelProps {
  user: any;
  apiUrl: string;
}

const TeacherPanel = ({ user, apiUrl }: TeacherPanelProps) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      setLoading(true);
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': user.id
        },
        body: JSON.stringify({ action: 'get_students' })
      });
      const data = await res.json();
      setStudents(data);
    } catch (err) {
      console.error('Ошибка загрузки учеников:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">Загрузка...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border-2 border-red-200 bg-gradient-to-br from-red-50 to-white relative overflow-hidden">
        <div className="absolute top-4 right-4 text-3xl animate-bounce">🎅</div>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="Users" size={24} />
            👥 Мои ученики ({students.length})
          </CardTitle>
          <CardDescription>
            Список всех зарегистрированных учеников
          </CardDescription>
        </CardHeader>
        <CardContent>
          {students.length === 0 ? (
            <div className="text-center py-8">
              <Icon name="UserX" size={48} className="mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Учеников пока нет</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {students.map((student) => (
                <Card
                  key={student.id}
                  className={`cursor-pointer transition-all hover:shadow-lg ${
                    selectedStudent?.id === student.id ? 'ring-2 ring-blue-500' : ''
                  }`}
                  onClick={() => setSelectedStudent(student)}
                >
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-semibold text-lg">{student.full_name}</h4>
                        <p className="text-sm text-muted-foreground">@{student.username}</p>
                      </div>
                      <Icon name="User" size={20} className="text-blue-500" />
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Icon name="Mail" size={14} />
                        <span className="truncate">{student.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Icon name="Calendar" size={14} />
                        <span>
                          {new Date(student.created_at).toLocaleDateString('ru-RU')}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {selectedStudent && (
        <Card className="border-2 border-green-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>📋 Информация об ученике</CardTitle>
                <CardDescription>{selectedStudent.full_name}</CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedStudent(null)}
              >
                <Icon name="X" size={20} />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Icon name="User" size={18} className="text-blue-500" />
                  <span className="font-semibold">Имя:</span>
                </div>
                <p className="pl-7">{selectedStudent.full_name}</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Icon name="AtSign" size={18} className="text-blue-500" />
                  <span className="font-semibold">Логин:</span>
                </div>
                <p className="pl-7">{selectedStudent.username}</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Icon name="Mail" size={18} className="text-blue-500" />
                  <span className="font-semibold">Email:</span>
                </div>
                <p className="pl-7">{selectedStudent.email}</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Icon name="Calendar" size={18} className="text-blue-500" />
                  <span className="font-semibold">Регистрация:</span>
                </div>
                <p className="pl-7">
                  {new Date(selectedStudent.created_at).toLocaleString('ru-RU')}
                </p>
              </div>
            </div>

            <div className="pt-4 border-t">
              <Badge variant="secondary" className="mb-3">
                <Icon name="Info" size={14} className="mr-1" />
                Доступ к данным
              </Badge>
              <div className="bg-muted/50 p-4 rounded-lg space-y-2 text-sm">
                <p className="flex items-center gap-2">
                  <Icon name="Lock" size={14} />
                  <span className="font-semibold">ID ученика:</span>
                  <code className="bg-background px-2 py-1 rounded">{selectedStudent.id}</code>
                </p>
                <p className="text-muted-foreground text-xs">
                  Используйте этот ID для назначения индивидуальных заданий
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TeacherPanel;