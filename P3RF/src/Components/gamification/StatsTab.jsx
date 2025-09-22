import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Trophy, 
  Zap, 
  Skull, 
  Flame, 
  Target,
  Calendar
} from "lucide-react";
import { motion } from "framer-motion";
import DoomCounter from "./DoomCounter";

export default function StatsTab({ user, tasks }) {
  if (!user) {
    return <div>Loading...</div>;
  }

  const completedTasks = tasks?.filter(task => task.status === 'done' || task.status === 'slain') || [];
  const todaysTasks = tasks?.filter(task => {
    if (!task.created_date) return false;
    const taskDate = new Date(task.created_date).toDateString();
    const today = new Date().toDateString();
    return taskDate === today;
  }) || [];
  const completedToday = todaysTasks.filter(task => task.status === 'done' || task.status === 'slain');

  const stats = [
    {
      icon: Trophy,
      label: "Cards Slain",
      value: user?.tasks_completed || 0,
      description: "Total completed tasks",
      color: "text-yellow-600 dark:text-yellow-400",
      bgColor: "from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20",
      borderColor: "border-yellow-200 dark:border-yellow-700/50"
    },
    {
      icon: Zap,
      label: "Total EXP",
      value: user?.total_exp || 0,
      description: "Experience points earned",
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20",
      borderColor: "border-blue-200 dark:border-blue-700/50"
    },
    {
      icon: Flame,
      label: "Current Streak",
      value: user?.streak_days || 0,
      description: "Consecutive active days",
      color: "text-orange-600 dark:text-orange-400",
      bgColor: "from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20",
      borderColor: "border-orange-200 dark:border-orange-700/50"
    },
    {
      icon: Calendar,
      label: "Total Pomodoros",
      value: user?.total_pomodoros || 0,
      description: "Focus sessions completed",
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20",
      borderColor: "border-purple-200 dark:border-purple-700/50"
    }
  ];

  const currentExp = user?.current_level_exp || 0;
  const nextLevelExp = user?.next_level_exp || Math.max(100, currentExp + 100);
  const levelProgress = nextLevelExp > 0 ? Math.min((currentExp / nextLevelExp) * 100, 100) : 0;

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">📈 Adventure Stats</h3>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={`bg-gradient-to-br ${stat.bgColor} border ${stat.borderColor} shadow-sm rounded-lg`}>
                <CardContent className="p-2">
                  <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-md bg-white/50 dark:bg-gray-800/30`}>
                      <Icon className={`w-4 h-4 ${stat.color}`} />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-gray-800 dark:text-gray-200">{stat.value}</h4>
                      <p className="text-xs text-gray-600 dark:text-gray-400">{stat.label}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
      
      {/* Doom Counter */}
      <Card className="bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border border-red-200 dark:border-red-700/50 shadow-sm rounded-lg">
        <CardContent className="p-2">
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-md bg-white/50 dark:bg-gray-800/30`}>
              <Skull className="w-4 h-4 text-red-600 dark:text-red-400" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-sm text-gray-800 dark:text-gray-200">Doom Counter</h4>
              <DoomCounter count={user?.failed_streak} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Level Progress Section */}
      <Card className="bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/20 dark:to-blue-900/20 border border-purple-200 dark:border-purple-700/50 rounded-lg shadow-sm">
        <CardContent className="p-2">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center shadow-md">
                <span className="text-white font-bold text-xs">{user?.level || 1}</span>
              </div>
              <h4 className="font-bold text-sm text-gray-900 dark:text-gray-200">Level {user?.level || 1}</h4>
            </div>
            <div className="text-right text-xs text-gray-600 dark:text-gray-400">
              <div>{currentExp} / {nextLevelExp} EXP</div>
            </div>
          </div>

          <div className="mt-2">
            <Progress value={levelProgress} className="h-3 rounded-full" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}