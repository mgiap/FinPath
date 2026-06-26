// src/lib/avatars.ts
export const PRESET_AVATARS = [
  { id: "fox", emoji: "🦊", gradient: "from-orange-400 to-red-500" },
  { id: "owl", emoji: "🦉", gradient: "from-amber-400 to-yellow-600" },
  { id: "rocket", emoji: "🚀", gradient: "from-indigo-400 to-purple-600" },
  { id: "panda", emoji: "🐼", gradient: "from-slate-400 to-slate-600" },
  { id: "lion", emoji: "🦁", gradient: "from-yellow-400 to-orange-600" },
  { id: "dolphin", emoji: "🐬", gradient: "from-cyan-400 to-blue-600" },
  { id: "wolf", emoji: "🐺", gradient: "from-gray-400 to-gray-700" },
  { id: "phoenix", emoji: "🔥", gradient: "from-red-400 to-pink-600" },
  { id: "turtle", emoji: "🐢", gradient: "from-green-400 to-emerald-600" },
  { id: "robot", emoji: "🤖", gradient: "from-blue-400 to-indigo-600" },
] as const;

export type PresetAvatarId = (typeof PRESET_AVATARS)[number]["id"];

export function getAvatar(avatarId?: string | null) {
  return PRESET_AVATARS.find((a) => a.id === avatarId) ?? PRESET_AVATARS[0];
}