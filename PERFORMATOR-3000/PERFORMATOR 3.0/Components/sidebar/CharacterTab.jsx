import React from "react";
import { Badge } from "@/components/ui/badge";

export default function CharacterTab({ user = {} }) {
  const slots = ["weapon", "helmet", "chest", "legs", "boots", "gloves", "accessory"];
  const equippedCount = slots.filter((slot) => !!user?.[`equipped_${slot}`]).length;

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 text-center mb-4">
        👤 Character
      </h3>

      {/* Character Overview */}
      <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg p-3">
        <div className="text-center mb-3">
          <div className="w-12 h-12 mx-auto mb-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-lg">{user?.level ?? 1}</span>
          </div>
          <div className="text-sm font-bold text-gray-900 dark:text-gray-100">
            Level {user?.level ?? 1}
          </div>
          <div className="text-xs text-purple-600 dark:text-purple-400">
            {user?.character_name ?? "Adventurer"}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-white dark:bg-gray-700 rounded p-2 text-center">
            <div className="font-bold text-gray-900 dark:text-gray-100">
              {user?.raca ?? "—"}
            </div>
            <div className="text-gray-500">Race</div>
          </div>
          <div className="bg-white dark:bg-gray-700 rounded p-2 text-center">
            <div className="font-bold text-gray-900 dark:text-gray-100">
              {user?.classe ?? "—"}
            </div>
            <div className="text-gray-500">Class</div>
          </div>
        </div>
      </div>

      {/* Equipment Summary */}
      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="text-xs font-bold text-gray-700 dark:text-gray-300">Equipment Slots</div>
          <Badge className="bg-white/60 text-sm border-0">
            {equippedCount} / {slots.length}
          </Badge>
        </div>

        <div className="grid grid-cols-3 gap-1">
          {slots.map((slot) => (
            <div key={slot} className="bg-white dark:bg-gray-600 rounded p-2 text-center">
              <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                {slot.charAt(0).toUpperCase() + slot.slice(1)}
              </div>
              <div className="text-xs">
                {user?.[`equipped_${slot}`] ? "✅" : "—"}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}