import React, { useState, useEffect } from "react";
import { Task } from "@/entities/all";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon,
  Clock,
  Zap,
  Plus
} from "lucide-react";
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  isToday,
  addMonths,
  subMonths,
  parseISO
} from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

export default function Calendar() {
  const [tasks, setTasks] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadTasks = async () => {
    try {
      const fetchedTasks = await Task.list?.("-due_date") || [];
      setTasks((fetchedTasks || []).filter(task => task?.due_date));
    } catch (error) {
      console.error("Error loading tasks:", error);
      setTasks([]);
    } finally {
      setIsLoading(false);
    }
  };

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Add days from previous/next month to fill the grid
  const startDate = new Date(monthStart);
  startDate.setDate(startDate.getDate() - monthStart.getDay());
  
  const endDate = new Date(monthEnd);
  endDate.setDate(endDate.getDate() + (6 - monthEnd.getDay()));
  
  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

  const getTasksForDate = (date) => {
    return tasks.filter(task => {
      if (!task?.due_date) return false;
      try {
        return isSameDay(parseISO(task.due_date), date);
      } catch {
        return false;
      }
    });
  };

  const navigateMonth = (direction) => {
    setCurrentDate(prev => direction === 'next' ? addMonths(prev, 1) : subMonths(prev, 1));
    setSelectedDate(null);
  };

  const getTotalXPForDate = (date) => {
    const dayTasks = getTasksForDate(date);
    return dayTasks.reduce((sum, task) => sum + (task?.exp_value || 0), 0);
  };

  const getCompletedTasksForDate = (date) => {
    const dayTasks = getTasksForDate(date);
    return dayTasks.filter(task => task?.status === 'done').length;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-purple-200 border-t-purple-500 rounded-full mx-auto"
          />
          <p className="text-gray-600 font-medium">Loading calendar...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Quest Calendar</h1>
          <p className="text-gray-600 text-lg">Plan and track your tasks by date</p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Calendar */}
          <div className="xl:col-span-3">
            <Card className="shadow-2xl rounded-3xl border-0 bg-white overflow-hidden">
              {/* Calendar Header */}
              <CardHeader className="bg-gradient-to-r from-purple-500 to-blue-500 text-white">
                <div className="flex items-center justify-between">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigateMonth('prev')}
                    className="text-white hover:bg-white/20 rounded-xl"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </Button>
                  
                  <CardTitle className="text-2xl font-bold">
                    {format(currentDate, 'MMMM yyyy')}
                  </CardTitle>
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigateMonth('next')}
                    className="text-white hover:bg-white/20 rounded-xl"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="p-0">
                {/* Weekday Headers */}
                <div className="grid grid-cols-7 bg-gray-50 border-b">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="p-4 text-center font-bold text-gray-700 border-r last:border-r-0">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7">
                  {calendarDays.map((date, index) => {
                    const dayTasks = getTasksForDate(date);
                    const isCurrentMonth = isSameMonth(date, currentDate);
                    const isSelected = selectedDate && isSameDay(date, selectedDate);
                    const isCurrentDay = isToday(date);
                    const completedTasks = getCompletedTasksForDate(date);
                    const totalXP = getTotalXPForDate(date);

                    return (
                      <motion.div
                        key={index}
                        whileHover={{ scale: 1.02 }}
                        className={`min-h-[120px] border-r border-b last:border-r-0 p-3 cursor-pointer transition-all duration-200 ${
                          !isCurrentMonth ? 'bg-gray-50 text-gray-400' :
                          isSelected ? 'bg-purple-50 ring-2 ring-purple-300' :
                          isCurrentDay ? 'bg-blue-50 ring-2 ring-blue-300' :
                          'bg-white hover:bg-purple-25'
                        }`}
                        onClick={() => setSelectedDate(date)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className={`text-lg font-bold ${
                            isCurrentDay ? 'text-blue-600' : 
                            isSelected ? 'text-purple-600' : 
                            isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                          }`}>
                            {format(date, 'd')}
                          </span>
                          {dayTasks.length > 0 && (
                            <Badge className="bg-gradient-to-r from-purple-500 to-blue-500 text-white text-xs">
                              {dayTasks.length}
                            </Badge>
                          )}
                        </div>

                        {/* Task indicators */}
                        <div className="space-y-1">
                          {dayTasks.slice(0, 2).map((task) => (
                            <div
                              key={task.id}
                              className={`text-xs p-1 rounded-lg truncate font-medium ${
                                task.status === 'done' ? 'bg-green-100 text-green-700' :
                                task.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                                'bg-gray-100 text-gray-700'
                              }`}
                            >
                              {task.title}
                            </div>
                          ))}
                          {dayTasks.length > 2 && (
                            <div className="text-xs text-gray-500 font-medium">
                              +{dayTasks.length - 2} more
                            </div>
                          )}
                        </div>

                        {/* XP indicator */}
                        {totalXP > 0 && (
                          <div className="mt-2 flex items-center gap-1">
                            <Zap className="w-3 h-3 text-orange-500" />
                            <span className="text-xs font-bold text-orange-600">{totalXP} XP</span>
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Selected Date Details */}
          <div className="xl:col-span-1">
            <Card className="shadow-2xl rounded-3xl border-0 bg-white sticky top-6">
              <CardHeader className="bg-gradient-to-r from-purple-100 to-blue-100 rounded-t-3xl">
                <CardTitle className="flex items-center gap-2 text-gray-900">
                  <CalendarIcon className="w-5 h-5" />
                  {selectedDate ? format(selectedDate, 'MMM d, yyyy') : 'Select a Date'}
                </CardTitle>
              </CardHeader>
              
              <CardContent className="p-6">
                {selectedDate ? (
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={selectedDate.toISOString()}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="space-y-4"
                    >
                      {/* Date Summary */}
                      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-4">
                        <div className="grid grid-cols-2 gap-3 text-center">
                          <div>
                            <p className="text-2xl font-bold text-purple-600">
                              {getTasksForDate(selectedDate).length}
                            </p>
                            <p className="text-xs text-gray-600">Total Tasks</p>
                          </div>
                          <div>
                            <p className="text-2xl font-bold text-orange-600">
                              {getTotalXPForDate(selectedDate)}
                            </p>
                            <p className="text-xs text-gray-600">Available XP</p>
                          </div>
                        </div>
                      </div>

                      {/* Tasks for selected date */}
                      <div className="space-y-3">
                        {getTasksForDate(selectedDate).length === 0 ? (
                          <div className="text-center py-8 text-gray-500">
                            <CalendarIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p className="font-medium">No tasks scheduled</p>
                            <Button className="mt-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl">
                              <Plus className="w-4 h-4 mr-2" />
                              Add Task
                            </Button>
                          </div>
                        ) : (
                          getTasksForDate(selectedDate).map((task) => (
                            <motion.div
                              key={task.id}
                              initial={{ opacity: 0, x: 20 }}
                              animate={{ opacity: 1, x: 0 }}
                              className={`p-4 rounded-2xl border-2 transition-all duration-200 ${
                                task.status === 'done' ? 'bg-green-50 border-green-200' :
                                task.status === 'in_progress' ? 'bg-blue-50 border-blue-200' :
                                'bg-gray-50 border-gray-200'
                              }`}
                            >
                              <h4 className={`font-bold mb-2 ${
                                task.status === 'done' ? 'line-through text-gray-500' : 'text-gray-900'
                              }`}>
                                {task.title}
                              </h4>
                              
                              <div className="flex items-center gap-2 mb-2">
                                <Clock className="w-4 h-4 text-gray-500" />
                                <span className="text-sm text-gray-600">
                                  {task.due_date ? format(parseISO(task.due_date), 'h:mm a') : '—'}
                                </span>
                              </div>

                              <div className="flex items-center justify-between">
                                <Badge className={`text-xs ${
                                  task.status === 'done' ? 'bg-green-100 text-green-700' :
                                  task.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                                  'bg-gray-100 text-gray-700'
                                }`}>
                                  {String(task.status).replace('_', ' ').toUpperCase()}
                                </Badge>
                                
                                <div className="flex items-center gap-1">
                                  <Zap className="w-3 h-3 text-orange-500" />
                                  <span className="text-xs font-bold text-orange-600">
                                    {task.exp_value || 0} XP
                                  </span>
                                </div>
                              </div>
                            </motion.div>
                          ))
                        )}
                      </div>
                    </motion.div>
                  </AnimatePresence>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <CalendarIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="font-medium">Click on a date to view tasks</p>
                    <p className="text-sm mt-2">See your scheduled quests and their XP rewards</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}