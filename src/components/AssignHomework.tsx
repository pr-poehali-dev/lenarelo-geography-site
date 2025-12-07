import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import Icon from '@/components/ui/icon';

interface Student {
  id: number;
  username: string;
  full_name: string;
}

interface Homework {
  id: number;
  title: string;
  description: string;
}

interface AssignHomeworkProps {
  user: any;
  authUrl: string;
  homeworkUrl: string;
  homework: Homework[];
  onAssigned: () => void;
}

const AssignHomework = ({ user, authUrl, homeworkUrl, homework, onAssigned }: AssignHomeworkProps) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedHomework, setSelectedHomework] = useState<number | null>(null);
  const [selectedStudents, setSelectedStudents] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      const res = await fetch(authUrl, {
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
    }
  };

  const handleAssign = async () => {
    if (!selectedHomework || selectedStudents.length === 0) {
      alert('Выберите задание и хотя бы одного ученика');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(homeworkUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': user.id
        },
        body: JSON.stringify({
          action: 'assign',
          homework_id: selectedHomework,
          student_ids: selectedStudents
        })
      });

      if (res.ok) {
        alert(`Задание назначено ${selectedStudents.length} ученикам!`);
        setSelectedHomework(null);
        setSelectedStudents([]);
        onAssigned();
      }
    } catch (err) {
      alert('Ошибка назначения задания');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleStudent = (studentId: number) => {
    setSelectedStudents(prev =>
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const toggleAll = () => {
    if (selectedStudents.length === students.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(students.map(s => s.id));
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-white relative overflow-hidden">
        <div className="absolute top-4 right-4 text-3xl animate-pulse">🎁</div>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="UserPlus" size={24} />
            🎯 Назначить задание
          </CardTitle>
          <CardDescription>
            Выберите задание и учеников для индивидуального назначения
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <label className="text-sm font-medium mb-3 block">1. Выберите задание</label>
            <div className="grid gap-2">
              {homework.map((hw) => (
                <button
                  key={hw.id}
                  onClick={() => setSelectedHomework(hw.id)}
                  className={`p-4 rounded-lg border-2 text-left transition-all ${
                    selectedHomework === hw.id
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-300'
                  }`}
                >
                  <h4 className="font-semibold">{hw.title}</h4>
                  <p className="text-sm text-muted-foreground mt-1">{hw.description}</p>
                </button>
              ))}
            </div>
          </div>

          {selectedHomework && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium">2. Выберите учеников</label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={toggleAll}
                >
                  {selectedStudents.length === students.length ? 'Снять все' : 'Выбрать всех'}
                </Button>
              </div>
              <div className="grid gap-2 max-h-64 overflow-y-auto">
                {students.map((student) => (
                  <div
                    key={student.id}
                    className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer"
                    onClick={() => toggleStudent(student.id)}
                  >
                    <Checkbox
                      checked={selectedStudents.includes(student.id)}
                      onCheckedChange={() => toggleStudent(student.id)}
                    />
                    <div className="flex-1">
                      <p className="font-medium">{student.full_name}</p>
                      <p className="text-sm text-muted-foreground">@{student.username}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedHomework && selectedStudents.length > 0 && (
            <div className="pt-4 border-t">
              <div className="bg-purple-50 p-4 rounded-lg mb-4">
                <p className="text-sm">
                  <Icon name="Info" size={16} className="inline mr-2" />
                  Выбрано: <strong>{selectedStudents.length}</strong> {selectedStudents.length === 1 ? 'ученик' : 'учеников'}
                </p>
              </div>
              <Button
                onClick={handleAssign}
                disabled={loading}
                className="w-full bg-gradient-to-r from-green-500 to-green-600"
                size="lg"
              >
                {loading ? 'Назначение...' : 'Назначить задание'}
                <Icon name="Send" size={18} className="ml-2" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AssignHomework;