import React, { useState, useEffect, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Task, User } from "@/entities/all";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Filter, Columns3, GanttChartSquare, Calendar } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "@/components/ui/use-toast";

import TaskColumn from "@/Components/kanban/TaskColumn";
import TaskForm from "@/Components/kanban/TaskForm";

// Constantes para melhor organização
const KANBAN_COLUMNS = [
  { id: "master", title: "Master Cards", color: "border-yellow-300", bg: "bg-yellow-100 dark:bg-slate-800", width: "w-60" },
  { id: "backlog", title: "Backlog", color: "border-gray-300", bg: "bg-slate-200 dark:bg-slate-800", width: "w-60" },
  { id: "todo", title: "To Do", color: "border-gray-300", bg: "bg-slate-200 dark:bg-slate-800", width: "w-60" },
  { id: "in_progress", title: "In Progress", color: "border-blue-300", bg: "bg-blue-100 dark:bg-slate-800", width: "w-60" },
  { id: "done", title: "Cards Slain", color: "border-purple-300", bg: "bg-purple-100 dark:bg-slate-800", width: "w-60", canUncheck: true }
];

const COLLAPSIBLE_COLUMNS = [
  { id: "slain", title: "Graveyard", color: "border-gray-400", bg: "bg-slate-300 dark:bg-slate-700", canUncheck: false }
];

const NAVIGATION_ITEMS = [
  { title: "Kanban", url: createPageUrl("Dashboard"), icon: Columns3 },
  { title: "Timeline", url: createPageUrl("Timeline"), icon: GanttChartSquare },
  { title: "Calendar", url: createPageUrl("Calendar"), icon: Calendar }
];

// Funções utilitárias
const getComboRank = (days) => {
  if (days <= 10) return 'F';
  if (days <= 20) return 'E';
  if (days <= 30) return 'D';
  if (days <= 40) return 'C';
  if (days <= 50) return 'B';
  if (days <= 60) return 'A';
  if (days <= 70) return 'S';
  if (days <= 99) return 'SS';
  return 'SSS';
};

const getRankColor = (rank) => {
  const colors = {
    'F': 'text-gray-500', 'E': 'text-gray-600', 'D': 'text-yellow-600',
    'C': 'text-orange-500', 'B': 'text-blue-500', 'A': 'text-green-500',
    'S': 'text-purple-600', 'SS': 'text-pink-600', 'SSS': 'text-red-600'
  };
  return colors[rank] || 'text-gray-500';
};

