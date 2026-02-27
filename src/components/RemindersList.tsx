import { useState, useEffect } from 'react';
import { Bell, BellOff, Clock, CheckCircle, AlertTriangle, Cloud, CloudRain, Sun } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { type Language } from '../lib/translations';

interface Reminder {
  id: string;
  reminder_time: string;
  reminder_type: 'advance' | 'due' | 'overdue';
  message: string;
  is_read: boolean;
  treatment_step_id: string;
  treatment_step: {
    title: string;
    scheduled_date: string;
  };
}

interface WeatherAlert {
  treatment_step_id: string;
  alert_type: 'favorable' | 'warning' | 'critical';
  message: string;
  weather_condition: string;
}

interface RemindersListProps {
  language: Language;
  userId: string;
}

export function RemindersList({ language, userId }: RemindersListProps) {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const [weatherAlerts, setWeatherAlerts] = useState<Map<string, WeatherAlert>>(new Map());

  useEffect(() => {
    loadReminders();
    loadWeatherAlerts();
  }, [userId]);

  async function loadReminders() {
    try {
      const { data, error } = await supabase
        .from('treatment_reminders')
        .select(`
          id,
          reminder_time,
          reminder_type,
          message,
          is_read,
          treatment_step_id,
          treatment_steps (
            title,
            scheduled_date
          )
        `)
        .eq('user_id', userId)
        .order('reminder_time', { ascending: true });

      if (error) throw error;

      const formattedReminders = data.map(r => ({
        ...r,
        treatment_step: Array.isArray(r.treatment_steps) ? r.treatment_steps[0] : r.treatment_steps,
      }));

      setReminders(formattedReminders);
    } catch (error) {
      console.error('Error loading reminders:', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadWeatherAlerts() {
    try {
      const { data, error } = await supabase
        .from('treatment_weather_alerts')
        .select('*')
        .gt('expires_at', new Date().toISOString());

      if (error) throw error;

      const alertsMap = new Map<string, WeatherAlert>();
      data?.forEach(alert => {
        alertsMap.set(alert.treatment_step_id, alert);
      });

      setWeatherAlerts(alertsMap);
    } catch (error) {
      console.error('Error loading weather alerts:', error);
    }
  }

  async function markAsRead(reminderId: string) {
    try {
      const { error } = await supabase
        .from('treatment_reminders')
        .update({ is_read: true })
        .eq('id', reminderId);

      if (error) throw error;
      await loadReminders();
    } catch (error) {
      console.error('Error marking reminder as read:', error);
    }
  }

  async function deleteReminder(reminderId: string) {
    try {
      const { error } = await supabase
        .from('treatment_reminders')
        .delete()
        .eq('id', reminderId);

      if (error) throw error;
      await loadReminders();
    } catch (error) {
      console.error('Error deleting reminder:', error);
    }
  }

  function getWeatherIcon(alertType: 'favorable' | 'warning' | 'critical') {
    switch (alertType) {
      case 'favorable':
        return <Sun className="w-5 h-5 text-green-600" />;
      case 'warning':
        return <Cloud className="w-5 h-5 text-yellow-600" />;
      case 'critical':
        return <CloudRain className="w-5 h-5 text-red-600" />;
    }
  }

  function getWeatherBadgeColor(alertType: 'favorable' | 'warning' | 'critical') {
    switch (alertType) {
      case 'favorable':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-300';
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  const unreadReminders = reminders.filter(r => !r.is_read);
  const displayReminders = showAll ? reminders : unreadReminders;
  const now = new Date();

  if (displayReminders.length === 0) {
    return (
      <div className="glass rounded-2xl p-8 border border-gray-200 text-center">
        <BellOff className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-600 font-semibold">
          {language === 'hi' ? 'कोई रिमाइंडर नहीं' : 'No reminders'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Bell className="w-6 h-6 text-emerald-600" />
          <h3 className="text-xl font-black text-gray-900">
            {language === 'hi' ? 'रिमाइंडर' : 'Reminders'}
          </h3>
          {unreadReminders.length > 0 && (
            <span className="bg-red-500 text-white text-sm font-black px-3 py-1 rounded-full">
              {unreadReminders.length}
            </span>
          )}
        </div>
        <button
          onClick={() => setShowAll(!showAll)}
          className="text-sm font-bold text-emerald-600 hover:text-emerald-700 underline"
        >
          {showAll
            ? (language === 'hi' ? 'अपठित दिखाएं' : 'Show unread')
            : (language === 'hi' ? 'सभी दिखाएं' : 'Show all')}
        </button>
      </div>

      <div className="space-y-3">
        {displayReminders.map((reminder) => {
          const reminderTime = new Date(reminder.reminder_time);
          const isOverdue = reminderTime < now;
          const isDueToday = reminderTime.toDateString() === now.toDateString();
          const weatherAlert = weatherAlerts.get(reminder.treatment_step_id);

          return (
            <div
              key={reminder.id}
              className={`glass rounded-xl p-5 border-2 transition-all duration-300 hover:shadow-xl ${
                !reminder.is_read
                  ? isOverdue
                    ? 'border-red-300 bg-red-50'
                    : isDueToday
                    ? 'border-orange-300 bg-orange-50'
                    : 'border-emerald-300 bg-emerald-50'
                  : 'border-gray-200 bg-gray-50 opacity-60'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  {isOverdue ? (
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                  ) : isDueToday ? (
                    <Clock className="w-6 h-6 text-orange-600" />
                  ) : (
                    <Bell className="w-6 h-6 text-emerald-600" />
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-lg font-black text-gray-900">
                          {reminder.treatment_step?.title}
                        </h4>
                        {weatherAlert && (
                          <div className={`flex items-center gap-1 px-2 py-1 rounded-lg border text-xs font-bold ${getWeatherBadgeColor(weatherAlert.alert_type)}`}>
                            {getWeatherIcon(weatherAlert.alert_type)}
                            <span className="capitalize">{weatherAlert.alert_type}</span>
                          </div>
                        )}
                      </div>
                      <p className="text-gray-700 font-semibold">{reminder.message}</p>
                      {weatherAlert && (
                        <p className="text-sm text-gray-600 mt-1 italic">
                          {weatherAlert.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                    <Clock className="w-4 h-4" />
                    <span className="font-bold">
                      {reminderTime.toLocaleString(language === 'hi' ? 'hi-IN' : 'en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    {isOverdue && (
                      <span className="text-red-600 font-black ml-2">
                        {language === 'hi' ? '(विलम्बित)' : '(Overdue)'}
                      </span>
                    )}
                  </div>

                  <div className="flex gap-2">
                    {!reminder.is_read && (
                      <button
                        onClick={() => markAsRead(reminder.id)}
                        className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-emerald-700 transition-colors text-sm"
                      >
                        <CheckCircle className="w-4 h-4" />
                        {language === 'hi' ? 'पढ़ा हुआ चिह्नित करें' : 'Mark as read'}
                      </button>
                    )}
                    <button
                      onClick={() => deleteReminder(reminder.id)}
                      className="text-sm text-gray-500 hover:text-gray-700 font-bold underline"
                    >
                      {language === 'hi' ? 'हटाएं' : 'Delete'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
