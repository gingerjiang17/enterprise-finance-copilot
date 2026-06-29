type SheetTypeBadgeProps = {
    type: "pl" | "gl" | "unknown";
  };
  
  export default function SheetTypeBadge({ type }: SheetTypeBadgeProps) {
    const badgeConfig = {
      pl: {
        label: "P&L Analysis",
        className: "border-emerald-200 bg-emerald-50 text-emerald-700",
      },
      gl: {
        label: "GL Actuals",
        className: "border-indigo-200 bg-indigo-50 text-indigo-700",
      },
      unknown: {
        label: "Preview Only",
        className: "border-zinc-200 bg-zinc-50 text-zinc-600",
      },
    };
  
    const config = badgeConfig[type];
  
    return (
      <span
        className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${config.className}`}
      >
        Sheet Type: {config.label}
      </span>
    );
  }