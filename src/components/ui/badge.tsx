import { cn } from "@/lib/utils";

type BadgeVariant = "green" | "amber" | "red" | "blue" | "gray";

const variants: Record<BadgeVariant, string> = {
  green: "bg-green-100 text-green-700 ring-green-600/20",
  amber: "bg-amber-100 text-amber-700 ring-amber-600/20",
  red:   "bg-red-100   text-red-700   ring-red-600/20",
  blue:  "bg-blue-100  text-blue-700  ring-blue-600/20",
  gray:  "bg-gray-100  text-gray-600  ring-gray-500/20",
};

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

export function Badge({ variant = "gray", children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
