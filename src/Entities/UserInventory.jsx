import React from "react";

/**
 * Simple presentational component for a UserInventory record.
 * Props:
 *  - record: { user_id, item_id, is_equipped, acquired_date }
 *  - item: optional item object { name, image_url, rarity }
 *  - onEquip(record) / onUnequip(record) callbacks (optional)
 */
export default function UserInventoryCard({
  record = {},
  item = null,
  onEquip,
  onUnequip
}) {
  const {
    user_id = "—",
    item_id = "—",
    is_equipped = false,
    acquired_date = null
  } = record;

  const formattedDate = acquired_date ? new Date(acquired_date).toLocaleString() : "Unknown";

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg border bg-white dark:bg-slate-800">
      <div className="w-12 h-12 rounded-md bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
        {item?.image_url ? (
          <img src={item.image_url} alt={item?.name || "item"} className="w-full h-full object-cover" />
        ) : (
          <div className="text-xl">🎁</div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <div className="truncate">
            <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {item?.name ?? `Item ${item_id}`}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Owner: {user_id} • Acquired: {formattedDate}
            </div>
          </div>

          <div className="ml-3 text-right">
            <div className={`text-xs px-2 py-0.5 rounded-full ${is_equipped ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-700"}`}>
              {is_equipped ? "Equipped" : "Unequipped"}
            </div>
            <div className="mt-2">
              {is_equipped ? (
                <button
                  type="button"
                  onClick={() => onUnequip && onUnequip(record)}
                  className="text-xs px-2 py-1 bg-white dark:bg-gray-700 border rounded"
                >
                  Unequip
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => onEquip && onEquip(record)}
                  className="text-xs px-2 py-1 bg-purple-500 text-white rounded"
                >
                  Equip
                </button>
              )}
            </div>
          </div>
        </div>

        {item?.rarity && (
          <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            Rarity: {item.rarity}
          </div>
        )}
      </div>
    </div>
  );
}