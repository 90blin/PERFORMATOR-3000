import React, { useState, useEffect } from "react";
import { User, Task } from "@/entities/all";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Target, 
  Calendar, 
  Trophy, 
  Settings,
  Zap,
  CheckCircle2
} from "lucide-react";
import { motion } from "framer-motion";

export default function Goals() {
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [settings, setSettings] = useState({
    daily_task_percentage: 50,
    weekly_goal_days: 5,
    monthly_goal_weeks: 3,
    exp_decay_rate: 10,
    streak_bonus_multiplier: 1.5
  });

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [currentUser, allTasks] = await Promise.all([
        User.me(),
        (typeof Task.list === "function") ? Task.list("-created_date") : Promise.resolve([])
      ]);
      setUser(currentUser || null);
      setTasks(allTasks || []);
      
      // Load user's custom settings if they exist
      if (currentUser?.goal_settings) {
        setSettings(prev => ({ ...prev, ...currentUser.goal_settings }));
      }
    } catch (error) {
      console.error("Error loading data:", error);
      setUser(null);
      setTasks([]);
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      await User.updateMyUserData({
        goal_settings: settings,
        difficulty: getDifficultyFromPercentage(settings.daily_task_percentage)
      });
      setUser(prev => prev ? { 
        ...prev, 
        goal_settings: settings,
        difficulty: getDifficultyFromPercentage(settings.daily_task_percentage)
      } : prev);
    } catch (error) {
      console.error("Error saving settings:", error);
    }
  };

  const getDifficultyFromPercentage = (percentage) => {
    if (percentage <= 35) return 'easy';
    if (percentage <= 65) return 'medium';
    return 'hard';
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-50 border-green-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'hard': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getTodaysTasks = () => {
    const today = new Date().toDateString();
    return (tasks || []).filter(task => {
      if (!task?.created_date) return false;
      const taskDate = new Date(task.created_date).toDateString();
      return taskDate === today;
    });
  };

  const getCompletedTodayTasks = () => {
    return getTodaysTasks().filter(task => task.status === 'done' || task.status === 'slain');
  };

  const calculateDailyGoal = () => {
    const todaysTasks = getTodaysTasks();
    return Math.max(0, Math.ceil(todaysTasks.length * (settings.daily_task_percentage / 100)));
  };

  const getCurrentDifficulty = () => {
    return getDifficultyFromPercentage(settings.daily_task_percentage);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-4 border-purple-200 border-t-purple-500 rounded-full mx-auto"
          />
          <p className="text-gray-600 font-medium">Loading goals...</p>
        </div>
      </div>
    );
  }

  const todaysTasks = getTodaysTasks();
  const completedTasks = getCompletedTodayTasks();
  const dailyGoal = calculateDailyGoal();
  const dailyProgress = dailyGoal > 0 ? (completedTasks.length / dailyGoal) * 100 : 0;
  const currentDifficulty = getCurrentDifficulty();

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Goal Management</h1>
          <p className="text-gray-600 text-lg">Customize your daily, weekly, and monthly targets</p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Settings Panel */}
          <div className="space-y-6">
            <Card className="shadow-2xl rounded-3xl border-0 bg-white">
              <CardHeader className="bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-t-3xl">
                <CardTitle className="flex items-center gap-2 text-xl font-bold">
                  <Settings className="w-6 h-6" />
                  Goal Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {/* Daily Goal Percentage */}
                <div>
                  <Label className="font-semibold text-gray-700 mb-2 block">
                    Daily Goal Percentage: {settings.daily_task_percentage}%
                  </Label>
                  <div className="space-y-3">
                    <Input
                      type="range"
                      min="10"
                      max="100"
                      step="5"
                      value={settings.daily_task_percentage}
                      onChange={(e) => setSettings(prev => ({ ...prev, daily_task_percentage: parseInt(e.target.value, 10) }))}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>Easy (10%)</span>
                      <span>Medium (50%)</span>
                      <span>Hard (100%)</span>
                    </div>
                    <Badge className={`${getDifficultyColor(currentDifficulty)} border font-medium`}>
                      Current: {currentDifficulty.toUpperCase()}
                    </Badge>
                  </div>
                </div>

                {/* Weekly Goal */}
                <div>
                  <Label className="font-semibold text-gray-700 mb-2 block">
                    Weekly Goal (Days to Complete)
                  </Label>
                  <Input
                    type="number"
                    min="1"
                    max="7"
                    value={settings.weekly_goal_days}
                    onChange={(e) => setSettings(prev => ({ ...prev, weekly_goal_days: parseInt(e.target.value, 10) }))}
                    className="w-full rounded-xl"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Complete daily goals on {settings.weekly_goal_days} out of 7 days
                  </p>
                </div>

                {/* Monthly Goal */}
                <div>
                  <Label className="font-semibold text-gray-700 mb-2 block">
                    Monthly Goal (Weeks to Complete)
                  </Label>
                  <Input
                    type="number"
                    min="1"
                    max="4"
                    value={settings.monthly_goal_weeks}
                    onChange={(e) => setSettings(prev => ({ ...prev, monthly_goal_weeks: parseInt(e.target.value, 10) }))}
                    className="w-full rounded-xl"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Complete weekly goals in {settings.monthly_goal_weeks} out of 4 weeks
                  </p>
                </div>

                {/* XP Decay Rate */}
                <div>
                  <Label className="font-semibold text-gray-700 mb-2 block">
                    XP Decay Rate: {settings.exp_decay_rate}% per day
                  </Label>
                  <Input
                    type="range"
                    min="5"
                    max="25"
                    step="5"
                    value={settings.exp_decay_rate}
                    onChange={(e) => setSettings(prev => ({ ...prev, exp_decay_rate: parseInt(e.target.value, 10) }))}
                    className="w-full"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    XP lost per day of inactivity
                  </p>
                </div>

                {/* Streak Bonus */}
                <div>
                  <Label className="font-semibold text-gray-700 mb-2 block">
                    Streak Bonus Multiplier: {settings.streak_bonus_multiplier}x
                  </Label>
                  <Input
                    type="number"
                    min="1"
                    max="3"
                    step="0.1"
                    value={settings.streak_bonus_multiplier}
                    onChange={(e) => setSettings(prev => ({ ...prev, streak_bonus_multiplier: parseFloat(e.target.value) }))}
                    className="w-full rounded-xl"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    XP multiplier for maintaining streaks
                  </p>
                </div>

                <Button
                  onClick={saveSettings}
                  className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 rounded-xl font-bold shadow-lg"
                >
                  Save Settings
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Progress Panel */}
          <div className="space-y-6">
            {/* Daily Progress */}
            <Card className="shadow-2xl rounded-3xl border-0 bg-gradient-to-br from-green-50 to-emerald-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl font-bold text-gray-900">
                  <Target className="w-6 h-6 text-green-600" />
                  Today's Progress
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-4xl font-bold text-gray-900 mb-2">
                    {completedTasks.length} / {dailyGoal}
                  </div>
                  <p className="text-gray-600">Tasks completed today</p>
                  <Badge className={`mt-2 ${getDifficultyColor(currentDifficulty)} border`}>
                    {currentDifficulty.toUpperCase()} MODE
                  </Badge>
                </div>

                <Progress value={Math.min(dailyProgress, 100)} className="h-3" />

                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="p-3 bg-white rounded-xl">
                    <div className="text-2xl font-bold text-blue-600">{todaysTasks.length}</div>
                    <div className="text-sm text-gray-600">Total Tasks</div>
                  </div>
                  <div className="p-3 bg-white rounded-xl">
                    <div className="text-2xl font-bold text-orange-600">
                      {todaysTasks.reduce((sum, task) => sum + (task?.exp_value || 0), 0)}
                    </div>
                    <div className="text-sm text-gray-600">Available XP</div>
                  </div>
                </div>

                {dailyProgress >= 100 && (
                  <div className="text-center p-4 bg-green-100 rounded-xl">
                    <CheckCircle2 className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <p className="font-bold text-green-800">Daily Goal Complete! 🎉</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Weekly Progress */}
            <Card className="shadow-2xl rounded-3xl border-0 bg-gradient-to-br from-blue-50 to-purple-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl font-bold text-gray-900">
                  <Calendar className="w-6 h-6 text-blue-600" />
                  Weekly Progress
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900 mb-2">
                    {user?.weekly_goals_completed || 0} / {settings.weekly_goal_days}
                  </div>
                  <p className="text-gray-600">Daily goals this week</p>
                </div>

                <Progress 
                  value={((user?.weekly_goals_completed || 0) / settings.weekly_goal_days) * 100} 
                  className="h-3" 
                />
              </CardContent>
            </Card>

            {/* Monthly Progress */}
            <Card className="shadow-2xl rounded-3xl border-0 bg-gradient-to-br from-yellow-50 to-orange-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl font-bold text-gray-900">
                  <Trophy className="w-6 h-6 text-orange-600" />
                  Monthly Progress
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900 mb-2">
                    {user?.monthly_weeks_completed || 0} / {settings.monthly_goal_weeks}
                  </div>
                  <p className="text-gray-600">Weekly goals this month</p>
                </div>

                <Progress 
                  value={((user?.monthly_weeks_completed || 0) / settings.monthly_goal_weeks) * 100} 
                  className="h-3" 
                />
              </CardContent>
            </Card>

            {/* Current Stats */}
            <Card className="shadow-2xl rounded-3xl border-0 bg-gradient-to-br from-purple-50 to-pink-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl font-bold text-gray-900">
                  <Zap className="w-6 h-6 text-purple-600" />
                  Current Stats
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="p-3 bg-white rounded-xl">
                    <div className="text-2xl font-bold text-purple-600">{user?.level || 1}</div>
                    <div className="text-sm text-gray-600">Level</div>
                  </div>
                  <div className="p-3 bg-white rounded-xl">
                    <div className="text-2xl font-bold text-green-600">{user?.streak_days || 0}</div>
                    <div className="text-sm text-gray-600">Streak</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}