// Componente UserStats incorporado
const UserStats = ({ user, currentTime }) => {
  const progressPercentage = user?.exp_to_next_level > 0
    ? (user.current_level_exp || 0) / user.exp_to_next_level * 100
    : 0;

  const comboRank = getComboRank(user?.streak_days || 0);
  const comboProgress = (user?.streak_days || 0) % 10;

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mt-2">
      {/* Level Progress */}
      <Card className="md:col-span-2 bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 shadow-sm">
        <CardContent className="p-2">
          <div className="flex items-center justify-between mb-1 text-xs">
            <span className="font-bold text-purple-600 dark:text-purple-400">LEVEL {user?.level || 1}</span>
            <span className="font-semibold text-purple-500 dark:text-purple-400">
              {Math.floor(progressPercentage)}%
              <span className="font-mono text-purple-500/80 dark:text-purple-500/80">
                ({Math.max(0, (user?.exp_to_next_level || 100) - (user?.current_level_exp || 0))} to next)
              </span>
            </span>
          </div>
          <div className="w-full bg-white/50 dark:bg-slate-700 rounded-full h-1.5 shadow-inner">
            <div
              className="bg-purple-400 h-1.5 rounded-full transition-all duration-500 shadow-sm"
              style={{ width: `${progressPercentage}%` }} />
          </div>
        </CardContent>
      </Card>

      {/* Clock */}
      <Card className="md:col-span-1 bg-slate-800 border border-slate-700 shadow-sm flex items-center justify-center">
        <CardContent className="p-2 text-center">
          <span
            className="font-mono font-bold text-2xl text-cyan-300"
            style={{ textShadow: '0 0 5px rgba(56, 189, 248, 0.4)' }}
          >
            {formatTime(currentTime)}
          </span>
        </CardContent>
      </Card>

      {/* Combo Progress */}
      <Card className="md:col-span-2 bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 shadow-sm">
        <CardContent className="p-2">
          <div className="flex items-center gap-2 mb-1 text-xs justify-between">
            <div className="flex items-center gap-2">
              <span className={`font-black text-sm ${getRankColor(comboRank)} drop-shadow-sm`}
                style={{
                  fontFamily: 'Impact, Arial Black, sans-serif',
                  textShadow: '1px 1px 2px rgba(0,0,0,0.2)',
                  WebkitTextStroke: '0.3px rgba(0,0,0,0.1)'
                }}>
                {comboRank}
              </span>
              <span className="font-bold text-sm text-green-700 dark:text-green-400">
                {(user?.streak_days || 0)}
                <span className="font-mono text-green-600/80 dark:text-green-500/80"> ({comboProgress}/10)</span>
              </span>
            </div>
            <span className="font-bold text-green-600 dark:text-green-300">COMBO</span>
          </div>
          <div className="w-full flex flex-row-reverse gap-0.5 rounded-full h-1.5 shadow-inner">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="w-[10%] h-full flex-grow first:rounded-r-full last:rounded-l-full overflow-hidden">
                <div className={`h-full transition-colors duration-300 ${
                  i < comboProgress
                    ? 'bg-green-400'
                    : 'bg-white/50 dark:bg-slate-700'
                }`}></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Hook useGamification incorporado
const useGamification = (user, setUser) => {
  const checkDailyDecay = useCallback(async () => {
    try {
      if (!user) return;

      const today = new Date().toISOString().split('T')[0];
      const lastActivity = user.last_activity_date;
      let updates = {};

      if (lastActivity) {
        const lastActivityDate = new Date(lastActivity);
        const todayDate = new Date(today);
        const diffTime = todayDate.getTime() - lastActivityDate.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays >= 1 && lastActivityDate.toISOString().split('T')[0] !== today) {
          // XP Decay logic
          const decayAmount = Math.floor((user.current_level_exp || 0) * 0.1 * diffDays);
          const newCurrentLevelExp = Math.max(0, (user.current_level_exp || 0) - decayAmount);

          let newLevel = user.level || 1;
          let adjustedCurrentLevelExp = newCurrentLevelExp;

          while (adjustedCurrentLevelExp < 0 && newLevel > 1) {
            newLevel -= 1;
            const previousLevelExpToNext = Math.floor((user.exp_to_next_level || 100) / 1.5);
            adjustedCurrentLevelExp += previousLevelExpToNext;
          }

          updates.current_level_exp = Math.max(0, adjustedCurrentLevelExp);
          updates.level = newLevel;

          toast({
            title: "⚔️ Battle Fatigue!",
            description: `You lost ${decayAmount} XP due to inactivity. Stay active to keep your edge!`,
            variant: "destructive"
          });

          // Doom Counter / Failed Streak Logic
          let newFailedStreak = (user.failed_streak || 0) + diffDays;
          if (newFailedStreak >= 3) {
            updates.streak_days = 0; // Reset combo
            updates.failed_streak = 0; // Reset doom counter
            toast({
              title: "🔥 Combo Lost!",
              description: "Your combo streak has been reset due to prolonged inactivity."
            });
          } else {
            updates.failed_streak = newFailedStreak;
          }
        }
      }

      if (Object.keys(updates).length > 0) {
        await User.updateMyUserData(updates);
        setUser((prev) => prev ? { ...prev, ...updates } : null);
      }

    } catch (error) {
      console.error("Error checking daily decay:", error);
    }
  }, [user, setUser]);

  return { checkDailyDecay };
};

