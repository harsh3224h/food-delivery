import React from "react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  subtext: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  colorTheme?: "blue" | "green" | "purple" | "orange";
}

export default function StatsCard({
  title,
  value,
  icon,
  subtext,
  trend,
  colorTheme = "blue",
}: StatsCardProps) {
  // 2015 Flat Colors (inspired by classic AdminLTE/Bootstrap)
  const themeClasses = {
    blue: {
      borderTop: "border-t-[3px] border-t-[#3c8dbc]",
      bg: "bg-white",
      iconBg: "bg-[#3c8dbc] text-white",
      border: "border-[#d2d6de]",
    },
    green: {
      borderTop: "border-t-[3px] border-t-[#00a65a]",
      bg: "bg-white",
      iconBg: "bg-[#00a65a] text-white",
      border: "border-[#d2d6de]",
    },
    purple: {
      borderTop: "border-t-[3px] border-t-[#605ca8]",
      bg: "bg-white",
      iconBg: "bg-[#605ca8] text-white",
      border: "border-[#d2d6de]",
    },
    orange: {
      borderTop: "border-t-[3px] border-t-[#f39c12]",
      bg: "bg-white",
      iconBg: "bg-[#f39c12] text-white",
      border: "border-[#d2d6de]",
    },
  };

  const theme = themeClasses[colorTheme];

  return (
    <div className={`flex rounded-none border ${theme.border} ${theme.borderTop} ${theme.bg} shadow-sm min-h-[90px]`}>
      <div className={`w-[70px] flex items-center justify-center ${theme.iconBg} rounded-none shrink-0`}>
        {icon}
      </div>
      <div className="flex-1 p-3 flex flex-col justify-between">
        <div>
          <span className="text-[12px] uppercase font-bold text-[#777] block tracking-wide">
            {title}
          </span>
          <span className="text-2xl font-bold text-[#333] block mt-0.5">
            {value}
          </span>
        </div>
        <div className="mt-1 flex items-center justify-between text-[11px] text-[#999] border-t border-[#f4f4f4] pt-1">
          <span>{subtext}</span>
          {trend && (
            <span
              className={`font-semibold ${
                trend.isPositive ? "text-[#00a65a]" : "text-[#dd4b39]"
              }`}
            >
              {trend.value}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
