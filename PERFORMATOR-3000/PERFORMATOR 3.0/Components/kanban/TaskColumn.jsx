import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AnimatePresence } from 'framer-motion';
import { Sparkles, Plus, Minimize2, Maximize2 } from 'lucide-react';
import TaskCard from './TaskCard';

export default function TaskColumn({
  column = {},
  tasks = [],
  isExpanded,
  onToggleExpand,
  isCollapsible,
  onStatusChange,
  onEdit,
  onDelete,
  onSlay,
  onCreateMasterCard,
  onCompleteToggle
}) {
  const showSlayButton = column.id === 'done';
  const canUncheck = column.canUncheck;
  const isMasterColumn = column.id === 'master';
  const isCollapsedColumn = column.id === 'slain';

  const handleCreateMasterCard = () => {
    if (typeof onCreateMasterCard === 'function') {
      onCreateMasterCard();
    }
  };

  const handleEditTask = (task) => {
    if (typeof onEdit === 'function' && task && task.id) {
      onEdit(task);
    }
  };

  const safeToggle = () => {
    if (typeof onToggleExpand === 'function') onToggleExpand();
  };

  return (
    <div className={`${isCollapsible && !isExpanded ? 'w-12' : column.width} flex-shrink-0 transition-all duration-300 h-full`}>
      <Card className="bg-slate-100/80 dark:bg-gray-800/90 backdrop-blur-sm shadow-md rounded-xl border-0 h-full flex flex-col">
        <CardHeader
          className={`${column.bg} border-b ${column.color} dark:border-gray-600 rounded-t-xl transition-all duration-300 py-2 px-3 relative group`}
        >
          {isCollapsible && !isExpanded && (
            <div
              className="absolute inset-0 flex items-end justify-center pb-4 cursor-pointer"
              onClick={safeToggle}
            >
              <div
                className={`text-slate-700 dark:text-slate-200 font-semibold text-xs whitespace-nowrap transform ${
                  isCollapsedColumn ? 'rotate-180' : '-rotate-90'
                }`}
                style={{ transformOrigin: 'center' }}
              >
                {column.title}
              </div>
            </div>
          )}

          <CardTitle className={`flex items-center justify-between ${isCollapsible && !isExpanded ? 'opacity-0' : 'opacity-100'}`}>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-slate-700 dark:text-slate-200 truncate">
                {column.title}
              </span>
            </div>

            <div className="flex items-center gap-1">
              <span className="bg-white dark:bg-slate-600 px-2 py-0.5 rounded-full font-medium text-xs text-slate-600 dark:text-slate-200 transition-all duration-300 whitespace-nowrap group-hover:translate-x-[-24px]">
                {tasks?.length ?? 0}
              </span>

              {isCollapsible && (
                isExpanded ? (
                  <Button variant="ghost" size="icon" className="w-5 h-5" onClick={safeToggle} aria-label="Collapse column">
                    <Minimize2 className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
                  </Button>
                ) : (
                  <Button variant="ghost" size="icon" className="w-5 h-5 absolute right-3 opacity-0 group-hover:opacity-100 transition-opacity" onClick={safeToggle} aria-label="Expand column">
                    <Maximize2 className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
                  </Button>
                )
              )}
            </div>

          </CardTitle>
        </CardHeader>

        {(!isCollapsible || isExpanded) && (
          <CardContent className="p-2 flex-grow overflow-hidden">
            <div className="space-y-2 h-full overflow-y-auto">
              {/* Master Card Creation Button */}
              {isMasterColumn && (
                <div className="mb-3">
                  <Button
                    onClick={handleCreateMasterCard}
                    className="w-full h-16 bg-white/30 hover:bg-white/40 dark:bg-white/10 dark:hover:bg-white/15 rounded-2xl transition-all duration-300 hover:scale-105 group flex items-center justify-center backdrop-blur-sm"
                    variant="ghost"
                    aria-label="Create master card"
                  >
                    <div className="w-8 h-8 bg-white/40 dark:bg-white/20 rounded-full flex items-center justify-center shadow-sm group-hover:shadow-md transition-all duration-300 backdrop-blur-sm">
                      <Plus className="w-5 h-5 text-white/60 dark:text-white/50" />
                    </div>
                  </Button>
                </div>
              )}

              <AnimatePresence>
                {(tasks || []).map((task) => (
                  <TaskCard
                    key={task?.id ?? Math.random()}
                    task={task}
                    onStatusChange={canUncheck ? onStatusChange : null}
                    onEdit={handleEditTask}
                    onDelete={onDelete}
                    onSlay={onSlay}
                    onCompleteToggle={onCompleteToggle}
                    canUncheck={canUncheck}
                    showSlayButton={showSlayButton}
                  />
                ))}
              </AnimatePresence>

              {(!tasks || tasks.length === 0) && !isMasterColumn && (
                <div className="text-center pt-8 text-slate-500 dark:text-slate-400 transition-colors duration-300">
                  <Sparkles className="w-6 h-6 mx-auto mb-2 opacity-40" />
                  <p className="font-medium text-xs">Empty column</p>
                </div>
              )}
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}