import React from "react";
import { 
  Trophy, 
  Zap, 
  Skull, 
  Flame, 
  Target,
  Calendar
} from "lucide-react";

export default function StatsTab({ user = {}, tasks = [] }) {
  const todaysTasks = (tasks || []).filter(task => {
    if (!task?.created_date) return false;
    const taskDate = new Date(task.created_date).toDateString();
    return taskDate === new Date().toDateString();
  });

  const stats = [
    {
      icon: Trophy,
      label: "Slayed",
      value: user?.tasks_completed || 0,
      color: "text-yellow-600",
    },
    {
      icon: Zap,
      label: "Total XP",
      value: user?.total_exp || 0,
      color: "text-blue-600",
    },
    {
      icon: Flame,
      label: "Streak",
      value: user?.streak_days || 0,
      color: "text-orange-600",
    },
    {
      icon: Calendar,
      label: "Pomodoros",
      value: user?.total_pomodoros || 0,
      color: "text-purple-600",
    }
  ];

  const currentExp = Number(user?.current_level_exp || 0);
  const expToNext = Number(user?.exp_to_next_level || 100);
  const levelProgress = expToNext > 0 ? Math.min(100, Math.round((currentExp / expToNext) * 100)) : 0;

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 text-center mb-4">
        📈 Stats
      </h3>

      <div className="grid grid-cols-2 gap-2">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2 text-center">
              <div className={`${stat.color} mb-1`}>
                <Icon className="w-4 h-4 mx-auto" />
              </div>
              <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
                {stat.value}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                {stat.label}
              </div>
            </div>
          );
        })}
      </div>

      {/* Level Progress */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg p-3 mt-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-purple-700 dark:text-purple-300">LEVEL</span>
          <span className="text-sm font-bold text-purple-800 dark:text-purple-200">{user?.level ?? 1}</span>
        </div>
        <div className="w-full bg-white/50 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
          <div 
            className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${levelProgress}%` }}
          />
        </div>
        <div className="text-xs text-gray-500 mt-2">
          {currentExp} / {expToNext} XP
        </div>
      </div>
    </div>
  );
}