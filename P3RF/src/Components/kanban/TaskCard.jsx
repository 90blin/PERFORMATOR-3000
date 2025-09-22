import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Task } from '@/entities/all';
import { 
  Square,
  CheckSquare2,
  Tag, 
  Clock, 
  Zap, 
  Trash2,
  Paperclip,
  CheckSquare
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const priorityColors = {
  low: "bg-blue-200 text-blue-800 border-blue-300",
  medium: "bg-yellow-200 text-yellow-800 border-yellow-300", 
  high: "bg-orange-200 text-orange-800 border-orange-300",
  critical: "bg-red-200 text-red-800 border-red-300"
};

const statusColors = {
  todo: "bg-slate-200 text-slate-800",
  in_progress: "bg-blue-200 text-blue-800",
  done: "bg-green-200 text-green-800",
  master: "bg-yellow-200 text-yellow-800",
  backlog: "bg-gray-200 text-gray-800"
};

const colorThemes = {
  gray: { bg: "bg-gray-100", border: "border-gray-400", text: "text-gray-800" },
  red: { bg: "bg-red-100", border: "border-red-400", text: "text-red-800" },
  orange: { bg: "bg-orange-100", border: "border-orange-400", text: "text-orange-800" },
  yellow: { bg: "bg-yellow-100", border: "border-yellow-400", text: "text-yellow-800" },
  green: { bg: "bg-green-100", border: "border-green-400", text: "text-green-800" },
  blue: { bg: "bg-blue-100", border: "border-blue-400", text: "text-blue-800" },
  purple: { bg: "bg-purple-100", border: "border-purple-400", text: "text-purple-800" },
  pink: { bg: "bg-pink-100", border: "border-pink-400", text: "text-pink-800" }
};

export default function TaskCard({ 
  task, 
  onStatusChange, 
  onEdit, 
  onDelete,
  onCompleteToggle
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [masterCard, setMasterCard] = useState(null);
  
  // Load master card data for linked tasks - must be called before early return
  useEffect(() => {
    if (task?.master_card_id) {
      const loadMasterCard = async () => {
        try {
          const master = await Task.get(task.master_card_id);
          setMasterCard(master);
        } catch (error) {
          console.error("Failed to load master card:", error);
        }
      };
      loadMasterCard();
    }
  }, [task?.master_card_id]);

  if (!task) return null;

  const {
    title,
    tags,
    priority,
    exp_value,
    status,
    is_complete = false,
    image_url,
    due_date,
    checklist_items = [],
    color = "gray",
    master_card_id
  } = task;

  const handleCompletionToggle = (e) => {
    e.stopPropagation();
    if (onCompleteToggle) {
      onCompleteToggle(task, !is_complete);
    }
  };

  const handleCardClick = () => {
    if (onEdit) {
      onEdit(task);
    }
  };
  
  const completedChecklistItems = checklist_items.filter(item => item.completed).length;

  // Master Card Display
  if (status === 'master') {
    const colorTheme = colorThemes[color] || colorThemes.gray;
    
    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="cursor-pointer"
        onClick={handleCardClick}
      >
        <Card className={`${colorTheme.bg} shadow-sm hover:shadow-lg transition-shadow duration-300 rounded-lg overflow-hidden border-2 ${colorTheme.border}`}>
          <CardContent className="p-3">
            <h3 className={`font-medium text-sm ${colorTheme.text} mb-2 truncate`}>
              {title}
            </h3>
            
            <div className={`flex items-center justify-between text-xs ${colorTheme.text} opacity-75`}>
              {due_date && (
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{formatDistanceToNow(new Date(due_date), { addSuffix: true })}</span>
                </div>
              )}
              
              {exp_value > 0 && (
                <div className="flex items-center gap-1">
                  <Zap className="w-3 h-3"/>
                  <span className="font-medium">{exp_value} XP</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  // Regular Task Card Display
  const masterColorTheme = masterCard?.color ? colorThemes[masterCard.color] : null;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="relative cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleCardClick}
    >
      <Card 
        className={`bg-white dark:bg-slate-800/80 shadow-sm hover:shadow-lg transition-shadow duration-300 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700`}
      >
        {/* Thin colored header for linked tasks */}
        {master_card_id && masterColorTheme && (
          <div className={`h-1 w-full ${masterColorTheme.bg.replace('bg-', 'bg-').replace('-100', '-400')}`}></div>
        )}
        
        <div className="flex">
          {/* Completion Checkbox Area */}
          <div 
            className={`relative flex-shrink-0 transition-all duration-300 ease-in-out ${isHovered ? 'w-12' : 'w-0'}`}
          >
            <div 
              className={`absolute inset-0 flex items-center justify-center cursor-pointer transition-colors duration-200 ${
                is_complete ? 'bg-green-400 hover:bg-green-500' : 'bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600'
              }`}
              onClick={handleCompletionToggle}
            >
              {is_complete ? (
                <CheckSquare2 className="w-6 h-6 text-white" />
              ) : (
                <Square className="w-6 h-6 text-slate-600 dark:text-slate-300" />
              )}
            </div>
          </div>
          
          {/* Card Content Area */}
          <CardContent className="p-3 flex-grow overflow-hidden">
            {image_url && (
              <div className="h-24 -mx-3 -mt-3 mb-2 overflow-hidden">
                <img src={image_url} alt={title} className="w-full h-full object-cover"/>
              </div>
            )}
            
            <h3 className={`font-medium text-xs text-slate-800 dark:text-slate-100 mb-2 truncate ${is_complete ? 'line-through text-slate-500 dark:text-slate-400' : ''}`}>
              {title}
            </h3>

            <div className="flex flex-wrap items-center gap-2 text-xs">
              {tags && tags.slice(0, 2).map(tag => (
                <Badge key={tag} className="bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                  {tag}
                </Badge>
              ))}
              
              <Badge className={`${priorityColors[priority]} border`}>
                {priority}
              </Badge>
              
              {due_date && (
                <Badge variant="outline" className="text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-600">
                  <Clock className="w-3 h-3 mr-1" />
                  {formatDistanceToNow(new Date(due_date), { addSuffix: true })}
                </Badge>
              )}
            </div>

            {(checklist_items.length > 0 || exp_value > 0) && (
              <div className="flex items-center justify-between mt-3 text-xs text-slate-500 dark:text-slate-400">
                {checklist_items.length > 0 && (
                  <div className="flex items-center gap-1.5">
                    <CheckSquare className="w-3.5 h-3.5" />
                    <span>{completedChecklistItems}/{checklist_items.length}</span>
                  </div>
                )}
                {exp_value > 0 && (
                  <div className="flex items-center gap-1">
                    <Zap className="w-3 h-3 text-orange-400"/>
                    <span className="font-medium">{exp_value} XP</span>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </div>
      </Card>
    </motion.div>
  );
}