export default function Dashboard({ tasks, setTasks, user, setUser, sidebarCollapsed }) {
  const location = useLocation();
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedColumns, setExpandedColumns] = useState({});
  const [currentTime, setCurrentTime] = useState(new Date());
  const [dailyCheckComplete, setDailyCheckComplete] = useState(false);

  const { checkDailyDecay } = useGamification(user, setUser);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [fetchedTasks, currentUser] = await Promise.all([
        Task.list("-created_date"),
        User.me()
      ]);
      setTasks(fetchedTasks || []);
      setUser(currentUser || null);
    } catch (error) {
      console.error("Error loading data:", error);
      setTasks([]);
      setUser(null);
    }
    setIsLoading(false);
  }, [setTasks, setUser]);

  useEffect(() => {
    loadData();

    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, [loadData]);

  useEffect(() => {
    if (user && !dailyCheckComplete) {
      checkDailyDecay();
      setDailyCheckComplete(true);
    }
  }, [user, dailyCheckComplete, checkDailyDecay]);

  const handleTaskSubmit = async (taskData) => {
    try {
      if (editingTask && editingTask.id) {
        await Task.update(editingTask.id, taskData);
      } else {
        await Task.create(taskData);
      }
      setShowForm(false);
      setEditingTask(null);
      loadData();
    } catch (error) {
      console.error("Error saving task:", error);
    }
  };

  const handleStatusChange = async (task, newStatus) => {
    try {
      if (!task) return;

      const updatedTask = { ...task, status: newStatus };

      if (newStatus === 'slain') {
        updatedTask.slain_at = new Date().toISOString();
        updatedTask.is_complete = true;

        if (user && !task.exp_awarded) {
          updatedTask.exp_awarded = true;
          const taskExpValue = task.exp_value || 25;
          const today = new Date().toISOString().split('T')[0];
          const newTotalExp = (user.total_exp || 0) + taskExpValue;
          const currentLevelExp = (user.current_level_exp || 0) + taskExpValue;
          const expToNext = user.exp_to_next_level || 100;

          let newLevel = user.level || 1;
          let newCurrentLevelExp = currentLevelExp;
          let newExpToNext = expToNext;

          if (currentLevelExp >= expToNext) {
            newLevel += 1;
            newCurrentLevelExp = currentLevelExp - expToNext;
            newExpToNext = Math.floor(expToNext * 1.5);
            toast({ title: "🎉 LEVEL UP!", description: `Congratulations! You've reached Level ${newLevel}!` });
          }

          let newStreak = user.streak_days || 0;
          if (user.last_activity_date !== today) {
            newStreak += 1;
          }

          const userUpdates = {
            level: newLevel,
            total_exp: newTotalExp,
            current_level_exp: newCurrentLevelExp,
            exp_to_next_level: newExpToNext,
            tasks_completed: (user.tasks_completed || 0) + 1,
            last_activity_date: today,
            streak_days: newStreak,
            failed_streak: 0,
            total_pomodoros: (user.total_pomodoros || 0) + (task.completed_pomodoros || task.estimated_pomodoros || 1)
          };
          await User.updateMyUserData(userUpdates);
          setUser((prev) => prev ? { ...prev, ...userUpdates } : null);

          toast({ title: "⚔️ Card Slain!", description: `Gained ${taskExpValue} XP! Great work!` });
        }
      }

      await Task.update(task.id, updatedTask);
      loadData();
    } catch (error) {
      console.error("Error updating task status:", error);
    }
  };

  const handleCompleteToggle = async (task, isComplete) => {
    try {
      if (!task) return;

      const updatedTask = {
        ...task,
        is_complete: isComplete,
        completed_at: isComplete ? new Date().toISOString() : null,
        status: isComplete ? 'done' : 'todo'
      };

      await Task.update(task.id, updatedTask);
      loadData();
    } catch (error) {
      console.error("Error toggling task completion:", error);
    }
  };

  const handleSlayCard = async (task) => {
    if (!task) return;
    if (task.status === 'done') {
      await handleStatusChange(task, 'slain');
    }
  };

  const handleDeleteTask = async (task) => {
    try {
      if (!task) return;
      await Task.delete(task.id);
      loadData();
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  const getTasksByStatus = (status) => {
    if (!Array.isArray(tasks)) return [];
    return tasks.filter((task) => task && task.status === status);
  };

  const toggleColumnExpanded = (columnId) => {
    setExpandedColumns((prev) => ({
      ...prev,
      [columnId]: !prev[columnId]
    }));
  };

  const handleEditTask = (task) => {
    if (task && task.id) {
      setEditingTask(task);
      setShowForm(true);
    }
  };

  const handleCreateMasterCard = () => {
    setEditingTask({ status: 'master' });
    setShowForm(true);
  };

  if (isLoading && (!tasks || tasks.length === 0)) {
    return (
      <div className="flex-grow flex items-center justify-center bg-slate-50 dark:bg-gray-900">
        <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-500 rounded-full animate-spin" />
      </div>);
  }

  return (
    <div className={`h-full flex flex-col bg-slate-50 dark:bg-gray-900 transition-all duration-300`}>
      {/* Header Section */}
      <div className="flex-shrink-0 px-4 py-2">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-xl font-black italic text-slate-800 dark:text-slate-200 tracking-wide">
              PERFORMATOR 0.3
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 rounded-lg bg-slate-200/80 dark:bg-slate-700/80 p-1">
              {NAVIGATION_ITEMS.map((item) =>
                <Button
                  key={item.title}
                  asChild
                  variant={location.pathname === item.url ? "default" : "ghost"}
                  className={`p-2 h-8 w-8 rounded-md transition-all duration-300 ${
                    location.pathname === item.url ?
                      `bg-white dark:bg-slate-900 text-slate-800 dark:text-white shadow-md` :
                      `hover:bg-white/50 dark:hover:bg-slate-900/50 text-slate-500 dark:text-slate-400`}`
                  }>
                  <Link to={item.url}>
                    <item.icon className="w-4 h-4" />
                  </Link>
                </Button>
              )}
            </div>
            <Button
              variant="outline"
              className="rounded-lg border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium transition-all duration-300 text-sm px-3 py-1.5 h-auto">
              <Filter className="w-3.5 h-3.5 mr-1.5 flex-shrink-0" />
              <span className="truncate">Filter</span>
            </Button>
            <Button
              onClick={() => { setEditingTask(null); setShowForm(true); }}
              className="bg-slate-800 hover:bg-slate-900 dark:bg-slate-100 dark:hover:bg-slate-200 dark:text-slate-800 text-white rounded-lg font-medium shadow-sm hover:shadow-md transition-all duration-300 text-sm px-3 py-1.5 h-auto">
              <Plus className="w-3.5 h-3.5 mr-1.5 flex-shrink-0" />
              <span className="truncate">New Quest</span>
            </Button>
          </div>
        </div>

        <UserStats user={user} currentTime={currentTime} />
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden px-4">
        <div className="py-4 flex gap-3 h-full min-w-max">
          {[...KANBAN_COLUMNS, ...COLLAPSIBLE_COLUMNS].map((column) =>
            <TaskColumn
              key={column.id}
              column={column}
              tasks={getTasksByStatus(column.id)}
              isExpanded={expandedColumns[column.id]}
              onToggleExpand={() => toggleColumnExpanded(column.id)}
              isCollapsible={COLLAPSIBLE_COLUMNS.some((c) => c.id === column.id)}
              onStatusChange={handleStatusChange}
              onEdit={handleEditTask}
              onDelete={handleDeleteTask}
              onSlay={handleSlayCard}
              onCreateMasterCard={handleCreateMasterCard}
              onCompleteToggle={handleCompleteToggle}
            />
          )}
        </div>
      </div>

      <AnimatePresence>
        {showForm &&
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="w-full max-w-4xl">
              <TaskForm task={editingTask} onSubmit={handleTaskSubmit} onCancel={() => { setShowForm(false); setEditingTask(null); }} />
            </motion.div>
          </motion.div>
        }
      </AnimatePresence>
    </div>
  );
}