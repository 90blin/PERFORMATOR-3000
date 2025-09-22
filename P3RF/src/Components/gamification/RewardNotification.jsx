import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Gift, X, Sparkles } from "lucide-react";

const rarityColors = {
  common: "from-gray-400 to-gray-500",
  uncommon: "from-green-400 to-green-500",
  rare: "from-blue-400 to-blue-500",
  epic: "from-purple-400 to-purple-500",
  legendary: "from-orange-400 to-orange-500"
};

const rarityBgs = {
  common: "from-gray-50 to-gray-100",
  uncommon: "from-green-50 to-green-100",
  rare: "from-blue-50 to-blue-100",
  epic: "from-purple-50 to-purple-100",
  legendary: "from-orange-50 to-orange-100"
};

export default function RewardNotification({ isOpen, reward, onClose }) {
  if (!isOpen || !reward) return null;

  const RarityBadge = ({ rarity }) => (
    <Badge className={`bg-gradient-to-r ${rarityColors[rarity] || rarityColors.common} text-white`}>
      {rarity ? rarity.charAt(0).toUpperCase() + rarity.slice(1) : "Common"}
    </Badge>
  );

  const ItemCard = ({ item }) => (
    <div className={`p-4 rounded-xl border-2 shadow-sm bg-gradient-to-br ${rarityBgs[item?.rarity] || rarityBgs.common} flex flex-col items-center gap-2`}>
      {item?.image_url ? (
        <img src={item.image_url} alt={item.name} className="w-20 h-20 object-contain rounded-md" />
      ) : (
        <div className="w-20 h-20 flex items-center justify-center text-3xl">🎁</div>
      )}
      <div className="font-semibold text-gray-900 text-center">{item?.name || "Unknown Item"}</div>
      <div className="flex items-center gap-2">
        <RarityBadge rarity={item?.rarity} />
        {item?.level_requirement != null && (
          <span className="text-xs font-mono text-gray-600">Lv.{item.level_requirement}</span>
        )}
      </div>
    </div>
  );

  const renderRewardContent = () => {
    if (reward.type === "daily" || reward.type === "monthly") {
      return (
        <div className="text-center space-y-6">
          {reward.exp ? (
            <div className="flex flex-col items-center gap-2">
              <div className="rounded-full bg-gradient-to-r from-yellow-200 to-yellow-300 p-3 inline-flex">
                <Sparkles className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="text-2xl font-bold">+{reward.exp} EXP</div>
              <div className="text-sm text-gray-500">Experience awarded</div>
            </div>
          ) : null}

          {reward.item ? (
            <ItemCard item={reward.item} />
          ) : (
            <div className="text-sm text-gray-500">No item dropped this time.</div>
          )}
        </div>
      );
    }

    if (reward.type === "weekly") {
      return (
        <div className="text-center space-y-4">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Weekly Rewards!</h3>
          <div className="grid grid-cols-3 gap-4">
            {(reward.items || []).map((it, idx) => (
              <ItemCard key={idx} item={it} />
            ))}
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center"
      >
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

        <motion.div
          initial={{ scale: 0.8, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: 30 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="relative bg-white rounded-3xl shadow-2xl p-6 mx-4 max-w-lg w-full"
        >
          <div className="absolute -top-5 -right-5">
            <div className="p-2 rounded-full bg-white/80 shadow-lg">
              <Sparkles className="w-8 h-8 text-pink-400" />
            </div>
          </div>

          <button
            aria-label="Close"
            onClick={onClose}
            className="absolute top-3 right-3 rounded-full p-2 hover:bg-gray-100"
          >
            <X className="w-5 h-5 text-gray-700" />
          </button>

          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="p-3 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
                <Gift className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold">You received a reward</h2>
                <p className="text-xs text-gray-500">Congratulations!</p>
              </div>
            </div>

            {renderRewardContent()}

            <div className="pt-2">
              <Button onClick={onClose} className="px-6 py-2 rounded-xl">
                Close
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}