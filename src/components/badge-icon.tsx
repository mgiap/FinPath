// src/components/badge-icon.tsx
import { BadgeRarity } from "@prisma/client";

const rarityStyles: Record<BadgeRarity, { bg: string; text: string; label: string }> = {
  COMMON:    { bg: "bg-slate-100",  text: "text-slate-600",  label: "text-slate-400"  },
  UNCOMMON:  { bg: "bg-green-100",  text: "text-green-700",  label: "text-green-600"  },
  RARE:      { bg: "bg-blue-100",   text: "text-blue-700",   label: "text-blue-600"   },
  EPIC:      { bg: "bg-violet-100", text: "text-violet-700", label: "text-violet-600" },
  LEGENDARY: { bg: "bg-amber-100",  text: "text-amber-700",  label: "text-amber-600"  },
};

interface BadgeIconProps {
  icon?: string | null;
  name?: string | null;
  rarity?: BadgeRarity | null;
  showRarity?: boolean;
  size?: "sm" | "md" | "lg";
}

export default function BadgeIcon({ icon, name, rarity, showRarity = true, size = "md" }: BadgeIconProps) {
  const r = rarity ?? "COMMON";
  const s = rarityStyles[r];
  const sizeClass = size === "sm" ? "h-8 w-8 text-base" : size === "lg" ? "h-14 w-14 text-3xl" : "h-10 w-10 text-lg";

  return (
    <div className="flex flex-col items-center gap-1">
      <div className={`${sizeClass} rounded-full ${s.bg} ${s.text} flex items-center justify-center font-semibold`}>
        {icon ?? name?.[0] ?? "?"}
      </div>
      {showRarity && (
        <p className={`text-xs capitalize ${s.label}`}>{r.toLowerCase()}</p>
      )}
    </div>
  );
}