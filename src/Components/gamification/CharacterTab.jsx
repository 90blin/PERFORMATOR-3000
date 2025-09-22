import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Item } from "@/entities/all";

const equipmentSlots = [
  { key: "helmet", label: "Helmet", emoji: "⛑️", position: "top-4 left-1/2 transform -translate-x-1/2" },
  { key: "weapon", label: "Weapon", emoji: "⚔️", position: "top-20 left-4" },
  { key: "chest", label: "Chest", emoji: "🛡️", position: "top-32 left-1/2 transform -translate-x-1/2" },
  { key: "gloves", label: "Gloves", emoji: "🧤", position: "top-20 right-4" },
  { key: "legs", label: "Legs", emoji: "👖", position: "top-48 left-1/2 transform -translate-x-1/2" },
  { key: "boots", label: "Boots", emoji: "👢", position: "top-64 left-1/2 transform -translate-x-1/2" },
  { key: "accessory", label: "Accessory", emoji: "💍", position: "top-40 right-8" }
];

const rarityColors = {
  common: "border-gray-400 bg-gray-50 text-gray-700",
  uncommon: "border-green-400 bg-green-50 text-green-700", 
  rare: "border-blue-400 bg-blue-50 text-blue-700",
  epic: "border-purple-400 bg-purple-50 text-purple-700",
  legendary: "border-orange-400 bg-orange-50 text-orange-700"
};

export default function CharacterTab({ user }) {
  const [equippedItems, setEquippedItems] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  const loadEquippedItems = useCallback(async () => {
    try {
      const equipped = {};
      
      for (const slot of equipmentSlots) {
        const itemId = user[`equipped_${slot.key}`];
        if (itemId) {
          try {
            const item = await Item.get(itemId);
            equipped[slot.key] = item;
          } catch (error) {
            console.log(`Item ${itemId} not found for slot ${slot.key}`);
          }
        }
      }
      
      setEquippedItems(equipped);
    } catch (error) {
      console.error("Error loading equipped items:", error);
    }
    setIsLoading(false);
  }, [user]);

  useEffect(() => {
    loadEquippedItems();
  }, [loadEquippedItems]);

  const getTotalStats = () => {
    let expMultiplier = 0;
    let productivityBonus = 0;

    Object.values(equippedItems).forEach(item => {
      if (item.stats_bonus) {
        expMultiplier += item.stats_bonus.exp_multiplier || 0;
        productivityBonus += item.stats_bonus.productivity_bonus || 0;
      }
    });

    return { expMultiplier, productivityBonus };
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-500 rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-600 font-medium">Loading character...</p>
        </div>
      </div>
    );
  }

  const { expMultiplier, productivityBonus } = getTotalStats();

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">👤 Character Sheet</h3>
        <p className="text-gray-600">View your equipped gear and character stats</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Character Visual */}
        <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-2 border-purple-200 rounded-2xl shadow-xl">
          <CardHeader>
            <CardTitle className="text-center text-xl font-bold text-gray-900">
              🏰 Adventure Gear
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Character Silhouette with Equipment Slots */}
            <div className="relative mx-auto w-80 h-96 bg-gradient-to-b from-gray-100 to-gray-200 rounded-3xl border-4 border-gray-300 shadow-inner">
              {/* Character Body */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-32 bg-gradient-to-b from-blue-200 to-blue-300 rounded-full opacity-30"></div>
              
              {/* Equipment Slots */}
              {equipmentSlots.map(slot => {
                const item = equippedItems[slot.key];
                return (
                  <div key={slot.key} className={`absolute ${slot.position}`}>
                    <div className={`w-16 h-16 rounded-2xl border-2 flex items-center justify-center shadow-lg transition-all duration-300 ${
                      item 
                        ? `${rarityColors[item.rarity]} hover:scale-110` 
                        : 'bg-gray-50 border-gray-300 border-dashed'
                    }`}>
                      {item ? (
                        item.image_url ? (
                          <img 
                            src={item.image_url} 
                            alt={item.name}
                            className="w-10 h-10 object-contain"
                          />
                        ) : (
                          <span className="text-2xl">{slot.emoji}</span>
                        )
                      ) : (
                        <span className="text-2xl opacity-30">{slot.emoji}</span>
                      )}
                    </div>
                    {item && (
                      <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                        <Badge className={`${rarityColors[item.rarity]} border text-xs`}>
                          {item.name}
                        </Badge>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Equipment Details & Stats */}
        <div className="space-y-6">
          {/* Character Stats */}
          <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-2xl shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg font-bold text-gray-900">
                📈 Character Stats
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-white rounded-xl shadow-sm">
                  <div className="text-2xl font-bold text-blue-600">+{expMultiplier}%</div>
                  <div className="text-sm text-gray-600">EXP Multiplier</div>
                </div>
                <div className="text-center p-4 bg-white rounded-xl shadow-sm">
                  <div className="text-2xl font-bold text-green-600">+{productivityBonus}%</div>
                  <div className="text-sm text-gray-600">Productivity Bonus</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Equipped Items List */}
          <Card className="bg-white border-2 border-gray-200 rounded-2xl shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-gray-900">
                ⚡ Equipped Items ({Object.keys(equippedItems).length}/7)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {Object.keys(equippedItems).length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-3">🎒</div>
                  <p className="font-medium">No items equipped</p>
                  <p className="text-sm">Visit the Inventory tab to equip gear</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {Object.entries(equippedItems).map(([slot, item]) => (
                    <div key={slot} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                      <div className={`w-12 h-12 rounded-lg ${rarityColors[item.rarity]} border flex items-center justify-center`}>
                        {item.image_url ? (
                          <img 
                            src={item.image_url} 
                            alt={item.name}
                            className="w-8 h-8 object-contain"
                          />
                        ) : (
                          <span className="text-lg">
                            {equipmentSlots.find(s => s.key === slot)?.emoji}
                          </span>
                        )}
                      </div>
                      <div className="flex-1">
                        <h5 className="font-bold text-gray-900">{item.name}</h5>
                        <p className="text-sm text-gray-500 capitalize">
                          {slot} • {item.rarity}
                        </p>
                      </div>
                      <Badge className={`${rarityColors[item.rarity]} border`}>
                        Lv.{item.level_requirement}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}