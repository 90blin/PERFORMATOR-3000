import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserInventory, Item } from "@/entities/all";
import { motion } from "framer-motion";

const rarityColors = {
  common: "border-gray-400 bg-gray-50 text-gray-700",
  uncommon: "border-green-400 bg-green-50 text-green-700",
  rare: "border-blue-400 bg-blue-50 text-blue-700",
  epic: "border-purple-400 bg-purple-50 text-purple-700",
  legendary: "border-orange-400 bg-orange-50 text-orange-700"
};

const categoryEmojis = {
  weapon: "⚔️",
  helmet: "⛑️",
  chest: "🛡️",
  legs: "👖",
  boots: "👢",
  gloves: "🧤",
  accessory: "💍"
};

export default function InventoryTab({ user, onUpdateUser, onRewardClaimed }) {
  const [inventory, setInventory] = useState([]);
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadInventory = useCallback(async () => {
    try {
      const [userInventory, allItems] = await Promise.all([
        UserInventory.list({ user_id: user.id }),
        Item.list()
      ]);
      setInventory(userInventory);
      setItems(allItems);
    } catch (error) {
      console.error("Error loading inventory:", error);
    }
    setIsLoading(false);
  }, [user.id]);

  useEffect(() => {
    loadInventory();
  }, [loadInventory]);

  const handleEquipItem = async (inventoryItem) => {
    try {
      const item = items.find(i => i.id === inventoryItem.item_id);
      if (!item) return;

      // Unequip any other item in the same category
      const categoryInventory = inventory.filter(inv =>
        inv.is_equipped &&
        items.find(i => i.id === inv.item_id)?.category === item.category
      );
      for (const prevItem of categoryInventory) {
        await UserInventory.update(prevItem.id, { is_equipped: false });
      }

      // Equip the new item
      await UserInventory.update(inventoryItem.id, { is_equipped: true });

      // Update user's equipped item field
      const equipmentField = `equipped_${item.category}`;
      await onUpdateUser({ [equipmentField]: inventoryItem.item_id });

      loadInventory();
    } catch (error) {
      console.error("Error equipping item:", error);
    }
  };

  const handleUnequipItem = async (inventoryItem) => {
    try {
      await UserInventory.update(inventoryItem.id, { is_equipped: false });
      const item = items.find(i => i.id === inventoryItem.item_id);
      if (item) {
        const equipmentField = `equipped_${item.category}`;
        await onUpdateUser({ [equipmentField]: null });
      }
      loadInventory();
    } catch (error) {
      console.error("Error unequipping item:", error);
    }
  };

  const getInventoryByCategory = (category) => {
    return inventory
      .map(invItem => ({
        ...invItem,
        item: items.find(i => i.id === invItem.item_id)
      }))
      .filter(invItem => invItem.item && invItem.item.category === category);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-500 rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-600 font-medium">Loading inventory...</p>
        </div>
      </div>
    );
  }

  const categories = Object.keys(categoryEmojis);

  return (
    <div className="space-y-6">
      {categories.map(category => {
        const categoryInventory = getInventoryByCategory(category);
        if (categoryInventory.length === 0) return null;
        return (
          <Card key={category} className="border-2 rounded-2xl shadow-lg">
            <CardContent className="py-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">{categoryEmojis[category]}</span>
                <span className="font-bold text-lg capitalize">{category}</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {categoryInventory.map(invItem => {
                  const { item } = invItem;
                  return (
                    <motion.div
                      key={invItem.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                      className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 ${rarityColors[item.rarity]} shadow`}
                    >
                      {item.image_url ? (
                        <img src={item.image_url} alt={item.name} className="w-12 h-12 object-contain mb-2" />
                      ) : (
                        <span className="text-3xl mb-2">{categoryEmojis[category]}</span>
                      )}
                      <div className="font-bold">{item.name}</div>
                      <Badge className={`${rarityColors[item.rarity]} border text-xs capitalize`}>
                        {item.rarity}
                      </Badge>
                      <div className="text-xs text-gray-500">Lv. {item.level_requirement}</div>
                      <div className="flex gap-2 mt-2">
                        {invItem.is_equipped ? (
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-green-500 text-green-700"
                            onClick={() => handleUnequipItem(invItem)}
                          >
                            Unequip
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => handleEquipItem(invItem)}
                          >
                            Equip
                          </Button>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}