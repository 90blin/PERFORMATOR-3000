import React, { useState, useEffect } from "react";
import { User, Task } from "@/entities/all";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Settings, 
  Bell, 
  Trophy, 
  Calendar,
  BarChart3,
  Target,
  Clock,
  Zap
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

import LevelProgress from "../components/profile/LevelProgress";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [currentUser, allTasks] = await Promise.all([
        User.me(),
        (typeof Task.list === "function") ? Task.list("-created_date") : Promise.resolve([])
      ]);
      setUser(currentUser);
      setTasks(allTasks);
    } catch (error) {
      console.error("Error loading profile data:", error);
      setUser(null);
      setTasks([]);
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserSettings = async (updates) => {
    try {
      if (typeof User.updateMyUserData === "function") {
        await User.updateMyUserData(updates);
      }
      setUser(prev => ({ ...prev, ...updates }));
    } catch (error) {
      console.error("Error updating user settings:", error);
    }
  };

  const getTaskStats = () => {
    const completedTasks = (tasks || []).filter(task => task.status === 'done');
    const inProgressTasks = (tasks || []).filter(task => task.status === 'in_progress');
    const todoTasks = (tasks || []).filter(task => task.status === 'todo');
    
    return {
      total: tasks.length,
      completed: completedTasks.length,
      inProgress: inProgressTasks.length,
      todo: todoTasks.length,
      completionRate: tasks.length > 0 ? (completedTasks.length / tasks.length * 100).toFixed(1) : 0
    };
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-500 rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-600 font-medium">Loading your profile...</p>
        </div>
      </div>
    );
  }

  const stats = getTaskStats();

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Your Profile</h1>
          <p className="text-gray-600 text-lg">Track your progress and manage your quest settings</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Level Progress */}
          <div className="lg:col-span-2">
            <LevelProgress user={user} />
          </div>

          {/* Right Column - Settings & Stats */}
          <div className="space-y-6">
            {/* Task Statistics */}
            <Card className="shadow-2xl rounded-3xl border-0 bg-gradient-to-br from-white to-gray-50">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-xl font-bold">
                  <BarChart3 className="w-6 h-6 text-blue-500" />
                  Task Statistics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-2xl">
                    <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
                    <p className="text-sm text-gray-600">Total Tasks</p>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-2xl">
                    <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
                    <p className="text-sm text-gray-600">Completed</p>
                  </div>
                  <div className="text-center p-3 bg-orange-50 rounded-2xl">
                    <p className="text-2xl font-bold text-orange-600">{stats.inProgress}</p>
                    <p className="text-sm text-gray-600">In Progress</p>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-2xl">
                    <p className="text-2xl font-bold text-purple-600">{stats.completionRate}%</p>
                    <p className="text-sm text-gray-600">Success Rate</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Settings */}
            <Card className="shadow-2xl rounded-3xl border-0 bg-gradient-to-br from-white to-gray-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl font-bold">
                  <Settings className="w-6 h-6 text-purple-500" />
                  Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Bell className="w-5 h-5 text-gray-600" />
                    <Label htmlFor="notifications" className="font-medium">
                      Notifications
                    </Label>
                  </div>
                  <Switch
                    id="notifications"
                    checked={user?.notifications_enabled || false}
                    onCheckedChange={(checked) => updateUserSettings({ notifications_enabled: checked })}
                  />
                </div>

                <div className="space-y-3">
                  <Label className="font-medium text-gray-700">Preferred View</Label>
                  <div className="grid grid-cols-1 gap-2">
                    {[
                      { value: "kanban", label: "Kanban Board", icon: Target },
                      { value: "timeline", label: "Timeline", icon: Clock },
                      { value: "calendar", label: "Calendar", icon: Calendar }
                    ].map((view) => (
                      <Button
                        key={view.value}
                        variant={user?.preferred_view === view.value ? "default" : "outline"}
                        onClick={() => updateUserSettings({ preferred_view: view.value })}
                        className="justify-start rounded-xl"
                      >
                        <view.icon className="w-4 h-4 mr-2" />
                        {view.label}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Achievements Preview */}
            <Card className="shadow-2xl rounded-3xl border-0 bg-gradient-to-br from-yellow-50 to-orange-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl font-bold">
                  <Trophy className="w-6 h-6 text-yellow-600" />
                  Achievements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white p-2 w-full justify-center">
                    🎯 First Quest Complete
                  </Badge>
                  {(user?.tasks_completed || 0) >= 5 && (
                    <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white p-2 w-full justify-center">
                      🌟 Task Master
                    </Badge>
                  )}
                  {(user?.level || 1) >= 3 && (
                    <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-2 w-full justify-center">
                      🚀 Level Up Champion
                    </Badge>
                  )}
                  <p className="text-sm text-gray-500 text-center mt-4">
                    More achievements unlock as you progress!
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}