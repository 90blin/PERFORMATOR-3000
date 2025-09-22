import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Trophy,
  Zap,
  Target,
  Calendar,
  TrendingUp,
  Award
} from "lucide-react";
import { motion } from "framer-motion";

const levelTitles = {
  1: { title: "Novice", color: "from-gray-400 to-gray-500", description: "Just getting started!" },
  2: { title: "Apprentice", color: "from-green-400 to-green-500", description: "Learning the ropes" },
  3: { title: "Skilled", color: "from-blue-400 to-blue-500", description: "Getting things done" },
  4: { title: "Expert", color: "from-purple-400 to-purple-500", description: "Highly productive" },
  5: { title: "Master", color: "from-orange-400 to-orange-500", description: "Task management pro" },
  10: { title: "Grandmaster", color: "from-red-400 to-red-500", description: "Legendary productivity" },
  15: { title: "Champion", color: "from-pink-400 to-pink-500", description: "Ultimate task warrior" },
  20: { title: "Legend", color: "from-yellow-400 to-yellow-500", description: "Mythical achiever" }
};

function getLevelInfo(level) {
  const keys = Object.keys(levelTitles).map(Number).sort((a, b) => a - b);
  for (let i = keys.length - 1; i >= 0; i--) {
    if (level >= keys[i]) return levelTitles[keys[i]];
  }
  return levelTitles[1];
}

export default function LevelProgress({ user = {} }) {
  const level = Number(user.level) || 1;
  const currentExp = Math.max(0, Number(user.current_level_exp) || 0);
  const expToNext = Math.max(1, Number(user.exp_to_next_level) || 100);
  const progressPercentage = Math.min(100, Math.round((currentExp / expToNext) * 100));

  const levelInfo = getLevelInfo(level);

  const stats = [
    {
      icon: Trophy,
      label: "Tasks Completed",
      value: user.tasks_completed ?? 0,
      color: "text-yellow-600",
      bg: "bg-yellow-50"
    },
    {
      icon: Zap,
      label: "Total XP",
      value: user.total_exp ?? 0,
      color: "text-orange-600",
      bg: "bg-orange-50"
    },
    {
      icon: Calendar,
      label: "Current Streak",
      value: `${user.streak_days ?? 0} days`,
      color: "text-green-600",
      bg: "bg-green-50"
    },
    {
      icon: TrendingUp,
      label: "Current Level",
      value: user.level ?? level,
      color: "text-purple-600",
      bg: "bg-purple-50"
    }
  ];

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-white to-gray-50 shadow-2xl rounded-3xl border-0 overflow-hidden">
        <CardContent className="p-8">
          <div className="text-center space-y-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
              className={`w-24 h-24 mx-auto bg-gradient-to-r ${levelInfo.color} rounded-full flex items-center justify-center shadow-2xl`}
            >
              <span className="text-white font-bold text-3xl">{level}</span>
            </motion.div>

            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Level {level}</h2>
              <Badge className={`bg-gradient-to-r ${levelInfo.color} text-white border-0 px-4 py-2 text-lg font-bold rounded-full inline-flex items-center gap-2`}>
                <Award className="w-4 h-4" />
                <span>{levelInfo.title}</span>
              </Badge>
              <p className="text-gray-600 mt-2 text-lg">{levelInfo.description}</p>
            </div>

            <div className="space-y-3 w-full max-w-xl mx-auto">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-700">Level Progress</span>
                <span className="font-bold text-purple-600">
                  {currentExp} / {expToNext} XP
                </span>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-4 shadow-inner overflow-hidden">
                <motion.div
                  className={`h-4 rounded-full shadow-lg bg-gradient-to-r ${levelInfo.color}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercentage}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </div>

              <p className="text-sm text-gray-500">
                {Math.max(0, expToNext - currentExp)} XP to next level
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="shadow-lg rounded-2xl border-0 hover:shadow-xl transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-2xl ${stat.bg}`}>
                      <Icon className={`w-6 h-6 ${stat.color}`} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}