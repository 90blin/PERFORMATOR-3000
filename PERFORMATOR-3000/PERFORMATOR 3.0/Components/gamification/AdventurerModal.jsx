import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

import StatsTab from "./StatsTab";
import InventoryTab from "./InventoryTab";
import CharacterTab from "./CharacterTab";
import GoalsTab from "./GoalsTab";
import RewardNotification from "./RewardNotification";

const tabs = [
  { id: "stats", label: "Stats", icon: "📊" },
  { id: "inventory", label: "Inventory", icon: "🎒" },
  { id: "character", label: "Character", icon: "👤" },
  { id: "goals", label: "Goals", icon: "⚙️" }
];

export default function AdventurerModal({ isOpen, onClose, user, onUpdateUser, tasks }) {
  const [activeTab, setActiveTab] = useState("stats");
  const [showReward, setShowReward] = useState(false);
  const [rewardData, setRewardData] = useState(null);

  const handleRewardClaimed = (reward) => {
    setRewardData(reward);
    setShowReward(true);
  };

  const handleRewardNotificationClose = () => {
    setShowReward(false);
    setRewardData(null);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center"
      >
        {/* Backdrop with blur */}
        <div className="absolute inset-0 bg-black/50 backdrop-blur-md" onClick={onClose} />
        
        {/* Modal */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: 50 }}
          className="relative w-full max-w-4xl mx-4 h-[90vh] bg-white rounded-3xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold">🏆 Adventurer's Profile</h2>
              <p className="text-purple-100 mt-1">Manage your quest progression</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-white hover:bg-white/20 rounded-full w-10 h-10"
            >
              <X className="w-6 h-6" />
            </Button>
          </div>

          {/* Content Area */}
          <div className="flex-1 h-full pb-20 overflow-hidden">
            <div className="h-full overflow-y-auto p-6">
              {activeTab === "stats" && <StatsTab user={user} tasks={tasks} />}
              {activeTab === "inventory" && (
                <InventoryTab 
                  user={user} 
                  onUpdateUser={onUpdateUser}
                  onRewardClaimed={handleRewardClaimed}
                />
              )}
              {activeTab === "character" && <CharacterTab user={user} />}
              {activeTab === "goals" && (
                <GoalsTab 
                  user={user} 
                  tasks={tasks}
                  onUpdateUser={onUpdateUser}
                  onRewardClaimed={handleRewardClaimed}
                />
              )}
            </div>
          </div>

          {/* Bottom Navigation */}
          <div className="absolute bottom-0 left-0 right-0 bg-white border-t-2 border-gray-200 px-6 py-4">
            <div className="flex justify-around">
              {tabs.map((tab) => (
                <Button
                  key={tab.id}
                  variant={activeTab === tab.id ? "default" : "ghost"}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex flex-col items-center gap-2 h-16 px-8 rounded-2xl transition-all duration-300 ${
                    activeTab === tab.id
                      ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg"
                      : "text-gray-600 hover:bg-purple-50 hover:text-purple-600"
                  }`}
                >
                  <span className="text-2xl">{tab.icon}</span>
                  <span className="text-sm font-semibold">{tab.label}</span>
                </Button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Reward Notification */}
        <RewardNotification
          isOpen={showReward}
          reward={rewardData}
          onClose={handleRewardNotificationClose}
        />
      </motion.div>
    </AnimatePresence>
  );
}