import { CATEGORY_ICONS, CATEGORY_BG } from "@/lib/data";

interface Props {
  category: string;
  size?: "sm" | "md";
}

export default function CategoryBadge({ category, size = "md" }: Props) {
  const bg = CATEGORY_BG[category] ?? "bg-stone-100 text-stone-700";
  const icon = CATEGORY_ICONS[category] ?? "📍";
  const cls = size === "sm" ? "text-xs px-1.5 py-0.5" : "text-xs px-2 py-1";

  return (
    <span className={`inline-flex items-center gap-1 rounded-full font-medium ${bg} ${cls}`}>
      <span>{icon}</span>
      {category}
    </span>
  );
}
