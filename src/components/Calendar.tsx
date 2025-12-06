import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';
import { Badge } from '@/components/ui/badge';

interface CalendarProps {
  scheduleItems: any[];
  onAddEvent: (date: Date, title: string, description: string, time: string) => void;
  isAdmin: boolean;
}

const Calendar = ({ scheduleItems, onAddEvent, isAdmin }: CalendarProps) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [newEvent, setNewEvent] = useState({ title: '', description: '', time: '' });

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  const getEventsForDate = (date: Date) => {
    return scheduleItems.filter(item => {
      const itemDate = new Date(item.date);
      return itemDate.toDateString() === date.toDateString();
    });
  };

  const handleAddEvent = () => {
    if (selectedDate && newEvent.title) {
      onAddEvent(selectedDate, newEvent.title, newEvent.description, newEvent.time);
      setNewEvent({ title: '', description: '', time: '' });
      setSelectedDate(null);
    }
  };

  const days = getDaysInMonth();
  const monthNames = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 
                      'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
  const weekDays = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];

  return (
    <div className="space-y-4">
      <Card className="bg-gradient-to-br from-blue-50 to-white border-2 border-blue-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
            >
              <Icon name="ChevronLeft" size={20} />
            </Button>
            <CardTitle className="text-2xl">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
            >
              <Icon name="ChevronRight" size={20} />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2 mb-2">
            {weekDays.map(day => (
              <div key={day} className="text-center font-semibold text-sm text-muted-foreground">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-2">
            {days.map((day, index) => {
              if (!day) {
                return <div key={`empty-${index}`} className="aspect-square" />;
              }
              const events = getEventsForDate(day);
              const isToday = day.toDateString() === new Date().toDateString();
              const isSelected = selectedDate?.toDateString() === day.toDateString();
              
              return (
                <button
                  key={index}
                  onClick={() => setSelectedDate(day)}
                  className={`aspect-square rounded-lg border-2 p-1 text-sm font-medium transition-all hover:scale-105 ${
                    isToday ? 'bg-green-100 border-green-500' : 
                    isSelected ? 'bg-blue-100 border-blue-500' :
                    events.length > 0 ? 'bg-red-50 border-red-300' : 
                    'bg-white border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <div>{day.getDate()}</div>
                  {events.length > 0 && (
                    <div className="flex justify-center gap-1 mt-1">
                      {events.slice(0, 3).map((_, i) => (
                        <div key={i} className="w-1 h-1 rounded-full bg-red-500" />
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {selectedDate && (
        <Card className="border-2 border-blue-300">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>
                {selectedDate.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
              <Button variant="ghost" size="sm" onClick={() => setSelectedDate(null)}>
                <Icon name="X" size={20} />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {getEventsForDate(selectedDate).length > 0 ? (
              <div className="space-y-2 mb-4">
                {getEventsForDate(selectedDate).map((event, i) => (
                  <div key={i} className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-semibold">{event.title}</p>
                        {event.time && (
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <Icon name="Clock" size={14} />
                            {event.time}
                          </p>
                        )}
                        {event.description && (
                          <p className="text-sm mt-1">{event.description}</p>
                        )}
                      </div>
                      {event.homework_id && <Badge variant="secondary">ДЗ</Badge>}
                      {event.webinar_id && <Badge variant="default">Вебинар</Badge>}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">Событий нет</p>
            )}

            {isAdmin && (
              <div className="space-y-3 pt-4 border-t">
                <h4 className="font-semibold">Добавить событие</h4>
                <Input
                  placeholder="Название"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                />
                <Input
                  type="time"
                  value={newEvent.time}
                  onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                />
                <Textarea
                  placeholder="Описание (необязательно)"
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                  rows={2}
                />
                <Button onClick={handleAddEvent} className="w-full">
                  <Icon name="Plus" size={18} className="mr-2" />
                  Добавить
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Calendar;
