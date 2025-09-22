import React, { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Play,
  Pause,
  RotateCcw,
  Coffee,
  Target,
  Zap,
  Cog,
  BookOpen,
  Brain
} from "lucide-react";
import { motion } from "framer-motion";

const TIMER_STATES = {
  WORK: "work",
  SHORT_BREAK: "short_break",
  LONG_BREAK: "long_break",
};

export default function PomodoroTimer({ user, onSessionComplete, onUpdateUser }) {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [currentState, setCurrentState] = useState(TIMER_STATES.WORK);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const [settings, setSettings] = useState({
    workDuration: user?.pomodoro_work_duration || 25,
    shortBreakDuration: user?.pomodoro_break_duration || 5,
    longBreakDuration: user?.pomodoro_long_break_duration || 15,
  });

  const intervalRef = useRef(null);
  const audioRef = useRef(null);

  const getCurrentStateDuration = useCallback(() => {
    switch (currentState) {
      case TIMER_STATES.WORK:
        return settings.workDuration;
      case TIMER_STATES.SHORT_BREAK:
        return settings.shortBreakDuration;
      case TIMER_STATES.LONG_BREAK:
        return settings.longBreakDuration;
      default:
        return settings.workDuration;
    }
  }, [currentState, settings]);

  // handleSessionComplete updated to avoid stale closures and avoid awaiting inside interval
  const handleSessionComplete = useCallback(
    (stopRunning = true) => {
      if (stopRunning) setIsRunning(false);

      // play short notification (best-effort)
      try {
        if (audioRef.current) {
          audioRef.current.currentTime = 0;
          audioRef.current.play().catch(() => {});
        }
      } catch (error) {
        // ignore play errors (autoplay restrictions)
      }

      if (currentState === TIMER_STATES.WORK) {
        // use functional update to avoid stale sessionsCompleted value
        setSessionsCompleted((prev) => {
          const newSessions = prev + 1;

          // update user totals (fire-and-forget)
          if (typeof onUpdateUser === "function") {
            try {
              onUpdateUser({
                total_pomodoros: (user?.total_pomodoros || 0) + 1,
              });
            } catch (e) {
              // ignore
            }
          }

          if (typeof onSessionComplete === "function") {
            try { onSessionComplete(); } catch (e) {}
          }

          const nextState =
            newSessions % 4 === 0 ? TIMER_STATES.LONG_BREAK : TIMER_STATES.SHORT_BREAK;
          setCurrentState(nextState);

          return newSessions;
        });
      } else {
        setCurrentState(TIMER_STATES.WORK);
      }
    },
    [currentState, onSessionComplete, onUpdateUser, user?.total_pomodoros]
  );

  // interval management
  useEffect(() => {
    if (isRunning) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            // do not await here
            handleSessionComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning, handleSessionComplete]);

  // reset timeLeft when state or durations change
  useEffect(() => {
    const duration = getCurrentStateDuration() || 25;
    setTimeLeft(duration * 60);
  }, [currentState, getCurrentStateDuration]);

  const toggleTimer = () => {
    setIsRunning((s) => !s);
  };

  const resetTimer = () => {
    setIsRunning(false);
    const duration = getCurrentStateDuration();
    setTimeLeft((duration || 25) * 60);
  };

  const formatTime = (seconds) => {
    const safe = Math.max(0, Math.floor(seconds));
    const mins = Math.floor(safe / 60);
    const secs = safe % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const updateSettings = async (newSettings) => {
    setSettings(newSettings);
    if (typeof onUpdateUser === "function") {
      try {
        await onUpdateUser({
          pomodoro_work_duration: newSettings.workDuration,
          pomodoro_break_duration: newSettings.shortBreakDuration,
          pomodoro_long_break_duration: newSettings.longBreakDuration,
        });
      } catch (e) {
        // ignore
      }
    }
  };

  const stateInfo = (() => {
    switch (currentState) {
      case TIMER_STATES.WORK:
        return { title: "Focus Time", icon: Target, color: "red" };
      case TIMER_STATES.SHORT_BREAK:
        return { title: "Short Break", icon: Coffee, color: "blue" };
      case TIMER_STATES.LONG_BREAK:
        return { title: "Long Break", icon: Coffee, color: "green" };
      default:
        return { title: "Focus Time", icon: Target, color: "red" };
    }
  })();

  const StateIcon = stateInfo.icon;
  const colorClasses = {
    red: "text-red-600 dark:text-red-400",
    blue: "text-blue-600 dark:text-blue-400",
    green: "text-green-600 dark:text-green-400",
  };

  return (
    <div className="space-y-3">
      {/* Compact Header */}
      <div className="text-center">
        <div className={`flex items-center justify-center gap-2 mb-1 ${colorClasses[stateInfo.color] || colorClasses.red}`}>
          <StateIcon className="w-4 h-4" />
          <h3 className="text-sm font-bold">{stateInfo.title}</h3>
        </div>
      </div>

      {/* Compact Timer Display */}
      <div className="text-center">
        <motion.div
          key={timeLeft}
          initial={{ scale: 1.05 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.2 }}
          className="text-3xl font-bold text-gray-900 dark:text-gray-100 font-mono"
        >
          {formatTime(timeLeft)}
        </motion.div>
      </div>

      {/* Compact Controls */}
      <div className="flex gap-1 justify-center">
        <Button
          onClick={toggleTimer}
          size="sm"
          className={`rounded-md font-medium px-3 py-1 text-xs ${
            isRunning ? `bg-orange-500 hover:bg-orange-600 text-white` : `bg-green-500 hover:bg-green-600 text-white`
          }`}
        >
          {isRunning ? <Pause className="w-3 h-3 mr-1" /> : <Play className="w-3 h-3 mr-1" />}
          {isRunning ? "Pause" : "Start"}
        </Button>

        <Button onClick={resetTimer} size="sm" variant="outline" className="rounded-md font-medium px-2 py-1">
          <RotateCcw className="w-3 h-3" />
        </Button>
      </div>

      {/* Pomodoro Settings Icons */}
      <div className="flex justify-center gap-1">
        <Button variant="ghost" size="sm" className="p-1 h-6 w-6 rounded-md" aria-label="Settings">
          <Cog className="w-3 h-3" />
        </Button>
        <Button variant="ghost" size="sm" className="p-1 h-6 w-6 rounded-md" aria-label="Study tips">
          <BookOpen className="w-3 h-3" />
        </Button>
        <Button variant="ghost" size="sm" className="p-1 h-6 w-6 rounded-md" aria-label="Focus mode">
          <Brain className="w-3 h-3" />
        </Button>
      </div>

      {/* Compact Stats */}
      <div className="space-y-2 text-xs">
        <div className="flex items-center justify-between">
          <span className="font-medium text-gray-700 dark:text-gray-300">Today's Sessions</span>
          <Badge variant="secondary" className="text-xs px-2 py-0">
            {sessionsCompleted}
          </Badge>
        </div>

        <div className="flex items-center justify-between">
          <span className="font-medium text-gray-700 dark:text-gray-300">Total Pomodoros</span>
          <div className="flex items-center gap-1">
            <Zap className="w-3 h-3 text-orange-500" />
            <span className="font-bold text-orange-600 text-xs">{user?.total_pomodoros || 0}</span>
          </div>
        </div>
      </div>

      <audio
        ref={audioRef}
        preload="auto"
        src="data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmUcBSqQ1/LJRQW1mZm1lZWZlaWVtdGmla2htpGtlaGVtZG1laKVoZWVlaGVtZGtltGtoaWVoZGVlaGVvdGr1baSnQX0w+t73fPPjRc="
      />
    </div>
  );
}