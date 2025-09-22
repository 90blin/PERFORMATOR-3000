import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import { 
  Target, 
  Calendar, 
  Trophy, 
  Gift,
  Zap
} from "lucide-react";

const difficultySettings = {
  easy: { percentage: 25, label: "Easy Mode", emoji: "😊", color: "from-green-400 to-green-500" },
  medium: { percentage: 50, label: "Medium Mode", emoji: "🔥", color: "from-yellow-400 to-orange-500" },
  hard: { percentage: 75, label: "Hard Mode", emoji: "💪", color: "from-red-400 to-red-500" }
};

export default function GoalsTab({ user, tasks, onUpdateUser, onRewardClaimed }) {
  const [todaysTasks, setTodaysTasks] = useState([]);
  
  useEffect(() => {
    const today = new Date().toDateString();
    const tasksToday = tasks?.filter(task => {
      if (!task.created_date) return false;
      const taskDate = new Date(task.created_date).toDateString();
      return taskDate === today;
    }) || [];
    
    setTodaysTasks(tasksToday);
  }, [tasks]);

  const completedToday = todaysTasks.filter(task => task.status === 'done').length;
  const totalToday = todaysTasks.length;
  const currentDifficulty = difficultySettings[user?.difficulty || 'medium'];
  const dailyGoal = Math.ceil((totalToday * currentDifficulty.percentage) / 100);
  const dailyProgress = totalToday > 0 ? Math.min((completedToday / dailyGoal) * 100, 100) : 0;
  const isDailyGoalComplete = completedToday >= dailyGoal && dailyGoal > 0;
  const canClaimDaily = isDailyGoalComplete && !user?.daily_goal_claimed;

  const handleDifficultyChange = async (difficulty) => {
    await onUpdateUser({ difficulty });
  };

  const handleClaimDailyReward = async () => {
    try {
      // Calculate EXP bonus based on difficulty
      const expBonus = currentDifficulty.percentage * 2; // 50, 100, 150 XP
      
      // Item drop logic
      const dropChances = [
        { rarity: 'common', chance: 47, minLevel: 1 },
        { rarity: 'uncommon', chance: 25, minLevel: 1 },
        { rarity: 'rare', chance: 8, minLevel: 1 },
        { rarity: 'epic', chance: 4, minLevel: 15 },
        { rarity: 'legendary', chance: 1, minLevel: 25 }
      ];
      
      const userLevel = user?.level || 1;
      const availableDrops = dropChances.filter(drop => userLevel >= drop.minLevel);
      const random = Math.random() * 100;
      
      let cumulativeChance = 15; // 15% chance of no item
      let droppedItem = null;
      
      for (const drop of availableDrops) {
        cumulativeChance += drop.chance;
        if (random <= cumulativeChance) {
          // For demo, create a mock item
          droppedItem = {
            name: `${drop.rarity.charAt(0).toUpperCase() + drop.rarity.slice(1)} Item`,
            rarity: drop.rarity,
            image_url: null
          };
          break;
        }
      }

      // Update user stats
      await onUpdateUser({
        daily_goal_claimed: true,
        daily_goal_completed: true,
        total_exp: (user?.total_exp || 0) + expBonus,
        current_level_exp: (user?.current_level_exp || 0) + expBonus,
        weekly_goals_completed: (user?.weekly_goals_completed || 0) + 1,
        failed_streak: 0 // Reset failed streak on successful completion
      });

      // Trigger reward notification
      onRewardClaimed({
        type: 'daily',
        exp: expBonus,
        item: droppedItem
      });

    } catch (error) {
      console.error("Error claiming daily reward:", error);
    }
  };

  const handleClaimWeeklyReward = async () => {
    try {
      // 3 item drops for weekly reward
      const rewards = [];
      for (let i = 0; i < 3; i++) {
        rewards.push({
          name: `Weekly Reward ${i + 1}`,
          rarity: 'uncommon', // Simplified for demo
          image_url: null
        });
      }

      await onUpdateUser({
        weekly_reward_claimed: true,
        monthly_weeks_completed: (user?.monthly_weeks_completed || 0) + 1
      });

      onRewardClaimed({
        type: 'weekly',
        items: rewards
      });

    } catch (error) {
      console.error("Error claiming weekly reward:", error);
    }
  };

  const handleClaimMonthlyReward = async () => {
    try {
      const guaranteedItem = {
        name: 'Epic Monthly Reward',
        rarity: 'epic',
        image_url: null
      };

      await onUpdateUser({
        monthly_reward_claimed: true
      });

      onRewardClaimed({
        type: 'monthly',
        item: guaranteedItem
      });

    } catch (error) {
      console.error("Error claiming monthly reward:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">🎯 Goals & Rewards</h3>
        <p className="text-gray-600">Set your difficulty and claim rewards for achievements</p>
      </div>

      {/* Difficulty Settings */}
      <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200 rounded-2xl shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl font-bold text-gray-900">
            ⚙️ Difficulty Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(difficultySettings).map(([key, settings]) => (
              <Button
                key={key}
                variant={user?.difficulty === key ? "default" : "outline"}
                onClick={() => handleDifficultyChange(key)}
                className={`h-20 flex flex-col items-center justify-center rounded-2xl transition-all duration-300 ${
                  user?.difficulty === key
                    ? `bg-gradient-to-r ${settings.color} text-white shadow-lg`
                    : 'border-2 border-gray-200 hover:bg-gray-50'
                }`}
              >
                <span className="text-2xl mb-1">{settings.emoji}</span>
                <span className="font-bold">{settings.label}</span>
                <span className="text-sm opacity-80">{settings.percentage}% of tasks</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Daily Goal Progress */}
      <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="w-6 h-6 text-green-600" />
              <span className="text-xl font-bold text-gray-900">Daily Goal</span>
            </div>
            <Badge className={`${currentDifficulty.color} bg-gradient-to-r text-white border-0`}>
              {currentDifficulty.emoji} {currentDifficulty.label}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <div className="text-4xl font-bold text-gray-900 mb-2">
              {completedToday} / {dailyGoal}
            </div>
            <p className="text-gray-600">Tasks completed today</p>
          </div>

          <Progress value={dailyProgress} className="h-4" />

          <div className="text-center">
            {isDailyGoalComplete ? (
              canClaimDaily ? (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="inline-block"
                >
                  <Button
                    onClick={handleClaimDailyReward}
                    className="bg-gradient-to-r from-green-400 to-green-600 text-white font-bold px-6 py-3 rounded-xl shadow-lg flex items-center gap-2 text-lg"
                  >
                    <Gift className="w-5 h-5" />
                    Claim Daily Reward
                  </Button>
                </motion.div>
              ) : (
                <Badge className="bg-green-500 text-white px-4 py-2 rounded-xl text-base font-bold">
                  <Zap className="w-4 h-4 inline-block mr-1" />
                  Daily Goal Complete!
                </Badge>
              )
            ) : (
              <Badge className="bg-gray-300 text-gray-700 px-4 py-2 rounded-xl text-base font-bold">
                Complete your daily goal to claim a reward
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Weekly Goal Progress */}
      <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-2xl shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl font-bold text-gray-900">
            <Calendar className="w-6 h-6 text-yellow-600" />
            Weekly Goal
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <div className="text-4xl font-bold text-gray-900 mb-2">
              {user?.weekly_goals_completed || 0} / 5
            </div>
            <p className="text-gray-600">Days daily goal completed this week</p>
          </div>
          <Progress value={((user?.weekly_goals_completed || 0) / 5) * 100} className="h-4" />
          <div className="text-center">
            {(user?.weekly_goals_completed || 0) >= 5 ? (
              !user?.weekly_reward_claimed ? (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="inline-block"
                >
                  <Button
                    onClick={handleClaimWeeklyReward}
                    className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold px-6 py-3 rounded-xl shadow-lg flex items-center gap-2 text-lg"
                  >
                    <Gift className="w-5 h-5" />
                    Claim Weekly Reward
                  </Button>
                </motion.div>
              ) : (
                <Badge className="bg-yellow-500 text-white px-4 py-2 rounded-xl text-base font-bold">
                  <Zap className="w-4 h-4 inline-block mr-1" />
                  Weekly Goal Complete!
                </Badge>
              )
            ) : (
              <Badge className="bg-gray-300 text-gray-700 px-4 py-2 rounded-xl text-base font-bold">
                Complete 5 daily goals this week to claim a reward
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Monthly Goal Progress */}
      <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-2xl shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl font-bold text-gray-900">
            <Trophy className="w-6 h-6 text-purple-600" />
            Monthly Goal
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <div className="text-4xl font-bold text-gray-900 mb-2">
              {user?.monthly_weeks_completed || 0} / 3
            </div>
            <p className="text-gray-600">Weeks weekly goal completed this month</p>
          </div>
          <Progress value={((user?.monthly_weeks_completed || 0) / 3) * 100} className="h-4" />
          <div className="text-center">
            {(user?.monthly_weeks_completed || 0) >= 3 ? (
              !user?.monthly_reward_claimed ? (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="inline-block"
                >
                  <Button
                    onClick={handleClaimMonthlyReward}
                    className="bg-gradient-to-r from-purple-400 to-pink-500 text-white font-bold px-6 py-3 rounded-xl shadow-lg flex items-center gap-2 text-lg"
                  >
                    <Gift className="w-5 h-5" />
                    Claim Monthly Reward
                  </Button>
                </motion.div>
              ) : (
                <Badge className="bg-purple-500 text-white px-4 py-2 rounded-xl text-base font-bold">
                  <Zap className="w-4 h-4 inline-block mr-1" />
                  Monthly Goal Complete!
                </Badge>
              )
            ) : (
              <Badge className="bg-gray-300 text-gray-700 px-4 py-2 rounded-xl text-base font-bold">
                Complete 3 weekly goals this month to claim a reward
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}