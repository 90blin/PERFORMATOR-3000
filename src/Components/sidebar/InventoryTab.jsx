import React, { useState, useEffect } from "react";
import { UserInventory, Item } from "@/entities/all";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function InventoryTab({ user = {}, onUpdateUser }) {
  const [inventory, setInventory] = useState([]);
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const loadInventory = async () => {
      try {
        const [userInventory, allItems] = await Promise.all([
          // support both filter/list APIs depending on entity implementation
          typeof UserInventory.filter === "function"
            ? UserInventory.filter({ user_id: user.id })
            : UserInventory.list?.({ user_id: user.id }) || [],
          typeof Item.list === "function" ? Item.list() : []
        ]);

        if (!mounted) return;
        setInventory(userInventory || []);
        setItems(allItems || []);
      } catch (error) {
        console.error("Error loading inventory:", error);
        if (mounted) {
          setInventory([]);
          setItems([]);
        }
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    if (user?.id) {
      setIsLoading(true);
      loadInventory();
    } else {
      setInventory([]);
      setItems([]);
      setIsLoading(false);
    }

    return () => {
      mounted = false;
    };
  }, [user?.id]);

  if (isLoading) {
    return (
      <div className="p-4 text-center">
        <div className="text-sm text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  if (!inventory || inventory.length === 0) {
    return (
      <div className="p-4 text-center">
        <div className="text-4xl mb-2">📦</div>
        <div className="text-sm font-bold text-gray-600 dark:text-gray-400 mb-1">Empty Inventory</div>
        <div className="text-xs text-gray-500">Complete goals to earn gear!</div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 text-center mb-4">
        🎒 Inventory
      </h3>

      <div className="space-y-2">
        {inventory.slice(0, 6).map((invItem) => {
          const item = items.find(i => i.id === invItem.item_id);
          if (!item) return null;

          return (
            <div key={invItem.id} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2 flex items-center gap-2">
              <div className="w-8 h-8 bg-white dark:bg-gray-600 rounded-lg flex items-center justify-center overflow-hidden">
                {item.image_url ? (
                  <img src={item.image_url} alt={item.name} className="w-6 h-6 object-contain" />
                ) : (
                  <span className="text-xs">⚔️</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-gray-900 dark:text-gray-100 truncate">
                  {item.name}
                </div>
                <Badge className="text-xs capitalize">{item.rarity}</Badge>
              </div>
              {invItem.is_equipped ? (
                <div className="text-xs text-green-600">✅</div>
              ) : (
                <div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={async () => {
                      try {
                        // example equip action if UserInventory.update exists
                        if (typeof UserInventory.update === "function") {
                          await UserInventory.update(invItem.id, { is_equipped: true });
                          // refresh local inventory
                          const refreshed = typeof UserInventory.filter === "function"
                            ? await UserInventory.filter({ user_id: user.id })
                            : UserInventory.list?.({ user_id: user.id }) || [];
                          setInventory(refreshed || []);
                          if (typeof onUpdateUser === "function") {
                            onUpdateUser(); // caller can refresh user if needed
                          }
                        }
                      } catch (e) {
                        console.error("Failed to equip item:", e);
                      }
                    }}
                    className="text-xs"
                  >
                    Equip
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {inventory.length > 6 && (
        <div className="text-center text-xs text-gray-500">
          +{inventory.length - 6} more items
        </div>
      )}
    </div>
  );
}