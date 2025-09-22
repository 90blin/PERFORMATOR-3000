import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ChevronDown, ChevronRight, Target, Calendar, Trophy } from 'lucide-react';

export default function StatusSummary({ isExpanded, onToggle, tasks, user }) {
  const getTasksByStatus = (status) => {
    if (!Array.isArray(tasks)) return [];
    return tasks.filter(task => task && task.status === status).length;
  };

  const getDifficultyPercentage = () => {
    switch (user?.difficulty) {
      case 'easy': return 25;
      case 'hard': return 75;
      case 'medium':
      default:
        return 50;
    }
  };

  const todaysTasks = tasks.filter(task => new Date(task.created_date).toDateString() === new Date().toDateString());
  const completedToday = todaysTasks.filter(task => task.status === 'done' || task.status === 'slain');
  const dailyGoalTarget = Math.ceil(todaysTasks.length * (getDifficultyPercentage() / 100));
  const dailyProgress = dailyGoalTarget > 0 ? Math.min((completedToday.length / dailyGoalTarget) * 100, 100) : (completedToday.length > 0 ? 100 : 0);
  
  const weeklyProgress = ((user?.weekly_goals_completed || 0) / 5) * 100;
  const monthlyProgress = ((user?.monthly_weeks_completed || 0) / 3) * 100;

  const stats = [
    { label: "Backlog", count: getTasksByStatus('backlog') },
    { label: "To Do", count: getTasksByStatus('todo') },
    { label: "In Progress", count: getTasksByStatus('in_progress') },
    { label: "Done", count: getTasksByStatus('done') },
  ];

  return (
    <div className="p-2">
      <div className="space-y-4">
        <div>
          <div className="flex justify-between items-center mb-1">
            <p className="flex items-center gap-1 text-sm font-semibold text-gray-700 dark:text-gray-300">
              <Target className="w-4 h-4 text-green-500"/>
              Daily Goal
            </p>
            <p className="text-xs font-mono text-gray-500">{completedToday.length} / {dailyGoalTarget} tasks</p>
          </div>
          <Progress value={dailyProgress} className="h-2" />
        </div>
        <div>
          <div className="flex justify-between items-center mb-1">
            <p className="flex items-center gap-1 text-sm font-semibold text-gray-700 dark:text-gray-300">
              <Calendar className="w-4 h-4 text-blue-500"/>
              Weekly Goal
            </p>
            <p className="text-xs font-mono text-gray-500">{user?.weekly_goals_completed || 0} / 5 days</p>
          </div>
          <Progress value={weeklyProgress} className="h-2" />
        </div>
        <div>
          <div className="flex justify-between items-center mb-1">
            <p className="flex items-center gap-1 text-sm font-semibold text-gray-700 dark:text-gray-300">
              <Trophy className="w-4 h-4 text-purple-500"/>
              Monthly Goal
            </p>
            <p className="text-xs font-mono text-gray-500">{user?.monthly_weeks_completed || 0} / 3 weeks</p>
          </div>
          <Progress value={monthlyProgress} className="h-2" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mt-4">
        {stats.map(stat => (
          <div key={stat.label} className="bg-gray-100 dark:bg-gray-700/50 p-2 rounded-lg text-center">
            <p className="text-lg font-bold text-gray-800 dark:text-gray-100">{stat.count}</p>
            <p className="text-xs font-semibold text-gray-600 dark:text-gray-400">{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}