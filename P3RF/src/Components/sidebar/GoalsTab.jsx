import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export default function GoalsTab({ user = {}, tasks = [], onUpdateUser }) {
  const difficultySettings = {
    easy: { percentage: 25, emoji: "😊", color: "from-green-400 to-green-500" },
    medium: { percentage: 50, emoji: "🔥", color: "from-yellow-400 to-orange-500" },
    hard: { percentage: 75, emoji: "💪", color: "from-red-400 to-red-500" }
  };

  const todaysTasks = (tasks || []).filter(task => {
    if (!task?.created_date) return false;
    const taskDate = new Date(task.created_date).toDateString();
    return taskDate === new Date().toDateString();
  });

  const completedToday = todaysTasks.filter(task => task.status === 'done').length;
  const currentDifficulty = difficultySettings[user?.difficulty || 'medium'];
  const dailyGoal = Math.max(0, Math.ceil((todaysTasks.length * currentDifficulty.percentage) / 100));
  const dailyProgress = dailyGoal > 0 ? Math.min((completedToday / dailyGoal) * 100, 100) : (completedToday > 0 ? 100 : 0);

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 text-center mb-4">
        🎯 Goals
      </h3>

      {/* Daily Goal */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-green-700 dark:text-green-300">Daily Goal</span>
          <Badge className={`text-xs bg-gradient-to-r ${currentDifficulty.color} text-white`}>
            {currentDifficulty.emoji}
          </Badge>
        </div>
        
        <div className="text-center mb-2">
          <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
            {dailyGoal > 0 ? `${completedToday} / ${dailyGoal}` : (todaysTasks.length > 0 ? `${completedToday} / ${todaysTasks.length}` : "0 / 0")}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">tasks completed</div>
        </div>

        <Progress value={dailyProgress} className="h-2 mb-2" />
        
        {dailyGoal > 0 ? (
          completedToday >= dailyGoal ? (
            <Badge className="w-full justify-center bg-green-100 text-green-700 text-xs">
              ✅ Goal Complete!
            </Badge>
          ) : (
            <div className="text-xs text-center text-gray-500">
              {Math.max(0, dailyGoal - completedToday)} more to go
            </div>
          )
        ) : (
          <div className="text-xs text-center text-gray-500">
            {todaysTasks.length === 0 ? "No tasks for today" : "Daily goal not set for today"}
          </div>
        )}
      </div>

      {/* Weekly Progress */}
      <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3">
        <div className="text-xs font-bold text-purple-700 dark:text-purple-300 mb-2">Weekly</div>
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-gray-600 dark:text-gray-400">Progress</span>
          <span className="text-xs font-bold">{user?.weekly_goals_completed || 0}/5</span>
        </div>
        <Progress value={((user?.weekly_goals_completed || 0) / 5) * 100} className="h-2" />
      </div>

      {/* Monthly Progress */}
      <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-3">
        <div className="text-xs font-bold text-orange-700 dark:text-orange-300 mb-2">Monthly</div>
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-gray-600 dark:text-gray-400">Progress</span>
          <span className="text-xs font-bold">{user?.monthly_weeks_completed || 0}/3</span>
        </div>
        <Progress value={((user?.monthly_weeks_completed || 0) / 3) * 100} className="h-2" />
      </div>
    </div>
  );
}