import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md";
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed",
        size === "sm" ? "px-3 py-1.5 text-xs" : "px-4 py-2 text-sm",
        variant === "primary" && "bg-blue-600 text-white hover:bg-blue-700 shadow-sm",
        variant === "outline" && "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 shadow-sm",
        variant === "ghost"   && "text-gray-600 hover:bg-gray-100",
        variant === "danger"  && "bg-red-600 text-white hover:bg-red-700 shadow-sm",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
