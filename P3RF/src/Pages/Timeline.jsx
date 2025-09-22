import React, { useState, useEffect } from "react";
import { Task } from "@/entities/all";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Calendar, 
  Clock, 
  Zap, 
  Tag,
  Plus,
  Filter,
  ArrowRight
} from "lucide-react";
import { format, parseISO, isToday, isTomorrow, isYesterday, isPast } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

const priorityColors = {
  low: "bg-blue-100 text-blue-700 border-blue-200",
  medium: "bg-yellow-100 text-yellow-700 border-yellow-200", 
  high: "bg-orange-100 text-orange-700 border-orange-200",
  critical: "bg-red-100 text-red-700 border-red-200"
};

const statusColors = {
  todo: "bg-gray-100 text-gray-700 border-gray-200",
  in_progress: "bg-blue-100 text-blue-700 border-blue-200",
  done: "bg-green-100 text-green-700 border-green-200"
};

export default function Timeline() {
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, upcoming, overdue, completed

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    setIsLoading(true);
    try {
      const fetchedTasks = typeof Task.list === "function" ? await Task.list("-due_date") : [];
      setTasks((fetchedTasks || []).filter(task => task?.due_date)); // Only show tasks with due dates
    } catch (error) {
      console.error("Error loading tasks:", error);
      setTasks([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getDateLabel = (dateString) => {
    try {
      const date = parseISO(dateString);
      if (isToday(date)) return "Today";
      if (isTomorrow(date)) return "Tomorrow";  
      if (isYesterday(date)) return "Yesterday";
      return format(date, "EEEE, MMMM d, yyyy");
    } catch {
      return dateString;
    }
  };

  const getTimeLabel = (dateString) => {
    try {
      return format(parseISO(dateString), "h:mm a");
    } catch {
      return "—";
    }
  };

  const isOverdue = (dateString, status) => {
    try {
      return isPast(parseISO(dateString)) && status !== 'done';
    } catch {
      return false;
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (!task?.due_date) return false;
    const due = parseISO(task.due_date);
    if (filter === "upcoming") return !isPast(due) && task.status !== 'done';
    if (filter === "overdue") return isOverdue(task.due_date, task.status);
    if (filter === "completed") return task.status === 'done';
    return true;
  });

  // Group tasks by date
  const groupedTasks = filteredTasks.reduce((groups, task) => {
    let dateKey = "undated";
    try {
      dateKey = format(parseISO(task.due_date), "yyyy-MM-dd");
    } catch {
      dateKey = String(task.due_date);
    }
    if (!groups[dateKey]) groups[dateKey] = [];
    groups[dateKey].push(task);
    return groups;
  }, {});

  const sortedDates = Object.keys(groupedTasks).sort();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-purple-200 border-t-purple-500 rounded-full mx-auto"
          />
          <p className="text-gray-600 font-medium">Loading timeline...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Task Timeline</h1>
          <p className="text-gray-600 text-lg">View your quests organized by due date</p>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-3 mb-8 justify-center">
          {[
            { value: "all", label: "All Tasks", count: tasks.length },
            { value: "upcoming", label: "Upcoming", count: tasks.filter(t => t?.due_date && !isPast(parseISO(t.due_date)) && t.status !== 'done').length },
            { value: "overdue", label: "Overdue", count: tasks.filter(t => t?.due_date && isOverdue(t.due_date, t.status)).length },
            { value: "completed", label: "Completed", count: tasks.filter(t => t.status === 'done').length }
          ].map((tab) => (
            <Button
              key={tab.value}
              variant={filter === tab.value ? "default" : "outline"}
              onClick={() => setFilter(tab.value)}
              className={`rounded-2xl font-semibold ${
                filter === tab.value 
                  ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white" 
                  : "border-2 border-purple-200 hover:bg-purple-50 text-purple-600"
              }`}
            >
              {tab.label}
              <Badge variant="secondary" className="ml-2 bg-white text-gray-700">
                {tab.count}
              </Badge>
            </Button>
          ))}
        </div>

        {/* Timeline */}
        <div className="space-y-8">
          <AnimatePresence>
            {sortedDates.map((date, dateIndex) => (
              <motion.div
                key={date}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: dateIndex * 0.1 }}
                className="relative"
              >
                {/* Date Header */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-4 h-4 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"></div>
                  <div className="flex-1 h-0.5 bg-gradient-to-r from-purple-200 to-blue-200"></div>
                  <h2 className="text-2xl font-bold text-gray-900 bg-white px-4 py-2 rounded-2xl shadow-sm">
                    {getDateLabel(groupedTasks[date][0]?.due_date ?? date)}
                  </h2>
                  <div className="flex-1 h-0.5 bg-gradient-to-r from-blue-200 to-purple-200"></div>
                </div>

                {/* Tasks for this date */}
                <div className="ml-8 space-y-4">
                  {groupedTasks[date].map((task, taskIndex) => (
                    <motion.div
                      key={task.id || `${date}-${taskIndex}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: (dateIndex * 0.1) + (taskIndex * 0.05) }}
                    >
                      <Card className={`shadow-xl rounded-2xl border-0 overflow-hidden hover:shadow-2xl transition-all duration-300 ${
                        isOverdue(task.due_date, task.status) ? 'ring-2 ring-red-200 bg-red-50' : 'bg-white'
                      }`}>
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-3">
                                <Clock className="w-5 h-5 text-gray-500" />
                                <span className="font-semibold text-gray-700">
                                  {getTimeLabel(task.due_date)}
                                </span>
                                {isOverdue(task.due_date, task.status) && (
                                  <Badge className="bg-red-100 text-red-700 border-red-200">
                                    OVERDUE
                                  </Badge>
                                )}
                              </div>

                              <h3 className={`text-xl font-bold mb-2 ${
                                task.status === 'done' ? 'line-through text-gray-500' : 'text-gray-900'
                              }`}>
                                {task.title}
                              </h3>

                              {task.description && (
                                <p className="text-gray-600 mb-4 line-clamp-2">
                                  {task.description}
                                </p>
                              )}

                              <div className="flex flex-wrap gap-2">
                                <Badge className={`${statusColors[task.status] || statusColors.todo} border font-semibold`}>
                                  {(task.status || 'todo').replace('_', ' ').toUpperCase()}
                                </Badge>
                                
                                <Badge className={`${priorityColors[task.priority] || priorityColors.medium} border font-semibold`}>
                                  {(task.priority || 'medium').toUpperCase()}
                                </Badge>

                                {task.tags?.map((tag, index) => (
                                  <Badge key={index} variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                                    <Tag className="w-3 h-3 mr-1" />
                                    {tag}
                                  </Badge>
                                ))}

                                <Badge className="bg-gradient-to-r from-yellow-100 to-orange-100 text-orange-700 border-orange-200 font-bold">
                                  <Zap className="w-3 h-3 mr-1" />
                                  {task.exp_value || 0} XP
                                </Badge>
                              </div>
                            </div>

                            <ArrowRight className="w-6 h-6 text-gray-400 flex-shrink-0 mt-2" />
                          </div>

                          {task.checklist_items && task.checklist_items.length > 0 && (
                            <div className="mt-4 pt-4 border-t border-gray-100">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-sm font-medium text-gray-700">
                                  Progress: {task.checklist_items.filter(item => item.completed).length}/{task.checklist_items.length}
                                </span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-300"
                                  style={{ 
                                    width: `${(task.checklist_items.filter(item => item.completed).length / task.checklist_items.length) * 100}%` 
                                  }}
                                />
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {filteredTasks.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-bold text-gray-600 mb-2">No tasks found</h3>
              <p className="text-gray-500 mb-6">
                {filter === "all" && "Create tasks with due dates to see them here"}
                {filter === "upcoming" && "No upcoming tasks scheduled"}
                {filter === "overdue" && "Great job! No overdue tasks"}
                {filter === "completed" && "No completed tasks yet"}
              </p>
              <Button className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 rounded-2xl">
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Quest
              </Button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}