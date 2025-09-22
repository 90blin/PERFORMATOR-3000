import React from "react";

const rarityStyles = {
  common: { bg: "bg-gray-100", badge: "text-gray-700 bg-gray-200" },
  uncommon: { bg: "bg-green-50", badge: "text-green-800 bg-green-100" },
  rare: { bg: "bg-blue-50", badge: "text-blue-800 bg-blue-100" },
  epic: { bg: "bg-purple-50", badge: "text-purple-800 bg-purple-100" },
  legendary: { bg: "bg-orange-50", badge: "text-orange-800 bg-orange-100" },
};

const categoryEmoji = {
  weapon: "⚔️",
  helmet: "⛑️",
  chest: "🛡️",
  legs: "👖",
  boots: "👢",
  gloves: "🧤",
  accessory: "💍",
};

export default function Item({ item = {} }) {
  const {
    name = "Unknown Item",
    category = "accessory",
    rarity = "common",
    image_url = null,
    level_requirement = 1,
    stats_bonus = {}
  } = item;

  const style = rarityStyles[rarity] || rarityStyles.common;
  const emoji = categoryEmoji[category] || "🎁";

  return (
    <div className={`w-full max-w-sm rounded-lg border ${style.bg} p-4 flex gap-3 items-start shadow-sm`}>
      <div className="w-16 h-16 rounded-md bg-white flex items-center justify-center overflow-hidden border">
        {image_url ? (
          // eslint-disable-next-line jsx-a11y/img-redundant-alt
          <img src={image_url} alt={`${name} image`} className="w-full h-full object-cover" />
        ) : (
          <div className="text-2xl">{emoji}</div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <h4 className="text-sm font-semibold text-gray-900 truncate">{name}</h4>
          <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${style.badge} whitespace-nowrap`}>
            {rarity.charAt(0).toUpperCase() + rarity.slice(1)}
          </span>
        </div>

        <div className="mt-2 text-xs text-gray-600">
          <div className="flex items-center justify-between">
            <span className="capitalize">{category.replace("_", " ")}</span>
            <span className="font-mono text-sm">Lv. {level_requirement}</span>
          </div>

          <div className="mt-2 space-y-1">
            {Object.keys(stats_bonus || {}).length === 0 ? (
              <div className="text-xs text-gray-500">No bonuses</div>
            ) : (
              Object.entries(stats_bonus).map(([key, val]) => (
                <div key={key} className="flex items-center justify-between text-xs">
                  <span className="capitalize">{key.replace("_", " ")}</span>
                  <span className="font-semibold text-gray-800">{val}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}