import { cn } from "@/shared/utils/style";

interface TagBadgeProps {
  title?: string;
  tag: string;
  className?: string;
}

const TAG_COLORS = {
  DEFI: "bg-purple-500/20 border-purple-500/20 text-purple-400",
  NFT: "bg-pink-500/20 border-pink-500/20 text-pink-400",
  GOVERNANCE: "bg-blue-500/20 border-blue-500/20 text-blue-400",
  BRIDGE: "bg-orange-500/20 border-orange-500/20 text-orange-400",
  TOKEN: "bg-emerald-500/20 border-emerald-500/20 text-emerald-400",
  TRANSFER: "bg-green-500/20 border-green-500/20 text-green-400",
  DEFAULT: "bg-gray-500/20 border-gray-500/20 text-gray-400",
} as const;

export function TagBadge({ title, tag, className }: TagBadgeProps) {
  const colorClass =
    TAG_COLORS[tag as keyof typeof TAG_COLORS] || TAG_COLORS.DEFAULT;

  return (
    <div
      className={cn(
        "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border whitespace-nowrap w-fit",
        colorClass,
        className
      )}
    >
      {title}
    </div>
  );
}
